/* SEOKY progressive web app helpers. All controls are added only when supported. */
(() => {
  const isSupported = "serviceWorker" in navigator;
  if (isSupported) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
        .catch((error) => console.warn("SEOKY offline support could not be enabled:", error));
    }, { once: true });
  }

  const status = document.createElement("div");
  status.className = "seoky-network-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = "You're offline — cached SEOKY pages may still be available.";
  document.body.appendChild(status);

  const updateNetworkStatus = () => {
    const offline = !navigator.onLine;
    status.classList.toggle("is-visible", offline);
    status.setAttribute("aria-hidden", String(!offline));
  };
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  updateNetworkStatus();

  let installPrompt = null;
  const headerActions = document.querySelector(".header-actions");
  let installButton = null;
  if (headerActions) {
    installButton = document.createElement("button");
    installButton.type = "button";
    installButton.className = "icon-btn seoky-install-button";
    installButton.setAttribute("aria-label", "Install SEOKY app");
    installButton.title = "Install SEOKY";
    installButton.textContent = "↓";
    installButton.hidden = true;
    headerActions.insertBefore(installButton, headerActions.firstChild);
    installButton.addEventListener("click", async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch (_) { /* user may dismiss */ }
      installPrompt = null;
      installButton.hidden = true;
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    if (installButton) installButton.hidden = true;
  });
})();
