odoo.define("website_shops_map.shop_list", function (require) {
    "use strict";

    var ajax = require("web.ajax");
    var web_editor_base = require("web_editor.base");
    var core = require("web.core");
    var session = require("web.session");
    var Widget = require("web.Widget");

    var Backbone = window.Backbone;
    var qweb = core.qweb;
    var _t = core._t;

    ajax.loadXML("/api/templates", qweb);

    if (typeof(Number.prototype.toRadians) === "undefined") { // just in case
        Number.prototype.toRadians = function () {
            return (this * Math.PI) / 180;
        };
    }

    /**
     * Decimal rounding function.
     *
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === "undefined" || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split("e");
        value = Math[type](+(value[0] + "e" + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split("e");
        return +(value[0] + "e" + (value[1] ? (+value[1] + exp) : exp));
    }

    /**
     * Makes an iterator for the array function.
     *
     */
    function makeIterator(array) {
        var nextIndex = 0;

        return {
            next: function () {
               return nextIndex < array.length ?
                   { value: array[nextIndex++], done: false } :
                   { done: true };
            },
        };
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust("round", value, exp);
        };
    }

    /**
     * Function to filter the list of stores by search string.
     *
     */
    var filter_shops = function filter_shops(query) {
        return function (value) {
            try {
                adminMode = false;
                var array_query = query.split(",").map(String);
                // search in address fields if query is not а number
                if (isNaN(Number(array_query[0]))) {
                    var result =
                        value.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
                        value.full_address.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
                        value.metro_station.toLowerCase().indexOf(query.toLowerCase()) !== -1;
                } else {
                    // search in shop number field if query is a number or array of numbers
                    adminMode = true;
                    for (var i = 0; i < array_query.length; i++) {
                        var result = (
                            array_query[i].indexOf(value.code) !== -1
                        );
                        if (result) {
                            break;
                        }
                    }
                }
            } catch (e) {};
            return result;
        };
    };

    /**
     * Function to filter shops by id.
     *
     */
    var filter_shops_by_id = function filter_shops(ids) {
        return function (value) {
            try {
                var result = (value.id in ids);
            } catch (e) {}
            return result;
        };
    };

    /**
     * Function to filter the list of stores by a set of properties.
     *
     */
    var filter_shops_on_properties = function filter_shops_on_properties(properties) {
        return function (value) {
            var props = [];
            value.properties_ids.forEach(function (val) {
                props.push(val.name);
            });
            for (var i = 0, len = properties.length; i < len; i++) {
                if ($.inArray(properties[i], props) === -1) {
                    return false;
                }
            }
            return true;
        };
    };

    var baseWidget = Widget.extend({
       /**
        * @override
        * @param {Object} params
        * @param {Object} options
        */
        init: function (parent, options) {
            this._super(parent);
            options = options || {};
        },
        /**
         * @override
         */
        show: function () {
            this.$el.removeClass("oe_hidden");
        },
        /**
         * @override
         */
        hide: function () {
            this.$el.addClass("oe_hidden");
            if ($("#shop-list-snippet-wrapper").length) {
                var shop_list = new shopList($("body")).setElement($("#shop-list-snippet-wrapper"));
            }
        },
    });

    var adminMode = false; // flag to show numders of shops on search by numbers
    var Forced = true; // flag to force refreshing geolocation coordinates

    /**
     * Shop list function.
     *
     */
    var shopList = baseWidget.extend({
        template: "ShopListTemplate",
        settings: {},
        shop_list: [],
        shop_list_advance: [],
        client_placemark: false,
        map: false,
        route: false,
        on_map_tab: false,
        show_route: false,
        show_own_shop_route: false,
        // Latitude
        latitude: 0.0,
        // Longitude
        longitude: 0.0,
        full_client_address: _t("Not defined"),
        properties_selector: false,
        properties: [],
        controller: false,
        widget_id: false,
        show_code: false,
        scale: 14,
        show_client: true,
        switch_map: false,
        shops_on_page: 65535,

        /**
         * Compute shop distance function.
         *
         * Calculation of the distance between the client and the store,
         * 0 if there are no client coordinates.
         *
         * @param {*} shop
         */
        compute_shop_distance: function (shop) {
            if (this.latitude && this.longitude) {
                var R = 6371; // Radius of the earth in km
                var dLat = (this.latitude - shop.partner_latitude).toRadians();
                var dLon = (this.longitude - shop.partner_longitude).toRadians();
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(shop.partner_latitude.toRadians()) * Math.cos(this.latitude.toRadians()) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                return Math.round10(d, -2);
            } else {
                return 0.0;
            }
        },

        /**
         * Get latitude and longitude function.
         *
         * Obtaining the client's coordinates (coarse coordinates are obtained
         * from yandex-maps, then refined if the user allows the use of geolocation).
         *
         * @param {*} Forced
         */
        get_lat_lng: function (Forced) {
            var deferred = $.Deferred();
            var deferred_browser = $.Deferred();
            var self = this;

            // callback to correct latitude and longitude by browser deferred navigation
            deferred_browser.done(function () {
                $.cookie("geo_lat", self.latitude, { expires: 365, path: "/" });
                $.cookie("geo_lon", self.longitude, { expires: 365, path: "/" });
                console.log("ShopsMap GeoLocation: browser coordinates are updated:");
                self.get_client_address().then(function () {
                    self.render_client_address();
                    self.render_shoplist(self.shop_list, 0);
                });
            });

            // if there are cookies, read cookies
            if ($.cookie("geo_lat") && $.cookie("geo_lon") && !Forced) {
                console.log("ShopsMap GeoLocation: cookies are used");
                self.latitude = parseFloat($.cookie("geo_lat"));
                self.longitude = parseFloat($.cookie("geo_lon"));
                deferred.resolve();
            } else {
                // otherwise compute values of latitude and longitude
                console.log("ShopsMap GeoLocation: yandex geolocation is used");
                self.latitude = ymaps.geolocation.latitude;
                self.longitude = ymaps.geolocation.longitude;
                deferred.resolve();
                if (navigator.geolocation) {
                    console.log("ShopsMap GeoLocation: browser geolocation is available");
                    navigator.geolocation.getCurrentPosition(function (position) {
                        console.log("ShopsMap GeoLocation: browser navigator is used");
                        self.latitude = position.coords.latitude;
                        self.longitude = position.coords.longitude;
                        deferred_browser.resolve();
                    }, function (error) {
                        console.log("ShopsMap GeoLocation: browser geolocation positioning error");
                    });
                } else { /*deferred.resolve()*/ }
            }

            // Firefox bug 675533 workaround
            // https://bugzilla.mozilla.org/show_bug.cgi?id=675533
            if (typeof InstallTrigger !== "undefined") { // if browser is Firefox
                setTimeout(function () {
                    deferred.resolve();
                }, 3000); // should be around 3 seconds
            }
            return deferred;
        },

        /**
         * Get the client address function.
         *
         * According to the client's coordinates, we get his address in
         * human language through ymaps api.
         */
        get_client_address: function () {
            var deferred = $.Deferred();
            var self = this;
            console.log("ShopsMap GeoLocation: latitude " + self.latitude + " and longitude " + self.longitude);
            var url = "https://geocode-maps.yandex.ru/1.x/?geocode=" + self.longitude + ", " + self.latitude + "&format=json";
            console.log("ShopsMap GeoLocation: Retrieving client address...");
            $.ajax({
                url: url,
                dataType: "json",
                timeout: 10000
            }).then(function (result) {
                console.log("ShopsMap GeoLocation: Result success response: " + result.response);
                result = result.response;
                console.log(result);
                if (result.GeoObjectCollection && result.GeoObjectCollection.featureMember) {
                    self.full_client_address = result.GeoObjectCollection.featureMember[0].GeoObject.description +
                                               ", " + result.GeoObjectCollection.featureMember[0].GeoObject.name
                    console.log("ShopsMap GeoLocation: Address retrieved successfully: " + self.full_client_address);
                    deferred.resolve();
                } else {
                    self.full_client_address = _t("Not defined");
                    deferred.reject();
                }
            }).fail(function (result) {
                console.log("ShopsMap GeoLocarion: Error retrieving client address from gecode-maps.yandex.ru");
                console.log("ShopsMap GeoLocation: Result fail response: " + result.response);
                console.log(result);
                self.full_client_address = _t("Address determination error");
                deferred.reject();
            });
            return deferred;
        },

        /**
         * Find shop by id function.
         *
         * @param {*} shop_id
         */
        find_shop_by_id: function (shop_id) {
            for (var i = 0, len = this.shop_list.length; i < len; i++) {
                if (this.shop_list[i].id === shop_id) {
                    return this.shop_list[i];
                }
            }
            return false;
        },

        /**
         * Remove placemarks function.
         *
         * This removes all markers from the map.
         *
         * @param {*} dont_remove_client
         */
        remove_placemarks: function (dont_remove_client) {
            if (this.map) {
                var self = this;
                if (this.route) {
                    // Removing the route to the map
                    this.map.geoObjects.remove(this.route);
                    self.route = false;
                }
                if (this.client_placemark && !dont_remove_client) {
                    // Removing the route to the map
                    this.map.geoObjects.remove(this.client_placemark);
                    this.client_placemark = false;
                }
                for (var i = 0, len = this.shop_list.length; i < len; i++) {
                    if (this.shop_list[i].placemark) {
                        // Removing the route to the map
                        this.map.geoObjects.remove(this.shop_list[i].placemark);
                        this.shop_list[i].placemark = false;
                    }
                }
            }
        },

        /**
         * Load all settings to get a list of stores function.
         *
         */
        load_settings: function () {
            var deferred = $.Deferred();
            var self = this;

            if ($(self.$el[0]).attr("data-id")) {
                self.widget_id = $(self.$el[0]).attr("data-id");
            } else {
                var uuid_number = new Date().getTime();
                self.widget_id = "eyekraftShopMap" + uuid_number;
                $(self.$el[0]).attr("data-id", self.widget_id);
            }

            // check for attribute to show a limited number of shops
            // according value of attribite 'shops-ids'
            if ($(self.$el[0]).attr("shops-ids")) {
                var shopIds = $(self.$el[0]).attr("shops-ids");
                shopIds = shopIds.slice(1, shopIds.length - 1);
                shopIds = shopIds.split(",").map(Number);
            } else {
                var shopIds = [];
            }

            // check for attribute to set permanent default map coordinates
            if ($(self.$el[0]).attr("lat")) {
                self.latitude = parseFloat($(self.$el[0]).attr("lat"));
                self.longitude = parseFloat($(self.$el[0]).attr("long"));
            }

            // check for attribute to set initial map scale
            if ($(self.$el[0]).attr("zoom")) {
                self.scale = parseInt($(self.$el[0]).attr("zoom"));
            }

            // check for attribute to show client placemark
            if ($(self.$el[0]).attr("client-placemark")) {
                self.show_client = parseInt($(self.$el[0]).attr("client-placecemark"));
            }

            // check for attribute to switch to map after loading (on desktop only)
            if ($(self.$el[0]).attr("switch-to-map")) {
                self.switch_map = ($(self.$el[0]).attr("switch-to-map") === "true");
                if (window.screen.width < 800) {
                    self.switch_map = false;
                }
            }

            // check for attribute to define number of shops per page
            if ($(self.$el[0]).attr("shops-on-page")) {
                self.shops_on_page = parseInt($(self.$el[0]).attr("shops-on-page"));
            }

            // check for attribute to define number of shops per page on mobiles
            if ($(self.$el[0]).attr("shops-on-page-mob")) {
                if (window.screen.width <= 800) {
                    self.shops_on_page = parseInt($(self.$el[0]).attr("shops-on-page-mob"));
                }
            }

            ajax.jsonRpc("/api/shoplist/params", "POST", {
                widget_id: self.widget_id,
                "ids": shopIds
            }).then(function (result) {
                self.settings = JSON.parse(result);
                deferred.resolve();
            });

            return deferred;
        },

        /**
         * Load shop list function.
         *
         * We load the list of stores, since we start rendering only after
         * the entire list of stores has been received, and there can be many
         * sources of stores - we create a recursive promise queue, iterating
         * through the available list of settings as soon as all stores are
         * received (the entire queue of promises has resolved) - the resulting
         * promise resolves.
         *
         * @param {*} query
         * @param {*} lat
         * @param {*} long
         */
        load_shop_list: function (query, lat, long) {
            var deferred = $.Deferred();
            var self = this;
            var property_flags = {};
            function loadList(settingsIterator) {
                var def = $.Deferred();
                var settings = settingsIterator.next();
                if (settings.done) {
                    def.resolve();
                    return def;
                } else {
                    settings = settings.value;
                    ajax.jsonRpc(settings.shop_list_url, "POST", settings.shop_list_params).then(function (result) {
                        var shop_list = JSON.parse(result);
                        for (var i = 0, len = shop_list.length; i < len; i++) {
                            // to keep compatibility with previous versions of module
                            // need to copy old 'latitude/longitude' properties
                            // to new geocoordinates properties inherited from res.partner model
                            if (!shop_list[i].partner_latitude) {
                                shop_list[i]["partner_latitude"] = shop_list[i].latitude;
                                shop_list[i]["partner_longitude"] = shop_list[i].longitude;
                            }
                            shop_list[i].color = settings.shop_list_params.color;
                            shop_list[i].tag = settings.shop_list_params.tag;
                            shop_list[i].info = settings.shop_list_params.info;
                            shop_list[i].map_url = "https://static-maps.yandex.ru/1.x/?l=map&pt=" + shop_list[i].partner_longitude + "," + shop_list[i].partner_latitude + ",pm2rdm&size=400,400&z=16";
                            shop_list[i].map_id = "shop-card-small-map-" + shop_list[i].id;
                            shop_list[i].map_href = "#shop-card-small-map-" + shop_list[i].id;
                            shop_list[i].own_map_id = "shop-card-small-map-" + shop_list[i].id + "-own";
                            shop_list[i].own_map_href = "#shop-card-small-map-" + shop_list[i].id + "-own";
                            shop_list[i].own_page_href = "#shop/id" + shop_list[i].id;
                            shop_list[i].properties_ids.forEach(function (prop) {
                                if (!property_flags[prop.name]) {
                                    self.properties.push(prop);
                                    property_flags[prop.name] = true;
                                }
                            });
                        }
                        self.shop_list = self.shop_list.concat(shop_list);
                        loadList(settingsIterator).then(function () {
                            def.resolve(true);
                        });
                    });
                }
                return def;
            }

            loadList(makeIterator(this.settings)).then(function () {
                deferred.resolve();
            });
            return deferred;
        },

        /**
         * Render a list of stores function.
         *
         * @param {*} shop_list
         * @param {*} index
         */
        render_shoplist: function (shop_list, index) {
            var self = this;
            var contents = this.$el[0].querySelector(".shop-list-container");

            // index == 0 means first call of the method
            // in this case making distance counting and sorting of shop_list
            if (index == 0) {
                contents.innerHTML = "";
                for (var i = 0, len = shop_list.length; i < len; i++) {
                    shop_list[i].distance = this.compute_shop_distance(shop_list[i]);
                }
                shop_list.sort(function (a, b) {
                    return a.distance - b.distance;
                });

                // cropped shoplist for catalog usage
                if ($("#shoplist")) {
                    var shop_list_cropped = [];
                    for (var i = 0; i < 3 && i < shop_list.length; i++) {
                        shop_list_cropped.push({
                            'name': shop_list[i].name,
                            'address': shop_list[i].full_address,
                            'phone': shop_list[i].phone,
                            'working_hours': shop_list[i].working_hours
                        });
                    }
                    $("#shoplist").attr("shopsids", JSON.stringify(shop_list_cropped));
                }

                // add advance search records in front of shoplist array
                if (self.shop_list_advance.length > 0) {
                    for (var i = 5; i >= 0; i--) {
                        try {
                            var tempIdx = shop_list.indexOf(self.shop_list_advance[i]);
                            if (tempIdx > -1) {
                                var temp = shop_list.splice(tempIdx, 1);
                                shop_list.unshift(temp[0]);
                            }
                        } catch (e) {}
                    }
                }
            }

            len = index + self.shops_on_page;
            if (len > shop_list.length) {
                len = shop_list.length;
            }
            for (var i = index; i < len; i++) {
                var shop = shop_list[i];
                shop.show_route_id = "shop-show-route-" + shop.id;
                // Render the "Shop Card" Template
                var shop_card_html = qweb.render(
                    "website_shops_map.eyekraft_shop_card", {
                        widget: this,
                        shop: shop,
                        adminMode: adminMode
                    }
                );
                var shop_card = document.createElement("div");
                shop_card.innerHTML = shop_card_html;
                shop_card = shop_card.childNodes[1];
                contents.appendChild(shop_card);
                $("#" + shop.show_route_id).click(function (event) {
                    var shop_id = parseInt(event.currentTarget.attributes.shop.value);
                    var shop = self.find_shop_by_id(shop_id);
                    if (shop) {
                        self.show_route = true;
                        $("#eyekraft-shop-list-address-input").val(shop.full_address);
                        $('a[id="eyekraft-show-map-tab"]').tab("show");
                        self.on_map_tab = true;
                    }
                });
            }
            // creates 'next-shops' button
            // if there are more shops unseen
            var nextDiv = document.getElementById("next-button-div");
            if (nextDiv) {
                nextDiv.parentNode.removeChild(nextDiv);
            }
            if (len < shop_list.length) {
                nextDiv = document.createElement("div");
                nextDiv.style.width = "100%";
                nextDiv.style.textAlign = "center";
                nextDiv.id = "next-button-div";
                contents.appendChild(nextDiv);
                var nextButton = document.createElement("a");
                nextButton.id = "next-shops";
                nextButton.text = _t("More to show");
                nextButton.className = "btn btn-primary";
                nextDiv.appendChild(nextButton);
                contents.appendChild(nextDiv);
                $("#next-shops").click(function (event) {
                    self.render_shoplist(shop_list, len);
                });
            }
            var section = self.$el[0];
            var list_li = ($(section).find("#eyekraft-show-list-tab")).parent(),
                map_li = ($(section).find("#eyekraft-show-map-tab")).parent(),
                shop_map_panel = $(section).find("#shop_map_panel"),
                shop_list_panel = $(section).find("#shop_list_panel");

            if (list_li.attr("class") != "active" || self.switch_map) {
                shop_list_panel.attr("class", "tab-pane fade");
                shop_map_panel.attr("class", "tab-pane fade in active");
                map_li.attr("class", "active");
                list_li.attr("class", "");
                self.switch_map = false;
                self.on_map_tab = true;
                $('a[id="eyekraft-show-map-tab"]').trigger("shown.bs.tab");
            } else {
                shop_map_panel.attr("class", "tab-pane fade");
                shop_list_panel.attr("class", "tab-pane fade in active");
                list_li.attr("class", "active");
                map_li.attr("class", "");
                self.on_map_tab = false;
            }
        },

        /**
         * Render the client's address, the client's address is supplemented with
         * an edit field with autocomplete based on data from the yandex geocoder,
         * requests to the geocoder start leaving when the request length exceeds
         * 8 letters. function.
         *
         */
        render_client_address: function () {
            var self = this;
            var contents = this.$el[0].querySelector(".eyekraft-geocoded-address");
            contents.innerHTML = "";
            // Render the "Shop List Client Address" Template
            var address_html = qweb.render(
                "website_shops_map.eyekraft_shop_list_client_address", {
                    widget: this,
                    address: this.full_client_address
                }
            );
            var address = document.createElement("div");
            address.innerHTML = address_html;
            address = address.childNodes[1];
            contents.appendChild(address);

            var yandex_lookup = function (query, callback) {
                if (query.length > 2) {
                    var url = "https://geocode-maps.yandex.ru/1.x/?geocode=" + query + "&format=json";
                    $.ajax({
                        url: url,
                        dataType: "json"
                    })
                    .then(function (result) {
                        result = result.response.GeoObjectCollection;
                        var data = [];
                        for (var i = 0, len = result.featureMember.length; i < len; i++) {
                            var elem = result.featureMember[i].GeoObject;
                            data.push({
                                "value": elem.description + ", " + elem.name,
                                "data": elem.Point
                            });
                        }
                        data = {
                            "suggestions": data
                        }
                        callback(data);
                    })
                    .fail(function (result) {
                        self.full_client_address = _t("Not defined");
                        console.log("ShopsMap GeoLocarion: Error retrieving client address from gecode-maps.yandex.ru");
                        deferred.reject();
                    });
                }
            };

            $("#eyekraft-shop-list-refresh")
                .click(function (event) {
                    $("#eyekraft-shop-list-user-geoloc-text").html(_t("determined...") + " <span class='fa fa-refresh fa-spin ml8'/>");
                    self.get_lat_lng(Forced)
                        .then(function () {
                        self.get_client_address().then(function () {
                            self.render_client_address();
                            self.render_shoplist(self.shop_list, 0);
                        });
                        $.cookie("geo_lat", self.latitude, { expires: 365, path: "/" });
                        $.cookie("geo_lon", self.longitude, { expires: 365, path: "/" });
                    });
                });

            $("#eyekraft-shop-list-user-geoloc-input").autocomplete({
                lookup: yandex_lookup,
                onSelect: function (suggestion) {
                    var lat_lng = suggestion.data.pos.split(" ");
                    self.latitude = parseFloat(lat_lng[1]);
                    self.longitude = parseFloat(lat_lng[0]);
                    self.full_client_address = suggestion.value;
                    self.render_client_address();

                    try {
                        var query = $("#eyekraft-shop-list-address-input")[0].value;
                    } catch (e) {}

                    if (query) {
                        var shop_list = self.shop_list.filter(filter_shops(query));
                    } else {
                        var shop_list = self.shop_list;
                    }

                    var properties = $("#eyekraft_props_picker").val();
                    if (properties && properties.length > 0) {
                        shop_list = shop_list.filter(filter_shops_on_properties(properties));
                    }

                    if (self.on_map_tab) {
                        self.remove_placemarks();
                        self.render_client_placemark();
                        self.render_vertical_shoplist(shop_list);
                    } else {
                        self.render_shoplist(shop_list, 0);
                    }

                    $.cookie("geo_lat", self.latitude, { expires: 365, path: "/" });
                    $.cookie("geo_lon", self.longitude, { expires: 365, path: "/" });
                },
            });
        },

        /**
         * Render the store list rendering on the map tab.
         *
         * @param {*} shop_list
         */
        render_vertical_shoplist: function (shop_list) {
            var contents = this.$el[0].querySelector("#shop-list-vertical");
            contents.innerHTML = "";
            var self = this;
            for (var i = 0, len = shop_list.length; i < len; i++) {
                shop_list[i].distance = this.compute_shop_distance(shop_list[i]);
            }
            shop_list.sort(function (a, b) {
                return a.distance - b.distance;
            });

            // add advance search records in front of shoplist array
            if (self.shop_list_advance.length > 0) {
                for (var i = 5; i >= 0; i--) {
                    try {
                        var tempIdx = shop_list.indexOf(self.shop_list_advance[i]);
                        if (tempIdx > -1) {
                            var temp = shop_list.splice(tempIdx, 1);
                            shop_list.unshift(temp[0]);
                        }
                    } catch (e) {}
                }
            }

            for (var i = 0, len = shop_list.length; i < len; i++) {
                var shop = shop_list[i];
                // Let's create a label
                shop_list[i].placemark = new ymaps.Placemark(
                    [shop.partner_latitude, shop.partner_longitude],
                    {
                        // Render the "Shop Map Balloon" Template
                        balloonContent: qweb.render(
                            "website_shops_map.eyekraft_shop_map_balloon", {
                                widget: this,
                                adminMode: adminMode,
                                shop: shop
                            }
                        )
                    },
                    {
                        // Disable the balloon close button
                        balloonCloseButton: false,
                        // We will open and close the balloon by clicking on the label icon
                        hideIconOnBalloonOpen: false
                    }
                );
                // Adding the route to the map
                this.map.geoObjects.add(shop_list[i].placemark);
                shop.show_on_map_id = "shop-show-on-map-" + shop.id;

                // Render the "Shop Card Map" Template
                var shop_card_html = qweb.render(
                    "website_shops_map.eyekraft_shop_card_map", {
                        widget: this,
                        shop: shop
                    }
                );

                var shop_card = document.createElement("div");
                shop_card.innerHTML = shop_card_html;
                shop_card = shop_card.childNodes[1];
                contents.appendChild(shop_card);
                $("#" + shop.show_on_map_id).click(function (event) {
                    var lat = parseFloat(event.currentTarget.attributes.lat.value);
                    var lng = parseFloat(event.currentTarget.attributes.lng.value);
                    // Sets the center of the map
                    self.map.setCenter([lat, lng], 16, { checkZoomRange: true });
                    $("html, body").animate({
                        scrollTop: $("#map-container-vertical").offset().top
                    }, 500);
                });
            }

            if (self.show_route) {
                this.render_route(shop_list[0]);
                self.show_route = false;
            }
        },

        /**
         * Render the own big map function.
         *
         * @param {*} shop
         */
        render_big_map: function () {
            if (!this.map) {
                if (this.latitude && this.longitude) {
                    var center = [this.latitude, this.longitude];
                } else {
                    for (var i = 0, len = this.shop_list.length; i < len; i++) {
                        if (this.shop_list[i].partner_latitude && this.shop_list[i].partner_longitude) {
                            var center = [this.shop_list[i].partner_latitude, this.shop_list[i].partner_longitude];
                            break;
                        }
                    }
                }

                // Class for creating and managing a map
                this.map = new ymaps.Map("map-container-vertical", {
                    // Center of the map
                    center: center,
                    // The map will be created with controls
                    controls: ['largeMapDefaultSet'],
                    // Scale factor
                    zoom: this.scale
                });
                // Map scale control
                this.map.controls.add(new ymaps.control.ZoomControl());
                // Route editor control
                this.map.controls.add(new ymaps.control.RouteEditor());
                this.render_client_placemark();
            }
        },

        /**
         * Render the own big map function.
         *
         * @param {*} shop
         */
        render_own_big_map: function (shop) {
            var center = [shop.partner_latitude, shop.partner_longitude];
            // Class for creating and managing a map
            this.map = new ymaps.Map("own-map-container-vertical", {
                // Center of the map
                center: center,
                // The map will be created with controls
                controls: ['largeMapDefaultSet'],
                // Scale factor
                zoom: 14
            });
            // Map scale control
            this.map.controls.add(new ymaps.control.ZoomControl());
            // Route editor control
            this.map.controls.add(new ymaps.control.RouteEditor());
        },

        /**
         * Render the client placemark function.
         *
         * Put a mark on the map with the position of the client.
         */
        render_client_placemark: function () {
            if (this.show_client && this.map && this.latitude && this.longitude) {
                // Let's create a label
                this.client_placemark = new ymaps.Placemark(
                    [this.latitude, this.longitude], {
                        balloonContentHeader: _t("You are here"),
                        balloonContentBody: "",
                        area: ""
                    }, {
                        // Set a balloon without content
                        preset: "twirl#redIcon"
                    }
                );
                // Adding the route to the map
                this.map.geoObjects.add(this.client_placemark);
                // Sets the center of the map
                this.map.setCenter([this.latitude, this.longitude]);
            }
        },

        /**
         * Render the route function.
         *
         * Draws a route on the map.
         *
         * @param {*} shop
         */
        render_route: function (shop) {
            if (this.map) {
                if (this.latitude && this.longitude) {
                    var self = this;
                    // Building a route from customer location to shop localization
                    ymaps
                        .route(
                            [
                                {
                                    // The 'wayPoint' value is point through which you want to pass without stopping
                                    type: "wayPoint",
                                    // Array of point coordinates, or its address as a string
                                    point: [this.latitude, this.longitude]
                                },
                                {
                                    // The 'wayPoint' value is point through which you want to pass without stopping
                                    type: "wayPoint",
                                    // Array of point coordinates, or its address as a string
                                    point: [shop.partner_latitude, shop.partner_longitude]
                                }
                            ],
                            // A flag that allows you to automatically set the center and zoom factor
                            // of the map so that the constructed route is visible in its entirety
                            { mapStateAutoApply: true }
                        )
                        .then(function (route) {
                            self.route = route;
                            // Returns is a collection of paths that make up the route.
                            var points = self.route.getWayPoints();
                            // Set the current customer location
                            points.get(0).properties.set("balloonContentHeader", _t('Are you here'));
                            // Set the destination store location
                            points.get(0).properties.set("balloonContent", self.full_client_address);
                            // Set a balloon without content
                            points.get(0).options.set("preset", "twirl#redIcon");
                            // Render the "Shop Map Balloon" Template
                            points.get(1).properties.set("balloonContent", qweb.render(
                                "website_shops_map.eyekraft_shop_map_balloon", {
                                    widget: this,
                                    shop: shop
                                }
                            ));
                            // Returns the collection of paths that make up the route.
                            self.route.getPaths().options.set({
                                // The balloon only shows information about the travel time with traffic
                                balloonContentBodyLayout: ymaps.templateLayoutFactory.createClass(_t("Travel time: approx.") + " " + self.route.getHumanTime()),
                                // Set a custom opacity of the appearance for lines of the route
                                opacity: 0.9
                            });
                            // Adding the route to the map
                            self.map.geoObjects.add(self.route);
                        });
                } else {
                    // Sets the center of the map
                    this.map.setCenter([shop.partner_latitude, shop.partner_longitude]);
                }
            }
        },

        /**
         * Render the properties selector function.
         *
         * Store property selector render.
         *
         */
        render_properties_selector: function () {
            var contents = this.$el[0].querySelector("#eyekraft_props_picker");
            if (!(contents)) {
                return false;
            }
            contents.innerHTML = "";
            var val = [];
            for (var i = 0, len = this.properties.length; i < len; i++) {
                // Render the "Shop Map Properties Option" Template
                var option_html = qweb.render(
                    "website_shops_map.eyekraft_shop_map_props_option", {
                        widget: this,
                        option: this.properties[i].name
                    }
                );
                var option = document.createElement("div");
                option.innerHTML = option_html;
                option = option.childNodes[1];
                contents.appendChild(option);
                if ((this.properties[i].default) && (this.properties[i].path == window.location.pathname.toString() || !this.properties[i].path)) {
                    val.push(this.properties[i].name);
                }
            }
            $("#eyekraft_props_picker").selectpicker({
                iconBase: "fa",
                tickIcon: "fa-check"
            });
            $("#eyekraft_props_picker").selectpicker("val", val);
            if (this.properties.length > 0) {
                $(".bootstrap-select").removeClass("hidden");
            }
        },

        /**
         * Init function.
         *
         * Calls the necessary renderers and binds event handlers to UI elements.
         *
         * @constructor
         *
         * @param {*} parent
         * @param {*} options
         */
        init: function (parent, options) {
            this._super(parent);
            options = options || {};
            var self = this;

            // filter shoplist by search string and by value of shop property if available
            // search string checks out for valid geolocation information to sort shop list by distance from this point
            // if search string is a substring of name or address fields of shop record, these records list in advance
            var filter_on_properties = function filter_on_properties() {
                self.shop_list_advance = [];
                self.get_lat_lng(!Forced).then(function () {
                    var GeoSort = false;
                    try {
                        var query = $("#eyekraft-shop-list-address-input")[0].value;
                    } catch (e){};
                    var url = "https://geocode-maps.yandex.ru/1.x/?geocode=" + query + "&format=json&results=25";
                    $.ajax({
                        url: url,
                        dataType: "json"
                    }).then(function (result) {
                        if (query) {
                            // Set a collection of geo objects
                            result = result.response.GeoObjectCollection;
                            // Additional geo object meta-data with information about the request and the number of toponyms found
                            if (query.length > 2 && result.metaDataProperty.GeocoderResponseMetaData["found"] > 0) {
                                // featureMember, container for placing a single geo object or a group of geo objects
                                for (var i = 0; i < result.featureMember.length; i++) {
                                    // Set the detailed information about the toponym found
                                    var place = result.featureMember[i].GeoObject.metaDataProperty.GeocoderMetaData;
                                    // If country code and place kind is locality
                                    if ((['RU','KZ'].indexOf(place.Address.country_code) != -1) && place.kind == 'locality') {
                                        var lat_lng = result.featureMember[i].GeoObject.Point.pos.split(" ");
                                        var templatitude = self.latitude;
                                        var templongitude = self.longitude;
                                        self.latitude = parseFloat(lat_lng[1]);
                                        self.longitude = parseFloat(lat_lng[0]);
                                        var componentsNum = place.Address.Components.length - 1;
                                        GeoSort = true;
                                        break;
                                    }
                                }
                            }

                            // if there is a route query
                            // create short shoplist consists of exact shop address to show
                            // otherwise create advance search shoplist to add to sorted shoplist
                            if (self.show_route) {
                                var shop_list = self.shop_list.filter(filter_shops(query));
                            } else {
                                self.shop_list_advance = self.shop_list.filter(filter_shops(query));
                                var shop_list = self.shop_list;
                            }
                        } else {
                            adminMode = false;
                            var shop_list = self.shop_list;
                        }
                        var properties = $("#eyekraft_props_picker").val();
                        if (properties && properties.length > 0) {
                            shop_list = shop_list.filter(filter_shops_on_properties(properties));
                        }
                        if (self.on_map_tab) {
                            self.remove_placemarks();
                            self.render_client_placemark();
                            self.render_vertical_shoplist(shop_list);
                        } else {
                            self.render_shoplist(shop_list, 0);
                        }
                    });
                    if (GeoSort) {
                        self.shop_list_advance = self.shop_list.filter(filter_shops(query));
                        var shop_list = self.shop_list;
                        self.latitude = templatitude;
                        self.longitude = templongitude;
                    }
                });
            };

            // Render full list function
            var render_full_list = function render_full_list(error) {
                self.render_client_address();
                self.load_settings().done(function () {
                    self.load_shop_list().done(function () {
                        var shop_list = self.shop_list;
                        self.render_properties_selector();
                        $("#eyekraft_props_picker").on("changed.bs.select", function (e) {
                            filter_on_properties();
                        });
                        var properties = $("#eyekraft_props_picker").val();
                        if (properties && properties.length > 0) {
                            shop_list = shop_list.filter(filter_shops_on_properties(properties));
                        }
                        self.render_shoplist(shop_list, 0);
                        // Router section
                        var Controller = Backbone.Router.extend({
                            routes: {
                                "shop/id:id": "shop",
                                "shopList": "backToList",
                            },

                            /**
                             * Shop function.
                             */
                            shop: function (id) {
                                var shop = self.find_shop_by_id(Number(id));
                                var widget_content = self.$el[0].querySelector("#shop_widget_content"),
                                    widget_tabs = self.$el[0].querySelector("#shop_widget_tabs"),
                                    properties_selector = self.$el[0].querySelector("#eyekraft_props_picker_selector"),
                                    shop_search = self.$el[0].querySelector("#address-input-group"),
                                    back_href = self.$el[0].querySelector("#eyekraft_back_to_shop_list");
                                if (widget_content) {
                                    $(widget_content).css("display", "none");
                                }
                                if (widget_tabs) {
                                    $(widget_tabs).css("display", "none");
                                }
                                if (properties_selector) {
                                    $(properties_selector).css("display", "none");
                                }
                                if (shop_search) {
                                    $(shop_search).css("display", "none");
                                }
                                if (back_href) {
                                    $(back_href).css("display", "block");
                                }

                                shop.own_show_route_id = "shop-show-route-" + shop.id + "-own";
                                // Render the "Shop Map Own Page" Template
                                var shop_own_page_html = qweb.render(
                                    "website_shops_map.eyekraft_shop_own_page", {
                                        widget: self,
                                        shop: shop
                                    }
                                );
                                var shop_own_page = document.createElement("div");
                                shop_own_page.innerHTML = shop_own_page_html;
                                shop_own_page = shop_own_page.childNodes[1];
                                self.$el[0].appendChild(shop_own_page);

                                $("#" + shop.own_show_route_id).click(function (event) {
                                    var own_map_div = self.$el[0].querySelector("#own-map-container-vertical");
                                    if (own_map_div && own_map_div.innerHTML == "") {
                                        $(own_map_div).attr("style", "border: 1px solid lightgrey; width:100%; min-height:400px; max-height:200px; overflow:hidden;");
                                        self.render_own_big_map(shop);
                                        self.render_route(shop);
                                    }
                                });
                            },

                            /**
                             * Back to list function.
                             */
                            backToList: function () {
                                var widget_content = self.$el[0].querySelector("#shop_widget_content"),
                                    widget_tabs = self.$el[0].querySelector("#shop_widget_tabs"),
                                    properties_selector = self.$el[0].querySelector("#eyekraft_props_picker_selector"),
                                    shop_search = self.$el[0].querySelector("#address-input-group"),
                                    back_href = self.$el[0].querySelector("#eyekraft_back_to_shop_list"),
                                    own_page = self.$el[0].querySelector("#eyekraft_shop_own_page");
                                if (widget_content) {
                                    $(widget_content).attr("style", "");
                                }
                                if (widget_tabs) {
                                    $(widget_tabs).attr("style", "");
                                }
                                if (properties_selector) {
                                    $(properties_selector).attr("style", "");
                                }
                                if (shop_search) {
                                    $(shop_search).attr("style", "");
                                }
                                if (back_href) {
                                    $(back_href).css("display", "none");
                                }
                                if (own_page) {
                                    $(own_page).remove("#eyekraft_shop_own_page");
                                }
                            },
                        });

                        self.controller = new Controller();
                        Backbone.history.start();
                    });
                });
            }

            this.get_lat_lng(!Forced).then(function () { // success
                    $.cookie("geo_lat", self.latitude, { expires: 365, path: "/" });
                    $.cookie("geo_lon", self.longitude, { expires: 365, path: "/" });
                    self.get_client_address().then(render_full_list);
                }, render_full_list
            );

            $("#eyekraft-shop-list-address-input").on("keyup", function (event) {
                if (event.keyCode == 13) {
                    filter_on_properties();
                }
            });

            $(".find-shop-by-address").click(filter_on_properties);

            $('a[id="eyekraft-show-map-tab"]').on("shown.bs.tab", function (e) {
                var target = $(e.target).attr("href"); // activated tab
                self.render_big_map();
                self.on_map_tab = true;
                filter_on_properties();
                if (self.show_route) {
                    var query = $("#eyekraft-shop-list-address-input").val("");
                    $("html, body").animate({
                        scrollTop: $("#map-container-vertical").offset().top
                    }, 500);
                }
            });

            $('a[id="eyekraft-show-list-tab"]').on("shown.bs.tab", function (e) {
                var target = $(e.target).attr("href"); // activated tab
                self.on_map_tab = false;
                filter_on_properties();
            });
        },

        /**
         * Show function.
         *
         */
        show: function () {
            var self = this;
            this._super();
        },
    });

    web_editor_base.ready().then(function () {
        if ($("#shop-list-snippet-wrapper").length) {
            var shop_list = new shopList($("body")).setElement($("#shop-list-snippet-wrapper"));
        }
    });

    return { WebsiteShopList: shopList };
});
