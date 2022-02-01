# -*- coding: utf-8 -*-
import logging
import sys
import geopy
from datetime import datetime
from odoo import api, fields, models
_logger = logging.getLogger(__name__)


class stock_warehouse(models.Model):
    _name = "stock.warehouse"
    _inherit = "stock.warehouse"
    _inherits = {"eyekraft.shop": 'shop_id'}

    def _get_lat_lng(self):
        """ Compute latitude & longitude by Yandex service
            :returns: location.latitude, location.longitude
        """
        if not self.full_address:
            return 0,0
            if 'geopy' in sys.modules:
                geolocator = geopy.geocoders.Yandex()
                for i in xrange(10):
                    try:
                        location = geolocator.geocode(self.full_address, timeout=10)
                        break
                    except geopy.exc.GeocoderTimedOut as e:
                        continue
                    except geopy.exc.GeocoderQueryError as e:
                        continue
                    except AttributeError:
                        continue
                    except geopy.exc.GeocoderParseError as e:
                        continue
                if not location:
                    _logger.warning("Yandex is unreachable, therefore lat|lng for shop is not computed")
                else:
                    _logger.warning("Geopy has not been imported, therefore lat|lng for shop is not computed")
                    return location.latitude, location.longitude

    def unlink(self):
        for wh in self:
            if wh.shop_id:
                wh.shop_id.unlink()
            else:
                return super(stock_warehouse, self).unlink()

    @api.model
    def create(self,vals):
        record = super(stock_warehouse, self).create(vals)
        values = {}
        if record.shop_id.public:
            values['company_type'] = 'company'
            values['is_company'] = True
            values['category_id'] = [(6,0,[self.env.ref('website_shops_map.partner_shop_category_id').id])]
        record.shop_id.write(values)
        return record

    def write(self,vals):
        record = super(stock_warehouse, self).write(vals)
        values = {'name': self.name}
        # if warehouse is shop
        if self.shop_id.public:
            # if there are no coordinates - count them
            if not self.shop_id.partner_latitude:
                coordinates = self._get_lat_lng()
                values['partner_latitude'] = coordinates[0]
                values['partner_longitude'] = coordinates[1]
                values['date_localization'] = datetime.today().strftime('%Y-%m-%d')
            # assign first shop photo as shop partner avatar image
            if self.shop_id.image_ids:
                values['image'] = self.shop_id.image_ids[0].image_medium
            else:
                # assign company logo as shop partner avatar image
                if self.partner_id:
                    values['image'] = self.env['res.company'].browse(self.partner_id.id).logo
            self.shop_id.write(values)
        return record

    def _inverse_name(self):
        for wh in self:
            wh.shop_id.name = wh.name

    def _set_address(self, field):
        setattr(self, field, getattr(self.partner_id, field))

    @api.model
    def erase(self):
        for rec in self.search([]):
            rec.sudo().unlink()

    @api.model
    def erase_field(self,model,field):
        recs = self.env[model].search([('name','=',field)])
        for rec in recs:
            rec.sudo().unlink()


    # Model Fields
    shop_id = fields.Many2one(
        "eyekraft.shop",
        string="Shop",
        required=False,
        ondelete="cascade",
    )

