import logging
from odoo import api, fields, models
_logger = logging.getLogger(__name__)


class ShopTimePeriod(models.Model):
    _name = "shop.time.period"
    _description = "Shop Time Period"

    _sql_constraints = [
        (
            'start_end_time_check',
            'check (start_time<end_time)',
            "End of period can't be less than or equal to start of period!"
        ),
    ]

    # Model Fields
    name = fields.Char(
        string="Shop Time Period",
        compute="_compute_name",
        store=True
    )
    start_time = fields.Float(
        string="Since",
        required=True
    )
    end_time = fields.Float(
        string="To",
        required=True
    )

    @api.depends('start_time', 'end_time')
    def _compute_name(self):
        for period in self:
            period.name = "{start} - {end}".format(
                start=('%.2f' % self.start_time).replace('.', ':'),
                end=('%.2f' % self.end_time).replace('.', ':'),
            )
