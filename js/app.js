/* Estado global de la aplicacion, todo vive en memoria del navegador */
const state = {
  user: null,
  view: "dashboard",
  quotes: JSON.parse(JSON.stringify(INITIAL_QUOTES)),
  activeId: null,
  pdfId: null,
  wizard: null,
  filters: { search: "", status: "", dept: "", vendor: "" },
  changingStatus: false,
};

const WIZARD_STEPS = ["Cliente", "Ubicacion", "Proyecto", "Fotos", "Partidas", "Ajustes", "Resumen"];

const STATUS_STYLE = {
  "Borrador": "st-borrador",
  "Pendiente": "st-pendiente",
  "Aprobada": "st-aprobada",
  "Programada": "st-programada",
  "Venta realizada": "st-venta",
  "Rechazada": "st-rechazada",
  "Cancelada": "st-cancelada",
};

/* Formatear numero como moneda en quetzales */
function fmtQ(n) {
  n = Number(n || 0);
  return "Q" + n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function uid(p) { return (p || "id") + Math.random().toString(36).slice(2, 9); }
function today() { return "2026-07-31"; }

/* Sumar todas las partidas y aplicar descuento y ajuste manual */
function calcTotals(q) {
  const subtotal = q.items.reduce((s, it) => s + it.qty * it.price, 0);
  const discountAmt = subtotal * ((q.discountPct || 0) / 100);
  const total = subtotal - discountAmt + Number(q.manualAdjustment || 0);
  return { subtotal, discountAmt, total };
}

function badge(status) {
  return `<span class="badge ${STATUS_STYLE[status] || "st-borrador"}">${status}</span>`;
}

/* Guardar un valor dentro de un objeto usando una ruta tipo "client.name" */
function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

function getPath(obj, path) {
  return path.split(".").reduce((c, k) => (c ? c[k] : undefined), obj);
}

/* LOGIN */

function login(email) {
  const isAdmin = email.toLowerCase().includes("admin");
  state.user = { name: isAdmin ? "Administrador Demo" : "Carlos Vendedor", role: isAdmin ? "Administrador" : "Vendedor", email };
  state.view = isAdmin ? "admin-dashboard" : "dashboard";
  render();
}

function logout() {
  state.user = null;
  state.view = "dashboard";
  render();
}

function doLogin() {
  const email = document.getElementById("login-email").value || "vendedor@demo.com";
  login(email);
}

function renderLogin() {
  return `
  <div class="login-wrap">
    <div class="login-hero">
      <div class="brand"><div class="brand-icon">GR</div><span>GRAMIVAL</span></div>
      <div class="login-hero-copy">
        <h1>Cotizaciones de gramilla sintetica, medidas con precision.</h1>
        <p>Registra el proyecto, calcula el precio y genera la cotizacion profesional en minutos.</p>
      </div>
      <div class="login-hero-footer">2026 Gramival S.A. - Sistema interno de cotizaciones</div>
    </div>
    <div class="login-form-side">
      <div class="login-card">
        <h2>Iniciar sesion</h2>
        <p class="muted">Ingresa con tu cuenta de vendedor o administrador.</p>
        <label class="field"><span>Correo</span><input id="login-email" type="text" placeholder="correo@demo.com" /></label>
        <label class="field"><span>Contrasena</span><input type="password" placeholder="********" /></label>
        <button class="btn btn-primary full" onclick="doLogin()">Iniciar sesion</button>
        <div class="demo-users">
          <div class="demo-users-title">Usuarios de demostracion</div>
          <button class="demo-user" onclick="login('admin@demo.com')">admin@demo.com <span>Administrador</span></button>
          <button class="demo-user" onclick="login('vendedor@demo.com')">vendedor@demo.com <span>Vendedor</span></button>
        </div>
      </div>
    </div>
  </div>`;
}

/* SHELL / NAVEGACION */

function goto(view) {
  if (view === "wizard") { startWizard(); return; }
  state.view = view;
  state.pdfId = null;
  render();
}

function navItems() {
  if (state.user.role === "Administrador") {
    return [
      ["admin-dashboard", "Dashboard"], ["history", "Cotizaciones"], ["admin-prices", "Precios"],
      ["admin-products", "Productos y servicios"], ["admin-freight", "Fletes"], ["admin-users", "Usuarios"],
    ];
  }
  return [["dashboard", "Inicio"], ["history", "Cotizaciones"], ["wizard", "Nueva"]];
}

function renderShell(innerHtml) {
  const items = navItems();
  const navLinks = items.map(([id, label]) => {
    const active = state.view === id || (id === "history" && state.view === "detail");
    return `<button class="nav-link ${active ? "active" : ""}" onclick="goto('${id}')">${label}</button>`;
  }).join("");

  const bottomTabs = state.user.role === "Vendedor" ? `
    <div class="bottom-tabs">
      ${[["dashboard", "Inicio"], ["history", "Cotizaciones"], ["wizard", "Nueva"]].map(([id, label]) => {
        const active = state.view === id || (id === "history" && state.view === "detail");
        return `<button class="bottom-tab ${active ? "active" : ""}" onclick="goto('${id}')">${label}</button>`;
      }).join("")}
    </div>` : "";

  return `
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar-brand"><div class="brand-icon">GR</div><span>GRAMIVAL</span></div>
      <nav class="sidebar-nav">${navLinks}</nav>
      <div class="sidebar-user">
        <div class="user-chip"><div class="user-avatar">${state.user.name.charAt(0)}</div><div><div class="user-name">${state.user.name}</div><div class="user-role">${state.user.role}</div></div></div>
        <button class="link-btn" onclick="logout()">Cerrar sesion</button>
      </div>
    </aside>
    <div class="main-col">
      <div class="topbar-mobile">
        <div class="brand"><div class="brand-icon small">GR</div><span>GRAMIVAL</span></div>
        <button class="menu-btn" onclick="toggleMobileNav()">&#9776;</button>
      </div>
      <div id="mobile-nav" class="mobile-nav hidden">${navLinks}<button class="nav-link" onclick="logout()">Cerrar sesion</button></div>
      <main class="main-content">${innerHtml}</main>
      ${bottomTabs}
    </div>
  </div>`;
}

function toggleMobileNav() {
  document.getElementById("mobile-nav").classList.toggle("hidden");
}

function pageHeader(title, subtitle, actionHtml) {
  return `<div class="page-header"><div><h1>${title}</h1>${subtitle ? `<p class="muted">${subtitle}</p>` : ""}</div>${actionHtml || ""}</div>`;
}

function statCard(label, value, tint) {
  return `<div class="stat-card"><div class="stat-icon" style="background:${tint || "#EAF3EE"}"></div><div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div></div>`;
}

/* DASHBOARD VENDEDOR */

function renderDashboard() {
  const qs = state.quotes;
  const total = qs.length;
  const pend = qs.filter(q => q.status === "Pendiente").length;
  const appr = qs.filter(q => q.status === "Aprobada" || q.status === "Programada").length;
  const sold = qs.filter(q => q.status === "Venta realizada").length;
  const rej = qs.filter(q => q.status === "Rechazada" || q.status === "Cancelada").length;
  const recent = [...qs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const rows = recent.map(q => {
    const t = calcTotals(q);
    return `<button class="quote-row" onclick="openDetail('${q.id}')">
      <div class="quote-row-main"><span class="mono strong">${q.code}</span><span class="muted">${q.client.name}</span><div class="quote-row-loc">${q.location.muni}, ${q.location.dept}</div></div>
      <div class="mono strong">${fmtQ(t.total)}</div>${badge(q.status)}
    </button>`;
  }).join("");

  return pageHeader(`Hola, ${state.user.name.split(" ")[0]}`, `Hoy es ${today()} - Resumen de tus cotizaciones`,
    `<button class="btn btn-amber" onclick="goto('wizard')">+ Nueva cotizacion</button>`) + `
    <div class="stat-grid">
      ${statCard("Total cotizaciones", total)}
      ${statCard("Pendientes", pend, "#FCE9D2")}
      ${statCard("Aprobadas", appr, "#DCEEE1")}
      ${statCard("Ventas realizadas", sold, "#DCE7F2")}
      ${statCard("Rechazadas / canc.", rej, "#F6DEDA")}
    </div>
    <div class="card">
      <div class="card-header">Cotizaciones recientes</div>
      <div class="quote-list">${rows}</div>
    </div>`;
}

/* ASISTENTE PARA CREAR COTIZACION */

function emptyDraft() {
  return {
    id: uid("q"), code: "COT-" + String(Math.floor(1000 + Math.random() * 8999)),
    vendor: state.user.name, date: today(),
    client: { name: "", contact: "" },
    location: { dept: "", muni: "", zone: "Urbana" },
    area: "", grassType: GRASS_TYPES[0].name, access: "", shape: "", baseExisting: "Si",
    conditions: "", observations: "", photos: [],
    items: [], discountPct: 0, manualAdjustment: 0, status: "Borrador", history: [],
  };
}

function startWizard() {
  state.wizard = { step: 0, draft: emptyDraft(), itemForm: null };
  state.view = "wizard";
  render();
}

function cancelWizard() {
  state.wizard = null;
  goto(state.user.role === "Administrador" ? "admin-dashboard" : "dashboard");
}

function wizardUpdate(path, value) {
  setPath(state.wizard.draft, path, value);
  render();
}

function wizardStepValid() {
  const d = state.wizard.draft;
  if (state.wizard.step === 0) return d.client.name && d.client.contact;
  if (state.wizard.step === 1) return d.location.dept && d.location.muni;
  if (state.wizard.step === 2) return d.area && d.grassType;
  return true;
}

function wizardNext() {
  if (!wizardStepValid()) return;
  state.wizard.step = Math.min(WIZARD_STEPS.length - 1, state.wizard.step + 1);
  render();
}

function wizardBack() {
  if (state.wizard.step === 0) { cancelWizard(); return; }
  state.wizard.step -= 1;
  render();
}

function wizardAddPhoto() {
  const d = state.wizard.draft;
  const pick = PHOTOS[d.photos.length % PHOTOS.length];
  d.photos.push(pick + "&sig=" + uid());
  render();
}

function wizardRemovePhoto(i) {
  state.wizard.draft.photos.splice(i, 1);
  render();
}

function wizardOpenItemForm() {
  state.wizard.itemForm = { name: "", qty: 1, unit: "m2", price: 0 };
  render();
}

function wizardCloseItemForm() {
  state.wizard.itemForm = null;
  render();
}

function wizardItemFormSet(field, value) {
  state.wizard.itemForm[field] = value;
  render();
}

function wizardItemFromCatalog(id) {
  const p = CATALOG.find(c => c.id === id);
  if (p) {
    state.wizard.itemForm.name = p.name;
    state.wizard.itemForm.unit = p.unit;
    state.wizard.itemForm.price = p.price;
    render();
  }
}

function wizardAddItem() {
  const f = state.wizard.itemForm;
  if (!f.name || !f.qty) return;
  state.wizard.draft.items.push({ id: uid("it"), name: f.name, qty: Number(f.qty), unit: f.unit, price: Number(f.price) });
  state.wizard.itemForm = null;
  render();
}

function wizardRemoveItem(id) {
  state.wizard.draft.items = state.wizard.draft.items.filter(i => i.id !== id);
  render();
}

function saveQuote() {
  const draft = state.wizard.draft;
  draft.status = "Pendiente";
  draft.history.push({ date: today(), to: "Pendiente", user: draft.vendor });
  state.quotes.unshift(draft);
  state.activeId = draft.id;
  state.wizard = null;
  state.view = "detail";
  render();
}

function renderRuler() {
  const step = state.wizard.step;
  const total = WIZARD_STEPS.length;
  const pct = ((step + 1) / total) * 100;
  const labels = WIZARD_STEPS.map((l, i) => `<span class="ruler-label ${i <= step ? "on" : ""}">${l}</span>`).join("");
  return `<div class="wizard-ruler">
    <div class="ruler-labels">${labels}</div>
    <div class="ruler-track"><div class="ruler-fill" style="width:${pct}%"></div></div>
    <div class="ruler-caption mono">PASO ${step + 1} / ${total} - ${WIZARD_STEPS[step]}</div>
  </div>`;
}

function renderWizardStep() {
  const d = state.wizard.draft;
  const step = state.wizard.step;

  if (step === 0) {
    return `<h3>Datos del cliente</h3>
      <label class="field"><span>Nombre del cliente</span><input value="${d.client.name}" oninput="wizardUpdate('client.name', this.value)" placeholder="Ej. Carlos Mendez" /></label>
      <label class="field"><span>Contacto (telefono o correo)</span><input value="${d.client.contact}" oninput="wizardUpdate('client.contact', this.value)" placeholder="Ej. 5555-5555" /></label>
      <p class="muted small">Los datos del cliente se guardan como parte de esta cotizacion, no se crea un registro de cliente aparte.</p>`;
  }

  if (step === 1) {
    const munis = DEPARTMENTS[d.location.dept] || [];
    const freight = FREIGHT.find(f => f.dept === d.location.dept && f.muni === d.location.muni && f.zone === d.location.zone);
    return `<h3>Ubicacion</h3>
      <div class="grid-2">
        <label class="field"><span>Departamento</span>
          <select onchange="wizardUpdate('location.dept', this.value); wizardUpdate('location.muni', '')">
            <option value="">Selecciona</option>
            ${Object.keys(DEPARTMENTS).map(dep => `<option value="${dep}" ${d.location.dept === dep ? "selected" : ""}>${dep}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>Municipio</span>
          <select onchange="wizardUpdate('location.muni', this.value)">
            <option value="">Selecciona</option>
            ${munis.map(m => `<option value="${m}" ${d.location.muni === m ? "selected" : ""}>${m}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="field"><span class="field-label">Zona</span>
        <div class="toggle-row">
          <button class="toggle-btn ${d.location.zone === "Urbana" ? "on" : ""}" onclick="wizardUpdate('location.zone','Urbana')">Urbana</button>
          <button class="toggle-btn ${d.location.zone === "Rural" ? "on" : ""}" onclick="wizardUpdate('location.zone','Rural')">Rural</button>
        </div>
      </div>
      ${d.location.muni ? `<div class="freight-box">
        <div><div class="freight-title">Flete estimado</div><div class="muted small">Precio calculado segun tarifas configuradas</div></div>
        <div class="mono strong big">${freight ? fmtQ(freight.price) : "-"}</div>
      </div>` : ""}`;
  }

  if (step === 2) {
    return `<h3>Informacion del proyecto</h3>
      <div class="grid-2">
        <label class="field"><span>Metros cuadrados (m2)</span><input type="number" value="${d.area}" oninput="wizardUpdate('area', this.value)" placeholder="500" /></label>
        <label class="field"><span>Tipo de gramilla</span>
          <select onchange="wizardUpdate('grassType', this.value)">
            ${GRASS_TYPES.map(g => `<option value="${g.name}" ${d.grassType === g.name ? "selected" : ""}>${g.name} - ${fmtQ(g.price)}/${g.unit}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>Tipo de acceso</span>
          <select onchange="wizardUpdate('access', this.value)">
            <option value="">Selecciona</option>
            ${["Acceso vehicular directo", "Acceso vehicular limitado", "Acceso restringido", "Acceso peatonal"].map(a => `<option ${d.access === a ? "selected" : ""}>${a}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>Forma del terreno</span>
          <select onchange="wizardUpdate('shape', this.value)">
            <option value="">Selecciona</option>
            <option ${d.shape === "Regular" ? "selected" : ""}>Regular</option>
            <option ${d.shape === "Irregular" ? "selected" : ""}>Irregular</option>
          </select>
        </label>
        <label class="field"><span>Base existente</span>
          <select onchange="wizardUpdate('baseExisting', this.value)">
            <option ${d.baseExisting === "Si" ? "selected" : ""}>Si</option>
            <option ${d.baseExisting === "No" ? "selected" : ""}>No</option>
          </select>
        </label>
      </div>`;
  }

  if (step === 3) {
    const photoThumbs = d.photos.map((p, i) => `<div class="photo-thumb"><img src="${p}" /><button onclick="wizardRemovePhoto(${i})">x</button></div>`).join("");
    return `<h3>Condiciones y fotografias</h3>
      <label class="field"><span>Condiciones del terreno</span><textarea rows="3" oninput="wizardUpdate('conditions', this.value)" placeholder="El terreno presenta una superficie relativamente nivelada...">${d.conditions}</textarea></label>
      <label class="field"><span>Observaciones</span><textarea rows="2" oninput="wizardUpdate('observations', this.value)" placeholder="Notas adicionales para esta cotizacion">${d.observations}</textarea></label>
      <span class="field-label">Fotografias</span>
      <div class="photo-grid">${photoThumbs}<button class="photo-add" onclick="wizardAddPhoto()">+ Agregar</button></div>`;
  }

  if (step === 4) {
    const totals = calcTotals(d);
    const rows = d.items.map(it => `<tr>
        <td>${it.name}</td><td class="right mono">${it.qty}</td><td>${it.unit}</td>
        <td class="right mono">${fmtQ(it.price)}</td><td class="right mono strong">${fmtQ(it.qty * it.price)}</td>
        <td class="right"><button class="icon-btn" onclick="wizardRemoveItem('${it.id}')">x</button></td>
      </tr>`).join("");

    let itemFormHtml = "";
    if (state.wizard.itemForm) {
      const f = state.wizard.itemForm;
      itemFormHtml = `<div class="item-form">
        <div class="item-form-title">Agregar partida</div>
        <label class="field"><span>Desde el catalogo</span>
          <select onchange="wizardItemFromCatalog(this.value)">
            <option value="">Selecciona un producto o servicio...</option>
            ${CATALOG.filter(c => c.active).map(c => `<option value="${c.id}">${c.name} - ${fmtQ(c.price)}/${c.unit}</option>`).join("")}
          </select>
        </label>
        <div class="grid-2">
          <label class="field"><span>Nombre</span><input value="${f.name}" oninput="wizardItemFormSet('name', this.value)" /></label>
          <label class="field"><span>Unidad</span>
            <select onchange="wizardItemFormSet('unit', this.value)">
              ${["m2", "ML", "m3", "Unidad", "Otros"].map(u => `<option ${f.unit === u ? "selected" : ""}>${u}</option>`).join("")}
            </select>
          </label>
          <label class="field"><span>Cantidad</span><input type="number" value="${f.qty}" oninput="wizardItemFormSet('qty', this.value)" /></label>
          <label class="field"><span>Precio unitario</span><input type="number" value="${f.price}" oninput="wizardItemFormSet('price', this.value)" /></label>
        </div>
        <div class="small muted" style="margin-bottom:10px">Total de linea: <span class="mono strong">${fmtQ((f.qty || 0) * (f.price || 0))}</span></div>
        <div class="btn-row"><button class="btn btn-primary" onclick="wizardAddItem()">Agregar</button><button class="btn btn-ghost" onclick="wizardCloseItemForm()">Cancelar</button></div>
      </div>`;
    }

    return `<div class="flex-between"><h3>Partidas de cotizacion</h3><button class="btn btn-ghost" onclick="wizardOpenItemForm()">+ Agregar partida</button></div>
      ${d.items.length === 0 ? `<div class="empty-box">Aun no hay partidas. Agrega la primera.</div>` : `
      <div class="table-wrap"><table><thead><tr><th>Descripcion</th><th class="right">Cant.</th><th>Unidad</th><th class="right">P. unit.</th><th class="right">Total</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="right subtotal-line">Subtotal: <span class="mono strong big">${fmtQ(totals.subtotal)}</span></div>`}
      ${itemFormHtml}`;
  }

  if (step === 5) {
    const t = calcTotals(d);
    return `<h3>Descuento y ajuste</h3>
      <div class="adjust-box">
        <div class="row"><span class="muted">Subtotal</span><span class="mono">${fmtQ(t.subtotal)}</span></div>
        <div class="row"><span class="muted">Descuento (%)</span><input type="number" class="mini-input" value="${d.discountPct}" oninput="wizardUpdate('discountPct', Number(this.value))" /></div>
        <div class="row"><span class="muted">Descuento aplicado</span><span class="mono amber">-${fmtQ(t.discountAmt)}</span></div>
        <div class="row"><span class="muted">Ajuste manual (Q)</span><input type="number" class="mini-input" value="${d.manualAdjustment}" oninput="wizardUpdate('manualAdjustment', Number(this.value))" /></div>
        <div class="row total-row"><span>Total</span><span class="mono big">${fmtQ(t.total)}</span></div>
      </div>`;
  }

  if (step === 6) {
    return renderQuoteSummary(d);
  }
  return "";
}

function renderQuoteSummary(q) {
  const t = calcTotals(q);
  const freight = FREIGHT.find(f => f.dept === q.location.dept && f.muni === q.location.muni && f.zone === q.location.zone);
  const itemRows = q.items.map(it => `<tr><td>${it.name}</td><td class="right mono">${it.qty} ${it.unit}</td><td class="right mono">${fmtQ(it.price)}</td><td class="right mono">${fmtQ(it.qty * it.price)}</td></tr>`).join("");
  const photoThumbs = (q.photos || []).slice(0, 4).map(p => `<img class="mini-photo" src="${p}" />`).join("");
  return `<h3>Resumen de la cotizacion</h3>
    <div class="grid-2">
      <div><div class="field-label">Cliente</div><div>${q.client.name || "-"}</div><div class="muted small">${q.client.contact || ""}</div></div>
      <div><div class="field-label">Ubicacion</div><div>${q.location.muni}, ${q.location.dept}</div><div class="muted small">Zona ${q.location.zone}${freight ? " - Flete " + fmtQ(freight.price) : ""}</div></div>
      <div><div class="field-label">Proyecto</div><div class="muted small">${q.area} m2 - ${q.grassType}</div><div class="muted small">Acceso: ${q.access || "-"} - Forma: ${q.shape || "-"} - Base: ${q.baseExisting}</div></div>
      <div><div class="field-label">Fotografias</div><div class="photo-row">${photoThumbs || '<span class="muted small">Sin fotografias</span>'}</div></div>
    </div>
    ${q.conditions ? `<div class="field-label">Condiciones del terreno</div><p class="muted small">${q.conditions}</p>` : ""}
    <div class="table-wrap"><table><thead><tr><th>Partida</th><th class="right">Cant.</th><th class="right">P.U.</th><th class="right">Total</th></tr></thead><tbody>${itemRows}</tbody></table></div>
    <div class="adjust-box" style="margin-top:12px">
      <div class="row"><span class="muted">Subtotal</span><span class="mono">${fmtQ(t.subtotal)}</span></div>
      <div class="row"><span class="muted">Descuento (${q.discountPct}%)</span><span class="mono">-${fmtQ(t.discountAmt)}</span></div>
      <div class="row"><span class="muted">Ajuste manual</span><span class="mono">${fmtQ(q.manualAdjustment)}</span></div>
      <div class="row total-row"><span>Total final</span><span class="mono big">${fmtQ(t.total)}</span></div>
    </div>`;
}

function renderWizard() {
  const step = state.wizard.step;
  const isLast = step === WIZARD_STEPS.length - 1;
  const nextDisabled = !wizardStepValid();
  return pageHeader("Nueva cotizacion", `Codigo provisional ${state.wizard.draft.code}`, `<button class="link-btn" onclick="cancelWizard()">Cancelar</button>`) + `
    <div class="wizard-wrap">
      ${renderRuler()}
      <div class="card pad">${renderWizardStep()}</div>
      <div class="flex-between" style="margin-top:16px">
        <button class="btn btn-ghost" onclick="wizardBack()">&larr; ${step === 0 ? "Cancelar" : "Atras"}</button>
        ${isLast ? `<button class="btn btn-amber" onclick="saveQuote()">Guardar cotizacion</button>`
          : `<button class="btn btn-primary" ${nextDisabled ? "disabled" : ""} onclick="wizardNext()">Siguiente &rarr;</button>`}
      </div>
    </div>`;
}

/* HISTORIAL */

function openDetail(id) {
  state.activeId = id;
  state.changingStatus = false;
  state.view = "detail";
  render();
}

function setFilter(field, value) {
  state.filters[field] = value;
  render();
}

function renderHistory() {
  const f = state.filters;
  const isAdmin = state.user.role === "Administrador";
  const filtered = state.quotes.filter(q =>
    (!f.search || q.client.name.toLowerCase().includes(f.search.toLowerCase()) || q.code.toLowerCase().includes(f.search.toLowerCase())) &&
    (!f.status || q.status === f.status) &&
    (!f.dept || q.location.dept === f.dept) &&
    (!f.vendor || q.vendor === f.vendor)
  ).sort((a, b) => b.date.localeCompare(a.date));

  const rows = filtered.map(q => {
    const t = calcTotals(q);
    return `<tr onclick="openDetail('${q.id}')">
      <td class="mono strong">${q.code}</td><td>${q.client.name}</td>
      <td class="muted hide-sm">${q.location.muni}, ${q.location.dept}</td>
      <td class="muted hide-md">${q.date}</td>
      <td class="right mono">${fmtQ(t.total)}</td>
      <td class="muted hide-md">${q.vendor}</td>
      <td>${badge(q.status)}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="7" class="empty-cell">No se encontraron cotizaciones con esos filtros.</td></tr>`;

  const vendorFilter = isAdmin ? `<select onchange="setFilter('vendor', this.value)"><option value="">Todos los vendedores</option>${VENDORS.map(v => `<option ${f.vendor === v ? "selected" : ""}>${v}</option>`).join("")}</select>` : "";

  return pageHeader("Cotizaciones", `${filtered.length} de ${state.quotes.length} cotizaciones`) + `
    <div class="card pad filter-bar">
      <input id="search-input" class="search-input" placeholder="Buscar cliente o numero..." value="${f.search}" oninput="setFilter('search', this.value)" />
      <select onchange="setFilter('status', this.value)"><option value="">Todos los estados</option>${STATUSES.map(s => `<option ${f.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
      <select onchange="setFilter('dept', this.value)"><option value="">Todos los departamentos</option>${Object.keys(DEPARTMENTS).map(d => `<option ${f.dept === d ? "selected" : ""}>${d}</option>`).join("")}</select>
      ${vendorFilter}
    </div>
    <div class="card">
      <div class="table-wrap"><table><thead><tr><th>Numero</th><th>Cliente</th><th class="hide-sm">Ubicacion</th><th class="hide-md">Fecha</th><th class="right">Total</th><th class="hide-md">Vendedor</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
}

/* DETALLE DE COTIZACION */

function toggleChangeStatus() {
  state.changingStatus = !state.changingStatus;
  render();
}

function changeStatus(newStatus) {
  const q = state.quotes.find(x => x.id === state.activeId);
  q.status = newStatus;
  q.history.push({ date: today(), to: newStatus, user: state.user.name });
  state.changingStatus = false;
  render();
}

function viewPdf() {
  state.pdfId = state.activeId;
  render();
}

function closePdf() {
  state.pdfId = null;
  render();
}

function renderDetail() {
  const q = state.quotes.find(x => x.id === state.activeId);
  if (!q) return `<p>Cotizacion no encontrada.</p>`;
  const t = calcTotals(q);

  const statusButtons = state.changingStatus ? `<div class="card pad status-choices">
    ${STATUSES.map(s => `<button class="status-chip ${STATUS_STYLE[s]}" ${s === q.status ? "disabled" : ""} onclick="changeStatus('${s}')">${s}</button>`).join("")}
  </div>` : "";

  const itemRows = q.items.map(it => `<tr><td>${it.name}</td><td class="right mono">${it.qty} ${it.unit}</td><td class="right mono">${fmtQ(it.price)}</td><td class="right mono">${fmtQ(it.qty * it.price)}</td></tr>`).join("");
  const photoThumbs = (q.photos || []).map(p => `<img class="detail-photo" src="${p}" />`).join("");

  const historyRows = q.history.map(h => `<div class="history-item"><div class="history-dot"></div><div><div class="mono small muted">${h.date}</div><div class="strong">${h.to}</div><div class="small muted">por ${h.user}</div></div></div>`).join("");

  return `
    <div class="detail-top">
      <button class="link-btn" onclick="goto('history')">&larr; Volver a cotizaciones</button>
      <div class="flex-between wrap">
        <div><div class="flex-gap"><h1 class="mono">${q.code}</h1>${badge(q.status)}</div><p class="muted">${q.client.name} - ${q.date} - Vendedor: ${q.vendor}</p></div>
        <div class="btn-row">
          <button class="btn btn-ghost" onclick="viewPdf()">Ver PDF</button>
          <button class="btn btn-amber" onclick="toggleChangeStatus()">Cambiar estado</button>
        </div>
      </div>
      ${statusButtons}
    </div>
    <div class="detail-grid">
      <div class="detail-main">
        <div class="card pad">
          <h3>Datos del proyecto</h3>
          <div class="grid-2 small">
            <div><span class="muted">Contacto: </span>${q.client.contact}</div>
            <div><span class="muted">Ubicacion: </span>${q.location.muni}, ${q.location.dept} (${q.location.zone})</div>
            <div><span class="muted">Area: </span>${q.area} m2</div>
            <div><span class="muted">Gramilla: </span>${q.grassType}</div>
            <div><span class="muted">Acceso: </span>${q.access || "-"}</div>
            <div><span class="muted">Forma / Base: </span>${q.shape || "-"} / ${q.baseExisting}</div>
          </div>
          ${q.conditions ? `<p class="small"><span class="strong">Condiciones: </span>${q.conditions}</p>` : ""}
          ${q.observations ? `<p class="small"><span class="strong">Observaciones: </span>${q.observations}</p>` : ""}
          ${photoThumbs ? `<div class="photo-row">${photoThumbs}</div>` : ""}
        </div>
        <div class="card pad">
          <h3>Partidas</h3>
          <div class="table-wrap"><table><thead><tr><th>Descripcion</th><th class="right">Cant.</th><th class="right">P.U.</th><th class="right">Total</th></tr></thead><tbody>${itemRows}</tbody></table></div>
          <div class="right" style="margin-top:10px">
            <div class="mini-totals">
              <div class="row"><span class="muted">Subtotal</span><span class="mono">${fmtQ(t.subtotal)}</span></div>
              <div class="row"><span class="muted">Descuento</span><span class="mono">-${fmtQ(t.discountAmt)}</span></div>
              <div class="row total-row"><span>Total</span><span class="mono">${fmtQ(t.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card pad">
        <h3>Historial de estados</h3>
        <div class="history-list">${historyRows}</div>
      </div>
    </div>`;
}

/* PDF */

function renderPdf() {
  const q = state.quotes.find(x => x.id === state.pdfId);
  const t = calcTotals(q);
  const rows = q.items.map((it, i) => `<tr><td class="mono">${String(i + 1).padStart(2, "0")}</td><td>${it.name}</td><td class="right mono">${it.qty}</td><td>${it.unit}</td><td class="right mono">${fmtQ(it.price)}</td><td class="right mono">${fmtQ(it.qty * it.price)}</td></tr>`).join("");

  return `
    <div class="pdf-actions no-print">
      <button class="link-btn" onclick="closePdf()">&larr; Volver</button>
      <button class="btn btn-amber" onclick="window.print()">Descargar PDF</button>
    </div>
    <div class="pdf-page">
      <div class="pdf-header">
        <div class="pdf-brand"><div class="brand-icon">GR</div><div><div class="strong">GRAMIVAL S.A.</div><div class="small muted">Venta e instalacion de gramilla sintetica</div><div class="small muted">Guatemala, Guatemala - contacto@gramival.demo</div></div></div>
        <div class="right"><div class="mono strong big">${q.code}</div><div class="small muted">Fecha: ${q.date}</div>${badge(q.status)}</div>
      </div>
      <div class="grid-2 small" style="margin:20px 0">
        <div><div class="field-label">Cliente</div><div class="strong">${q.client.name}</div><div class="muted">${q.client.contact}</div></div>
        <div><div class="field-label">Ubicacion del proyecto</div><div class="strong">${q.location.muni}, ${q.location.dept}</div><div class="muted">Zona ${q.location.zone} - ${q.area} m2</div></div>
      </div>
      <div class="field-label">Detalle de partidas</div>
      <table class="pdf-table"><thead><tr><th>#</th><th>Descripcion</th><th class="right">Cant.</th><th>Unidad</th><th class="right">P. Unit.</th><th class="right">Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="right" style="margin:16px 0">
        <div class="mini-totals" style="max-width:260px;margin-left:auto">
          <div class="row"><span class="muted">Subtotal</span><span class="mono">${fmtQ(t.subtotal)}</span></div>
          <div class="row"><span class="muted">Descuento (${q.discountPct}%)</span><span class="mono">-${fmtQ(t.discountAmt)}</span></div>
          ${q.manualAdjustment ? `<div class="row"><span class="muted">Ajuste</span><span class="mono">${fmtQ(q.manualAdjustment)}</span></div>` : ""}
          <div class="row total-row"><span>Total</span><span class="mono">${fmtQ(t.total)}</span></div>
        </div>
      </div>
      <div class="grid-2 small">
        <div><div class="field-label">Condiciones de pago</div>30% al iniciar, 30% al entregar avance, 20% en pruebas, 20% al finalizar.</div>
        <div><div class="field-label">Observaciones</div>${q.observations || "Sin observaciones adicionales."}</div>
      </div>
      <div class="pdf-footer">Cotizacion generada por el sistema Gramival - Documento de demostracion, sin validez fiscal.</div>
    </div>`;
}

/* ADMINISTRACION */

function renderAdminDashboard() {
  const qs = state.quotes;
  const totalQuoted = qs.reduce((s, q) => s + calcTotals(q).total, 0);
  const sold = qs.filter(q => q.status === "Venta realizada").length;
  const pend = qs.filter(q => q.status === "Pendiente").length;
  const closeRate = qs.length ? Math.round((sold / qs.length) * 100) : 0;

  const byMonth = {};
  qs.forEach(q => {
    const m = q.date.slice(5, 7) === "06" ? "Junio" : q.date.slice(5, 7) === "05" ? "Mayo" : "Julio";
    byMonth[m] = (byMonth[m] || 0) + calcTotals(q).total;
  });
  const months = ["Mayo", "Junio", "Julio"];
  const maxVal = Math.max(...months.map(m => byMonth[m] || 0), 1);
  const bars = months.map(m => {
    const v = byMonth[m] || 0;
    const h = Math.round((v / maxVal) * 100);
    return `<div class="bar-col"><div class="bar" style="height:${h}%"></div><div class="bar-val small mono">${fmtQ(v)}</div><div class="bar-label small muted">${m}</div></div>`;
  }).join("");

  return pageHeader("Dashboard administrativo", "Vista general del negocio") + `
    <div class="stat-grid">
      ${statCard("Total cotizaciones", qs.length)}
      ${statCard("Ventas realizadas", sold, "#DCE7F2")}
      ${statCard("Pendientes", pend, "#FCE9D2")}
      ${statCard("Valor total cotizado", fmtQ(totalQuoted), "#DCEEE1")}
      ${statCard("Tasa de cierre", closeRate + "%")}
    </div>
    <div class="card pad">
      <h3>Valor cotizado por mes</h3>
      <div class="bar-chart">${bars}</div>
    </div>`;
}

/* Cambiar el precio base de un tipo de gramilla */
function editGrassPrice(id) {
  const g = GRASS_TYPES.find(x => x.id === id);
  const nuevo = prompt(`Nuevo precio para ${g.name} (Q por ${g.unit})`, g.price);
  if (nuevo === null) return; /* el usuario le dio cancelar */
  const valor = Number(nuevo);
  if (isNaN(valor) || valor <= 0) { alert("Ingresa un numero valido mayor a cero"); return; }
  g.price = valor;
  render();
}

/* Agregar o actualizar un precio base por departamento y zona */
function addZonePrice() {
  const deptTexto = prompt("Departamento (puedes escribir uno nuevo o uno ya existente)");
  if (deptTexto === null) return; /* el usuario le dio cancelar */
  const dept = deptTexto.trim();
  if (!dept) { alert("Escribe un nombre de departamento"); return; }

  const zoneTexto = prompt("Zona (Urbana o Rural)", "Urbana");
  if (zoneTexto === null) return;
  const zoneLimpio = zoneTexto.trim().toLowerCase();
  const zone = zoneLimpio === "urbana" ? "Urbana" : zoneLimpio === "rural" ? "Rural" : null;
  if (!zone) { alert("La zona debe ser Urbana o Rural"); return; }

  const precioTexto = prompt(`Precio base por m2 para ${dept} - ${zone}`);
  if (precioTexto === null) return;
  const precio = Number(precioTexto);
  if (isNaN(precio) || precio <= 0) { alert("Ingresa un numero valido mayor a cero"); return; }

  /* Buscar sin importar mayusculas o minusculas, para no crear el mismo departamento dos veces */
  const existente = PRICE_BY_ZONE.find(p => p.dept.toLowerCase() === dept.toLowerCase() && p.zone === zone);
  if (existente) {
    existente.price = precio;
  } else {
    PRICE_BY_ZONE.push({ dept, zone, price: precio });
  }
  render();
}

function renderAdminPrices() {
  const grassRows = GRASS_TYPES.map(g => `<div class="list-row"><span>${g.name}</span><div class="flex-gap"><span class="mono strong">${fmtQ(g.price)} / ${g.unit}</span><button class="btn btn-ghost small-btn" onclick="editGrassPrice('${g.id}')">Editar</button></div></div>`).join("");
  const zoneRows = PRICE_BY_ZONE.map(p => `<tr><td>${p.dept}</td><td>${p.zone}</td><td class="right mono">${fmtQ(p.price)}</td><td class="right"><button class="link-btn">Editar</button></td></tr>`).join("");

  return pageHeader("Precios", "Gestiona los precios base de gramilla por tipo y por ubicacion") + `
    <div class="card">
      <div class="card-header">Precio base por tipo de gramilla</div>
      <div class="list">${grassRows}</div>
    </div>
    <div class="card" style="margin-top:16px">
    <div class="card-header flex-between"><span>Precio base por ubicacion</span><button class="btn btn-ghost small-btn" onclick="addZonePrice()">+ Nuevo precio</button></div>      <div class="table-wrap"><table><thead><tr><th>Departamento</th><th>Zona</th><th class="right">Precio base /m2</th><th></th></tr></thead><tbody>${zoneRows}</tbody></table></div>
    </div>`;
}

function renderAdminProducts() {
  const rows = CATALOG.map(c => `<tr>
    <td class="strong">${c.name}</td><td class="hide-sm">${c.unit}</td><td class="right mono">${fmtQ(c.price)}</td>
    <td><span class="pill ${c.active ? "pill-on" : "pill-off"}">${c.active ? "Activo" : "Inactivo"}</span></td>
    <td class="right"><button class="link-btn">Editar</button></td>
  </tr>`).join("");
  return pageHeader("Productos y servicios", "Catalogo configurable de partidas para las cotizaciones", `<button class="btn btn-amber">+ Nuevo producto</button>`) + `
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Nombre</th><th class="hide-sm">Unidad</th><th class="right">Precio base</th><th>Estado</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function renderAdminFreight() {
  const rows = FREIGHT.map(f => `<tr><td>${f.dept}</td><td>${f.muni}</td><td>${f.zone}</td><td class="right mono">${fmtQ(f.price)}</td><td class="right"><button class="link-btn">Editar</button></td></tr>`).join("");
  return pageHeader("Fletes", "Tarifas de transporte por departamento, municipio y zona", `<button class="btn btn-amber">+ Nueva tarifa</button>`) + `
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Departamento</th><th>Municipio</th><th>Zona</th><th class="right">Precio de flete</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>
    <p class="muted small" style="margin-top:10px">Los cambios realizados afectaran las nuevas cotizaciones.</p>`;
}

function renderAdminUsers() {
  const rows = USERS.map(u => `<tr><td class="strong">${u.name}</td><td class="mono small muted">${u.email}</td><td>${u.role}</td><td><span class="pill ${u.status === "Activo" ? "pill-on" : "pill-off"}">${u.status}</span></td></tr>`).join("");
  return pageHeader("Usuarios", "Vendedores y administradores del sistema", `<button class="btn btn-amber">+ Nuevo usuario</button>`) + `
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

/* RENDER PRINCIPAL */

function render() {
  /* Guardar el foco actual antes de redibujar */
  const focused = document.activeElement;
  const focusedId = focused && focused.id;
  const selStart = focused && focused.selectionStart;
  const selEnd = focused && focused.selectionEnd;

  const app = document.getElementById("app");
  if (!state.user) {
    app.innerHTML = renderLogin();
    return;
  }
  let inner;
  if (state.pdfId) inner = renderPdf();
  else if (state.view === "wizard" && state.wizard) inner = renderWizard();
  else if (state.view === "detail") inner = renderDetail();
  else if (state.view === "history") inner = renderHistory();
  else if (state.view === "admin-dashboard") inner = renderAdminDashboard();
  else if (state.view === "admin-prices") inner = renderAdminPrices();
  else if (state.view === "admin-products") inner = renderAdminProducts();
  else if (state.view === "admin-freight") inner = renderAdminFreight();
  else if (state.view === "admin-users") inner = renderAdminUsers();
  else inner = renderDashboard();

  app.innerHTML = renderShell(inner);

  /* Restaurar el foco si el elemento sigue existiendo */
  if (focusedId) {
    const el = document.getElementById(focusedId);
    if (el) {
      el.focus();
      if (selStart != null) el.setSelectionRange(selStart, selEnd);
    }
  }
}
/* Punto de entrada, arranca todo cuando carga la pagina */

document.addEventListener("DOMContentLoaded", render);