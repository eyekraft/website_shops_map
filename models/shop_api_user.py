import hashlib
from odoo import api, fields, models


class ShopApiUser(models.Model):
    _name = 'shop.api.user'
    _description = 'Shop API users'

    # Model Fields
    name = fields.Char(string="Name")
    api_key = fields.Char(string="API Key")

    def generate_api_key(self):
        """
        Generate API key for shop list user
        """
        hash_dict = {field: self.__getattribute__(field) for field in self._fields}
        self.api_key = hashlib.sha1(str(hash_dict).encode('utf-8')).hexdigest()

    @api.model
    def create(self, values):
        api_user = super(ShopApiUser, self).create(values)
        api_user.generate_api_key()
        return api_user
