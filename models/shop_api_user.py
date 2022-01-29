# -*- coding: utf-8 -*-
import hashlib

from odoo import models, fields, api


class shop_api_user(models.Model):
    _name = 'shop.api.user'
    _description = 'Shop API users'
    
    def generate_api_key(self):
        """
        Generate API key for shop list user
        """
        hash_dict = {field: self.__getattribute__(field) for field in self._fields}
        self.api_key = hashlib.sha1(str(hash_dict)).hexdigest()
    
    @api.model
    def create(self, values):
        api_user = super(shop_api_user, self).create(values)
        api_user.generate_api_key()
        return api_user
    
    name = fields.Char(string="Name")
    api_key = fields.Char(string="API Key")
