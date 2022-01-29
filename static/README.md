# Store List Widget

## Directories and Libraries

### lib

Here are the external libraries used:

* [bootstrap-selector](https://developer.snapappointments.com/bootstrap-select/) - good selector for bootstrap.

* [jquery-autocomplete](https://jqueryui.com/autocomplete/) - autocomplete for input fields.

### src

Here are the sources codes:

* ``css`` - cascading style sheets files:

    * [reflex.css](https://github.com/leejordan/reflex) - reflex library for displaying adaptive interface.

    * ``shop_list_style.css`` - additional styles file.

* ``img`` - here is only the icon for the snippet.

* ``js`` - shop_list_shippet file with all the rendering logic.

## shop_list_snippet.js

Contains the shopList widget and some helper functions:

* **toRadians** - convert degrees to radians

* **decimalAdjust** - decimal rounding

* **makeIterator** - makes an iterator for the array

* **filter_shops** - function to filter the list of stores by search string

* **filter_shops_on_properties** - function to filter the list of stores by a set of properties

* **shopList**

	* **compute_shop_distance** - calculation of the distance between the client and the store, 0 if there are no client coordinates.

	* **get_lat_lng** - obtaining the client's coordinates (coarse coordinates are obtained from yandex-maps, then refined if the user allows the use of geolocation).

	* **get_client_address** - according to the client's coordinates, we get his address in human language through ymaps api.

	* **find_shop_by_id** - find store by id.

	* **remove_placemarks** - removes all markers from the map.

	* **load_settings** - load all settings to get a list of stores.

	* **load_shop_list** - we load the list of stores, since we start rendering only after the entire list of stores has been received, and there can be many sources of stores - we create a recursive promise queue, iterating through the available list of settings as soon as all stores are received (the entire queue of promises has resolved) - the resulting promise resolves.

	* **render_shoplist** - render a list of stores.

	* **render_client_address** - render the client's address, the client's address is supplemented with an edit field with autocomplete based on data from the yandex geocoder, requests to the geocoder start leaving when the request length exceeds 8 letters.

	* **render_vertical_shoplist** - store list rendering on the map tab.

	* **render_big_map** - map render on the map tab.

	* **render_client_placemark** - put a mark on the map with the position of the client.

	* **render_route** - draws a route on the map.

	* **render_properties_selector** - store property selector render.

	* **init** - calls the necessary renderers and binds event handlers to UI elements.
