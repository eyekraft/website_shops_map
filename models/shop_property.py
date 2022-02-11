# -*- coding: utf-8 -*-
from odoo import api, fields, models


class shop_property(models.Model):
    _name = 'shop.property'
    _description = 'Shop property model for eyekraft'

    # Model Fields
    name = fields.Char(
        string="Name",
        help='In this field, you can enter "Name" of the property (to see in the drop-down selection on the webpage)',
    )
    sequence = fields.Integer(
        string="Sequence",
        help='In this field, you can enter "Sequence" if necessary (properties with a lower number are shown in the selection list earlier)',
    )
    default = fields.Boolean(
        string="Default",
        help='In this field, you can check "Default" to apply this property automatically on "Shop List Snippet" load',
    )
    path = fields.Char(
        string="URL",
        help='In this field, you can enter the "URL" address using default option permanently, to apply automatic property on specified page only, ex. «/page/shops»'
    )
