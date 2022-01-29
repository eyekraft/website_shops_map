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

## shop_list_snippet.js

Contiene el widget shopList y algunas funciones auxiliares:

* **toRadians** - convertir grados a radianes.

* **decimalAdjust** - redondeo decimal.

* **makeIterator** - hace un iterador para la matriz.

* **filter_shops** - función para filtrar la lista de tiendas por cadena de búsqueda.

* **filter_shops_on_properties** - función para filtrar la lista de tiendas por un conjunto de propiedades.

* **shopList**

	* **compute_shop_distance** - cálculo de la distancia entre el cliente y la tienda, 0 si no hay coordenadas del cliente.

	* **get_lat_lng** - obtener las coordenadas del cliente (las coordenadas aproximadas se obtienen de yandex-maps, luego se refinan si el usuario permite el uso de la geolocalización).

	* **get_client_address** - según las coordenadas del cliente, obtenemos su dirección en lenguaje humano a través de ymaps api.

	* **find_shop_by_id** - encontrar tienda por id.

	* **remove_placemarks** - elimina todos los marcadores del mapa.

	* **load_settings** - cargar todas las configuraciones para obtener una lista de tiendas.

	* **load_shop_list** - cargamos la lista de tiendas, ya que comenzamos a renderizar solo después de que se haya recibido la lista completa de tiendas, y puede haber muchas fuentes de tiendas: creamos una cola de promesa recursiva, iterando a través de la lista de configuraciones disponibles tan pronto como todas las tiendas se reciben (toda la cola de promesas se ha resuelto) - la promesa resultante se resuelve.

	* **render_shoplist** - renderizar una lista de tiendas.

	* **render_client_address** - representar la dirección del cliente, la dirección del cliente se complementa con un campo de edición con autocompletado basado en datos del geocodificador yandex, las solicitudes al geocodificador comienzan a salir cuando la longitud de la solicitud supera las 8 letras.

	* **render_vertical_shoplist** - representación de la lista de tiendas en la pestaña del mapa.

	* **render_big_map** - representación del mapa en la pestaña del mapa.

	* **render_client_placemark** - poner una marca en el mapa con la posición del cliente.

	* **render_route** - dibuja una ruta en el mapa.

	* **render_properties_selector** - representación del selector de propiedades de la tienda.

	* **init** - llama a los renderizadores necesarios y vincula los controladores de eventos a los elementos de la interfaz de usuario.
