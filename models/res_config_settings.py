from odoo import fields, models

YMAPS_LANG_LOCALIZATION = [
    ('be_BY', 'Belarusian'),
    ('en_US', 'English'),
    ('ru_RU', 'Russian'),
    ('tr_TR', 'Turkish'),
    ('uk_UA', 'Ukrainian'),
]


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # Model Fields
    yandex_maps_view_api_key = fields.Char(
        string='Yandex Maps View Api Key',
        config_parameter='web_yandex_maps.api_key')
    yandex_maps_lang_localization = fields.Selection(
        selection=YMAPS_LANG_LOCALIZATION,
        string='Yandex Maps Language Localization',
        config_parameter='web_yandex_maps.lang_localization')
    yandex_maps_modules = fields.Char(
        string='Modules',
        config_parameter='web_yandex_maps.modules')
