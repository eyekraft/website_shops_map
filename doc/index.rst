===========
 Shops Map
===========

Also this documentation is available in other languages as *English* | `Russian <index_ru.rst>`_ | `Spanish <index_es.rst>`_.


Installation
============

* The '`geopy <https://geopy.readthedocs.io/en/latest/>`_' Python library must be installed first for shop geo-coordinates automatic calculation.

::

    $ pip install geopy==2.2.0


Configuration
=============

To register Odoo database as shop list source you need to generate local API-key.

* Open menu ``Inventory --> Warehouse Management --> API Settings --> Shop API Users``.

    .. figure:: ../static/description/scr_man_shop_api_users_form.png
      :width: 600px
      :alt: Screenshot for Shop API Users form

* Enter URL to current database and get you API-key on pushing saving button.

* Use this URL and generated API-key on map ``Shop List Snippet`` source setup.


Yandex Maps API
---------------

Set API key and map localization, visit the `page <https://yandex.com/dev/maps/jsapi/doc/2.1/quick-start/index.html#get-api-key>`_ about get an API Key for the "JavaScript API y HTTP Geocoder" Map service.

* Open menu ``Settings --> General Settings --> Yandex Maps View``.

    .. figure:: ../static/description/scr_man_yandex_settings_form.png
      :width: 600px
      :alt: Screenshot Addon for Yandex Maps View

* Fill all of the required data and save it.


Multi-Warehouses
----------------

You can manage several warehouses. You need to have Manager Access Rights for Inventory module to work with shops.

* Open menu ``Settings --> Inventory --> Warehouse -->`` `Multi-Warehouses <https://www.odoo.com/documentation/13.0/applications/inventory_and_mrp/inventory/management/warehouses/warehouse_creation.html>`_ to manage multiple warehouses.

    .. figure:: ../static/description/scr_man_warehouses_settings_form.png
      :width: 600px
      :alt: Screenshot for define Multi-Warehouses

* Fill all of the required data and save it.


Shop List Config
----------------

Create a Shop List Config because in the snippet configuration dialog you can choose next options of your shop list:

    * **Shop List Url**, defines the URL address for Shop List.

    * **Shop List Paramters**, defines the parameters for Shop List, like as:

      * **Colour**, defines colour of shop card border. Cause snippet allows to show lists from several sources it may be need to distinguish between them.

      * **Label**, defines short text mark placed before shop name. It has the same purpose as colour.

      * **Info**, defines the type of information to display in the shop card caption. It's distance from current user's location to the shop location by default.

      * **Shop tags**, defines shops with what tags will be shown on the map of the snippet. Cause this module supports Partner Google Map Snippet it can use its tagged Partners with geolocation completed. Partners available for Partner Google Map Snippet are imported as shops on this module install and are able to show by corresponding tag. The module's own tag is 'shop' and it is used by default.

    * **Widget ID**, defines the Widget ID for Shop List.

Open menu ``Inventory --> Warehouse Management --> Shop Management --> Shop List Config``.

    .. figure:: ../static/description/scr_man_shop_urls_form.png
      :width: 600px
      :alt: Screenshot for Shop List Config form

Fill all of the required data and save it.


Periods of Time
---------------

Create a Periods of Time entering opening hours for the shop

    * **Since**, defines the hour from in which the shop works, in set hours in numbers.

    * **To**, defines the hour until in which the shop works, in set hours in numbers.

Open menu ``Inventory --> Warehouse Management --> Shop Management --> Periods of Time``.

    .. figure:: ../static/description/scr_man_period_of_time_form.png
      :width: 600px
      :alt: Screenshot for Periods of Time form

Fill all of the required data and save it.


Shop Work Days
--------------

Create a opening days in format of your own (ex. «Mon-Fri», «Saturday») for the shop

Open menu ``Inventory --> Warehouse Management --> Shop Management --> Shop Work Days``.

    .. figure:: ../static/description/scr_man_shop_work_days_form.png
      :width: 600px
      :alt: Screenshot for Shop Work Days form

Fill all of the required data and save it.


Shop properties
---------------

Shop Properties are used to filter shops on the webpage or to set when creating a new warehouse at Warehouse management.

    * **Name**, defines the property name (to see in the drop-down selection on the webpage).

    * **Sequence**, defines the sequence number, if necessary (properties with a lower number are shown in the selection list earlier).

    * **Default**, checks as default to apply this property automatically on "Shop List Snippet" load.

    * **URL**, defines the url address using default option permanently, to apply automatic property on specified page only, ex. «/page/shops».

Open menu ``Inventory --> Warehouse Management --> Shop Management --> Shop properties``.

    .. figure:: ../static/description/scr_man_shop_property_form.png
      :width: 600px
      :alt: Screenshot for Shop properties form

Fill all of the required data and save it.


Manage Warehouses
=================

You can to create Warehouse as Public Shop.

* Open menu ``Inventory --> Warehouse Management -->`` `Warehouses <https://www.odoo.com/documentation/13.0/applications/inventory_and_mrp/inventory/management/warehouses.html>`_.

* Create ``Warehouse``.

* Mark it as ``Public Shop``.

    .. figure:: ../static/description/scr_man_warehouse_as_shop.png
      :width: 600px
      :alt: Screenshot for Warehouse as Public Shop

* Fill all of the required data and save it.


Usage
=====

You need to have Manager Access Rights for Inventory module to work with shops.

* Place ``Shop List Snippet`` on webpage.

    .. figure:: ../static/description/scr_man_shop_list_snippet.png
      :width: 600px
      :alt: Screenshot for Shop List Snippet

* Set up source ``URL-path`` and ``API-key``.

* Save the ``Shop List Snippet`` and see you warehouse in the list and on the map.


Main options
============

In the snippet configuration dialog you can choose next options of your shop list:

* **Colour**, defines colour of shop card border. Cause snippet allows to show lists from several sources it may be need to distinguish between them.

* **Label**, defines short text mark placed before shop name. It has the same purpose as colour.

* **Info**, defines the type of information to display in the shop card caption. It's distance from current user's location to the shop location by default.

* **Shop tags**, defines shops with what tags will be shown on the map of the snippet. Cause this module supports Partner Google Map Snippet it can use its tagged Partners with geolocation completed. Partners available for Partner Google Map Snippet are imported as shops on this module install and are able to show by corresponding tag. The module's own tag is 'shop' and it is used by default.


Additional options (for admin usage)
====================================

There are several options you can define by adding attributes to the snippet's ``<div>`` tag in `QWeb <https://www.odoo.com/documentation/13.0/developer/reference/javascript/qweb.html>`_ editor.
The example of usage:

::

	<div id="shop-list-snippet-wrapper" data-id="eyekraftShopMap1512116381857" shops-on-page="6" switch-to-map="true">

* shop_ids='[<list of ids of "eyekraft.shop" model records to load to the snippet>]' - It allows to show a limited number of certain shops.

* lat='<value of latitude of the fixed map center>'.

* lon='<value of longitude of the fixed map center>' - By default map has user coordinates by map center. This options may override this.

* zoom='<value of zoom level of the map>' - 1..9.

* client-placemark='<true/false>' - Visibility of the user placemark in the middle of the map.

* switch-to-map='<true/false>' - Flag to switch to map tab after shop-list loading. It works on desktop screens only leaving list tab visible on mobile platforms.

* shops-on-page='<count of shops to show on list tab at once>' - Option adds 'More' button to the list.

* shops-on-page-mob='<count of shops to show on list tab at once on mobile screens>'.


Support
=======

Please email to: it@eyekraft.ru?subject=website_shops_map
