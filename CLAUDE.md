# Página web — Servicio técnico Apple

## Qué es este proyecto

Sitio web para **Inkblot** (usuario: menazzi@gmail.com), un negocio de reparación de
productos Apple. Servicios ofrecidos: reparación de **iPhone, iPad, Mac y Apple Watch**
— pantalla, batería, vidrio trasero, cámara, puerto de carga, botones y diagnóstico
general. El foco principal del negocio (y del catálogo de precios) es **iPhone**; iPad
y Mac todavía no tienen catálogo definido y usan un flujo de "cotizá tu equipo" directo
por WhatsApp.

Este sitio es una **página paralela a la página oficial de Inkblot** (no la reemplaza).
El usuario no aclaró todavía qué implica eso en la práctica (¿un link cruzado a la
página oficial? ¿mismo dominio en otra ruta? ¿landing independiente para este servicio
puntual?) — preguntar antes de asumir algo si se vuelve relevante (dominio, si hay que
linkear la página oficial desde acá, etc.).

Estética elegida por el usuario tras comparar 3 variantes: **"Cristal" (Liquid Glass)** —
paneles translúcidos con blur, fondo con manchas de color difuminadas, botones tipo
píldora, tipografía nativa de Apple (SF Pro). Inspirado en el estilo de apple.com pero
**sin usar logo ni fotos reales de Apple** (marca registrada) — se imita el estilo
visual, no los activos de marca.

## Reglas de negocio acordadas con el usuario

- Modelos de **iPhone, iPad y Apple Watch desde 2019 en adelante** (equivalente a
  iPhone 11) como criterio general. **Excepción**: se agregaron modelos de iPhone
  anteriores (8, 8 Plus, X, XS, XS Max, XR) porque el usuario había dado precios reales
  de vidrio trasero para esos modelos. Esos precios de vidrio trasero se sacaron después
  a pedido del usuario (ver más abajo) — los modelos se mantienen igual.
- **Mac es otra excepción**: modelos **desde 2012 en adelante**, porque las Mac duran
  más y siguen siendo reparables.
- **Precios en dólares (USD)**, no en pesos. El usuario pidió en algún momento evaluar
  mostrar también el equivalente en pesos al "dólar blue" de Ámbito, pero **pidió
  explícitamente posponer esa parte** ("por ahora no hagas lo de Ámbito, arrancá con
  la lista"). No está implementado. Si se retoma: no inventar/hardcodear una cotización
  fija (se desactualiza y puede inducir a error) — habría que traerla en vivo desde
  algún origen confiable, con manejo de que la consulta puede fallar.
- Batería es un ítem simple (un solo precio por modelo), **no** tiene variantes tipo
  "estándar / alta capacidad" — eso se había armado como ejemplo antes de tener datos
  reales y se sacó al cargar la lista de precios real.
- Solo pantalla de iPhone tiene variantes de repuesto (ver más abajo). Vidrio trasero es
  un ítem simple, sin "solo vidrio" vs. "tapa completa" — se probó esa distinción y el
  usuario pidió sacarla (tapa completa implicaría cambio de chasis, no se ofrece). Por
  el momento tampoco tiene precios cargados (el usuario pidió sacarlos, "por el momento
  no vamos a poner precios") — todos los modelos muestran "Consultar" para este servicio.

## Stack técnico

HTML/CSS/JS estático, sin build ni frameworks (fácil de hostear en GitHub Pages, Netlify,
un hosting compartido, etc.). No hay dependencias externas.

## Estructura de archivos

```
index.html            Home: hero, buscador guiado, categorías, servicios, contacto
iphone.html            Página de categoría iPhone (modelos agrupados + reparaciones)
ipad.html               Página de categoría iPad (cotización directa)
mac.html                Página de categoría Mac (cotización directa)
watch.html              Página de categoría Apple Watch
contacto.html           Página de contacto (WhatsApp, teléfono, email, horarios, redes)
css/styles.css          Estilos (glass/"Cristal": blur, translucidez, paleta, componentes)
js/config.js            Datos generales del negocio (nombre, WhatsApp, teléfono, email, etc.)
js/models-data.js       Modelos, grupos de modelos, servicios, opciones de repuesto y PRICES
js/main.js              Lógica: nav móvil, contacto, páginas de categoría, buscador guiado
```

### Modelos agrupados (acordeón)

`MODEL_GROUPS[categoria]` es un array de `{ label, models: [...] }` (ej. "iPhone 16" con
sus 5 variantes adentro). Tanto la página de categoría como el buscador de la home
muestran estos grupos como un acordeón (se toca el grupo y se despliegan sus modelos) en
vez de una lista plana larga. `MODELS[categoria]` es la lista plana derivada (grupos +
`OTHER_MODEL_LABEL`) para donde haga falta.

### Cómo están armadas las páginas de categoría

Cada página de categoría tiene los mismos dos contenedores vacíos:

```html
<div id="model-tabs" class="model-tabs"></div>
<div id="model-panel" class="model-panel"></div>
```

y al final llama a `initCategoryPage("iphone")` (o la categoría que corresponda), en
`js/main.js`. Para iPad/Mac (`SIMPLE_QUOTE_CATEGORIES`) el panel muestra un cartel de
cotización directa en vez del listado de servicios.

### Precios (`PRICES` en `js/models-data.js`)

Todo en dólares, como números (el formateo "US$ 50" se hace al mostrar, con
`formatPrice()`). Dos formas según el servicio:

- **Servicios simples** (batería, cámara, puerto de carga, botones, diagnóstico):
  `PRICES["iphone"]["iPhone 13"]["bateria"] = 69`
- **Servicios con opciones de repuesto** (por ahora, solo pantalla en iPhone — ver
  `IPHONE_REPAIR_OPTIONS`): el valor es un objeto por opción:
  `PRICES["iphone"]["iPhone 13"]["pantalla"] = { oled: 144 }`

Para pantalla, las opciones posibles son `oled`, `incell` (LCD) y `original` (repuesto
Apple). **No todos los modelos tienen las tres**: la página solo muestra las opciones
que tienen precio cargado para ese modelo puntual (ej. iPhone 11 base solo tiene
`incell`, nunca tuvo pantalla OLED de fábrica). Si un modelo todavía no tiene ningún
precio cargado para ese servicio, se muestran todas las opciones con "Consultar" para
no dejar la sección vacía (ver `getAvailableOptions()` en `main.js`).

"Vidrio trasero" (`tapa-trasera`) es un servicio simple, sin variantes de repuesto —
mismo patrón que batería: `PRICES["iphone"]["iPhone 13"]["tapa-trasera"] = 60`. No se
ofrece cambio de tapa completa (a diferencia del vidrio, implicaría cambio de chasis;
el usuario pidió explícitamente no ofrecerlo). Por ahora no hay ningún precio cargado
para este servicio en ningún modelo (el usuario pidió sacarlos todos, "por el momento
no vamos a poner precios") — muestra "Consultar" en toda la línea. Cuando el usuario
pase la lista, cargarlos con el mismo patrón que batería.

## Pendiente — datos reales para cargar

1. **`js/config.js`**: datos de contacto ya cargados desde la página oficial
   (inkblot.pro) — teléfono, email, dirección y horarios son reales. Dos cosas para
   confirmar: (a) el número de WhatsApp se cargó como `5491158873498` (se le agregó el
   "9" después del 54, como suelen necesitar los links wa.me para números argentinos),
   pero en la página oficial figura sin el 9 (`+54 11 5887-3498`) — probar que el botón
   de WhatsApp abra bien y avisar si no; (b) no se encontraron Instagram/Facebook en la
   página oficial, así que esos dos campos siguen siendo placeholders sin confirmar.
2. **Tiempos de espera**: no hay ningún dato cargado todavía (el usuario dijo que lo
   iba a pasar más adelante). Por ahora todas las opciones de repuesto muestran
   "Tiempo: A confirmar" fijo en `renderOptionCard()`.
3. **Precios de iPad, Mac y Apple Watch**: sin catálogo. iPad y Mac muestran cotización
   directa (`SIMPLE_QUOTE_CATEGORIES`); Apple Watch ya tiene el listado de servicios
   pero sin ningún precio cargado (todo "Consultar").
4. **Precios de vidrio trasero (`tapa-trasera`), todos los modelos de iPhone**: se habían
   cargado (con precios reales que había dado el usuario) y después se sacaron a pedido
   explícito del usuario ("por el momento no vamos a poner precios, sacalos" — "todos").
   Hoy no hay ningún precio cargado para este servicio; muestra "Consultar" en toda la
   línea. Cargarlos cuando el usuario los vuelva a pasar.
5. **Batería de iPhone 16 y 17 (todas las variantes)**: no falta cargar el dato — según
   el usuario, todavía no hay repuesto de batería compatible en plaza para esos modelos
   por ser muy nuevos. Se agrega cuando exista el repuesto, no antes.
6. **Dólar blue / Ámbito**: pospuesto a pedido del usuario (ver reglas de negocio arriba).
7. Imágenes reales del local/trabajos (hoy no hay fotos, todo es ícono/emoji para
   evitar usar imágenes con derechos de Apple).
8. Definir dominio propio y dónde hostear (GitHub Pages, Netlify, hosting compartido, etc.).

## Convenciones

- No usar contenido/branding real de Apple (logo, fotos de producto, tipografía SF con
  licencia) — solo inspiración de layout y paleta.
- Mantener `js/config.js` y `js/models-data.js` como única fuente de verdad para datos
  editables — no hardcodear teléfono/precios directamente en el HTML.
- Los precios son siempre números en USD dentro de `PRICES`; formatear con
  `formatPrice()` al mostrarlos, nunca como string ya formateado en los datos.
