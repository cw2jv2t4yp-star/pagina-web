/*
 * Datos generales del negocio.
 * Editar acá cuando se tengan los datos definitivos: se actualizan solos
 * en todas las páginas (nav, contacto, footer, botones de WhatsApp).
 */
const CONFIG = {
  businessName: "Inkblot",
  tagline: "Servicio técnico especializado en productos Apple",

  // Número de WhatsApp en formato internacional, sin +, espacios ni guiones. Ej: 5491122334455
  // OJO: el teléfono real es +54 11 5887-3498 (sin el "9"), tal cual figura en la página
  // oficial. Para números argentinos, los links de WhatsApp (wa.me) suelen necesitar un
  // "9" después del 54 para que abran bien en el celular. Se lo agregamos acá, pero
  // conviene probarlo y avisar si no abre correcto para ajustarlo.
  whatsappNumber: "5491158873498",
  whatsappMessage: "Hola! Quiero consultar por una reparación.",

  phoneDisplay: "+54 11 5887-3498",
  email: "menazzi@inkblot.pro",
  address: "Franklin D. Roosevelt 2445, 5° C, Ciudad de Buenos Aires",
  hours: "Lunes a viernes de 10 a 18 hs",

  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
};

function whatsappLink(customMessage) {
  const msg = encodeURIComponent(customMessage || CONFIG.whatsappMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
}
