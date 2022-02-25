# -*- coding: utf-8 -*-
import json
import lxml.html
import logging
import requests
import sys
import werkzeug
from geopy.distance import geodesic
from odoo.http import request

_logger = logging.getLogger(__name__)

try:
    import geopy
except ImportError:
    _logger.warning("No module named geopy")

from odoo import modules, models, fields, api


def urlplus(url, params):
    return werkzeug.Href(url)(params or None)


class eyekraft_module_description(models.Model):
    """
    Class to load extended description of module.
    """
    _name = "ir.module.module"
    _descriprion = "Extends standart description_html with more html files"
    _inherit = "ir.module.module"

    def _manual(self):
        spanish = ["es_ES", "es_AR", "es_BO", "es_CL", "es_CO", "es_CR", "es_DO", "es_EC, es", "es_GT", "es_MX", "es_PA", "es_PE", "es_PY", "es_UY", "es_VE"]
        if self.env.context['lang'] == u'ru_RU':
            path = modules.module.get_module_resource(self.name, 'doc/manual_ru.html')
        elif self.env.context['lang'] == u'es' or self.env.context['lang'] in spanish:
            path = modules.module.get_module_resource(self.name, 'doc/manual_es.html')
        else:
            path = modules.module.get_module_resource(self.name, 'doc/manual.html')
        if path:
            html_file = open(path,'r')
            text = html_file.read()
            html_file.close()
            htmltext = lxml.html.document_fromstring(text)
            for element, attribute, link, pos in htmltext.iterlinks():
                if element.get('src') and not '//' in element.get('src') and not 'static/' in element.get('src'):
                    element.set('src', "/%s/static/description/%s" % (self.name, element.get('src')))
            text = lxml.html.tostring(htmltext)
            self.manual_html = text

    # Model Fields
    manual_html = fields.Html(string='Manual HTML', compute='_manual')


class shopobj:
    """
    Class to objectify shop dictionary
    for template data compatibility.
    """
    def __init__(self,dictobj):
        self.__dict__ = dictobj


class eyekraft_module_geo(models.Model):
    """
    Class to get coordinates of the user on server side
    and load and show primary list of shops.
    """
    _inherit = "website"

    # parameters are:
    # snippet_id - to read parameters of certain snippet
    # tab - flag of the tab showed by default. Template name of shop card depends of it.
    @api.model
    def load_primary_shop_list(self,snippet_id,tab):
        """Load primary shop list.

        :param snippet_id: to read parameters of certain snippet.
        :type snippet_id: str.
        :param tab: flag of the tab showed by default. Template name of shop card depends of it.
        :type tab: str.
        :returns: str shop_cards_html
        """
        # prevent of search bots requests
        if not 'HTTP_USER_AGENT' in request.httprequest.environ:
            return ''
        bots = ['Bot','bot','Yandex','Google']
        for bot in bots:
            if request.httprequest.environ['HTTP_USER_AGENT'].find(bot) > -1:
                return ''
        # Load parameters of snippet
        header= {'Content-type':'application/json'}
        try:
            r = requests.get(request.httprequest.host_url+'api/shoplist/params', timeout=3, data=json.dumps({'params':{'widget_id':'eyekraftShopMap'+str(snippet_id)}}), headers=header)
            result = json.loads(r.text)['result']
        except:
            return ''
        if result == u'[]':
            return ''
        params = json.loads(result)[0]
        # load shop list
        try:
            r = requests.get(request.httprequest.host_url+'api/shops', timeout=3, data=json.dumps({'params':params['shop_list_params']}), headers=header)
            result = json.loads(r.text)['result']
            shop_list = json.loads(result)
        except:
            return ''
        if not shop_list:
            return ''
        location = {}
        if 'geo_lat' in request.httprequest.cookies:
            location['latitude'] = float(format(float(request.httprequest.cookies['geo_lat']),'.2f'))
            location['longitude'] = float(format(float(request.httprequest.cookies['geo_lon']),'.2f'))
            CacheRec = self.env['shop.map.cache'].search([('latitude','=',location['latitude']),('longitude','=',location['longitude'])])
            if CacheRec:
                return CacheRec[0].html
        else:
            if 'HTTP_X_FORWARDED_FOR' in request.httprequest.environ:
                ip = request.httprequest.environ['HTTP_X_FORWARDED_FOR']
            else:
                ip = request.httprequest.environ['REMOTE_ADDR']
                url = 'http://freegeoip.net/json/'+ip
            try:
                location = json.loads(requests.get(url, timeout=3).text)
                _logger.info('freegeoip.net request completed!')
                _logger.info('location is %s, %s' % (location['latitude'], location['longitude']))
            except:
                return ''

        # Count shops distance and sort shop list by remoteness
        for shop in shop_list:
            shop['distance'] = float(format(geodesic((location['latitude'],location['longitude']),(shop['partner_latitude'],shop['partner_longitude'])).km,'.2f'))
        shop_list = sorted(shop_list, key=lambda shop: shop['distance'])
        # Prepare the list of shop cards to import to webpage
        view = request.env['ir.ui.view'].sudo()
        shop_cards_html = ''
        if tab == 'list':
            # Render the "Shop Card" Template
            template_name = 'website_shops_map.eyekraft_shop_card'
        else:
            # Render the "Shop Card Map" Template
            template_name = 'website_shops_map.eyekraft_shop_card_map'
        for i in xrange(6):
            shop = shopobj(shop_list[i])
            shop.color = params['shop_list_params']['color'] if 'color' in params['shop_list_params'] else False
            shop.tag = params['shop_list_params']['tag'] if 'tag' in params['shop_list_params'] else False
            shop.info = params['shop_list_params']['info'] if 'info' in params['shop_list_params'] else 'км'
            shop.map_id = False
            shop.map_href = False
            shop.map_url = False
            shop.own_page_href = False
            shop.show_route_id = False
            shop.show_on_map_id = False
            shop.images = False
            shop_cards_html += view.render_template(template_name,{'shop':shop,'adminMode':False,});
        # save data to the cache model
        if 'geo_lat' in request.httprequest.cookies:
            CacheRec = self.env['shop.map.cache'].create({
                            'latitude':location['latitude'],
                            'longitude':location['longitude'],
                            'html':shop_cards_html,
            })
        return shop_cards_html


class tune_partner(models.Model):
    _inherit="res.partner"

    _sql_constraints = [('check_name', 'CHECK(True)','')]


class eyekraft_shop(models.Model):
    _name = "eyekraft.shop"
    _description = "Shop model for eyekraft"
    _inherit = "base_multi_image.owner"
    _inherits = {"res.partner":'partner_id'}

    _sql_constraints = [('check_name', 'CHECK(True)','')]

    # Model Fields
    partner_id = fields.Many2one("res.partner", required=True, ondelete="restrict")

    def unlink(self):
        partner = self.partner_id
        foreign_partner = self.foreign_partner
        record = super(eyekraft_shop, self).unlink()
        if not foreign_partner:
            partner.unlink()
        return record

    # Collect full address field from other fields
    @api.depends('country_id', 'state_id', 'city', 'street', 'street2', 'zip')
    def _compute_full_address(self):
        """
        Computes full shop address
        """
        full_address = ''
        if self.zip:
            full_address += self.zip + ', '
        if self.country_id and self.country_id.name:
            full_address += self.country_id.name + ', '
        if self.state_id:
            full_address += self.state_id.name + ', '
        if self.city:
            full_address += self.city + ', '
        if self.street:
            full_address += self.street + ', '
        if self.street2:
            full_address += self.street2 + ', '
        if len(full_address) > 3 and full_address[-2] == ',':
            self.full_address = full_address[:-2]
        else:
            self.full_address = full_address
        # clear coordinates if exist to count them again in stock.warehouse.get_lat_lng()
        self.partner_latitude = 0
        self.partner_longitude = 0


    # Model Fields
    full_address = fields.Char(
        string='Full Address',
        compute='_compute_full_address',
        store=True,
    )
    metro_station = fields.Char(
        string='Subway station',
        help='In this field, you can enter the name of the subway station in the "Subway station" field, if necessary',
    )
    properties_ids = fields.Many2many(
        'shop.property',
        'shop_shop_properties_rel',
        'shop_id',
        'property_id',
        string='Properties',
        help='In this field, you can select the services available in the shop in the "Properties" field (services must be pre-configured at "Shop Properties")',
    )
    work_hours_ids = fields.One2many(
        "shop.work.hours",
        "shop_id",
        string="Work hours",
        help='In this field, you can enter opening hours and enter the data in the window that appears, or select previously entered hours from the list',
    )
    rating = fields.Float(
        string="Rating"
    )
    public = fields.Boolean(
        string="Public Shop",
        help='Check "Public Shop" checkbox to assign warehouse as public shop',
    )
    foreign_partner = fields.Boolean(help="Flag for partner record linked on module install")
    warehouse_ids = fields.One2many(
        "stock.warehouse",
        "shop_id",
        string="Warehouse Name",
    )

    # Collect string of all work hours periods
    def _get_work_hours(self):
        self.ensure_one()
        res = u''
        for work_hours in self.work_hours_ids:
            res += (
                work_hours.work_days_id.name
                + ' '
                + ', '.join(period.name for period in work_hours.period_ids)
                + ', '
            )
        return res.strip().strip(',')
