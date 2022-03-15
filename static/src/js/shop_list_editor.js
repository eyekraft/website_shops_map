odoo.define('website_shops_map.shop_list_editor', function (require) {
    "use strict";

    var ajax = require('web.ajax');
    var base = require('web_editor.base');
    var core = require('web.core');
    var Dialog = require('web.Dialog');
    var LinkDialog = require('wysiwyg.widgets.LinkDialog');
    var options = require('web_editor.snippets.options');

    var qweb = core.qweb;
    var _t = core._t;

    // Load QWeb XML Template
    ajax.loadXML('/website_shops_map/static/src/xml/s_shops_map_modal.xml', qweb);

    /**
     * Allows to customize the Source setup.
     */
    var EditSourcesDialog = Dialog.extend({
        // The name of a QWeb template that will be rendered after the widget
        // has been initialized but before it has been started.
        template: 'website_shops_map.s_shops_map_modal',
        // Events are a mapping of an event selector
        events: _.extend({}, Dialog.prototype.events, {
            'click a.js_add_source': 'addSource',
            'click button.js_edit_source': 'editSource',
            'click button.js_delete_source': 'deleteSource',
        }),

        /**
         * Init function.
         * Creation and initialization of the Dialog widget instance
         *
         * @constructor
         *
         * @param {*} parent
         * @param {*} sources
         * @param {*} widget_id
         */
        init: function (parent, sources, widget_id) {
            this.sources = sources;
            this.flat = this.flatenize(sources);
            this.to_delete = [];
            this.widget_id = widget_id
            this._super(parent,_.extend({},{title: _t("Map Data Source")},options || {}));
        },

        /**
         * Start function.
         * Starting the widget, and returning the result of starting it
         *
         * @override
         *
         */
        start: function () {
            var self = this;
            var r = this._super.apply(this, arguments);
            this.$('.oe_source_editor').nestedSortable({
                listType: 'ul',
                handle: 'div',
                items: 'li',
                maxLevels: 2,
                toleranceElement: '> div',
                forcePlaceholderSize: true,
                opacity: 0.6,
                placeholder: 'oe_source_placeholder',
                tolerance: 'pointer',
                attribute: 'data-source-id',
                expression: '()(.+)', // nestedSortable takes the second match of an expression (*sigh*)
            });
            return r;
        },

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        /**
         * Flatenize function.
         *
         * @param {*} sources
         */
        flatenize: function (sources) {
            var dict = {};
            var self = this;
            sources.forEach(function (source) {
                dict[source.id] = source;
            });
            return dict;
        },

        /**
         * Add source function.
         *
         */
        addSource: function () {
            var self = this;
            var dialog = new SourceEntryDialog(this, {}, undefined, {});
            dialog.on('save', this, function (link) {
                var new_source = {
                    id: _.uniqueId('new-'),
                    shop_list_params: link.text,
                    shop_list_url: link.url,
                    shop_list_color: link.color,
                    shop_list_tag: link.tag,
                    shop_list_info: link.info,
                };
                self.flat[new_source.id] = new_source;
                self.$('.oe_source_editor').append(
                    qweb.render(
                        'website_shops_map.shop_list_url_source',
                        { source: new_source }
                    )
                );
            });
            dialog.open();
        },

        /**
         * Edit source function.
         *
         * @param {*} ev
         */
        editSource: function (ev) {
            var self = this;
            var source_id = $(ev.currentTarget).closest('[data-source-id]').data('source-id');
            var source = self.flat[source_id];
            if (source) {
                var dialog = new SourceEntryDialog(this, {}, undefined, source);
                dialog.on('save', this, function (link) {
                    var id = link.id;
                    var source_obj = self.flat[id];
                    _.extend(source_obj, {
                        'shop_list_params': link.text,
                        'shop_list_url': link.url,
                        'shop_list_color': link.color,
                        'shop_list_tag': link.tag,
                        'shop_list_info': link.info,
                    });
                    var $source = self.$('[data-source-id="' + id + '"]');
                    $source.find('.js_source_label').first().text(source_obj.shop_list_url);
                });
                dialog.open();
            } else {
                alert(_t("Could not find source entry"));
            }
        },

        /**
         * Delete source function.
         *
         * @param {*} ev
         */
        deleteSource: function (ev) {
            var self = this;
            var $source = $(ev.currentTarget).closest('[data-source-id]');
            var sid = $source.data('source-id');
            var mid = $source.data('source-id')|0;
            if (mid) {
                this.to_delete.push(mid);
                delete this.flat[mid];
            } else {
                delete this.flat[sid];
            }
            $source.remove();
        },

        /**
         * Save function.
         *
         * @override
         */
        save: function () {
            var self = this;
            var new_source = this.$('.oe_source_editor').nestedSortable('toArray', {startDepthCount: 0});
            var levels = [];
            var data = self.flat;
            var context = {};

            // Save sources for widget
            ajax.jsonRpc('/web/dataset/call_kw', 'call', {
                model: 'shop.list.config',
                method: 'save',
                args: [[context.website_id], {
                    data: data,
                    to_delete: self.to_delete,
                    widget_id: self.widget_id
                }],
                kwargs: {
                    context: context
                },
            }).then(function (source) {
                self.close();
            });
        },
    });

    var SourceEntryDialog = LinkDialog.extend({
        /**
         * Init function.
         *
         * @constructor
         *
         * @param {*} parent
         * @param {*} options
         * @param {*} editor
         * @param {*} data
         */
        init: function (parent, options, editor, data) {
            data.text = data.shop_list_params || '';
            data.url = data.shop_list_url || '';
            data.color = data.shop_list_color || '';
            data.tag = data.shop_list_tag || '';
            data.info = data.shop_list_info || '';
            data.tags_avail = data.tags_avail || [];
            data.tags = data.tags || [];
            data.isNewWindow = data.new_window;
            this.data = data;
            return this._super.apply(this, arguments);
        },

        /**
         * Start function
         *
         * @override
         */
        start: function () {
            var self = this;

            // remove style selector
            this.$(".link-style").remove();

            // remove "new window" checkbox
            this.$(".pull-right").remove();

            // remove selector of pages
            this.$("ul[class=list-group]")[0].children[0].remove();

            this.$("h4[class=modal-title]").text(_t("Configuring the data source"));
            this.$("label[for=link-new]").parent().replaceWith(function(index,oldHTML) {
                return $('<h5 class="list-group-item-heading">').html(oldHTML)
            })
            this.$("label[for=link-new]").text(_t("Source API-key"));
            this.$("label[for=link-external]").parent().replaceWith(function(index,oldHTML) {
                return $('<h5 class="list-group-item-heading">').html(oldHTML)
            })
            this.$("label[for=link-external]").text(_t("Source URL"));
            var mainDiv = this.$("div[class=list-group]").parent();
            var divListGroup = $(
                '<div class="list-group">' +
                    '<div class="form-group list-group-item" style="overflow:hidden">' +
                        '<div class="col-md-1 mr16">' +
                            '<h5 class="mt16">' + _t("Options") + ':</h5>' +
                        '</div>' +
                        '<h5><label class="col-md-1 control-label vertic-align text-center" for="optcolor" title="' + _t("Enter name of the HTML-color") + '">' + _t("Color") + '</label></h5>' +
                        '<div class="col-md-2">' +
                            '<input class="form-control" type="text" value="' + this.data.color + '" id="optcolor" maxlength="10"/>' +
                        '</div>' +
                        '<h5><label class="col-md-1 control-label vertic-align text-center" for="opttag" title="' + _t("Marked label to show before the caption of the shop card") + '">' + _t("Label") + '</label></h5>' +
                        '<div class="col-md-2">' +
                            '<input class="form-control" type="text" value="' + this.data.tag + '" id="opttag" maxlength="10"/>' +
                        '</div>' +
                        '<h5><label class="ml32 col-md-1 control-label vertic-align" for="optinfo" title="' + _t("Option to show info in the caption of the shop card") + '">' + _t("Info") + '</label></h5>' +
                        '<div class="col-md-1 mt4">' +
                            '<input type="radio" name="info" value="km">&nbsp;' + _t("Km") + '</>' +
                        '</div>' +
                        '<div class="col-md-2 mt4 mb16">' +
                            '<input type="radio" name="info" value="num">&nbsp;' + _t("Code") + '</>' +
                        '</div>' +
                    '</div>' +
                '</div>');
            mainDiv.append($divListGroup);
            if (this.data.info == 'num') {
                this.$("input[value=num]").attr('checked','checked')
            } else {
                this.$("input[value=km]").attr('checked','checked')
            };
            if (this.data.tags_avail.length) {
                var divListGroupShopTags = $(
                    '<div class="list-group">' +
                        '<div id="tags-group" class="form-group list-group-item" style="overflow:hidden">' +
                            '<div class="col-md-2">' +
                                '<h5>' + _t("Shop tags:") + '</h5>' +
                            '</div>' +
                        '</div>' +
                    '</div>');
                mainDiv.append($divListGroupShopTags);
                var tagsDiv = this.$("#tags-group");
                var tagsSelected = this.data.tags.length > 0
                if (tagsSelected && this.data.tags[0] == '') {
                    this.data.tags = this.data.tags_avail
                }
                for (var i=0; i < this.data.tags_avail.length; i++) {
                    var tagName = this.data.tags_avail[i];
                    var divListGroupTagsRow = $(
                        '<div class="col-md-2 mt8">' +
                            '<input id="shoptag' + i + '" type="checkbox" class="vertic-align" value="' + tagName + '" style="transform:scale(1.3);"/>' +
                            '<span class="ml8">' + tagName + '</span>' +
                        '</div>');
                    tagsDiv.append($divListGroupTagsRow);
                    if (tagsSelected) {
                        if (this.data.tags.indexOf(tagName) > -1) {
                            tagsDiv.find('#shoptag'+i).attr('checked','checked');
                        }
                    } else {
                        if (tagName == 'shop') {
                            tagsDiv.find('#shoptag'+i).attr('checked','checked');
                        }
                    }
                }
            }
            return $.when(this._super.apply(this, arguments)).then(function () {
                var $link_text = self.$('#link-text').focus();
                self.$('#link-page').change(function (e) {
                    if ($link_text.val()) {
                        return;
                    }
                    var data = $(this).select2('data');
                    $link_text.val(data.create ? data.id : data.shop_list_url);
                    $link_text.focus();
                });
            });
        },

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        /**
         * Save function.
         *
         * @override
         */
        save: function () {
            var $e = this.$('#link-text');
            if (!$e.val() || !$e[0].checkValidity()) {
                $e.closest('.form-group').addClass('has-error');
                $e.focus();
                return;
            }
            this.data.color = this.$("#optcolor").val();
            this.data.tag = this.$("#opttag").val();
            if (this.$("input[value=num]").prop('checked')){
                this.data.info = 'num'
            } else {
                this.data.info = 'km'
            }
            var tagInputs = this.$("input[id*=shoptag]");
            this.data.tags = []
            for (var i=0; i < tagInputs.length; i++) {
                if (this.$(tagInputs[i]).prop('checked')) {
                    this.data.tags.push(this.$(tagInputs[i]).val())
                }
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Destroy function.
         * Widget destruction and cleanup
         *
         */
        destroy: function () {
            this._super.apply(this, arguments);
        },
    });

    // Registries the function for open the customization dialog
    // Snippet option for Set visibility, List visibility, Map visibility and Widget settings
    options.registry.public_shop_list = options.Class.extend({
        /**
         * Set visibility function.
         *
         * @param {*} elem
         * @param {*} visible
         */
        setVisibility: function (elem, visible) {
            // save changes in edit mode
            var $visible = $(elem).data();
            $visible.visible = visible;

            // save changes to object
            elem.attr("data-visible", visible);
        },

        /**
         * List visibility function.
         *
         * @param {*} type
         * @param {*} data
         */
        list_visibility : function (type, data) {
            if (type !== "click") return;
            var self = this;
            var section = self.$target
            var listLi = ($(section).find('#shop-show-list-tab')).parent(),
                shopListPanel = $(section).find('#shop_list_panel'),
                mapLi = ($(section).find('#shop-show-map-tab')).parent(),
                shopMapPanel = $(section).find('#shop_map_panel'),
                map_a = $(section).find('#shop-show-map-tab');

            if (listLi.attr("data-visible") === "on") {
                listLi
                    .css('display', 'none')
                    .attr('class', '');
                shopListPanel.attr('class', 'tab-pane fade');
                mapLi.attr('class', 'active');
                shopMapPanel.attr('class', 'tab-pane fade in active');
                map_a.tab('show');
                self.setVisibility(listLi, 'off');
            } else {
                listLi.css('display', 'block');
                self.setVisibility(listLi, 'on');
            };
        },

        /**
         * Map visibility function.
         *
         * @param {*} type
         * @param {*} data
         */
        map_visibility : function (type, data) {
            if (type !== "click") return;
            var self = this;
            var section = self.$target;
            var listLi = ($(section).find('#shop-show-list-tab')).parent(),
                shopListPanel = $(section).find('#shop_list_panel'),
                mapLi = ($(section).find('#shop-show-map-tab')).parent(),
                shopMapPanel = $(section).find('#shop_map_panel');
            var route_link = $(section).find('[data-block="route_link"]');

            if (mapLi.attr("data-visible") === "on") {
                mapLi
                    .css('display', 'none')
                    .attr('class', '');
                shopMapPanel.attr('class', 'tab-pane fade');
                listLi.attr('class', 'active');
                shopListPanel.attr('class', 'tab-pane fade in active');
                route_link.attr('class', 'col-xs-6 text-right invisible');
                self.setVisibility(mapLi, 'off');
            } else {
                mapLi.css('display', 'block');
                self.setVisibility(mapLi, 'on');
                route_link.attr('class', 'col-xs-6 text-right');
            };
        },

        /**
         * Widget settings function.
         *
         * @param {*} type
         * @param {*} data
         */
        widget_settings : function (type, data) {
            if (type!=="click") return;
            var self = this;
            var section = $(self.$target).find('#shop-list-snippet-wrapper');
            var uuid = $(section).attr('data-id');

            if (!uuid) {
                var uuidNumber = new Date().getTime();
                uuid = 'publicShopMap' + uuidNumber
                $(section).attr('data-id', uuid)
                var $wizard_id = $(section).data();
                $wizard_id.id = uuid
            }

            // Get sources for widget
            ajax.jsonRpc('/web/dataset/call_kw', 'call', {
                model: 'shop.list.config',
                method: 'get_sources_for_widget',
                args: [uuid],
                kwargs: {
                    context: {}
                }
            }).then(function (res) {
                var result = new EditSourcesDialog(this,res,uuid).open();
                return result;
            });
        },
    });

});
