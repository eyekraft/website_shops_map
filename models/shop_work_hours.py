import logging
from odoo import api, fields, models
_logger = logging.getLogger(__name__)


class eyecraft_work_days(models.Model):
    _name = "eyecraft.work.days"
    _description = "Shop Work Days"

    # Model Fields
    name = fields.Char(
        string="Work days",
        help="This field enter opening days in format of your own (ex. «Mon-Fri», «Saturday»)",
    )


class period_of_time(models.Model):
    _name = "period.of.time"
    _description = "Period of Time"

    _sql_constraints = [
        (
            'start_end_time_check',
            'check (start_time<end_time)',
            "End of period can't be less than or equal to start of period!"
        ),
    ]

    @api.depends('start_time', 'end_time')
    def _compute_name(self):
        for period in self:
            period.name = "{start} - {end}".format(
                start=('%.2f' % self.start_time).replace('.', ':'),
                end=('%.2f' % self.end_time).replace('.', ':'),
            )

    # Model Fields
    name = fields.Char(
        string="Period of Time",
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


class shop_work_hours(models.Model):
    _name = "shop.work.hours"
    _description = "Shop Work Hours"

    # Model Fields
    name = fields.Char(string="Name")
    work_days_id = fields.Many2one(
        "eyecraft.work.days",
        string="Week days",
        help='In this field, you can enter the "Shop Work Hours" in which the shop works in set hours',
        required=True,
    )
    period_ids = fields.Many2many(
        "period.of.time",
        "work_hours_periods_rel",
        "work_hours_id",
        "period_id",
        string="Periods of Time",
        required=True,
    )
    shop_id = fields.Many2one(
        "eyekraft.shop",
        string="Shop",
    )
