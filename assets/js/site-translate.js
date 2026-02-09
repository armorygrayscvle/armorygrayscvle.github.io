// /assets/js/site-translate.js
(() => {
  const STORAGE_KEY = "siteLang";
  const BRAND_LOCK = ["ARMORY GRAYSCVLE", "Armory Grayscvle", "Armory GRAYSCVLE"];

  // Dictionary keyed by normalized English text.
  const dict = {
    de: {
      "HOME": "START",
      "Catalog": "Katalog",
      "CATALOG": "KATALOG",
      "CART": "WARENKORB",
      "CONTACT": "KONTAKT",
      "LOGIN": "LOGIN",
      "PRIVACY": "DATENSCHUTZ",
      "TERMS": "AGB",
      "GENERAL": "ALLGEMEIN",
      "OWN LESS. MEAN MORE.": "WENIGER BESITZEN. MEHR BEDEUTEN.",
      "ADD TO CART": "IN DEN WARENKORB",
      "SOLD OUT": "AUSVERKAUFT",
      "SIZE": "GRÖSSE",
      "COLOR": "FARBE",
      "QUANTITY": "MENGE",
      "EMAIL": "E-MAIL",
      "Name": "Name",
      "NAME": "NAME",
      "MESSAGE": "NACHRICHT",
      "SEND": "SENDEN",
      "NEWSLETTER": "NEWSLETTER",
      "SUBSCRIBE": "ABONNIEREN"
    },
    pt: {
      "HOME": "INÍCIO",
      "Catalog": "Catálogo",
      "CATALOG": "CATÁLOGO",
      "CART": "CARRINHO",
      "CONTACT": "CONTACTO",
      "LOGIN": "INICIAR SESSÃO",
      "PRIVACY": "PRIVACIDADE",
      "TERMS": "TERMOS",
      "GENERAL": "GERAL",
      "OWN LESS. MEAN MORE.": "TER MENOS. SIGNIFICAR MAIS.",
      "ADD TO CART": "ADICIONAR AO CARRINHO",
      "SOLD OUT": "ESGOTADO",
      "SIZE": "TAMANHO",
      "COLOR": "COR",
      "QUANTITY": "QUANTIDADE",
      "EMAIL": "EMAIL",
      "Name": "Nome",
      "NAME": "NOME",
      "MESSAGE": "MENSAGEM",
      "SEND": "ENVIAR",
      "NEWSLETTER": "NEWSLETTER",
      "SUBSCRIBE": "SUBSCREVER"
    }
  };

  const norm = (s) =>
    (s || "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const missing = new Set();

  const shouldSkipNode = (node) => {
    if (!node || !node.parentElement) return true;
    const tag = node.parentElement.tagName;
    if (!tag) return true;
    if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(tag)) return true;
    if (node.parentElement.closest("code, pre")) return true;
    if (node.parentElement.closest("input, textarea")) return true;
    return false;
  };

  const translateTextNode = (textNode, lang) => {
    const raw = textNode.nodeValue;
    const t = norm(raw);
    if (!t) return;
    if (BRAND_LOCK.includes(t)) return;

    if (textNode.__origText == null) textNode.__origText = raw;

    if (lang === "en") {
      textNode.nodeValue = textNode.__origText;
      return;
    }

    const translated = dict?.[lang]?.[t];
    if (translated) {
      const lead = raw.match(/^\s*/)?.[0] ?? "";
      const trail = raw.match(/\s*$/)?.[0] ?? "";
      textNode.nodeValue = lead + translated + trail;
    } else {
      missing.add(t);
    }
  };

  const translateAttrs = (lang) => {
    const attrs = ["placeholder", "aria-label", "title", "value"];
    const elements = document.querySelectorAll("input, textarea, button, a");
    elements.forEach((el) => {
      attrs.forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const raw = el.getAttribute(attr);
        const t = norm(raw);
        if (!t) return;
        if (BRAND_LOCK.includes(t)) return;
        if (!el.__origAttrs) el.__origAttrs = {};
        if (el.__origAttrs[attr] == null) el.__origAttrs[attr] = raw;

        if (lang === "en") {
          el.setAttribute(attr, el.__origAttrs[attr]);
          return;
        }

        const translated = dict?.[lang]?.[t];
        if (translated) el.setAttribute(attr, translated);
        else missing.add(t);
      });
    });
  };

  const walkAndTranslate = (lang) => {
    missing.clear();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        if (!norm(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      translateTextNode(node, lang);
    }
    translateAttrs(lang);
    if (lang !== "en" && missing.size) {
      console.log(`[i18n] Missing ${missing.size} strings for ${lang}:`, Array.from(missing).sort());
    }
  };

  const setLang = (lang) => {
    const target = ["en", "pt", "de"].includes(lang) ? lang : "en";
    localStorage.setItem(STORAGE_KEY, target);
    document.documentElement.lang = target;
    const current = document.getElementById("langCurrent");
    if (current) current.textContent = target.toUpperCase();
    walkAndTranslate(target);
    if (window.i18n && typeof window.i18n.applyTranslations === "function") {
      try {
        window.i18n.applyTranslations(target);
      } catch (e) {
        /* ignore */
      }
    }
    if (window.Snipcart?.api?.session) {
      try {
        window.Snipcart.api.session.setLanguage(target === "de" ? "de" : target === "pt" ? "pt" : "en");
      } catch (e) {
        /* ignore */
      }
    }
  };

  const bindButtons = () => {
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLang(btn.dataset.lang);
      });
    });
  };

  const init = () => {
    bindButtons();
    const saved = localStorage.getItem(STORAGE_KEY) || "en";
    setLang(saved);
    const obs = new MutationObserver(() => {
      const lang = localStorage.getItem(STORAGE_KEY) || "en";
      walkAndTranslate(lang);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);

  window.__setSiteLang = setLang;
})();
