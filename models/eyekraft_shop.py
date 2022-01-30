# -*- coding: utf-8 -*-
import werkzeug
import logging
import sys
import lxml.html
import requests
import json
from odoo.http import request
from geopy.distance import vincenty

_logger = logging.getLogger(__name__)

try:
    import geopy
except ImportError:
    _logger.warning("No module named geopy")

from odoo import modules, models, fields, api


def urlplus(url, params):
    return werkzeug.Href(url)(params or None)

# class to load extended description of module
class eyekraft_module_description(models.Model):
    _name = "ir.module.module"
    _descriprion = "Extends standart description_html with more html files"
    _inherit = "ir.module.module"

    def _manual(self):
        if self.env.context['lang'] == u'ru_RU':
            path = modules.module.get_module_resource(self.name, 'doc/manual_ru.html')
        elif self.env.context['lang'] == u'es' and self.env.context['lang'] == u'es_CL' and self.env.context['lang'] == u'es_ES':
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

    manual_html = fields.Html(string='Manual HTML', compute='_manual')

# class to objectify shop dictionary
# for template data compatibility
class shopobj:
    def __init__(self,dictobj):
        self.__dict__ = dictobj

# class to get coordinates of the user on server side
# and load and show primary list of shops
class eyekraft_module_geo(models.Model):
    _inherit = "website"

    # parameters are:
    # snippet_id - to read parameters of certain snippet
    # tab - flag of the tab showed by default. Template name of shop card depends of it.
    @api.model
    def load_primary_shop_list(self,snippet_id,tab):
        # prevent of search bots requests
        if not 'HTTP_USER_AGENT' in request.httprequest.environ:
            return ''
        bots = ['Bot','bot','Yandex','Google']
        for bot in bots:
            if request.httprequest.environ['HTTP_USER_AGENT'].find(bot) > -1:
                return ''
        # load parameters of snippet
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

        # count shops distance and sort shop list by remoteness
        for shop in shop_list:
            shop['distance'] = float(format(vincenty((location['latitude'],location['longitude']),(shop['partner_latitude'],shop['partner_longitude'])).km,'.2f'))
        shop_list = sorted(shop_list, key=lambda shop: shop['distance'])
        # prepare the list of shop cards to import to webpage
        view = request.env['ir.ui.view'].sudo()
        shop_cards_html = ''
        if tab == 'list':
            template_name = 'website_shops_map.eyekraft_shop_card'
        else:
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

    partner_id = fields.Many2one("res.partner", required=True, ondelete="restrict")
    _sql_constraints = [('check_name', 'CHECK(True)','')]

    def unlink(self):
        partner = self.partner_id
        foreign_partner = self.foreign_partner
        record = super(eyekraft_shop, self).unlink()
        if not foreign_partner:
            partner.unlink()
        return record

    # collect full address field from other fields
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

    metro_station = fields.Char(string='Subway station')

    properties_ids = fields.Many2many(
        'shop.property',
        'shop_shop_properties_rel',
        'shop_id',
        'property_id',
        string='Properties',
    )

    work_hours_ids = fields.One2many(
        "shop.work.hours",
        "shop_id",
        string="Work hours",
    )

    rating = fields.Float(string="Rating")

    public = fields.Boolean(string="Shop")

    foreign_partner = fields.Boolean(help="Flag for partner record linked on module install")

    warehouse_ids = fields.One2many(
        "stock.warehouse",
        "shop_id",
        string="Warehouse",
    )

    # collect string of all work hours periods
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
