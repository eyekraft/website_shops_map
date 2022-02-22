# -*- coding: utf-8 -*-
{
    'name': 'Shops Map',
    'version': '1.1.20171129',
    'category': 'Sale',
    'summary': 'Shop model with map snippet',
    'description': '''
Extends Warehouse model to store more shop data. Adds website snippet to show shops on the map.
Partner And Google Map Snippet compatible.
    ''',
    'auto_install': False,
    'application': True,
    'author': 'Eyekraft Optical',
    'website': 'https://eyekraft.ru',
    'support': 'https://support.eyekraft.ru',
    'maintainer': "Leonardo J. Caballero G. <leonardocaballero@gmail.com>",
    'depends': [
        'sale',
        'base_multi_image',
        'base_geolocalize',
        'base_automation',
        'stock',
        'website',
    ],
    'data': [
        'data/website_shops_map_data.xml',
        'security/ir.model.access.csv',
        'views/shop_property_view.xml',
        'views/extend_module_view.xml',
        'views/shop_api_user_view.xml',
        'views/shop_map_cache_view.xml',
        'views/period_of_time_view.xml',
        'views/res_config_settings.xml',
        'views/stock_view.xml',
        'views/shop_list_config_view.xml',
        'views/s_shop_list.xml',
        'views/shop_work_days_view.xml',
        'views/website_frontend_assets.xml',
        'views/website_frontend_templates.xml',
    ],
    'qweb': [
        'static/src/xml/s_shops_map_modal.xml',
    ],
    'js': [
    ],
    'demo': [
    ],
    'test': [
    ],
    'license': 'GPL-3',
    'images': ['static/description/main.png'],
    'update_xml': [],
    'installable': True,
    'private_category': False,
    'external_dependencies': {
        "python": ["geopy"],
    },
    'post_init_hook': 'fn_post_init_hook',
}
