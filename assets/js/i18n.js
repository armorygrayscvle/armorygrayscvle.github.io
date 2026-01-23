(function () {
  const STORAGE_KEY = "siteLang";
  const SUPPORTED = ["en", "pt", "de"];

  function getSaved() {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(val) ? val : "en";
    } catch (err) {
      return "en";
    }
  }

  function save(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* ignore */
    }
  }

  function applyLang(lang) {
    const target = SUPPORTED.includes(lang) ? lang : "en";
    document.documentElement.lang = target;
    if (typeof window.applyTranslations === "function") {
      window.applyTranslations(target);
    } else if (window.translations) {
      // Fallback simple replacer
      const dict = window.translations[target] || window.translations.en || {};
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const val = dict[key];
        if (val) el.textContent = val;
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        const val = dict[key];
        if (val) el.setAttribute("placeholder", val);
      });
    }
  }

  function setLang(lang) {
    const target = SUPPORTED.includes(lang) ? lang : "en";
    save(target);
    applyLang(target);
    if (typeof window.updateLocaleButtons === "function") {
      window.updateLocaleButtons(target);
    }
  }

  function bindButtons() {
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  }

  function init() {
    const lang = getSaved();
    applyLang(lang);
    bindButtons();
  }

  if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }

  window.i18n = { setLang, applyLang, getSaved };
})();
