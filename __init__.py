from odoo import api, SUPERUSER_ID
from . import controllers
from . import models
from . import setup


def fn_post_init_hook(cr, registry):

    env = api.Environment(cr,SUPERUSER_ID,context={})
    model_obj = env['stock.warehouse']
    warehouses = model_obj.search([('shop_id', '=', False)])

    # search for existed warehouses
    # convert them in compatible type
    for wh in warehouses:
        values = {'name': wh.name}
        shop_id = env['public.shop'].create(values)
        values = {'shop_id': shop_id.id}
        wh.write(values)
        if wh.partner_id:
            partner_to_delete = wh.shop_id.partner_id
            wh.shop_id.partner_id = wh.partner_id
            partner_to_delete.sudo().unlink()

    # search for partners available for 'snippet_google_partner' module
    # and create warehouses with corresponding partners linked
    # to show on native module map
    partner_model = env['res.partner']
    partners_to_stock = partner_model.search([
        ('category_id','!=',False),
        ('partner_latitude','!=',False),
        ('partner_longitude','!=',False),
        ('partner_longitude','!=',False),
        ('date_localization','!=',False),
    ])
    i = 1
    for partner in partners_to_stock:
        values = {'name': partner.name,'code':'x_'+str(i)}
        warehouse = model_obj.create(values)
        warehouse.public = True
        warehouse.shop_id.foreign_partner = True
        partner_to_delete = warehouse.shop_id.partner_id
        warehouse.shop_id.partner_id = partner
        partner_to_delete.sudo().unlink()
        i += 1
