import json
import logging
import requests
import werkzeug
from geopy.distance import geodesic
from odoo.http import request

_logger = logging.getLogger(__name__)

try:
    import geopy
except ImportError:
    _logger.warning("No module named geopy")

from odoo import api, models


def urlplus(url, params):
    return werkzeug.Href(url)(params or None)


class shopobj:
    """
    Class to objectify shop dictionary
    for template data compatibility.
    """
    def __init__(self, dictobj):
        self.__dict__ = dictobj


class Website(models.Model):
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
            r = requests.get(request.httprequest.host_url+'api/shoplist/params', timeout=3, data=json.dumps({'params':{'widget_id':'publicShopMap'+str(snippet_id)}}), headers=header)
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
            template_name = 'website_shops_map.public_shop_card'
        else:
            # Render the "Shop Card Map" Template
            template_name = 'website_shops_map.public_shop_card_map'
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
