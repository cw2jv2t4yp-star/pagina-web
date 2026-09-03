# Página web — Servicio técnico Apple

## Qué es este proyecto

Sitio web para **Inkblot** (usuario: menazzi@gmail.com), un negocio de reparación de
productos Apple. Servicios ofrecidos: reparación de **iPhone, iPad, Mac y Apple Watch**
— pantalla, batería, vidrio trasero, cámara, puerto de carga, botones y diagnóstico
general. El foco principal del negocio (y del catálogo de precios) es **iPhone**. iPad
tiene catálogo acotado a **pantalla y batería** (nada más, ver reglas de negocio abajo);
Mac todavía no tiene catálogo definido y usa un flujo de "cotizá tu equipo" directo
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
  iPhone 11) como criterio general. Por un tiempo hubo una excepción con modelos de
  iPhone anteriores (8, 8 Plus, X, XS, XS Max, XR) porque el usuario había dado precios
  reales de vidrio trasero para esos modelos — esos precios se sacaron después, y
  finalmente el usuario pidió sacar los modelos también ("son viejos, nadie tiene eso... 
  bórralos"). Se mantiene el grupo **iPhone SE** (2ª y 3ª gen.) porque ya entra dentro
  del criterio general (2020 y 2022, ambos ≥ 2019) — no es una excepción.
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
- Vidrio trasero de iPhone no tiene "solo vidrio" vs. "tapa completa" — se probó esa
  distinción y el usuario pidió sacarla (tapa completa implicaría cambio de chasis, no
  se ofrece). Por el momento tampoco tiene precios cargados (el usuario pidió sacarlos,
  "por el momento no vamos a poner precios") — todos los modelos muestran "Consultar"
  para este servicio.
- **Vidrio trasero sí tiene selector de color** (a pedido del usuario, para que el
  cliente indique de entrada de qué color es su equipo): se despliega igual que
  Pantalla, con una tarjeta por color oficial de Apple para ese modelo puntual (ver
  `IPHONE_BACK_GLASS_COLORS` más abajo). El color no cambia el precio — es la misma
  reparación, solo para que el taller sepa qué repuesto pedir.
- **iPad tiene catálogo, pero acotado a pantalla y batería** (`SERVICES_BY_CATEGORY.ipad`):
  el usuario pidió agregar esas dos reparaciones nomás, con el mismo flujo que iPhone
  (tildar el/los servicio/s y mandar la cotización por WhatsApp), en vez del cartel
  genérico de "cotizá tu equipo". Por eso `ipad` salió de `SIMPLE_QUOTE_CATEGORIES`
  (que ahora solo tiene `mac`). Igual que el resto, sin precios cargados todavía.

## Stack técnico

HTML/CSS/JS estático, sin build ni frameworks (fácil de hostear en GitHub Pages, Netlify,
un hosting compartido, etc.). No hay dependencias externas.

## Estructura de archivos

```
index.html            Home: hero, buscador guiado, categorías, servicios, contacto
iphone.html            Página de categoría iPhone (modelos agrupados + reparaciones)
ipad.html               Página de categoría iPad (pantalla + batería, mismo flujo que iPhone)
mac.html                Página de categoría Mac (cotización directa)
watch.html              Página de categoría Apple Watch
contacto.html           Página de contacto (WhatsApp, teléfono, email, dirección con
                        link "Cómo llegar" y mapa embebido, horarios, redes)
blog.html               Sección de blog/novedades — existe como cartel "próximamente",
                        sin artículos reales todavía (a pedido del usuario)
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
`js/main.js`. Para Mac (`SIMPLE_QUOTE_CATEGORIES`) el panel muestra un cartel de
cotización directa en vez del listado de servicios; iPad ya no está en esa lista —
usa el listado normal, acotado a pantalla y batería.

### Precios (`PRICES` en `js/models-data.js`)

Todo en dólares, como números (el formateo "US$ 50" se hace al mostrar, con
`formatPrice()`). Dos formas según el servicio:

- **Servicios simples** (batería, cámara, puerto de carga, botones, diagnóstico):
  `PRICES["iphone"]["iPhone 13"]["bateria"] = 69`
- **Servicios con acordeón de opciones** (pantalla y vidrio trasero, solo en iPhone —
  ver `IPHONE_REPAIR_OPTIONS` e `IPHONE_BACK_GLASS_COLORS`): el valor en `PRICES` sigue
  siendo un objeto por opción, pero **solo para pantalla** el precio varía por opción
  (`{ oled: 144 }`); para vidrio trasero el precio es el mismo sin importar el color
  elegido, así que se guarda como número simple: `PRICES["iphone"]["iPhone 13"]["tapa-trasera"] = 60`.

Para pantalla, las opciones posibles son `oled`, `incell` (LCD) y `original` (repuesto
Apple). **No todos los modelos tienen las tres**: la página solo muestra las opciones
que tienen precio cargado para ese modelo puntual (ej. iPhone 11 base solo tiene
`incell`, nunca tuvo pantalla OLED de fábrica). Si un modelo todavía no tiene ningún
precio cargado para ese servicio, se muestran todas las opciones con "Consultar" para
no dejar la sección vacía (ver `getAvailableOptions()` en `main.js`).

**Vidrio trasero (`tapa-trasera`) se despliega igual que pantalla, pero por color**: no
se ofrece "solo vidrio" vs. "tapa completa" (implicaría cambio de chasis, el usuario
pidió explícitamente no ofrecerlo) — la variante es el color del equipo. Los colores
salen de `IPHONE_BACK_GLASS_COLORS[modelo]` (los nombres oficiales que usa Apple para
esa generación, ver `js/models-data.js`), no de `IPHONE_REPAIR_OPTIONS`, y el precio
que se muestra es el mismo para todos los colores de un modelo (`getPrice()`, no
`getOptionPrice()` — ver `isColorService()` en `main.js`, tanto en `initCategoryPage`
como en el buscador guiado).

**Por ahora `PRICES.iphone` está vacío (`{}`)**: el usuario pidió sacar todos los
precios del sitio ("te repito, sacar los precios" → confirmó que era para todos, no
solo vidrio trasero) — pantalla, batería, todo. Todas las páginas muestran "Consultar"
en cada línea hasta que pase una lista de precios definitiva. Al cargarla, restaurar
el mismo patrón que antes: `PRICES["iphone"]["<modelo>"]["<servicio>"] = número` (o
`{ oled: número, ... }` para pantalla).

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
3. **Precios de iPad, Mac y Apple Watch**: sin catálogo de precios. Mac muestra
   cotización directa (`SIMPLE_QUOTE_CATEGORIES`); iPad (pantalla + batería) y Apple
   Watch ya tienen el listado de servicios pero sin ningún precio cargado (todo
   "Consultar").
4. **Precios de iPhone, todos los servicios y modelos**: se habían cargado (con precios
   reales que había dado el usuario) y después se sacaron por completo a pedido
   explícito del usuario ("te repito, sacar los precios" → confirmó que era para
   pantalla y batería también, no solo vidrio trasero). Hoy `PRICES.iphone` está vacío
   y toda la página muestra "Consultar". Cargarlos cuando el usuario pase la lista
   definitiva (`PRICES["iphone"]["<modelo>"]["<servicio>"] = número`, u `{ oled: N, ... }`
   para pantalla).
5. **Batería de iPhone 16 y 17 (todas las variantes)**: además de lo anterior, según
   el usuario, todavía no hay repuesto de batería compatible en plaza para esos modelos
   por ser muy nuevos. Se agrega cuando exista el repuesto, no antes.
6. **Dólar blue / Ámbito**: pospuesto a pedido del usuario (ver reglas de negocio arriba).
7. Imágenes reales del local/trabajos (hoy no hay fotos, todo es ícono/emoji para
   evitar usar imágenes con derechos de Apple).
8. Definir dominio propio y dónde hostear (GitHub Pages, Netlify, hosting compartido, etc.).
9. **Artículos del blog** (`blog.html`): el usuario pidió crear la sección ("blog o
   newsletter" con novedades de Apple y equipos nuevos) pero explícitamente todavía no
   quiere cargar contenido real — por ahora es solo un cartel de "próximamente". No
   escribir posts de ejemplo/inventados sin que el usuario lo pida.

## Convenciones

- No usar contenido/branding real de Apple (logo, fotos de producto, tipografía SF con
  licencia) — solo inspiración de layout y paleta.
- Mantener `js/config.js` y `js/models-data.js` como única fuente de verdad para datos
  editables — no hardcodear teléfono/precios directamente en el HTML.
- Los precios son siempre números en USD dentro de `PRICES`; formatear con
  `formatPrice()` al mostrarlos, nunca como string ya formateado en los datos.
