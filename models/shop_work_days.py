import logging
from odoo import fields, models
_logger = logging.getLogger(__name__)


class ShopWorkDays(models.Model):
    _name = "shop.work.days"
    _description = "Shop Work Days"

    # Model Fields
    name = fields.Char(
        string="Work days",
        help="This field enter opening days in format of your own (ex. «Mon-Fri», «Saturday»)",
    )
