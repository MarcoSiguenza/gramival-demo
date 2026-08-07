(function () {
  "use strict";

  const DURATION = 3000;

  let container = null;

  function getContainer() {
    if (!container) container = document.getElementById("toastContainer");
    return container;
  }

  function showToast(message, type) {
    if (!message) return;

    const toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "success");
    toast.setAttribute("role", "status");
    toast.textContent = message;

    getContainer().appendChild(toast);

    const timer = setTimeout(() => dismiss(toast), DURATION);

    toast.addEventListener("click", () => {
      clearTimeout(timer);
      dismiss(toast);
    });
  }

  function dismiss(toast) {
    if (!toast.parentNode) return;

    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }

  window.showToast = showToast;
})();