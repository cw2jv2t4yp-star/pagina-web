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
  { id: "tapa-trasera", label: "Vidrio / Tapa trasera", desc: "Cambio de vidrio o tapa trasera rota o astillada.", icon: "🔲" },
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
  ipad: ["pantalla", "bateria", "puerto-carga", "botones", "diagnostico"],
  mac: ["pantalla", "bateria", "puerto-carga", "botones", "diagnostico"],
  watch: ["pantalla", "bateria", "botones", "diagnostico"],
};

// Categorías sin catálogo de reparaciones definido todavía: en vez de mostrar una
// lista de servicios, se muestra un cartel de "cotizá tu equipo" directo por
// WhatsApp. Sacar una categoría de esta lista en cuanto se defina su catálogo.
const SIMPLE_QUOTE_CATEGORIES = ["ipad", "mac"];

// Opciones de repuesto para iPhone, con la tecnología, pros y contras de cada una.
// Por ahora es el único producto con este nivel de detalle: es donde más
// reparaciones se hacen y donde mejor conocemos las opciones de repuestos.
// Formato: IPHONE_REPAIR_OPTIONS[idServicio] = [ { id, name, tech, pros[], cons[], price, eta }, ... ]
// price/eta quedan en null hasta que se cargue el precio y tiempo real por modelo.
const IPHONE_REPAIR_OPTIONS = {
  pantalla: [
    {
      id: "oled",
      name: "Pantalla OLED",
      tech: "Tecnología OLED: cada píxel genera su propia luz. Es la tecnología de fábrica en los modelos que traen pantalla OLED (por ejemplo, los Pro y varios modelos desde el iPhone X en adelante).",
      pros: ["Negros más profundos y colores más fieles", "Mejor brillo y contraste"],
      cons: ["Más cara que una pantalla Incell/LCD", "Reparación más delicada"],
      price: null,
      eta: null,
    },
    {
      id: "incell",
      name: "Pantalla Incell (LCD)",
      tech: "Tecnología LCD In-Cell: el sensor táctil está integrado en el panel LCD. Es la tecnología de fábrica en modelos con pantalla LCD, como el iPhone 11.",
      pros: ["Más económica", "Buena calidad de imagen para uso diario"],
      cons: ["Colores algo menos intensos que un OLED", "Los negros no son tan profundos"],
      price: null,
      eta: null,
    },
  ],
  bateria: [
    {
      id: "estandar",
      name: "Batería estándar",
      tech: "Batería de reemplazo de capacidad equivalente a la original de fábrica.",
      pros: ["Buena relación precio / duración", "Instalación rápida"],
      cons: [],
      price: null,
      eta: null,
    },
    {
      id: "alta-capacidad",
      name: "Batería de alta capacidad",
      tech: "Batería de mayor capacidad (mAh) que la original, para más autonomía por carga.",
      pros: ["Más horas de uso entre cargas"],
      cons: ["Precio algo mayor"],
      price: null,
      eta: null,
    },
  ],
  "tapa-trasera": [
    {
      id: "solo-vidrio",
      name: "Cambio de solo el vidrio (láser)",
      tech: "Se retira con láser solo el vidrio roto y se coloca uno nuevo, sin cambiar la tapa completa.",
      pros: ["Más económico", "Se mantiene la tapa y las cámaras originales"],
      cons: ["Proceso más delicado", "No siempre es posible según el daño"],
      price: null,
      eta: null,
    },
    {
      id: "tapa-completa",
      name: "Cambio de tapa completa",
      tech: "Se reemplaza toda la tapa trasera, incluyendo el marco.",
      pros: ["Resultado más prolijo si el daño es grande", "También repara golpes en el marco"],
      cons: ["Más caro", "Reparación más larga"],
      price: null,
      eta: null,
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

// Precios: completar a futuro con el formato PRICES["iphone"]["iPhone 15 Pro"]["pantalla"] = "$XX.XXX"
const PRICES = {};

function getPrice(category, model, serviceId) {
  return (
    (PRICES[category] && PRICES[category][model] && PRICES[category][model][serviceId]) ||
    null
  );
}
