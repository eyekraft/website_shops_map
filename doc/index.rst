===========
 Shops Map 
===========

Also this documentation is available in other languages as *English* | `Russian <index_ru.rst>`_.


Installation
============

* The '`geopy <https://geopy.readthedocs.io/en/latest/>`_' Python library must be installed first for shop geo-coordinates automatic calculation.

::

    $ pip install -r requirements.txt


Configuration
=============

To register Odoo database as shop list source you need to generate local API-key.

* Open menu ``Settings --> API Settings --> Shop API Users``.

* Enter URL to current database and get you API-key on pushing saving button.

* Use this URL and generated API-key on map snippet source setup.


Usage
=====

You need to have Manager Access Rights for Inventory module to work with shops.

* Open menu ``Inventory --> Warehouse Management --> Warehouses``.

* Create Warehouse.

* Mark it as 'Shop'.

* Fill all of the required data.

* Place Shop Map snippet on webpage.

* Set up source URL-path and API-key.

* Save snippet and see you warehouse in the list and on the map.


Main options
============

In the snippet configuration dialog you can choose next options of your shop list:

* 'Colour' defines colour of shop card border. Cause snippet allows to show lists from several sources it may be need to distinguish between them.

* 'Label' defines short text mark placed before shop name. It has the same purpose as colour.

* 'Info' defines the type of information to display in the shop card caption. It's distance from current user's location to the shop location by default.

* 'Shop tags' defines shops with what tags will be shown on the map of the snippet. Cause this module supports Partner Google Map Snippet it can use its tagged Partners with geolocation completed. Partners available for Partner Google Map Snippet are imported as shops on this module install and are able to show by corresponding tag. The module's own tag is 'shop' and it is used by default.


Additional options (for admin usage)
====================================

There are several options you can define by adding attributes to the snippet's ``<div>`` tag in QWEB editor.
The example of usage:

::

	<div id="shop-list-snippet-wrapper" data-id="eyekraftShopMap1512116381857" shops-on-page="6" switch-to-map="true">

* shop_ids='[<list of ids of "eyekraft.shop" model records to load to the snippet>]' It allows to show a limited number of certain shops.

* lat='<value of latitude of the fixed map center>'

* lon='<value of longitude of the fixed map center>' By default map has user coordinates by map center. This options may override this.

* zoom='<value of zoom level of the map>' - 1..9.

* client-placemark='<true/false>' Visibility of the user placemark in the middle of the map.

* switch-to-map='<true/false>' Flag to switch to map tab after shop-list loading. It works on desktop screens only leaving list tab visible on mobile platforms.

* shops-on-page='<count of shops to show on list tab at once>' Option adds 'More' button to the list.

* shops-on-page-mob='<count of shops to show on list tab at once on mobile screens>'.


Support
=======

Please email to: it@eyekraft.ru?subject=website_shops_map
