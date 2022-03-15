import logging
import lxml.html
from odoo import fields, models, modules

_logger = logging.getLogger(__name__)


class IrModuleModule(models.Model):
    """
    Class to load extended description of module.
    """
    _name = "ir.module.module"
    _descriprion = "Extends standart description_html with more html files"
    _inherit = "ir.module.module"

    # Model Fields
    manual_html = fields.Html(string='Manual HTML', compute='_manual')

    # Extends standart description_html with more html files
    def _manual(self):
        spanish = ["es_ES", "es_AR", "es_BO", "es_CL", "es_CO", "es_CR", "es_DO", "es_EC, es", "es_GT", "es_MX", "es_PA", "es_PE", "es_PY", "es_UY", "es_VE"]
        if self.env.context['lang'] == u'ru_RU':
            path = modules.module.get_module_resource(self.name, 'doc/manual_ru.html')
        elif self.env.context['lang'] == u'es' or self.env.context['lang'] in spanish:
            path = modules.module.get_module_resource(self.name, 'doc/manual_es.html')
        else:
            path = modules.module.get_module_resource(self.name, 'doc/manual.html')
        if path:
            html_file = open(path,'r')
            text = html_file.read()
            html_file.close()
            htmltext = lxml.html.document_fromstring(text)
            for element, attribute, link, pos in htmltext.iterlinks():
                if element.get('src') and not '//' in element.get('src') and not 'static/' in element.get('src'):
                    element.set('src', "/%s/static/description/%s" % (self.name, element.get('src')))
            text = lxml.html.tostring(htmltext)
            self.manual_html = text
