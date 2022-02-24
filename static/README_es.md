# Widget para mostrar una lista de tiendas

## Directories and Libraries

### lib

Aquí están las bibliotecas externas utilizadas

* [bootstrap-selector](https://developer.snapappointments.com/bootstrap-select/) - buen selector para bootstrap

* [jquery-autocomplete](https://jqueryui.com/autocomplete/) - autocompletar para campos de entrada

### src

Aquí están los archivos código fuentes:

* ``css`` - Hojas de estilo en cascada.

    * [reflex.css](https://github.com/leejordan/reflex) - biblioteca reflex para mostrar la interfaz adaptativa.

    * ``shop_list_style.css`` - archivo de estilos adicionales.

* ``img`` - aquí solo está el ícono para el fragmento.

* ``js`` - archivo **shop_list_shippet** con toda la lógica de representación.

    * ``shop_list_editor.js`` - la lógica del widget **shopList** desde el modo de editor de sitios web.

## shop_list_snippet.js

Contiene el widget **shopList** y algunas funciones auxiliares:

* **toRadians** - convertir grados a radianes.

* **decimalAdjust** - redondeo decimal.

* **makeIterator** - hace un iterador para la matriz.

* **filterShops** - función para filtrar la lista de tiendas por cadena de búsqueda.

* **filterShopsOnProperties** - función para filtrar la lista de tiendas por un conjunto de propiedades.

* **shopList**

	* **computeShopDistance** - cálculo de la distancia entre el cliente y la tienda, 0 si no hay coordenadas del cliente.

	* **getLatLng** - obtener las coordenadas del cliente (las coordenadas aproximadas se obtienen de yandex-maps, luego se refinan si el usuario permite el uso de la geolocalización).

	* **getClientAddress** - según las coordenadas del cliente, obtenemos su dirección en lenguaje humano a través de ymaps api.

	* **findShopById** - encontrar tienda por id.

	* **removePlacemarks** - elimina todos los marcadores del mapa.

	* **loadSettings** - cargar todas las configuraciones para obtener una lista de tiendas.

	* **loadShopList** - cargamos la lista de tiendas, ya que comenzamos a renderizar solo después de que se haya recibido la lista completa de tiendas, y puede haber muchas fuentes de tiendas: creamos una cola de promesa recursiva, iterando a través de la lista de configuraciones disponibles tan pronto como todas las tiendas se reciben (toda la cola de promesas se ha resuelto) - la promesa resultante se resuelve.

	* **renderShopList** - renderizar una lista de tiendas.

	* **renderClientAddress** - representar la dirección del cliente, la dirección del cliente se complementa con un campo de edición con autocompletado basado en datos del geocodificador yandex, las solicitudes al geocodificador comienzan a salir cuando la longitud de la solicitud supera las 8 letras.

	* **renderVerticalShopList** - representación de la lista de tiendas en la pestaña del mapa.

	* **renderBigMap** - representación del mapa en la pestaña del mapa.

	* **renderClientPlacemark** - poner una marca en el mapa con la posición del cliente.

	* **renderRoute** - dibuja una ruta en el mapa.

	* **renderPropertiesSelector** - representación del selector de propiedades de la tienda.

	* **init** - llama a los renderizadores necesarios y vincula los controladores de eventos a los elementos de la interfaz de usuario.
