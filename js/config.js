/*
 * Datos generales del negocio.
 * Editar acá cuando se tengan los datos definitivos: se actualizan solos
 * en todas las páginas (nav, contacto, footer, botones de WhatsApp).
 */
const CONFIG = {
  businessName: "iFix Service",
  tagline: "Servicio técnico especializado en productos Apple",

  // Número de WhatsApp en formato internacional, sin +, espacios ni guiones. Ej: 5491122334455
  whatsappNumber: "5491100000000",
  whatsappMessage: "Hola! Quiero consultar por una reparación.",

  phoneDisplay: "+54 9 11 0000-0000",
  email: "contacto@ifixservice.com",
  address: "Dirección a confirmar, Ciudad, Argentina",
  hours: "Lunes a viernes de 10 a 19 hs · Sábados de 10 a 14 hs",

  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
};

function whatsappLink(customMessage) {
  const msg = encodeURIComponent(customMessage || CONFIG.whatsappMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
}
