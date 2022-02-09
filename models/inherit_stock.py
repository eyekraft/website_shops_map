# -*- coding: utf-8 -*-
import logging
import sys
from datetime import datetime
from geopy import exc, geocoders
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
                # Geocoder using the Yandex Maps API.
                geolocator = geocoders.Yandex()

                # https://geopy.readthedocs.io/en/latest/index.html#geopy.geocoders.Yandex.geocode
                spanish = ["es_ES", "es_AR", "es_BO", "es_CL", "es_CO", "es_CR", "es_DO", "es_EC, es", "es_GT", "es_MX", "es_PA", "es_PE", "es_PY", "es_UY", "es_VE"]
                english = ["en_AU", "en_CA", "en_GB", "en_US"]
                if self.env.context['lang'] == u'es' or self.env.context['lang'] in spanish:
                    language="en_US"
                elif self.env.context['lang'] == u'en' or self.env.context['lang'] in english:
                    language="en_US"
                elif self.env.context['lang'] == u'tr' or self.env.context['lang'] == u'tr_TR':
                    language="tr_TR"
                elif self.env.context['lang'] == u'uk' or self.env.context['lang'] == u'uk_UA':
                    language="uk_UA"
                elif self.env.context['lang'] == u'be' or self.env.context['lang'] == u'be_BY':
                    language="be_BY"
                elif self.env.context['lang'] == u'ru' or self.env.context['lang'] == u'ru_RU':
                    language="ru_RU"
                else:
                    language="en_RU"

                for i in xrange(10):
                    # Do the geocoding
                    try:
                        # Return a location point by address using Yandex geocoder.
                        location = geolocator.geocode(query=self.full_address, timeout=10, lang=language)
                        break
                    except exc.GeocoderTimedOut as e:
                        _logger.info("GeocoderTimedOut: Retrying...")
                        continue
                    except exc.GeocoderQuotaExceeded as e:
                        _logger.info("GeocoderQuotaExceeded: The remote geocoding service refused to fulfill the request because the client has used its quota...")
                        continue
                    except AttributeError:
                        continue
                    except exc.GeocoderParseError as e:
                        _logger.info("GeocoderParseError: Geopy could not parse the service's response...")
                        continue
                if not location:
                    _logger.warning("Yandex is unreachable, therefore latitude|longitude for shop is not computed.")
                else:
                    _logger.warning("Geopy has not been imported, therefore latitude|longitude for shop is not computed.")
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
                values['image'] = self.shop_id.image_ids[0].image_1920
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

    # ir.actions.server methods:
    @api.model
    def erase_on_shop(self):
        model_name = 'shop.map.cache'
        model.env[model_name].erase_on_new_shop()


    # Model Fields
    shop_id = fields.Many2one(
        "eyekraft.shop",
        string="Shop",
        required=True,
        ondelete="cascade",
    )
