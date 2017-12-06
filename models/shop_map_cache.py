# -*- coding: utf-8 -*-

from openerp import models, fields, api

#this is model to store cached requests for geo-coordibates determination
#model stores coordinates and short shoplist in HTML for quick page formation
#the status of cached coordinates checks by load_primary_shop_list() method of eyekraft.shop model
class ShopsMapCache(models.Model):
    _name = 'shop.map.cache'
    _description = 'Caching model to store geoccordinates of clients'

    latitude = fields.Float(string="Latitude")
    longitude = fields.Float(string="Longitude")
    html = fields.Html(string='Shop List Html')

    #method to erase all data from model
    #on new shop creation
    @api.model
    def erase_on_new_shop(self):
	for rec in self.search([]):
	    rec.sudo().unlink()
