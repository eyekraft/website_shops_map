# -*- coding: utf-8 -*-

from odoo import models, fields, api


class shop_property(models.Model):
    _name = 'shop.property'
    _description = 'Shop property model for eyekraft'

    name = fields.Char(string="Name")
    sequence = fields.Integer(string="Sequence")
    default = fields.Boolean(string="Default")
    path = fields.Char(string='URL', help='URL using default option permanently')