# -*- coding: utf-8 -*-
import logging
from odoo import fields, models
_logger = logging.getLogger(__name__)


class ResPartner(models.Model):
    _inherit = "res.partner"


    # Model Fields
    partner_latitude = fields.Float(string='Geo Latitude', digits=(16, 5))
    partner_longitude = fields.Float(string='Geo Longitude', digits=(16, 5))
    date_localization = fields.Date(string='Geolocation Date')
    image = fields.Binary(string="Partner Image", attachment=True,
        help="This field holds the image used as avatar for this partner, limited to 1024x1024px",)
