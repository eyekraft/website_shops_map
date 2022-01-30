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

* Abrir el menú ``Ajustes --> Configuración de API --> Usuarios de API de la tienda``.

* Ingrese la URL a la base de datos actual y obtenga su clave API al presionar el botón Guardar.

* Use esta URL y la clave de API generada en la configuración de la fuente del fragmento HTML del mapa.


Uso
===

Debe tener derechos de acceso de administrador para el módulo de Inventario para trabajar con tiendas.

* Abrir el menú ``Inventario --> Gestión de almacén --> Almacenes``.

* Crear Almacén.

* Márcalo como 'Tienda'.

* Llena todos los datos requeridos.

* Coloque el fragmento HTML de 'Shop Map' en la página web.

* Configure la ruta URL de fuente y la clave API.

* Guarde el fragmento HTML y vea su almacén en la lista y en el mapa.


Opciones principales
====================

En el cuadro de diálogo de configuración del fragmento HTML, puede elegir las siguientes opciones de su lista de tienda:

* 'Color' define el color del borde de la tarjeta de la tienda. Por que el fragmento HTML le permite mostrar listas de varias fuentes, es posible que sea necesario distinguirlas.

* 'Etiqueta' define una marca de texto corta colocada antes del nombre de la tienda. Tiene el mismo propósito que el color.

* 'Info' define el tipo de información que se mostrará en el título de la tarjeta de la tienda. Es la distancia desde la ubicación del usuario actual hasta la ubicación de la tienda por defecto.

* 'Etiquetas de tienda' define las tiendas con qué etiquetas se mostrarán en el mapa del fragmento. Debido a que este módulo es compatible con Partner Google Map Snippet, puede usar sus socios etiquetados con geolocalización completa. Los socios disponibles para Partner Google Map Snippet se importan como tiendas en la instalación de este módulo y se pueden mostrar con la etiqueta correspondiente. La etiqueta propia del módulo es 'shop' y se usa por defecto.


Opciones adicionales (para uso administrativo)
==============================================

Hay varias opciones que puede definir agregando atributos a la etiqueta ``<div>`` del fragmento en el editor QWEB.
El ejemplo de uso:

::

	<div id="shop-list-snippet-wrapper" data-id="eyekraftShopMap1512116381857" shops-on-page="6" switch-to-map="true">

* shop_ids='[<lista de ids de registros del modelo "eyekraft.shop" para cargar en el fragmento>]', eso le permite mostrar un número limitado de determinadas tiendas.

* lat='<valor de la latitud del centro del mapa fijo>'.

* lon='<valor de la longitud del centro del mapa fijo>', por defecto, el mapa tiene coordenadas de usuario por centro del mapa. Esta opción puede anular esta.

* zoom='<valor del nivel de zoom del mapa>' - 1..9.

* client-placemark='<true/false>', la visibilidad de la marca de posición del usuario en el medio del mapa.

* switch-to-map='<true/false>', este marca para cambiar a la pestaña del mapa después de cargar la lista de tienda. Funciona en pantallas de escritorio solo dejando la pestaña de lista visible en plataformas móviles.

* shops-on-page='<recuento de tiendas para mostrar en la pestaña de lista a la vez>', la opción agrega el botón 'Más' a la lista.

* shops-on-page-mob='<recuento de tiendas para mostrar en la pestaña de lista a la vez en pantallas móviles>'


Soporte
=======

Por favor, envíe un correo electrónico a: it@eyekraft.ru?subject=website_shops_map
