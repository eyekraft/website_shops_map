=================
 Mapa de tiendas
=================

Esta documentación también esta disponible en otros idiomas como `Ingles <index.rst>`_ | `Ruso <index_ru.rst>`_ | *Español*.


Instalación
===========

* La biblioteca Python '`geopy <https://geopy.readthedocs.io/en/latest/>`_' debe instalarse primero para el cálculo automático de las coordenadas geográficas de la tienda.

::

    $ pip install geopy==2.2.0


Configuración
=============

Para registrar la base de datos de Odoo como fuente de lista de tienda, debe generar una clave API local.

* Abrir el menú ``Inventario --> Gestión de almacén --> Configuración de API --> Usuarios de API de la tienda``.

    .. figure:: ../static/description/scr_man_shop_api_users_form.png
      :width: 600px
      :alt: Captura de pantalla para el formulario Usuarios de API de la tienda

* Ingrese la ``URL`` a la base de datos actual y obtenga su ``clave API`` al presionar el botón ``Guardar``.

* Use esta ``URL`` y la ``clave API`` generada en la configuración de la fuente del fragmento HTML de ``Shop List Snippet`` para mapa.


Yandex Maps API
---------------

Debe establecer API Key y localización de mapas, visite la `página <https://yandex.com/dev/maps/jsapi/doc/2.1/quick-start/index.html#get-api-key>` acerca de obtener una API Key para el servicio de mapas "JavaScript API y HTTP Geocoder".

* Abrir el menú ``Ajustes --> Opciones Generales --> Vista de mapas de Yandex``.

    .. figure:: ../static/description/scr_man_yandex_settings_form.png
      :width: 600px
      :alt: Captura de pantalla para opciones de Yandex Maps View

* Llena todos los datos requeridos y guárdelo.


Multialmacén
------------

Puede gestionar varios almacenes. Debe tener derechos de acceso de administrador para el módulo de Inventario para trabajar con tiendas.

* Abrir el menú ``Ajustes --> Inventario --> Almacén -->`` `Multialmacén <https://www.odoo.com/documentation/13.0/es/applications/inventory_and_mrp/inventory/management/warehouses/warehouse_creation.html>`_ para gestionar almacenes múltiples.

    .. figure:: ../static/description/scr_man_warehouses_settings_form.png
      :width: 600px
      :alt: Captura de pantalla para definir Multialmacén

* Llena todos los datos requeridos y guárdelo.


Configuración de lista de tiendas
---------------------------------

Crear una configuración de lista de tiendas porque en el cuadro de diálogo de configuración de fragmentos puede elegir las siguientes opciones de su lista de compras:

    * **URL de lista de la tienda**, define la dirección URL para lista de la tienda.

    * **Parámetros de lista de Tienda**, define los parámetros para Lista de Tienda, como:

      * **Color**, define el color del borde de la tarjeta de la tienda. Por que el fragmento HTML le permite mostrar listas de varias fuentes, es posible que sea necesario distinguirlas.

      * **Etiqueta**, define una marca de texto corta colocada antes del nombre de la tienda. Tiene el mismo propósito que el color.

      * **Información**, define el tipo de información que se mostrará en el título de la tarjeta de la tienda. Es la distancia desde la ubicación del usuario actual hasta la ubicación de la tienda predeterminada.

      * **Etiquetas de tienda**, define las tiendas con qué etiquetas se mostrarán en el mapa del fragmento. Debido a que este módulo es compatible con Partner Google Map Snippet, puede usar sus socios etiquetados con geolocalización completa. Los socios disponibles para Partner Google Map Snippet se importan como tiendas en la instalación de este módulo y se pueden mostrar con la etiqueta correspondiente. La etiqueta propia del módulo es 'shop' y se usa predeterminada.

    * **ID de Widget**, define el ID de Widget para la Lista de Tienda.

Abrir el menú ``Inventario --> Gestión de almacén --> Gestión de la tienda --> Configuración de lista de la tienda``.

    .. figure:: ../static/description/scr_man_shop_urls_form.png
      :width: 600px
      :alt: Captura de pantalla para el formulario Configuración de lista de la tienda

Llena todos los datos requeridos y guárdelo.


Períodos de tiempo
------------------

Crear un Período de Tiempo ingresando el horario de apertura de la tienda

    * **Desde**, define la hora a partir de la cual trabaja la tienda, en horas establecidas en números.

    * **A**, define la hora hasta la que trabaja la tienda, en horas establecidas en números.

Abrir el menú ``Inventario --> Gestión de almacén --> Gestión de la tienda --> Períodos de tiempo``.

    .. figure:: ../static/description/scr_man_period_of_time_form.png
      :width: 600px
      :alt: Captura de pantalla para el formulario Períodos de tiempo

Llena todos los datos requeridos y guárdelo.


Días de trabajo de la tienda
----------------------------

Cree un día de apertura en su propio formato (por ejemplo, «lunes a viernes», «sábado») para la tienda.

Abrir el menú ``Inventario --> Gestión de almacén --> Gestión de la tienda --> Días de trabajo de la tienda``.

    .. figure:: ../static/description/scr_man_shop_work_days_form.png
      :width: 600px
      :alt: Captura de pantalla para el formulario Días de trabajo de la tienda

Llena todos los datos requeridos y guárdelo.


Propiedades de tienda
---------------------

Las propiedades de la tienda se utilizan para filtrar las tiendas en la página web o para configurarlas al crear un nuevo almacén en Gestión de almacenes.

    * **Nombre**, defina el nombre de la propiedad (para ver en la selección desplegable en la página web).

    * **Secuencia**, defina el número de la secuencia, si es necesario (las propiedades con un número más bajo se muestran en la lista de selección anterior).

    * **Predeterminado**, marque la casilla como predeterminado para aplicar esta propiedad automáticamente en la carga del fragmento HTML de "Shop List Snippet".

    * **Dirección URL**, defina la dirección URL usando la opción predeterminada de forma permanente, para aplicar la propiedad automática solo en la página especificada, ej. «/page/shops»

Abrir el menú ``Inventario --> Gestión de almacén --> Gestión de la tienda --> Propiedades de tienda``.

    .. figure:: ../static/description/scr_man_shop_property_form.png
      :width: 600px
      :alt: Captura de pantalla para el formulario Propiedades de tienda

Llena todos los datos requeridos y guárdelo.


Administrar Almacenes
=====================

Puedes crear Almacén como tienda pública.

* Abrir el menú ``Inventario --> Gestión de almacén -->`` `Almacenes <https://www.odoo.com/documentation/13.0/es/applications/inventory_and_mrp/inventory/management/warehouses.html>`_.

* Crear ``Almacén``.

* Márcalo como ``Tienda pública``.

    .. figure:: ../static/description/scr_man_warehouse_as_shop.png
      :width: 600px
      :alt: Captura de pantalla para definir un Almacén como tienda pública

Llena todos los datos requeridos y guárdelo.


Uso
===

Debe tener derechos de acceso de administrador para el módulo de Inventario para trabajar con tiendas.

* Coloque el fragmento HTML de ``Shop List Snippet`` en la página web.

    .. figure:: ../static/description/scr_man_shop_list_snippet.png
      :width: 600px
      :alt: Captura de pantalla de fragmento HTML Shop List Snippet

* Configure la ``ruta URL de fuente`` y la ``clave API``.

* Guarde el fragmento HTML de ``Shop List Snippet``, así puede ver su almacén en la listado de tiendas y en el mapa.


Opciones principales
====================

En el cuadro de diálogo de configuración del fragmento HTML, puede elegir las siguientes opciones de su lista de tienda:

* **Color**, define el color del borde de la tarjeta de la tienda. Por que el fragmento HTML le permite mostrar listas de varias fuentes, es posible que sea necesario distinguirlas.

* **Etiqueta**, define una marca de texto corta colocada antes del nombre de la tienda. Tiene el mismo propósito que el color.

* **Info**, define el tipo de información que se mostrará en el título de la tarjeta de la tienda. Es la distancia desde la ubicación del usuario actual hasta la ubicación de la tienda por defecto.

* **Etiquetas de tienda**, define las tiendas con qué etiquetas se mostrarán en el mapa del fragmento. Debido a que este módulo es compatible con Partner Google Map Snippet, puede usar sus socios etiquetados con geolocalización completa. Los socios disponibles para Partner Google Map Snippet se importan como tiendas en la instalación de este módulo y se pueden mostrar con la etiqueta correspondiente. La etiqueta propia del módulo es 'shop' y se usa por defecto.


Opciones adicionales (para uso administrativo)
==============================================

Hay varias opciones que puede definir agregando atributos a la etiqueta ``<div>`` del fragmento en el editor `QWeb <https://www.odoo.com/documentation/13.0/es/developer/reference/javascript/qweb.html>`_.
El ejemplo de uso:

::

	<div id="shop-list-snippet-wrapper" data-id="eyekraftShopMap1512116381857" shops-on-page="6" switch-to-map="true">

* shop_ids='[<lista de ids de registros del modelo "eyekraft.shop" para cargar en el fragmento>]' - la opción le permite mostrar un número limitado de determinadas tiendas.

* lat='<valor de la latitud del centro del mapa fijo>'.

* lon='<valor de la longitud del centro del mapa fijo>' - por defecto, el mapa tiene coordenadas de usuario por centro del mapa. Esta opción puede anular esta.

* zoom='<valor del nivel de zoom del mapa>' - 1..9.

* client-placemark='<true/false>' - la visibilidad de la marca de posición del usuario en el medio del mapa.

* switch-to-map='<true/false>' - este marca para cambiar a la pestaña del mapa después de cargar la lista de tienda. Funciona en pantallas de escritorio solo dejando la pestaña de lista visible en plataformas móviles.

* shops-on-page='<recuento de tiendas para mostrar en la pestaña de lista a la vez>' - la opción agrega el botón 'Más' a la lista.

* shops-on-page-mob='<recuento de tiendas para mostrar en la pestaña de lista a la vez en pantallas móviles>'.


Soporte
=======

Por favor, envíe un correo electrónico a: it@eyekraft.ru?subject=website_shops_map
