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

    * ``shop_list_editor.js`` - the **shopList** widget logic from website editor mode.

## shop_list_snippet.js

Contains the **shopList** widget and some helper functions:

* **toRadians** - convert degrees to radians

* **decimalAdjust** - decimal rounding

* **makeIterator** - makes an iterator for the array

* **filterShops** - function to filter the list of stores by search string

* **filterShopsOnProperties** - function to filter the list of stores by a set of properties

* **shopList**

	* **computeShopDistance** - calculation of the distance between the client and the store, 0 if there are no client coordinates.

	* **getLatLng** - obtaining the client's coordinates (coarse coordinates are obtained from yandex-maps, then refined if the user allows the use of geolocation).

	* **getClientAddress** - according to the client's coordinates, we get his address in human language through ymaps api.

	* **findShopById** - find store by id.

	* **removePlacemarks** - removes all markers from the map.

	* **loadSettings** - load all settings to get a list of stores.

	* **loadShopList** - we load the list of stores, since we start rendering only after the entire list of stores has been received, and there can be many sources of stores - we create a recursive promise queue, iterating through the available list of settings as soon as all stores are received (the entire queue of promises has resolved) - the resulting promise resolves.

	* **renderShopList** - render a list of stores.

	* **renderClientAddress** - render the client's address, the client's address is supplemented with an edit field with autocomplete based on data from the yandex geocoder, requests to the geocoder start leaving when the request length exceeds 8 letters.

	* **renderVerticalShopList** - store list rendering on the map tab.

	* **renderBigMap** - map render on the map tab.

	* **renderClientPlacemark** - put a mark on the map with the position of the client.

	* **renderRoute** - draws a route on the map.

	* **renderPropertiesSelector** - store property selector render.

	* **init** - calls the necessary renderers and binds event handlers to UI elements.
