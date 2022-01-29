# -*- coding: utf-8 -*-
from odoo import api, fields, models, sys


class shop_list_config(models.Model):
    _name = 'shop.list.config'
    _description = "Shop List Configurations"

    shop_list_url = fields.Char(string="Shop List Url")
    shop_list_params = fields.Char(string="Shop List Paramters")
    widget_id = fields.Char(string="Widget ID")
    
    @api.model
    def get_sorces_for_widget(self, widget_id):
        sources = self.search([('widget_id', '=', widget_id)])
        tags = self.env['eyekraft.shop'].search([]).mapped('category_id.name')
        res = []
        for source in sources:
            res.append({
                'id': source.id,
                'tags_avail': tags if tags else [],
                'shop_list_url': source.shop_list_url.replace('/api/shops', ''),
                'shop_list_params': eval(source.shop_list_params)['api_key'],
                'shop_list_color': eval(source.shop_list_params)['color'] if 'color' in eval(source.shop_list_params) else '',
                'shop_list_tag': eval(source.shop_list_params)['tag'] if 'tag' in eval(source.shop_list_params) else '',
                'shop_list_info': eval(source.shop_list_params)['info'] if 'info' in eval(source.shop_list_params) else '',
                'tags': eval(source.shop_list_params)['tags'].split(',') if 'tags' in eval(source.shop_list_params) else '',
                'widget_id': source.widget_id,
            })
        return res

    def save(self, data):
        if data:
            widget_id = data.get('widget_id', '')
            sources = data.get('data', {})
            to_delete = data.get('to_delete', [])
            for key, source in sources.items():
                values = {
                    'shop_list_url': (source['shop_list_url'] + '/api/shops').replace('//api', '/api'),
                    'shop_list_params': str({'api_key': source['shop_list_params'],
                    'color': source['shop_list_color'],
                    'tag': source['shop_list_tag'],
                    'info': source['shop_list_info'],
                    'tags': ','.join(source['tags']) if 'tags' in source else ''}),
                    'widget_id': widget_id,
                }
                try:
                    source_id = int(key)
                    self.browse(source_id).write(values)
                except ValueError:
                    self.create(values)
            for source_id in to_delete:
                self.browse(source_id).unlink()

