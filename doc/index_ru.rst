===========
 Shops Map
===========

Эта документация также доступна на других языках, таких как `Английский <index.rst>`_ | *Pусский* | `испанский <index_es.rst>`_.


Установка
=========

* Перед установкой модуля требуется предварительно установить Python-библиотеку '`geopy <https://geopy.readthedocs.io/en/latest/>`_'.

::

    $ pip install geopy==2.2.0


Конфигурация
============

Для того, чтобы использовать текущую базу в качестве источника списка магазинов, необходимо сформировать локальный ключ API.

* Откройте меню ``Склад --> Управление складом --> Настройки API --> Пользователи API магазинов``.

    .. figure:: ../static/description/scr_man_shop_api_users_form.png
      :width: 600px
      :alt: Скриншот для Пользователи API магазинов

* Введите URL текущего сайта, и в процессе сохранения записи будет сформирован ключ API.

* Введите этот URL и ключ API во время настройки источника сниппета карты.


Yandex Maps API
---------------

Set API key and map localization, visit the `page <https://yandex.com/dev/maps/jsapi/doc/2.1/quick-start/index.html#get-api-key>`_ about get an API Key for the "JavaScript API y HTTP Geocoder" Map service.

* Откройте меню ``Settings --> General Settings --> Yandex Maps View``.

    .. figure:: ../static/description/scr_man_yandex_settings_form.png
      :width: 600px
      :alt: Screenshot Addon for Yandex Maps View

* Заполните все необходимые данные и сохранить его.


Мульти склады
-------------

Вы можете управлять несколькими складами. Для работы с данными требуется иметь доступ в качестве Менеджера Склада.

* Откройте меню ``Настройки --> Инвентарь --> склад -->`` `Мульти склады <https://www.odoo.com/documentation/13.0/applications/inventory_and_mrp/inventory/management/warehouses/warehouse_creation.html>`_ управлять несколькими складами.

    .. figure:: ../static/description/scr_man_warehouses_settings_form.png
      :width: 600px
      :alt: Скриншот для Мульти склады

* Заполните все необходимые данные и сохранить его.


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

Откройте меню ``Инвентарь --> Управление складом --> Управление магазином --> Shop List Config``.

    .. figure:: ../static/description/scr_man_shop_urls_form.png
      :width: 600px
      :alt: Скриншот для Shop List Config

Заполните все необходимые данные и сохранить его.


Периоды времени
---------------

Create a Periods of Time entering opening hours for the shop

    * **Since**, defines the hour from in which the shop works, in set hours in numbers.

    * **To**, defines the hour until in which the shop works, in set hours in numbers.

Откройте меню ``Инвентарь --> Управление складом --> Управление магазином --> Периоды времени``.

    .. figure:: ../static/description/scr_man_period_of_time_form.png
      :width: 600px
      :alt: Скриншот для Периоды времени

Заполните все необходимые данные и сохранить его.


Рабочие дни магазина
--------------------

Create a opening days in format of your own (ex. «Mon-Fri», «Saturday») for the shop

Откройте меню ``Инвентарь --> Управление складом --> Управление магазином --> Рабочие дни магазина``.

    .. figure:: ../static/description/scr_man_shop_work_days_form.png
      :width: 600px
      :alt: Скриншот для Рабочие дни магазина

Заполните все необходимые данные и сохранить его.


Свойства магазинов
------------------

Shop Properties are used to filter shops on the webpage or to set when creating a new warehouse at Warehouse management.

    * **Name**, defines the property name (to see in the drop-down selection on the webpage).

    * **Sequence**, defines the sequence number, if necessary (properties with a lower number are shown in the selection list earlier).

    * **Default**, checks as default to apply this property automatically on "Shop List Snippet" load.

    * **URL**, defines the url address using default option permanently, to apply automatic property on specified page only, ex. «/page/shops».

Откройте меню ``Инвентарь --> Управление складом --> Управление магазином --> Свойства магазинов``.

    .. figure:: ../static/description/scr_man_shop_property_form.png
      :width: 600px
      :alt: Скриншот для Свойства магазинов

Заполните все необходимые данные и сохранить его.


Manage Warehouses
=================

Вы можете создать склад как общедоступный магазин.

* Откройте меню ``Склад --> Управление складом -->`` `Склады <https://www.odoo.com/documentation/13.0/applications/inventory_and_mrp/inventory/management/warehouses.html>`_.

* Создайте ``склад``.

* Отметьте его как ``Общественный Магазин``, поставив соответствующую галочку.

    .. figure:: ../static/description/scr_man_warehouse_as_shop.png
      :width: 600px
      :alt: Скриншот для Склад как общественный магазин

* Заполните все необходимые данные и сохранить его.


Использование
=============

Для работы с данными требуется иметь доступ в качестве Менеджера Склада.

* Поместите в редакторе на страницу сниппет карты магазинов ``Shop List Snippet``.

    .. figure:: ../static/description/scr_man_shop_list_snippet.png
      :width: 600px
      :alt: Скриншот для Shop List Snippet

* В настройках сниппета настройте ``URL`` и ``ключ API`` источника.

* Сохраните страницу. При правильно настроенном источнике будут отображены данные из базы.


Основные настройки
==================

В окне диалога настройки сниппета вы можете выставить следующие настройки:

* **Цвет**, определяет цвет рамки карточки магазина. Сниппет позволяет использовать в качестве источника несколько серверов Odoo. Иногда требуется различать магазины в общем списке.

* **Метка**, определяет цветную текстовую метку, расположенную перед названием магазина. Служит для тех же целей, что и цвет.

* **Инфо**, определяет тип информации, показываемую в заголовке карточки магазина. По умолчанию это расстояние от местоположения пользователя до магазина.

* **Теги**, определяет, магазины с какими тегами будут показаны сниппетом. Ввиду того, что модуль поддерживает карту Partner Google Map Snippet, он может использовать тегированных Клиентов с заполненными геокоординатами. Клиенты, доступные для Partner Google Map Snippet импортируются как магазины при установке модуля и могут быть отобраны по тегу. Текущий тег для магазинов модуля это 'shop'.


Дополнительные настройки (для админов и разработчиков)
======================================================

Некоторые настройки вы можете определить путем добавления аттрибутов к тегу ``<div>`` сниппета в редакторе `QWeb <https://www.odoo.com/documentation/13.0/developer/reference/javascript/qweb.html>`_.
Пример использования:

::

	<div id="shop-list-snippet-wrapper" data-id="eyekraftShopMap1512116381857" shops-on-page="6" switch-to-map="true">

* shop_ids='[<список ID записей модели eyekraft.shop>]' - позволяет показывать только список отобранных магазинов.

* lat='<значение широты для центра карты>'.

* lon='<значение долготы для центра карты>' - по умолчанию центр карты устанавливается в координаты пользователя. Эти опции фиксируют указанный центр карты.

* zoom='<значение масштаба>' - 1..9.

* client-placemark='<true/false>' - видимость маркера пользователя в центре карты.

* switch-to-map='<true/false>' - опция переключение на вкладку с картой после загрузки сниппета. Срабатывает только на больших экранах, оставляя для малых экранов отображение списка.

* shops-on-page='<количество магазинов на одну страницу>' - опция добавляет к списку кнопку "Показать больше".

* shops-on-page-mob='<количество магазинов на одну страницу для малых экранов>'.


Поддержка
=========

Пишите: it@eyekraft.ru?subject=website_shops_map
