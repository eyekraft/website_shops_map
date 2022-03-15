import logging
from odoo import fields, models
_logger = logging.getLogger(__name__)


class shop_work_hours(models.Model):
    _name = "shop.work.hours"
    _description = "Shop Work Hours"

    # Model Fields
    name = fields.Char(string="Name")
    work_days_id = fields.Many2one(
        "shop.work.days",
        string="Week days",
        help='In this field, you can enter the "Shop Work Hours" in which the shop works in set hours',
        required=True,
    )
    period_ids = fields.Many2many(
        "shop.time.period",
        "work_hours_periods_rel",
        "work_hours_id",
        "period_id",
        string="Shop Time Period",
        required=True,
    )
    shop_id = fields.Many2one(
        "public.shop",
        string="Shop",
    )
