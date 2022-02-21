odoo.define('website_shops_map.editor', function (require) {
    'use strict';

    var core = require('web.core');
    var editor = require('web_editor.editor');
    var website = require('website.website');
    var _t = core._t;

    website.TopBar.include({
        /**
         * Edit function.
         *
         */
        edit: function () {
            this.$('button[data-action=edit]').prop('disabled', true);
            this.$el.hide();
            editor.editor_bar = new editor.Class(this);
            editor.editor_bar.prependTo(document.body);
            var messageList = _t("Select property");

            var selector = $(document).find('#eyekraft_props_picker_selector')
            if (selector.length){
                // remove properties
                $(selector).children().remove();
                $(selector).append("<select id='eyekraft_props_picker' class='hidden' multiple='' title='+ messageList +'></select>");
            };

            var bigMapView = $(document).find('#map-container-vertical')
            if (bigMapView.length){
                // remove big map
                $(bigMapView).children().remove();
            };
        }
    });

});
