/*
  Componente reutilizable de modales.

  API:
    openModal({ title, body, footer, onOpen })
    closeModal()

  - title, body y footer siguen funcionando igual que antes (strings de HTML).
  - onOpen(refs) es opcional y se ejecuta DESPUES de inyectar el HTML.
    refs = { body, footer, close } para enganchar listeners con querySelector
    en lugar de exponer una funcion global por cada boton.

  Todo vive dentro de una IIFE para no ocupar nombres en el scope global:
  hacia afuera solo se exponen openModal y closeModal.
*/
(function () {
  "use strict";

  /* Los nodos se buscan la primera vez que se usan, no al cargar el script.
     Asi el componente funciona sin importar donde se coloque el <script>. */
  let refs = null;

  function getRefs() {
    if (refs) return refs;

    refs = {
      overlay: document.getElementById("modalOverlay"),
      title: document.getElementById("modalTitle"),
      body: document.getElementById("modalBody"),
      footer: document.getElementById("modalFooter"),
      close: document.getElementById("modalCloseBtn"),
    };

    refs.close.addEventListener("click", closeModal);

    /* Solo cierra si el clic fue en el fondo, no dentro del modal */
    refs.overlay.addEventListener("click", function (e) {
      if (e.target === refs.overlay) closeModal();
    });

    return refs;
  }

  function isOpen() {
    return !getRefs().overlay.classList.contains("hidden");
  }

  /* Elemento que tenia el foco antes de abrir, para devolverselo al cerrar */
  let lastFocused = null;

  function openModal(options) {
    const config = options || {};
    const r = getRefs();

    lastFocused = document.activeElement;

    r.title.textContent = config.title || "";
    r.body.innerHTML = config.body || "";
    r.footer.innerHTML = config.footer || "";

    r.overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");

    /* Enganchar la logica del formulario recien inyectado */
    setModalError("");
    if (typeof config.onOpen === "function") {
      config.onOpen({ body: r.body, footer: r.footer, close: closeModal });
    }

    focusFirstField();
  }

  function closeModal() {
    const r = getRefs();

    r.overlay.classList.add("hidden");
    r.body.innerHTML = "";
    r.footer.innerHTML = "";

    document.body.classList.remove("modal-open");

    /* Devolver el foco a donde estaba, salvo que ese elemento ya no exista */
    if (lastFocused && document.body.contains(lastFocused)) {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function confirmModal({ title = "", message = "", detail = "", confirmLabel = "Confirmar", onConfirm }) {
    openModal({
      title,
      body: `
        <p id="confirmMessage"></p>
        ${detail ? `<p id="confirmDetail" class="muted small"></p>` : ""}
      `,
      footer: `
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button id="confirmActionBtn" class="btn btn-danger">${confirmLabel}</button>
      `,
      onOpen: (refs) => {
        refs.body.querySelector("#confirmMessage").textContent = message;
        if (detail) refs.body.querySelector("#confirmDetail").textContent = detail;
        refs.footer.querySelector("#confirmActionBtn").addEventListener("click", onConfirm);
      }
    });
  }

  function focusFirstField() {
    const first = getRefs().body.querySelector("input, select, textarea, button")
      || getRefs().footer.querySelector("button");
    if (first) first.focus();
  }

  function setModalError(message) {
    const r = getRefs();
    let box = r.body.querySelector(".modal-error");

    if (!box) {
      box = document.createElement("p");
      box.className = "modal-error form-error";
      r.body.insertBefore(box, r.body.firstChild);
    }

    box.textContent = message || "";
    box.classList.toggle("hidden", !message);
  }

  /* Escape cierra el modal. Un solo listener para toda la aplicacion. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) closeModal();
  });

  window.openModal = openModal;
  window.closeModal = closeModal;
  window.setModalError = setModalError;
  window.confirmModal = confirmModal;
})();