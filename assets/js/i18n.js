// assets/js/i18n.js
(() => {
  // 1) TRANSLATIONS (edit/add keys freely)
  const translations = {
    en: {
      nav: {
        creations: "CREATIONS",
        cart: "CART",
        contact: "CONTACT",
        login: "LOGIN",
        privacy: "PRIVACY",
      },
      home: {
        title: "OWN LESS. MEAN MORE.",
        subtitle: "Handmade limited-run pieces.",
      },
    },

    pt: {
      nav: {
        creations: "CRIAÇÕES",
        cart: "CARRINHO",
        contact: "CONTACTO",
        login: "ENTRAR",
        privacy: "PRIVACIDADE",
      },
      home: {
        title: "POSSUI MENOS. SIGNIFICA MAIS.",
        subtitle: "Peças artesanais em edição limitada.",
      },
    },

    de: {
      nav: {
        creations: "KREATIONEN",
        cart: "WARENKORB",
        contact: "KONTAKT",
        login: "ANMELDEN",
        privacy: "DATENSCHUTZ",
      },
      home: {
        title: "WENIGER BESITZEN. MEHR BEDEUTEN.",
        subtitle: "Handgefertigte Stücke in limitierter Auflage.",
      },
    },
  };

  // 2) HELPERS
  const get = (obj, path) =>
    path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

  const applyTranslations = (lang) => {
    const dict = translations[lang] || translations.en;

    document.documentElement.lang = lang;

    // Translate text nodes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = get(dict, key);
      if (typeof value === "string") el.textContent = value;
    });

    // Translate placeholders (optional)
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const value = get(dict, key);
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });

    // Translate titles (optional)
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const value = get(dict, key);
      if (typeof value === "string") el.setAttribute("title", value);
    });

    // Mark active language (supports legacy .locale-active)
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("active", isActive);
      btn.classList.toggle("locale-active", isActive);
      // If you use <a href=\"#\"> for lang, keep it accessible:
      btn.setAttribute("aria-current", isActive ? "true" : "false");
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    localStorage.setItem("preferredLang", lang);
  };

  const setLang = (lang) => {
    if (!translations[lang]) lang = "en";
    applyTranslations(lang);
  };

  // 3) INIT
  document.addEventListener("DOMContentLoaded", () => {
    // Click handler (single binding, prevents redirects)
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-lang]");
      if (!el) return;

      // Stops <a> navigation if you used <a href=\"...\"
      e.preventDefault();

      setLang(el.dataset.lang);
    });

    const saved = localStorage.getItem("preferredLang");
    setLang(saved || "en");
  });

  // Optional: expose for debugging
  window.__setLang = setLang;
})();
