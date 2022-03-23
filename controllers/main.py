import ast
import json
import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class PublicShopList(http.Controller):

    def authenticate(self, api_key):
        """
        Shop list user auth by API key
        """
        allowed_shops = request.env['shop.api.user'].sudo().search([('api_key', '=', api_key)])
        if len(allowed_shops) > 0:
            return True
        else:
            return False


    @http.route(['/api/get_yandex_apikey'], type='json', auth="public", website=False, cors='*')
    def get_yandex_apikey(self, debug=False, **kwargs):
        """
        Exports Yandex API key From Settings
        """
        api_key = request.env['ir.config_parameter'].sudo().get_param(
            'web_yandex_maps.api_key', default='')
        return api_key


    @http.route(['/api/get_yandex_lang'], type='json', auth="public", website=False, cors='*')
    def get_yandex_lang(self, debug=False, **kwargs):
        """
        Exports Yandex API Language From Settings
        """
        language = request.env['ir.config_parameter'].sudo().get_param(
            'web_yandex_maps.lang_localization', default='')
        return language


    @http.route(['/api/shops'], type='json', auth="public", website=False, cors='*')
    def get_shops_list(self, query=False, debug=False, lat=False, lng=False, **kwargs):
        """
        Exports Shop list in JSON format
        """
        results = []
        if self.authenticate(request.params.get('api_key', '')):
            export_fields = [
                'id',
                'name',
                'full_address',
                'metro_station',
                'street',
                'street2',
                'zip',
                'city',
                'state_id',
                'country_id',
                'email',
                'phone',
                'properties_ids',
                'partner_latitude',
                'partner_longitude',
                'comment',
            ]

        isIds = request.params.get('ids','')
        tags = request.params.get('tags','')
        tags = tags.split(',') if tags else False
        shop_ids = []
        if not isIds:
            # if not ids list passes get recordset of all shops ('is_published' flag in true)
            # checks if linked warehouse record is not archieved ('active' flag is true)
            # and filter by selected tags
            domain = [('is_published', '=', True),('warehouse_ids.active','=',True)]
            if tags:
                domain.append('|') if len(tags) > 1 else None
                for tag in tags:
                    tagId = request.env['res.partner.category'].sudo().search([('name','=',tag)]).id
                    domain.append(('category_id','in',tagId))
                    shop_ids = request.env['public.shop'].sudo().search(domain)
            else:
                # if ids list get recordset of passed ids only
                shop_ids = request.env['public.shop'].sudo().browse(isIds)

            for shop in shop_ids:
                shop_dict = {field: shop.__getattribute__(field) for field in export_fields}
                shop_dict['country_id'] = (shop_dict['country_id'] and shop_dict['country_id'].id) and shop_dict['country_id'].name or ''
                shop_dict['state_id'] = (shop_dict['state_id'] and shop_dict['state_id'].id) and shop_dict['state_id'].name or ''
                shop_dict['properties_ids'] = [
                    {'name': prop.name, 'default': prop.default, 'path': prop.path} for prop in shop_dict['properties_ids']
                ]
                shop_dict['images'] = []
                i = 1
                for image in shop.image_ids:
                    image_dict = {
                        'url': request.env['website'].image_url(image, 'image_main'),
                        'id': image.id,
                        'num': i,
                        'href': "#shop-card-image-" + str(image.id),
                        'elid': "shop-card-image-" + str(image.id),
                    }
                    shop_dict['images'].append(image_dict)
                    i += 1
                shop_dict['working_hours'] = shop._get_work_hours()
                shop_dict['code'] = request.env['stock.warehouse'].sudo().search([('shop_id.id','=',shop.id)])[0].code
                results.append(shop_dict)
        return json.dumps(results, ensure_ascii=False)


    @http.route(['/api/shoplist/params'], type='json', auth="public", website=False, cors='*')
    def get_shop_params(self, debug=False, **kwargs):
        """
        Exports Shop list Access Params From Settings
        Exported json struncture:
        {
            'url': url from settings to get shop list from
            'api_key': api key for getting shop list through url
        }
        """
        widget_id = kwargs.get('widget_id', False)
        shopIds = kwargs.get('ids',False)
        export_fields = [
            'shop_list_url',
            'shop_list_params',
        ]
        results = []
        for conf in request.env['shop.list.config'].sudo().search([('widget_id', '=', widget_id)]):
            conf_dict = { field: conf.__getattribute__(field) for field in export_fields}
            conf_dict['shop_list_params'] = ast.literal_eval(conf_dict['shop_list_params'].strip())
            if shopIds:
                conf_dict['shop_list_params']['ids'] = shopIds
            results.append(conf_dict)
        return json.dumps(results, ensure_ascii=False)

    @http.route(['/api/templates'], type='http', methods=["GET"], auth="public", website=False, cors='*')
    def get_xml_templates(self, debug=False, **kwargs):
        templates_list = [
            'website_shops_map.public_shop_map_balloon',
            'website_shops_map.public_shop_card',
            'website_shops_map.public_shop_list_client_address',
            'website_shops_map.public_shop_card_map',
            'website_shops_map.public_shop_map_props_option',
            'website_shops_map.public_shop_own_page',
        ]
        result = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<templates id=\"template\" xml:space=\"preserve\">\n"
        for template in templates_list:
            templates = request.env['ir.ui.view'].sudo().search([('key','=',template)], limit=1)
            result += ("\n").join(templates.arch_base.split("\n")[1:])
        result += "</templates>"

        return result
