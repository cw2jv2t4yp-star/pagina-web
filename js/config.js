/*
 * Datos generales del negocio.
 * Editar acá cuando se tengan los datos definitivos: se actualizan solos
 * en todas las páginas (nav, contacto, footer, botones de WhatsApp).
 */
const CONFIG = {
  businessName: "Inkblot",
  tagline: "Servicio técnico especializado en productos Apple",

  // Número de WhatsApp en formato internacional, sin +, espacios ni guiones. Ej: 5491122334455
  // Número personal del usuario (11 6849-2024), no el de la página oficial de Inkblot.
  whatsappNumber: "5491168492024",
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
