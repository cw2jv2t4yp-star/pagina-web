/* Lógica compartida: menú móvil, datos de contacto y páginas de categoría. */

document.addEventListener("DOMContentLoaded", () => {
  applyContactData();
  initMobileNav();
});

/* -------------------- Nav / contacto -------------------- */

function applyContactData() {
  document.querySelectorAll("[data-whatsapp-link]").forEach((el) => {
    el.href = whatsappLink();
  });
  document.querySelectorAll("[data-business-name]").forEach((el) => {
    el.textContent = CONFIG.businessName;
  });
  document.querySelectorAll("[data-phone]").forEach((el) => {
    el.textContent = CONFIG.phoneDisplay;
    if (el.tagName === "A") el.href = `tel:${CONFIG.phoneDisplay.replace(/\s|-/g, "")}`;
  });
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.textContent = CONFIG.email;
    if (el.tagName === "A") el.href = `mailto:${CONFIG.email}`;
  });
  document.querySelectorAll("[data-address]").forEach((el) => {
    el.textContent = CONFIG.address;
  });
  document.querySelectorAll("[data-maps-link]").forEach((el) => {
    el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.address)}`;
  });
  document.querySelectorAll("[data-map-embed]").forEach((el) => {
    el.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.address)}&output=embed`;
  });
  document.querySelectorAll("[data-hours]").forEach((el) => {
    el.textContent = CONFIG.hours;
  });
  document.querySelectorAll("[data-instagram]").forEach((el) => {
    el.href = CONFIG.instagram;
  });
  document.querySelectorAll("[data-facebook]").forEach((el) => {
    el.href = CONFIG.facebook;
  });
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.textContent = open ? "✕" : "☰";
    links.style.display = open ? "flex" : "";
  });
}

/* -------------------- Utilidades compartidas -------------------- */

/**
 * Evita repetir el nombre del producto cuando el modelo ya lo incluye
 * (ej: no queremos "iPhone iPhone 15 Pro", pero sí "Apple Watch (modelo no indicado)").
 */
function formatDeviceLabel(category, model) {
  const meta = CATEGORY_META[category];
  if (!meta) return model;
  if (model.startsWith("Otro modelo")) return `${meta.label} (modelo no indicado en la lista)`;
  if (model.toLowerCase().startsWith(meta.label.toLowerCase())) return model;
  return `${meta.label} ${model}`;
}

/**
 * Dibuja la lista de modelos agrupada por generación/línea (ej: "iPhone 16"
 * con sus 5 variantes adentro), en vez de una lista plana larga. Los grupos
 * son botones redondeados en fila (como los de modelo); al tocar uno se
 * despliega debajo una sola fila con los modelos de esa línea, también como
 * botones redondeados.
 * El llamador es responsable de conectar los listeners de [data-group-index]
 * y [data-model] sobre el contenedor donde se inyecta este HTML.
 */
function renderModelGroups(category, activeModel, openIndex) {
  const groups = MODEL_GROUPS[category] || [];
  const rowHtml = groups
    .map((g, i) => {
      const isOpen = i === openIndex;
      const hasActive = g.models.includes(activeModel);
      return `<button class="model-group__header${hasActive ? " has-active" : ""}" data-group-index="${i}">
        <span>${escapeHtml(g.label)}</span>
        <span class="model-group__arrow${isOpen ? " is-open" : ""}">▾</span>
      </button>`;
    })
    .join("");

  const openGroup = groups[openIndex];
  const modelsHtml = openGroup
    ? `<div class="model-group__models">${openGroup.models.map((m) => `<button class="model-tab${m === activeModel ? " is-active" : ""}" data-model="${escapeHtml(m)}">${escapeHtml(m)}</button>`).join("")}</div>`
    : "";

  const otherActive = activeModel === OTHER_MODEL_LABEL;
  return `<div class="model-group-row">${rowHtml}</div>
    ${modelsHtml}
    <button class="model-tab model-tab--other${otherActive ? " is-active" : ""}" data-model="${OTHER_MODEL_LABEL}">${OTHER_MODEL_LABEL}</button>`;
}

/** Índice del grupo al que pertenece un modelo (-1 si es "otro modelo" o no se encuentra). */
function findGroupIndex(category, model) {
  const groups = MODEL_GROUPS[category] || [];
  return groups.findIndex((g) => g.models.includes(model));
}

/**
 * @param {object} [checkbox] Si se pasa, agrega un checkbox para incluir esta opción
 *   puntual en el pedido de cotización (usado en la página de categoría, donde se arma
 *   un pedido con varias reparaciones a la vez). { serviceId, checked }.
 */
function renderOptionCard(opt, priceAmount, checkbox) {
  const pros = (opt.pros || []).map((p) => `<li>${escapeHtml(p)}</li>`).join("");
  const price = formatPrice(priceAmount);
  const checkHtml = checkbox
    ? `<button class="option-card__check${checkbox.checked ? " is-checked" : ""}" data-select-service="${checkbox.serviceId}" data-select-option="${escapeHtml(opt.id)}" aria-pressed="${checkbox.checked}" aria-label="Incluir ${escapeHtml(opt.name)} en el pedido"></button>`
    : "";
  return `
    <div class="option-card${checkbox ? " option-card--selectable" : ""}">
      ${checkHtml}
      <h5>${escapeHtml(opt.name)}</h5>
      ${opt.tech ? `<p class="option-card__tech">${escapeHtml(opt.tech)}</p>` : ""}
      ${pros ? `<ul class="option-card__list">${pros}</ul>` : ""}
      <div class="option-card__meta">
        <span>Precio: ${price ? price : "Consultar"}</span>
        <span>Tiempo: A confirmar</span>
      </div>
      ${opt.note ? `<p class="option-card__note">${escapeHtml(opt.note)}</p>` : ""}
    </div>`;
}

/**
 * De las opciones de repuesto definidas para un servicio (ej. pantalla: oled/incell/original),
 * devuelve solo las que tienen precio cargado para el modelo activo (no todos los modelos
 * admiten todas las tecnologías). Si todavía no se cargó ningún precio para ese modelo,
 * se muestran todas igual (con "Consultar") para no dejar la sección vacía.
 */
function getAvailableOptions(category, model, serviceId) {
  const options = IPHONE_REPAIR_OPTIONS[serviceId] || [];
  const pricedIds = getPricedOptionIds(category, model, serviceId);
  if (pricedIds.length === 0) return options;
  return options.filter((o) => pricedIds.includes(o.id));
}

/* -------------------- Páginas de categoría -------------------- */

/**
 * Inicializa una página de categoría (iPhone, iPad, Mac, Apple Watch):
 * dibuja las pestañas de modelo y el panel de reparaciones del modelo activo.
 * iPad y Mac todavía no tienen catálogo de reparaciones definido: en vez de
 * la lista de servicios muestran un cartel de "cotizá tu equipo" directo.
 */
function initCategoryPage(categoryKey) {
  const groups = MODEL_GROUPS[categoryKey] || [];
  const serviceIds = SERVICES_BY_CATEGORY[categoryKey] || [];
  const meta = CATEGORY_META[categoryKey];
  const tabsEl = document.getElementById("model-tabs");
  const panelEl = document.getElementById("model-panel");
  if (!tabsEl || !panelEl || groups.length === 0) return;

  let activeModel = groups[0].models[0];
  let openGroupIndex = 0;
  let selected = []; // reparaciones tildadas para pedir juntas: { serviceId, optionId | null }
  const openOptionServices = new Set(); // qué acordeones de opciones (pantalla, vidrio trasero) están abiertos

  function isSelected(serviceId, optionId) {
    return selected.some((x) => x.serviceId === serviceId && x.optionId === optionId);
  }

  function toggleSelection(serviceId, optionId) {
    if (isSelected(serviceId, optionId)) {
      selected = selected.filter((x) => !(x.serviceId === serviceId && x.optionId === optionId));
    } else {
      // Una sola opción tildada por servicio (no tiene sentido pedir Pantalla OLED e Incell juntas).
      selected = selected.filter((x) => x.serviceId !== serviceId);
      selected.push({ serviceId, optionId });
    }
  }

  function render() {
    tabsEl.innerHTML = renderModelGroups(categoryKey, activeModel, openGroupIndex);

    tabsEl.querySelectorAll("[data-group-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.groupIndex);
        openGroupIndex = openGroupIndex === idx ? -1 : idx;
        render();
      });
    });
    tabsEl.querySelectorAll("[data-model]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeModel = btn.dataset.model;
        openGroupIndex = findGroupIndex(categoryKey, activeModel);
        selected = []; // el pedido armado era para el modelo anterior
        render();
      });
    });

    if (SIMPLE_QUOTE_CATEGORIES.includes(categoryKey)) {
      panelEl.innerHTML = `
        <div class="model-panel__title">${escapeHtml(activeModel)}</div>
        <p class="model-panel__subtitle">Todavía estamos sumando el detalle de reparaciones para ${meta.label}. Contanos qué le pasa a tu equipo y te cotizamos a la brevedad.</p>
        <div class="model-panel__cta">
          <a class="btn btn--primary" href="${whatsappLink(
            `Hola! Tengo un/a ${activeModel} y quiero cotizar una reparación.`
          )}" target="_blank" rel="noopener">Cotizar por WhatsApp</a>
        </div>`;
    } else {
      const services = SERVICES.filter((s) => serviceIds.includes(s.id));
      const items = services
        .map((s) => {
          const isColorService = categoryKey === "iphone" && s.id === "tapa-trasera" && getBackGlassColors(activeModel).length > 0;
          const hasOptions = (categoryKey === "iphone" && IPHONE_REPAIR_OPTIONS[s.id]) || isColorService;
          if (hasOptions) {
            const options = isColorService
              ? getBackGlassColors(activeModel).map((c) => ({ id: c, name: c }))
              : getAvailableOptions(categoryKey, activeModel, s.id);
            const flatPrice = isColorService ? getPrice(categoryKey, activeModel, s.id) : null;
            const cards = options
              .map((o) =>
                renderOptionCard(o, isColorService ? flatPrice : getOptionPrice(categoryKey, activeModel, s.id, o.id), {
                  serviceId: s.id,
                  checked: isSelected(s.id, o.id),
                })
              )
              .join("");
            const isOpen = openOptionServices.has(s.id);
            return `
              <div class="repair-card">
                <button class="repair-item" data-toggle-options="${s.id}" aria-expanded="${isOpen}">
                  <div class="repair-item__icon">${s.icon}</div>
                  <div class="repair-item__body">
                    <h4>${s.label}</h4>
                    <p>${s.desc}</p>
                  </div>
                  <span class="repair-item__toggle-arrow${isOpen ? " is-open" : ""}">▾</span>
                </button>
                <div class="repair-options" id="options-${s.id}" ${isOpen ? "" : "hidden"}>${cards}</div>
              </div>`;
          }
          const price = formatPrice(getPrice(categoryKey, activeModel, s.id));
          const checked = isSelected(s.id, null);
          return `
            <button class="repair-item${checked ? " is-checked" : ""}" data-select-service="${s.id}" aria-pressed="${checked}">
              <div class="repair-item__icon">${s.icon}</div>
              <div class="repair-item__body">
                <h4>${s.label}</h4>
                <p>${s.desc}</p>
                <div class="repair-item__price${price ? "" : " is-empty"}">${price ? price : "Consultar"}</div>
              </div>
            </button>`;
        })
        .join("");

      const hasSelection = selected.length > 0;
      let ctaLabel = "Solicitar cotización por WhatsApp";
      let message = `Hola! Quiero consultar por una reparación para ${activeModel}.`;
      let totalHtml = "";

      if (hasSelection) {
        const lines = selected.map((sel, i) => {
          const service = SERVICES.find((x) => x.id === sel.serviceId);
          let label, priceAmount;
          if (sel.serviceId === "tapa-trasera" && sel.optionId) {
            // el optionId de vidrio trasero es directamente el color elegido
            label = `${service.label} (${sel.optionId})`;
            priceAmount = getPrice(categoryKey, activeModel, sel.serviceId);
          } else {
            const option = sel.optionId ? (IPHONE_REPAIR_OPTIONS[sel.serviceId] || []).find((o) => o.id === sel.optionId) : null;
            label = option ? option.name : service.label;
            priceAmount = option
              ? getOptionPrice(categoryKey, activeModel, sel.serviceId, sel.optionId)
              : getPrice(categoryKey, activeModel, sel.serviceId);
          }
          return { n: i + 1, label, priceAmount };
        });
        ctaLabel = `Consultar ${selected.length} ${selected.length > 1 ? "reparaciones" : "reparación"} por WhatsApp`;
        message = `Hola! Tengo un/a ${activeModel} y quiero cotizar estas reparaciones:\n${lines
          .map((l) => `${l.n}) ${l.label}`)
          .join("\n")}\n¿Me pasás precio${lines.length > 1 ? "s" : ""} y tiempo de espera?`;
        const allPriced = lines.every((l) => l.priceAmount != null);
        const totalAmount = lines.reduce((sum, l) => sum + (l.priceAmount || 0), 0);
        totalHtml = `<div class="model-panel__total${allPriced ? "" : " is-empty"}">${allPriced ? `Total: ${formatPrice(totalAmount)}` : "Consultar precio total"}</div>`;
      }

      panelEl.innerHTML = `
        <div class="model-panel__title">${escapeHtml(activeModel)}</div>
        <p class="model-panel__subtitle">Tildá las reparaciones que necesitás y consultalas juntas por WhatsApp</p>
        <div class="repair-list">${items}</div>
        ${totalHtml}
        <div class="model-panel__cta">
          <a class="btn btn--primary" href="${whatsappLink(message)}" target="_blank" rel="noopener">${ctaLabel}</a>
        </div>`;

      panelEl.querySelectorAll("[data-toggle-options]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sid = btn.dataset.toggleOptions;
          if (openOptionServices.has(sid)) {
            openOptionServices.delete(sid);
          } else {
            openOptionServices.add(sid);
          }
          render();
        });
      });
      panelEl.querySelectorAll("[data-select-service]").forEach((btn) => {
        btn.addEventListener("click", () => {
          toggleSelection(btn.dataset.selectService, btn.dataset.selectOption || null);
          render();
        });
      });
    }
  }

  render();
}

/* -------------------- Buscador guiado (home) -------------------- */

/**
 * Wizard para gente que no quiere navegar por menús ni saber de técnica:
 * elegí tu producto → elegí tu modelo (con ayuda para identificarlo) →
 * [si el producto tiene catálogo] elegí qué se rompió → [en iPhone, para
 * pantalla/batería/tapa trasera] elegí el tipo de repuesto → contanos el
 * síntoma → resultado con un mensaje de WhatsApp ya armado, como
 * pre-diagnóstico para el taller.
 *
 * iPad y Mac todavía no tienen catálogo de reparaciones: para esas categorías
 * el wizard va directo de "modelo" a "resultado" con un cartel de cotización.
 */
function initFinder() {
  const root = document.getElementById("finder");
  if (!root) return;

  const state = {
    step: "category",
    category: null,
    model: null,
    serviceId: null,
    optionId: null,
    symptom: null,
    repairs: [], // reparaciones ya confirmadas para este mismo equipo: { serviceId, optionId, symptom }
    openGroupIndex: 0,
  };

  /** true si el servicio activo es "vidrio trasero" en iPhone: sus "opciones" son colores, no tecnologías. */
  function isColorService(category, serviceId) {
    return category === "iphone" && serviceId === "tapa-trasera";
  }

  /** Opciones a mostrar en el paso "option": colores (vidrio trasero) o tecnologías de repuesto (pantalla). */
  function getStepOptions(category, model, serviceId) {
    if (isColorService(category, serviceId)) {
      return getBackGlassColors(model).map((c) => ({ id: c, name: c }));
    }
    return getAvailableOptions(category, model, serviceId);
  }

  /** Info para mostrar una reparación ya agregada al carrito (ícono, nombre, precio). */
  function repairLineInfo(repair) {
    const service = SERVICES.find((s) => s.id === repair.serviceId);
    if (isColorService(state.category, repair.serviceId) && repair.optionId) {
      const label = `${service.label} (${repair.optionId})`;
      const priceAmount = getPrice(state.category, state.model, repair.serviceId);
      return { icon: service.icon, label, priceAmount };
    }
    const option = repair.optionId ? (IPHONE_REPAIR_OPTIONS[repair.serviceId] || []).find((o) => o.id === repair.optionId) : null;
    const label = option ? option.name : service.label;
    const priceAmount = option
      ? getOptionPrice(state.category, state.model, repair.serviceId, option.id)
      : getPrice(state.category, state.model, repair.serviceId);
    return { icon: service.icon, label, priceAmount };
  }

  // Orden de pasos según lo que ya se sabe del estado actual (se recalcula en cada render,
  // así que se va ajustando a medida que el usuario elige categoría/servicio).
  function getSteps() {
    const steps = ["category", "model"];
    if (!state.category || SIMPLE_QUOTE_CATEGORIES.includes(state.category)) return steps;
    steps.push("service");
    if (state.serviceId && getStepOptions(state.category, state.model, state.serviceId).length > 0) {
      steps.push("option");
    }
    steps.push("symptom");
    return steps;
  }

  function goBack() {
    const steps = getSteps();
    const idx = steps.indexOf(state.step);
    if (idx > 0) {
      state.step = steps[idx - 1];
      render();
    }
  }

  function reset() {
    state.step = "category";
    state.category = null;
    state.model = null;
    state.serviceId = null;
    state.optionId = null;
    state.symptom = null;
    state.repairs = [];
    state.openGroupIndex = 0;
    render();
  }

  function backButton() {
    return `<button class="finder__back" id="finder-back">‹ Volver</button>`;
  }

  // El indicador siempre muestra 3 pasos fijos (Producto → Modelo → Reparación),
  // sin importar cuántas pantallas internas tenga el paso 3 (qué se rompió, tipo
  // de repuesto, síntoma son todas parte de "Reparación", no pasos nuevos).
  function progressPhase(step) {
    if (step === "category") return 0;
    if (step === "model") return 1;
    if (["service", "option", "symptom"].includes(step)) return 2;
    return -1; // "cart" y "result" quedan fuera del indicador, como antes
  }

  function render() {
    const progressEl = document.getElementById("finder-progress");
    const bodyEl = document.getElementById("finder-body");
    const currentIdx = progressPhase(state.step);
    const total = 3;

    if (currentIdx === -1) {
      progressEl.innerHTML = "";
    } else {
      const dots = [];
      for (let i = 0; i < total; i++) {
        dots.push(`<span class="finder__step-dot${currentIdx >= i ? " is-done" : ""}">${i + 1}</span>`);
        if (i < total - 1) dots.push(`<span class="finder__step-line${currentIdx >= i + 1 ? " is-done" : ""}"></span>`);
      }
      progressEl.innerHTML = `<div class="finder__steps">${dots.join("")}</div>`;
    }

    if (state.step === "category") {
      bodyEl.innerHTML = `
        <h3 class="finder__title">¿Qué producto tenés?</h3>
        <div class="finder__grid">
          ${Object.keys(CATEGORY_META)
            .map((key) => {
              const m = CATEGORY_META[key];
              return `<button class="finder__option" data-category="${key}">
                <span class="finder__option-icon">${m.icon}</span>
                <span>${m.label}</span>
              </button>`;
            })
            .join("")}
        </div>`;
      bodyEl.querySelectorAll("[data-category]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.category = btn.dataset.category;
          state.step = "model";
          state.openGroupIndex = 0;
          render();
        });
      });
      return;
    }

    if (state.step === "model") {
      const meta = CATEGORY_META[state.category];
      const help = MODEL_HELP[state.category] || "";
      bodyEl.innerHTML = `
        ${backButton()}
        <h3 class="finder__title">¿Qué modelo de ${meta.label} es?</h3>
        <button class="finder__help-toggle" id="finder-help-toggle" type="button">¿No sabés cuál es tu modelo? Tocá acá ›</button>
        <div class="finder__help" id="finder-help" hidden>${help}</div>
        <div class="finder__model-groups">${renderModelGroups(state.category, state.model, state.openGroupIndex)}</div>`;
      document.getElementById("finder-back").addEventListener("click", goBack);
      document.getElementById("finder-help-toggle").addEventListener("click", (e) => {
        const helpEl = document.getElementById("finder-help");
        helpEl.hidden = !helpEl.hidden;
        e.currentTarget.textContent = helpEl.hidden ? "¿No sabés cuál es tu modelo? Tocá acá ›" : "Ocultar ayuda ‹";
      });
      bodyEl.querySelectorAll("[data-group-index]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.groupIndex);
          state.openGroupIndex = state.openGroupIndex === idx ? -1 : idx;
          render();
        });
      });
      bodyEl.querySelectorAll("[data-model]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.model = btn.dataset.model;
          state.step = SIMPLE_QUOTE_CATEGORIES.includes(state.category) ? "result" : "service";
          render();
        });
      });
      return;
    }

    if (state.step === "service") {
      const meta = CATEGORY_META[state.category];
      const serviceIds = SERVICES_BY_CATEGORY[state.category] || [];
      const addedIds = state.repairs.map((r) => r.serviceId);
      const services = SERVICES.filter((s) => serviceIds.includes(s.id) && !addedIds.includes(s.id));
      const hasCart = state.repairs.length > 0;
      bodyEl.innerHTML = `
        ${backButton()}
        <h3 class="finder__title">${hasCart ? "¿Algo más se rompió?" : `¿Qué se le rompió a tu ${meta.label}?`}</h3>
        <p class="finder__subtitle">${escapeHtml(state.model)}</p>
        ${
          services.length > 0
            ? `<div class="finder__grid">
                ${services
                  .map(
                    (s) => `<button class="finder__option" data-service="${s.id}">
                      <span class="finder__option-icon">${s.icon}</span>
                      <span>${s.label}</span>
                    </button>`
                  )
                  .join("")}
              </div>`
            : `<p class="finder__subtitle">Ya agregaste todas las reparaciones disponibles para este equipo.</p>`
        }
        ${hasCart ? `<div class="btn-row" style="margin-top:20px"><button class="btn btn--ghost" id="finder-go-cart">Ver lo que ya agregué</button></div>` : ""}`;
      document.getElementById("finder-back").addEventListener("click", () => {
        if (hasCart) {
          state.step = "cart";
          render();
        } else {
          goBack();
        }
      });
      const goCartBtn = document.getElementById("finder-go-cart");
      if (goCartBtn) goCartBtn.addEventListener("click", () => { state.step = "cart"; render(); });
      bodyEl.querySelectorAll("[data-service]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.serviceId = btn.dataset.service;
          const nextSteps = getSteps();
          state.step = nextSteps[nextSteps.indexOf("service") + 1];
          render();
        });
      });
      return;
    }

    if (state.step === "option") {
      const service = SERVICES.find((s) => s.id === state.serviceId);
      const isColor = isColorService(state.category, state.serviceId);
      const options = getStepOptions(state.category, state.model, state.serviceId);
      const titleText = isColor ? "¿De qué color es tu iPhone?" : `¿Qué tipo de ${service.label.toLowerCase()} querés?`;
      const subtitleText = isColor ? "Así sabemos qué vidrio trasero pedir." : "Estas son las opciones disponibles, con lo bueno y lo malo de cada una.";
      bodyEl.innerHTML = `
        ${backButton()}
        <h3 class="finder__title">${titleText}</h3>
        <p class="finder__subtitle">${subtitleText}</p>
        <div class="finder__options-list">
          ${options
            .map(
              (opt) => `
              <button class="finder__option-card" data-option="${escapeHtml(opt.id)}">
                ${renderOptionCard(opt, isColor ? getPrice(state.category, state.model, state.serviceId) : getOptionPrice(state.category, state.model, state.serviceId, opt.id))}
                <span class="finder__option-card-cta">Elegir esta opción</span>
              </button>`
            )
            .join("")}
        </div>`;
      document.getElementById("finder-back").addEventListener("click", goBack);
      bodyEl.querySelectorAll("[data-option]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.optionId = btn.dataset.option;
          state.step = "symptom";
          render();
        });
      });
      return;
    }

    if (state.step === "symptom") {
      const service = SERVICES.find((s) => s.id === state.serviceId);
      const symptoms = SYMPTOMS_BY_SERVICE[state.serviceId] || [];
      bodyEl.innerHTML = `
        ${backButton()}
        <h3 class="finder__title">Contanos un poco más</h3>
        <p class="finder__subtitle">${service.label} — ¿qué notás exactamente?</p>
        <div class="finder__grid finder__grid--models">
          ${symptoms.map((sym) => `<button class="finder__option finder__option--compact" data-symptom="${escapeHtml(sym)}">${escapeHtml(sym)}</button>`).join("")}
        </div>`;
      document.getElementById("finder-back").addEventListener("click", goBack);
      bodyEl.querySelectorAll("[data-symptom]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.repairs.push({ serviceId: state.serviceId, optionId: state.optionId, symptom: btn.dataset.symptom });
          state.serviceId = null;
          state.optionId = null;
          state.symptom = null;
          state.step = "cart";
          render();
        });
      });
      return;
    }

    if (state.step === "cart") {
      const meta = CATEGORY_META[state.category];
      const items = state.repairs
        .map((r, i) => {
          const info = repairLineInfo(r);
          const price = formatPrice(info.priceAmount);
          return `
            <div class="cart-item">
              <span class="cart-item__icon">${info.icon}</span>
              <div class="cart-item__body">
                <h4>${info.label}</h4>
                <p>"${escapeHtml(r.symptom)}"</p>
              </div>
              <span class="cart-item__price${price ? "" : " is-empty"}">${price ? price : "Consultar"}</span>
              <button class="cart-item__remove" data-remove-index="${i}" aria-label="Quitar">✕</button>
            </div>`;
        })
        .join("");
      bodyEl.innerHTML = `
        <h3 class="finder__title">Reparaciones agregadas</h3>
        <p class="finder__subtitle">${meta.label} — ${escapeHtml(state.model)}</p>
        <div class="cart-list">${items}</div>
        <div class="btn-row" style="margin-top:20px">
          <button class="btn btn--primary" id="finder-add-more">Agregar otra reparación</button>
          <button class="btn btn--ghost" id="finder-go-result">Listo, ver resumen</button>
        </div>`;
      document.getElementById("finder-add-more").addEventListener("click", () => {
        state.step = "service";
        render();
      });
      document.getElementById("finder-go-result").addEventListener("click", () => {
        state.step = "result";
        render();
      });
      bodyEl.querySelectorAll("[data-remove-index]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.repairs.splice(Number(btn.dataset.removeIndex), 1);
          if (state.repairs.length === 0) {
            state.step = "service";
          }
          render();
        });
      });
      return;
    }

    // Paso final: resultado
    const deviceLabel = formatDeviceLabel(state.category, state.model);

    if (SIMPLE_QUOTE_CATEGORIES.includes(state.category)) {
      const meta = CATEGORY_META[state.category];
      const message = `Hola! Tengo un/a ${deviceLabel} y quiero cotizar una reparación.`;
      bodyEl.innerHTML = `
        <div class="finder__result">
          <div class="finder__result-icon">${meta.icon}</div>
          <h3 class="finder__title">¡Listo!</h3>
          <p class="finder__result-summary"><strong>${escapeHtml(deviceLabel)}</strong></p>
          <p class="finder__result-note">Todavía estamos sumando el detalle de reparaciones para ${meta.label}. Contanos qué le pasa y te cotizamos por WhatsApp a la brevedad.</p>
          <div class="btn-row">
            <a class="btn btn--primary" href="${whatsappLink(message)}" target="_blank" rel="noopener">Cotizar por WhatsApp</a>
            <button class="btn btn--ghost" id="finder-restart">Hacer otra consulta</button>
          </div>
        </div>`;
      document.getElementById("finder-restart").addEventListener("click", reset);
      return;
    }

    const lines = state.repairs.map((r, i) => ({ ...repairLineInfo(r), symptom: r.symptom, n: i + 1 }));
    const allPriced = lines.every((l) => l.priceAmount != null);
    const totalAmount = lines.reduce((sum, l) => sum + (l.priceAmount || 0), 0);

    const itemsHtml = lines
      .map((l) => {
        const price = formatPrice(l.priceAmount);
        return `
          <div class="finder__result-item">
            <span class="finder__result-item__icon">${l.icon}</span>
            <div class="finder__result-item__body">
              <h4>${l.label}</h4>
              <p>"${escapeHtml(l.symptom)}"</p>
            </div>
            <span class="finder__result-item__price${price ? "" : " is-empty"}">${price ? price : "Consultar"}</span>
          </div>`;
      })
      .join("");

    const messageLines = lines.map((l) => `${l.n}) ${l.label} — ${l.symptom}`).join("\n");
    const message = `Hola! Tengo un/a ${deviceLabel} y necesito estas reparaciones:\n${messageLines}\n¿Me pasás precio${lines.length > 1 ? "s" : ""} y tiempo de espera?`;

    bodyEl.innerHTML = `
      <div class="finder__result">
        <h3 class="finder__title">¡Listo!</h3>
        <p class="finder__result-summary"><strong>${escapeHtml(deviceLabel)}</strong></p>
        <div class="finder__result-items">${itemsHtml}</div>
        <div class="finder__result-price${allPriced ? "" : " is-empty"}">${allPriced ? `Total: ${formatPrice(totalAmount)}` : "Consultar precio total"}</div>
        <p class="finder__result-note">Escribinos por WhatsApp con estos datos y te confirmamos precio y tiempo de espera.</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="${whatsappLink(message)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
          <button class="btn btn--ghost" id="finder-restart">Hacer otra consulta</button>
        </div>
      </div>`;
    document.getElementById("finder-restart").addEventListener("click", reset);
  }

  render();
}

/**
 * Escapa texto para insertarlo tanto en contenido HTML como dentro de atributos
 * delimitados por comillas dobles (ej. data-model="${escapeHtml(m)}"). El truco
 * textContent→innerHTML solo no alcanza: no escapa comillas, así que un modelo
 * con " en el nombre (ej. `iPad Pro 13" (M4)`) cortaba el atributo a la mitad.
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
