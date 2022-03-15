import json
import logging
import requests
import sys
from geopy.distance import geodesic
from odoo.http import request

try:
    import geopy
except ImportError:
    _logger.warning("No module named geopy")

from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class PublicShop(models.Model):
    _name = "public.shop"
    _description = "Public Shop model"
    _inherit = "base_multi_image.owner"
    _inherits = {"res.partner":'partner_id'}

    _sql_constraints = [('check_name', 'CHECK(True)','')]

    # Model Fields
    partner_id = fields.Many2one(
        "res.partner",
        required=True,
        ondelete="restrict"
    )
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

    def unlink(self):
        partner = self.partner_id
        foreign_partner = self.foreign_partner
        record = super(PublicShop, self).unlink()
        if not foreign_partner:
            partner.unlink()
        return record
