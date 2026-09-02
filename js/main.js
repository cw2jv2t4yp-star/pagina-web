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
 * con sus 5 variantes adentro), en vez de una lista plana larga. Cada grupo
 * es un acordeón: se abre el grupo al que pertenece el modelo activo.
 * El llamador es responsable de conectar los listeners de [data-group-index]
 * y [data-model] sobre el contenedor donde se inyecta este HTML.
 */
function renderModelGroups(category, activeModel, openIndex) {
  const groups = MODEL_GROUPS[category] || [];
  const groupsHtml = groups
    .map((g, i) => {
      const isOpen = i === openIndex;
      const hasActive = g.models.includes(activeModel);
      return `
        <div class="model-group">
          <button class="model-group__header${hasActive ? " has-active" : ""}" data-group-index="${i}">
            <span class="model-group__label">${escapeHtml(g.label)}</span>
            <span class="model-group__count">${g.models.length} modelo${g.models.length === 1 ? "" : "s"}</span>
            <span class="model-group__arrow${isOpen ? " is-open" : ""}">▾</span>
          </button>
          <div class="model-group__models" ${isOpen ? "" : "hidden"}>
            ${g.models.map((m) => `<button class="model-tab${m === activeModel ? " is-active" : ""}" data-model="${escapeHtml(m)}">${escapeHtml(m)}</button>`).join("")}
          </div>
        </div>`;
    })
    .join("");
  const otherActive = activeModel === OTHER_MODEL_LABEL;
  return `<div class="model-groups">${groupsHtml}</div>
    <button class="model-tab model-tab--other${otherActive ? " is-active" : ""}" data-model="${OTHER_MODEL_LABEL}">${OTHER_MODEL_LABEL}</button>`;
}

/** Índice del grupo al que pertenece un modelo (-1 si es "otro modelo" o no se encuentra). */
function findGroupIndex(category, model) {
  const groups = MODEL_GROUPS[category] || [];
  return groups.findIndex((g) => g.models.includes(model));
}

function renderOptionCard(opt) {
  const pros = opt.pros.map((p) => `<li>${escapeHtml(p)}</li>`).join("");
  const cons = opt.cons.map((c) => `<li>${escapeHtml(c)}</li>`).join("");
  return `
    <div class="option-card">
      <h5>${escapeHtml(opt.name)}</h5>
      <p class="option-card__tech">${escapeHtml(opt.tech)}</p>
      ${pros ? `<p class="option-card__label option-card__label--pro">Puntos a favor</p><ul class="option-card__list">${pros}</ul>` : ""}
      ${cons ? `<p class="option-card__label option-card__label--con">Puntos en contra</p><ul class="option-card__list">${cons}</ul>` : ""}
      <div class="option-card__meta">
        <span>Precio: ${opt.price ? opt.price : "Consultar"}</span>
        <span>Tiempo: ${opt.eta ? opt.eta : "A confirmar"}</span>
      </div>
    </div>`;
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
          const options = categoryKey === "iphone" ? IPHONE_REPAIR_OPTIONS[s.id] : null;
          if (options) {
            const cards = options.map(renderOptionCard).join("");
            return `
              <div class="repair-item repair-item--expandable">
                <div class="repair-item__icon">${s.icon}</div>
                <div class="repair-item__body">
                  <button class="repair-item__toggle" data-toggle-options="${s.id}">
                    <h4>${s.label}</h4>
                    <span class="repair-item__toggle-arrow">▾</span>
                  </button>
                  <p>${s.desc}</p>
                  <div class="repair-options" id="options-${s.id}" hidden>${cards}</div>
                </div>
              </div>`;
          }
          const price = getPrice(categoryKey, activeModel, s.id);
          return `
            <div class="repair-item">
              <div class="repair-item__icon">${s.icon}</div>
              <div class="repair-item__body">
                <h4>${s.label}</h4>
                <p>${s.desc}</p>
                <div class="repair-item__price${price ? "" : " is-empty"}">${price ? price : "Consultar"}</div>
              </div>
            </div>`;
        })
        .join("");

      panelEl.innerHTML = `
        <div class="model-panel__title">${escapeHtml(activeModel)}</div>
        <p class="model-panel__subtitle">Servicios de reparación disponibles para este modelo</p>
        <div class="repair-list">${items}</div>
        <div class="model-panel__cta">
          <a class="btn btn--primary" href="${whatsappLink(
            `Hola! Quiero consultar por una reparación para ${activeModel}.`
          )}" target="_blank" rel="noopener">Solicitar cotización por WhatsApp</a>
        </div>`;

      panelEl.querySelectorAll("[data-toggle-options]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const optionsEl = document.getElementById(`options-${btn.dataset.toggleOptions}`);
          optionsEl.hidden = !optionsEl.hidden;
          btn.classList.toggle("is-open", !optionsEl.hidden);
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

  const state = { step: "category", category: null, model: null, serviceId: null, optionId: null, symptom: null, openGroupIndex: 0 };

  // Orden de pasos según lo que ya se sabe del estado actual (se recalcula en cada render,
  // así que se va ajustando a medida que el usuario elige categoría/servicio).
  function getSteps() {
    const steps = ["category", "model"];
    if (!state.category || SIMPLE_QUOTE_CATEGORIES.includes(state.category)) return steps;
    steps.push("service");
    if (state.category === "iphone" && state.serviceId && IPHONE_REPAIR_OPTIONS[state.serviceId]) {
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
    state.openGroupIndex = 0;
    render();
  }

  function backButton() {
    return `<button class="finder__back" id="finder-back">‹ Volver</button>`;
  }

  function render() {
    const progressEl = document.getElementById("finder-progress");
    const bodyEl = document.getElementById("finder-body");
    const steps = getSteps();
    const currentIdx = steps.indexOf(state.step);
    const total = steps.length;

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
      const services = SERVICES.filter((s) => serviceIds.includes(s.id));
      bodyEl.innerHTML = `
        ${backButton()}
        <h3 class="finder__title">¿Qué se le rompió a tu ${meta.label}?</h3>
        <p class="finder__subtitle">${escapeHtml(state.model)}</p>
        <div class="finder__grid">
          ${services
            .map(
              (s) => `<button class="finder__option" data-service="${s.id}">
                <span class="finder__option-icon">${s.icon}</span>
                <span>${s.label}</span>
              </button>`
            )
            .join("")}
        </div>`;
      document.getElementById("finder-back").addEventListener("click", goBack);
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
      const options = IPHONE_REPAIR_OPTIONS[state.serviceId] || [];
      bodyEl.innerHTML = `
        ${backButton()}
        <h3 class="finder__title">¿Qué tipo de ${service.label.toLowerCase()} querés?</h3>
        <p class="finder__subtitle">Estas son las opciones disponibles, con lo bueno y lo malo de cada una.</p>
        <div class="finder__options-list">
          ${options
            .map(
              (opt) => `
              <button class="finder__option-card" data-option="${opt.id}">
                ${renderOptionCard(opt)}
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
          state.symptom = btn.dataset.symptom;
          state.step = "result";
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

    const service = SERVICES.find((s) => s.id === state.serviceId);
    const option = state.optionId ? (IPHONE_REPAIR_OPTIONS[state.serviceId] || []).find((o) => o.id === state.optionId) : null;
    const serviceLabel = option ? option.name : service.label;
    const price = option ? option.price : getPrice(state.category, state.model, state.serviceId);
    const message = `Hola! Tengo un/a ${deviceLabel}.\nProblema: ${serviceLabel} — ${state.symptom}.\n¿Me pasás precio y tiempo de espera?`;
    bodyEl.innerHTML = `
      <div class="finder__result">
        <div class="finder__result-icon">${service.icon}</div>
        <h3 class="finder__title">¡Listo!</h3>
        <p class="finder__result-summary"><strong>${escapeHtml(deviceLabel)}</strong> — ${serviceLabel}</p>
        <p class="finder__result-symptom">"${escapeHtml(state.symptom)}"</p>
        <div class="finder__result-price${price ? "" : " is-empty"}">${price ? price : "Consultar precio"}</div>
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
