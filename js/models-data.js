/*
 * Datos de modelos y servicios de reparación.
 * Este archivo es el único lugar que hay que tocar para:
 *   - agregar/quitar modelos de un producto
 *   - agregar/quitar tipos de reparación (servicios)
 *   - cargar precios reales (objeto PRICES)
 *
 * Mientras no haya un precio cargado en PRICES, la página muestra "Consultar".
 */

// Servicios de reparación disponibles (aplican, en general, a todas las categorías).
// id: identificador interno | label: texto visible | icon: emoji/símbolo simple (sin usar íconos de Apple)
const SERVICES = [
  { id: "pantalla", label: "Pantalla", desc: "Cambio de módulo de pantalla original o compatible premium.", icon: "🖥️" },
  { id: "bateria", label: "Batería", desc: "Reemplazo de batería por baja duración o desgaste.", icon: "🔋" },
  { id: "tapa-trasera", label: "Vidrio trasero", desc: "Cambio de vidrio trasero roto o astillado.", icon: "🔲" },
  { id: "camara", label: "Cámara", desc: "Reparación de cámara trasera o frontal (foco, vidrio, módulo).", icon: "📷" },
  { id: "puerto-carga", label: "Puerto de carga", desc: "Limpieza o cambio de conector de carga.", icon: "🔌" },
  { id: "botones", label: "Botones", desc: "Reparación de botones de volumen, encendido o Home/Action.", icon: "🔘" },
  { id: "diagnostico", label: "Diagnóstico", desc: "Diagnóstico técnico general del equipo.", icon: "🔍" },
];

// Modelos por categoría, agrupados por generación/línea para no mostrar una
// lista larga y plana (el usuario toca "iPhone 16" y ahí se despliegan los
// modelos de esa generación). Se puede seguir agregando modelos nuevos a
// cada grupo, o grupos nuevos a cada categoría.
// Criterio: iPhone/iPad/Watch desde ~2019 en adelante (iPhone 11 y equivalentes).
// Mac desde 2012 en adelante (las Mac duran más y siguen siendo reparables).
// No se incluyen modelos más viejos que esos porque no se reparan.
const OTHER_MODEL_LABEL = "Otro modelo / no listado";

const MODEL_GROUPS = {
  iphone: [
    { label: "iPhone 17", models: ["iPhone 17 Pro Max", "iPhone 17 Pro"] },
    { label: "iPhone 16", models: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 16e"] },
    { label: "iPhone 15", models: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15"] },
    { label: "iPhone 14", models: ["iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14"] },
    { label: "iPhone 13", models: ["iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini"] },
    { label: "iPhone SE", models: ["iPhone SE (3ª gen., 2022)", "iPhone SE (2ª gen., 2020)"] },
    { label: "iPhone 12", models: ["iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 mini"] },
    { label: "iPhone 11", models: ["iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11"] },
  ],
  ipad: [
    { label: "iPad Pro", models: ["iPad Pro 13\" (M4)", "iPad Pro 11\" (M4)", "iPad Pro (2018-2022, otros tamaños)"] },
    { label: "iPad Air", models: ["iPad Air 13\" (M2)", "iPad Air 11\" (M2)", "iPad Air (2019-2022, otros tamaños)"] },
    { label: "iPad", models: ["iPad (10ª gen.)", "iPad (9ª gen.)", "iPad (8ª/7ª gen.)"] },
    { label: "iPad mini", models: ["iPad mini (7ª gen.)", "iPad mini (6ª gen.)", "iPad mini (5ª gen., 2019)"] },
  ],
  mac: [
    { label: "MacBook Pro (Apple Silicon)", models: ["MacBook Pro 16\" (M4)", "MacBook Pro 14\" (M4)", "MacBook Pro (M1/M2/M3, otros tamaños)"] },
    { label: "MacBook Air (Apple Silicon)", models: ["MacBook Air 15\"", "MacBook Air 13\"", "MacBook Air (M1/M2, otros tamaños)"] },
    { label: "MacBook (Intel)", models: ["MacBook Pro/Air (Intel, 2016-2020)", "MacBook Pro/Air (Intel, 2012-2015)"] },
  ],
  watch: [
    { label: "Apple Watch Ultra", models: ["Apple Watch Ultra 2"] },
    { label: "Apple Watch (recientes)", models: ["Apple Watch Series 10", "Apple Watch Series 9", "Apple Watch Series 8", "Apple Watch Series 7"] },
    { label: "Apple Watch SE", models: ["Apple Watch SE (2ª gen.)", "Apple Watch SE (1ª gen.)"] },
    { label: "Apple Watch (anteriores)", models: ["Apple Watch Series 6", "Apple Watch Series 5"] },
  ],
};

// Lista plana por categoría, derivada de MODEL_GROUPS + la opción "otro modelo".
// Se usa donde hace falta la lista completa sin agrupar.
const MODELS = Object.fromEntries(
  Object.keys(MODEL_GROUPS).map((cat) => [
    cat,
    [...MODEL_GROUPS[cat].flatMap((g) => g.models), OTHER_MODEL_LABEL],
  ])
);

// Datos de presentación de cada categoría (usados en el buscador guiado de la home).
const CATEGORY_META = {
  iphone: { label: "iPhone", icon: "📱" },
  ipad: { label: "iPad", icon: "📱" },
  mac: { label: "Mac", icon: "💻" },
  watch: { label: "Apple Watch", icon: "⌚" },
};

// Servicios disponibles por categoría (Mac, por ejemplo, no tiene "cámara trasera" del mismo tipo,
// pero se puede ajustar esta lista a medida que se defina el catálogo real).
const SERVICES_BY_CATEGORY = {
  iphone: ["pantalla", "bateria", "tapa-trasera", "camara", "puerto-carga", "botones", "diagnostico"],
  ipad: ["pantalla", "bateria"],
  mac: ["pantalla", "bateria", "puerto-carga", "botones", "diagnostico"],
  watch: ["pantalla", "bateria", "botones", "diagnostico"],
};

// Categorías sin catálogo de reparaciones definido todavía: en vez de mostrar una
// lista de servicios, se muestra un cartel de "cotizá tu equipo" directo por
// WhatsApp. Sacar una categoría de esta lista en cuanto se defina su catálogo.
// iPad ya salió de acá: tiene catálogo acotado a pantalla y batería (ver SERVICES_BY_CATEGORY).
const SIMPLE_QUOTE_CATEGORIES = ["mac"];

// Opciones de repuesto para iPhone, con la tecnología, pros y contras de cada una.
// Por ahora es el único producto con este nivel de detalle: es donde más
// reparaciones se hacen y donde mejor conocemos las opciones de repuestos.
// El precio de cada opción NO va acá: se busca en PRICES según el modelo
// (una misma opción, ej. "oled", vale distinto según el modelo de iPhone).
// Formato: IPHONE_REPAIR_OPTIONS[idServicio] = [ { id, name, tech, pros[], cons[] }, ... ]
const IPHONE_REPAIR_OPTIONS = {
  pantalla: [
    {
      id: "oled",
      name: "Pantalla OLED",
      tech: "Tecnología OLED: cada píxel genera su propia luz. Es la tecnología de fábrica en los modelos que traen pantalla OLED (por ejemplo, los Pro y varios modelos desde el iPhone X en adelante).",
      pros: ["Negros más profundos y colores más fieles", "Mejor brillo y contraste"],
      cons: ["Más cara que una pantalla Incell/LCD", "Reparación más delicada"],
    },
    {
      id: "incell",
      name: "Pantalla Incell (LCD)",
      tech: "Tecnología LCD In-Cell: el sensor táctil está integrado en el panel LCD. Es la tecnología de fábrica en modelos con pantalla LCD, como el iPhone 11.",
      pros: ["Más económica", "Buena calidad de imagen para uso diario"],
      cons: ["Colores algo menos intensos que un OLED", "Los negros no son tan profundos"],
    },
    {
      id: "original",
      name: "Pantalla original (Apple)",
      tech: "Repuesto original de Apple (Service Pack): la misma pantalla con la que sale el equipo de fábrica.",
      pros: ["Calidad idéntica a la de fábrica", "Sin avisos ni límites de funciones (brillo automático, True Tone, etc.)"],
      cons: ["La opción más cara", "No está disponible para todos los modelos"],
      note: "Sujeto a disponibilidad de stock.",
    },
  ],
};

// Síntomas frecuentes por tipo de reparación. Se usan en el paso de "diagnóstico"
// del buscador guiado, para que el cliente cuente qué le pasa al equipo sin
// necesidad de saber términos técnicos. Esto llega en el mensaje de WhatsApp.
const SYMPTOMS_BY_SERVICE = {
  pantalla: [
    "Está rota o rajada (pero prende)",
    "No prende / pantalla negra",
    "No responde al tacto",
    "Tiene líneas, manchas o colores raros",
    "Otro / no estoy seguro",
  ],
  bateria: [
    "Se descarga muy rápido",
    "Se apaga solo aunque tenga batería",
    "Está hinchada o abultada",
    "No carga o carga mal",
    "Otro / no estoy seguro",
  ],
  "tapa-trasera": [
    "Vidrio trasero rajado",
    "Tapa trasera rota o despegada",
    "Otro / no estoy seguro",
  ],
  camara: [
    "La foto sale borrosa o no enfoca",
    "La cámara no prende / pantalla negra al abrirla",
    "El vidrio de la cámara está roto",
    "Otro / no estoy seguro",
  ],
  "puerto-carga": [
    "No carga",
    "Carga solo moviendo el cable o en una posición",
    "El cable entra flojo o no entra",
    "Otro / no estoy seguro",
  ],
  botones: [
    "El botón de volumen no responde",
    "El botón de encendido no responde",
    "El botón Home / Action no responde",
    "Otro / no estoy seguro",
  ],
  diagnostico: [
    "No prende",
    "Se reinicia solo",
    "Se mojó",
    "No sé qué tiene, necesito diagnóstico",
    "Otro / no estoy seguro",
  ],
};

// Ayuda para identificar el modelo, por categoría (paso 2 del buscador).
// Texto en lenguaje simple, pensado para gente no técnica.
const MODEL_HELP = {
  iphone: "Andá a Ajustes > General > Información y fijate en \"Nombre del modelo\". También podés mirar la parte de atrás del teléfono, cerca de la letra chica.",
  ipad: "Andá a Ajustes > General > Información y fijate en \"Nombre del modelo\". También está grabado en la parte de atrás del iPad.",
  mac: "Tocá el logo de la manzana (arriba a la izquierda) > \"Acerca de esta Mac\" y vas a ver el modelo y el año.",
  watch: "En el reloj: Ajustes > General > Información. O desde el iPhone: abrí la app \"Watch\" > General > Información.",
};

// Colores oficiales de tapa/vidrio trasero por modelo de iPhone (los mismos nombres
// que usa Apple para cada generación). Se usa para que el cliente indique de qué
// color es su equipo al pedir el cambio de vidrio trasero — no cambia el precio,
// es solo para que el taller sepa qué repuesto pedir. Modelos no listados acá
// (iPad, Mac, Watch) no muestran selector de color.
const IPHONE_BACK_GLASS_COLORS = {
  "iPhone 11": ["Blanco", "Negro", "(PRODUCT)RED", "Amarillo", "Verde", "Púrpura"],
  "iPhone 11 Pro": ["Verde noche", "Gris espacial", "Plata", "Oro"],
  "iPhone 11 Pro Max": ["Verde noche", "Gris espacial", "Plata", "Oro"],

  "iPhone 12 mini": ["Negro", "Blanco", "(PRODUCT)RED", "Verde", "Azul", "Púrpura"],
  "iPhone 12": ["Negro", "Blanco", "(PRODUCT)RED", "Verde", "Azul", "Púrpura"],
  "iPhone 12 Pro": ["Grafito", "Plata", "Oro", "Azul pacífico"],
  "iPhone 12 Pro Max": ["Grafito", "Plata", "Oro", "Azul pacífico"],

  "iPhone 13 mini": ["Medianoche", "Luz estelar", "Azul", "Rosa", "Verde", "(PRODUCT)RED"],
  "iPhone 13": ["Medianoche", "Luz estelar", "Azul", "Rosa", "Verde", "(PRODUCT)RED"],
  "iPhone 13 Pro": ["Grafito", "Oro", "Plata", "Azul sierra", "Verde alpino"],
  "iPhone 13 Pro Max": ["Grafito", "Oro", "Plata", "Azul sierra", "Verde alpino"],

  "iPhone SE (2ª gen., 2020)": ["Negro", "Blanco", "(PRODUCT)RED"],
  "iPhone SE (3ª gen., 2022)": ["Medianoche", "Luz estelar", "(PRODUCT)RED"],

  "iPhone 14": ["Medianoche", "Luz estelar", "(PRODUCT)RED", "Azul", "Púrpura", "Amarillo"],
  "iPhone 14 Plus": ["Medianoche", "Luz estelar", "(PRODUCT)RED", "Azul", "Púrpura", "Amarillo"],
  "iPhone 14 Pro": ["Negro espacial", "Plata", "Oro", "Púrpura oscuro"],
  "iPhone 14 Pro Max": ["Negro espacial", "Plata", "Oro", "Púrpura oscuro"],

  "iPhone 15": ["Negro", "Azul", "Verde", "Amarillo", "Rosa"],
  "iPhone 15 Plus": ["Negro", "Azul", "Verde", "Amarillo", "Rosa"],
  "iPhone 15 Pro": ["Titanio negro", "Titanio blanco", "Titanio azul", "Titanio natural"],
  "iPhone 15 Pro Max": ["Titanio negro", "Titanio blanco", "Titanio azul", "Titanio natural"],

  "iPhone 16": ["Negro", "Blanco", "Rosa", "Verde azulado", "Azul ultramar"],
  "iPhone 16 Plus": ["Negro", "Blanco", "Rosa", "Verde azulado", "Azul ultramar"],
  "iPhone 16 Pro": ["Titanio negro", "Titanio blanco", "Titanio natural", "Titanio desierto"],
  "iPhone 16 Pro Max": ["Titanio negro", "Titanio blanco", "Titanio natural", "Titanio desierto"],
  "iPhone 16e": ["Negro", "Blanco"],

  "iPhone 17 Pro": ["Naranja cósmico", "Azul profundo", "Plata"],
  "iPhone 17 Pro Max": ["Naranja cósmico", "Azul profundo", "Plata"],
};

/** Colores de tapa trasera disponibles para un modelo, o [] si no aplica (no es iPhone, o modelo sin datos). */
function getBackGlassColors(model) {
  return IPHONE_BACK_GLASS_COLORS[model] || [];
}

// Aproximación en hex de cada color oficial, solo para mostrar un círculo de color
// junto al nombre (no son los códigos exactos de Apple, es una referencia visual
// para que se entienda de un vistazo aunque no se lea el texto).
const COLOR_SWATCHES = {
  "Blanco": "#F5F5F1",
  "Negro": "#1C1C1E",
  "(PRODUCT)RED": "#B0212F",
  "Amarillo": "#F3E2A9",
  "Verde": "#A9C6A0",
  "Púrpura": "#D6CADD",
  "Verde noche": "#4E5851",
  "Gris espacial": "#55534E",
  "Plata": "#E3E4E6",
  "Oro": "#F0E1CF",
  "Azul pacífico": "#3B4A5A",
  "Medianoche": "#1E1E24",
  "Luz estelar": "#F0E6D8",
  "Azul": "#7C9CBF",
  "Rosa": "#F0C7C7",
  "Azul sierra": "#A8C4D4",
  "Verde alpino": "#6E7C6C",
  "Grafito": "#4A4A4C",
  "Negro espacial": "#35322F",
  "Púrpura oscuro": "#5C5468",
  "Titanio negro": "#3C3C3E",
  "Titanio blanco": "#E8E4DC",
  "Titanio azul": "#4B5563",
  "Titanio natural": "#8A8478",
  "Verde azulado": "#6E8C89",
  "Azul ultramar": "#4A5FBF",
  "Titanio desierto": "#B7A78E",
  "Naranja cósmico": "#D9714A",
  "Azul profundo": "#33445E",
};

/** Color hex aproximado para el círculo junto al nombre, o gris neutro si no está mapeado. */
function getColorSwatch(colorName) {
  return COLOR_SWATCHES[colorName] || "#C7C7CC";
}

// Precios en dólares (USD). Todos los montos son números; el formateo
// ("US$ 50") se hace al mostrarlos, no acá.
//
// Dos formas según el servicio:
//   - Servicios simples (batería, vidrio trasero, cámara, puerto de carga, botones, diagnóstico):
//       PRICES["iphone"]["iPhone 13"]["bateria"] = 69
//   - Servicios con opciones de repuesto (por ahora, solo pantalla en iPhone):
//       PRICES["iphone"]["iPhone 13"]["pantalla"] = { oled: 144 }
//     Si un modelo no tiene cargada una opción (ej. no tiene "incell"), esa
//     opción no se ofrece para ese modelo y no aparece en la página.
//
// A pedido del usuario, por el momento no hay ningún precio cargado (todo
// muestra "Consultar") — se vuelven a cargar cuando pase la lista definitiva.
const PRICES = {
  iphone: {},
};

/** Precio de un servicio simple (sin opciones de repuesto), o null si no está cargado. */
function getPrice(category, model, serviceId) {
  const v = PRICES[category] && PRICES[category][model] && PRICES[category][model][serviceId];
  return typeof v === "number" ? v : null;
}

/** Precio de una opción de repuesto puntual (ej. pantalla > oled), o null si no está cargado. */
function getOptionPrice(category, model, serviceId, optionId) {
  const v = PRICES[category] && PRICES[category][model] && PRICES[category][model][serviceId];
  return v && typeof v === "object" && typeof v[optionId] === "number" ? v[optionId] : null;
}

/** ids de las opciones de repuesto que tienen precio cargado para este modelo. */
function getPricedOptionIds(category, model, serviceId) {
  const v = PRICES[category] && PRICES[category][model] && PRICES[category][model][serviceId];
  return v && typeof v === "object" ? Object.keys(v) : [];
}

/** Formatea un precio en dólares para mostrar en la página. */
function formatPrice(amount) {
  return amount == null ? null : `US$ ${amount}`;
}
