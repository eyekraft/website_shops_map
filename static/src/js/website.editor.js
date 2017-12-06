odoo.define('website_shops_map.editor', function (require) {
'use strict';

var editor = require('web_editor.editor');
var website = require('website.website');

website.TopBar.include({
    edit: function () {
        this.$('button[data-action=edit]').prop('disabled', true);
        this.$el.hide();
        editor.editor_bar = new editor.Class(this);
        editor.editor_bar.prependTo(document.body);

        var selector = $(document).find('#eyekraft_props_picker_selector')
        if (selector.length){
            // remove properties
            $(selector).children().remove();
            $(selector).append("<select id='eyekraft_props_picker' class='hidden' multiple='' title='Select property'></select>");
        };

        var big_map_view = $(document).find('#map-container-vertical')
        if (big_map_view.length){
            // remove big map
            $(big_map_view).children().remove();
        };
    }
});

});