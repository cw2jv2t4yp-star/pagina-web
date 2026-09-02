# Página web — Servicio técnico Apple

## Qué es este proyecto

Sitio web para un negocio de reparación de productos Apple (usuario: menazzi@gmail.com).
Servicios ofrecidos: reparación de **iPhone, iPad, Mac y Apple Watch** — pantalla, batería,
vidrio/tapa trasera, cámara, puerto de carga, botones y diagnóstico general.

Diseño inspirado en la estética de apple.com (minimalista, tipografía grande, mucho
blanco, nav superior con blur) pero **sin usar logo ni fotos reales de Apple** (marca
registrada) — se imita el estilo visual, no los activos de marca.

## Reglas de negocio acordadas con el usuario

- Solo se listan modelos de **iPhone, iPad y Apple Watch desde 2019 en adelante**
  (equivalente a iPhone 11). No se agregan modelos más viejos (ej. no iPhone 6s).
- **Mac es la excepción**: se listan modelos **desde 2012 en adelante**, porque las Mac
  duran más y siguen siendo reparables.
- El listado de modelos y de servicios de reparación es una estructura inicial; los
  precios y el detalle final por modelo los va a cargar el usuario después.

## Stack técnico

HTML/CSS/JS estático, sin build ni frameworks (fácil de hostear en GitHub Pages, Netlify,
un hosting compartido, etc.). No hay dependencias externas.

## Estructura de archivos

```
index.html          Home: hero, categorías, servicios, contacto
iphone.html          Página de categoría iPhone (pestañas por modelo)
ipad.html             Página de categoría iPad
mac.html              Página de categoría Mac
watch.html            Página de categoría Apple Watch
css/styles.css        Estilos (design system tipo Apple: colores, tipografía, componentes)
js/config.js          Datos generales del negocio (nombre, WhatsApp, teléfono, email, etc.)
js/models-data.js     Modelos por categoría + servicios de reparación + precios
js/main.js            Lógica: nav móvil, inyección de datos de contacto, pestañas de modelo
```

### Cómo están armadas las páginas de categoría

Cada página de categoría (`iphone.html`, `ipad.html`, `mac.html`, `watch.html`) tiene los
mismos dos contenedores vacíos:

```html
<div id="model-tabs" class="model-tabs"></div>
<div id="model-panel" class="model-panel"></div>
```

y al final llama a `initCategoryPage("iphone")` (o la categoría que corresponda). Esa
función (en `js/main.js`) lee `MODELS` y `SERVICES_BY_CATEGORY` de `js/models-data.js`,
dibuja las pestañas de modelo, y al hacer clic en una pestaña muestra el panel con los
servicios de reparación disponibles para ese modelo (con precio si está cargado en
`PRICES`, o "Consultar" si no).

## Pendiente — datos reales para cargar

Estos son placeholders que el usuario tiene que reemplazar:

1. **`js/config.js`**: nombre real del negocio (hoy: "iFix Service" — placeholder,
   confirmar o cambiar), número de WhatsApp, teléfono, email, dirección, horarios,
   redes sociales.
2. **`js/models-data.js` → objeto `PRICES`**: precios por modelo y tipo de reparación.
   Formato: `PRICES["iphone"]["iPhone 15 Pro"]["pantalla"] = "$XX.XXX"`.
3. Revisar si la lista de modelos de `MODELS` está completa/actualizada (hay que
   agregar los modelos que salgan después de la fecha de creación de este archivo).
4. Imágenes reales del local/trabajos (hoy no hay fotos, todo es ícono/emoji para
   evitar usar imágenes con derechos de Apple).
5. Definir si se quiere dominio propio y dónde se va a hostear (GitHub Pages, Netlify,
   hosting compartido, etc.).

## Convenciones

- No usar contenido/branding real de Apple (logo, fotos de producto, tipografía SF con
  licencia) — solo inspiración de layout y paleta.
- Mantener `js/config.js` y `js/models-data.js` como única fuente de verdad para datos
  editables — no hardcodear teléfono/precios directamente en el HTML.
