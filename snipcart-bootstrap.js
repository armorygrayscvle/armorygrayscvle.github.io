(function () {
  // Single source of truth for the public key: pulled from SnipcartSettings (set in snipcart-settings.js).
  const PUBLIC_API_KEY =
    (window.SnipcartSettings && window.SnipcartSettings.publicApiKey) ||
    "YjUyZGQ5ZmEtYzA1MC00YTBhLTliNGItNWFhY2FlNTZmYTUzNjM5MDEyMjgzOTUxMjUwNjQx";
  const THEME_HREF = "https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.css";
  const SCRIPT_SRC = "https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.js";

  function ensureTheme() {
    if (document.querySelector('link[data-snipcart-theme="v3-default"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = THEME_HREF;
    link.setAttribute("data-snipcart-theme", "v3-default");
    document.head.appendChild(link);
  }

  function ensureContainer() {
    let el = document.getElementById("snipcart");
    if (el) return el;
    el = document.createElement("div");
    el.id = "snipcart";
    el.hidden = true;
    el.setAttribute("data-api-key", PUBLIC_API_KEY);
    el.setAttribute("data-config-add-product-behavior", "none");
    el.setAttribute("data-config-modal-style", "side");
    el.setAttribute("data-currency", "eur");
    document.body.appendChild(el);
    return el;
  }

  function ensureScript() {
    if (document.querySelector('script[data-snipcart-script="v3-default"]')) return;
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = false;
    script.setAttribute("data-snipcart-script", "v3-default");
    document.body.appendChild(script);
  }

  ensureTheme();
  ensureContainer();
  ensureScript();
})();
