// Remove any old service workers that could cache stale assets
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

// Always start at top on reload
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
const resetScroll = () => window.scrollTo(0, 0);
resetScroll();
window.addEventListener("pageshow", resetScroll);
window.addEventListener("beforeunload", resetScroll);

// Ensure relative asset URLs resolve from site root (works inside /en/ /pt/ /de/)
(function ensureBaseHref() {
  const existing = document.querySelector("base");
  if (existing) return;
  const base = document.createElement("base");
  base.href = "/";
  const head = document.head || document.getElementsByTagName("head")[0];
  const first = head.querySelector("link, script");
  if (first) {
    head.insertBefore(base, first);
  } else {
    head.appendChild(base);
  }
})();

// Load i18n helper once
(function loadI18n() {
  if (window.__i18nLoaded) return;
  const s = document.createElement("script");
  s.src = "/assets/js/i18n.js";
  s.defer = true;
  document.head.appendChild(s);
  window.__i18nLoaded = true;
})();

// Force stylesheet cache-bust with explicit version
(function bumpStylesheet() {
  const styleEl = document.getElementById("site-style");
  if (!styleEl) return;
  const version = "3";
  const base = (styleEl.getAttribute("href") || "style.css").split("?")[0];
  styleEl.setAttribute("href", `${base}?v=${version}&t=${Date.now()}`);
})();

// Mobile hero sizing: fit viewport below the fixed header
const MOBILE_MAX_WIDTH = 768;
function setMobileHeroHeight() {
  const hero = document.querySelector(".home .ch-hero");
  const header = document.querySelector(".ch-header");
  if (!hero || !header) return;

  const isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
  if (!isMobile) {
    document.documentElement.style.removeProperty("--header-height");
    hero.style.removeProperty("height");
    hero.style.removeProperty("minHeight");
    hero.style.removeProperty("paddingTop");
    hero.style.removeProperty("paddingBottom");
    return;
  }

  const headerHeight = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
  document.documentElement.style.setProperty(
    "--mobile-hero-height",
    `${Math.max(window.innerHeight - headerHeight, 0)}px`
  );
  const targetHeight = Math.max(window.innerHeight - headerHeight, 0);
  hero.style.height = `${targetHeight}px`;
  hero.style.minHeight = `${targetHeight}px`;
  hero.style.paddingTop = `calc(${headerHeight}px + 20px)`;
  hero.style.paddingBottom = "0px";
  hero.style.marginBottom = "0px";
}

function applyBrandLockupTo(el) {
  if (!el) return;
  if (el.querySelector(".brand-word-grayscvle")) {
    el.classList.add("brand-lockup");
    return;
  }

  const text = (el.textContent || "").trim();
  const parts = text.split(/\s+/);
  if (parts.length < 2) return;

  const first = parts.shift();
  const rest = parts.join(" ");
  el.classList.add("brand-lockup");
  el.innerHTML = `<span class="brand-word brand-word-armory">${first}</span><span class="brand-word brand-word-grayscvle">${rest}</span>`;
}

function applyBrandLockups() {
  applyBrandLockupTo(document.querySelector("#loader h1"));
  applyBrandLockupTo(document.querySelector(".ch-brand"));
}

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const main = document.getElementById("main-content");
  applyBrandLockups();
  jumpToInfo();
  setMobileHeroHeight();

  setTimeout(() => {
    loader.style.opacity = "0";
    main.style.opacity = "1";

    setTimeout(() => {
      loader.style.display = "none";
      document.body.style.overflow = "auto";
    }, 1200);

  }, 1200);
});

window.addEventListener("pageshow", jumpToInfo);
window.addEventListener("resize", setMobileHeroHeight);
window.addEventListener("orientationchange", setMobileHeroHeight);
window.addEventListener("pageshow", setMobileHeroHeight);

function jumpToInfo() {
  const info = document.querySelector(".info-page");
  if (!info) return;
  const top = info.getBoundingClientRect().top + window.pageYOffset - 10;
  window.scrollTo({ top, behavior: "auto" });
}

/* HOME MENU (MAISON) */
const chMenuToggle = document.getElementById("ch-menu-toggle");
const chMenu = document.getElementById("ch-menu");
const chMenuClose = document.querySelector(".ch-menu-close");
const chMenuLinks = document.querySelectorAll(".ch-menu-link");
let checkoutBusy = false;

function openChMenu() {
  if (!chMenu) return;
  chMenu.classList.add("open");
}

function closeChMenu() {
  if (!chMenu) return;
  chMenu.classList.remove("open");
}

if (chMenuToggle) {
  chMenuToggle.addEventListener("click", () => {
    if (chMenu?.classList.contains("open")) {
      closeChMenu();
    } else {
      openChMenu();
    }
  });
}

if (chMenuClose) {
  chMenuClose.addEventListener("click", closeChMenu);
}

if (chMenuLinks && chMenuLinks.length) {
  chMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeChMenu();
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeChMenu();
});

const BRAND_HTML = `
  <span class="brand-word brand-word-armory">ARMORY</span>
  <span class="brand-word brand-word-grayscvle">GRAYSCVLE</span>
`;

function ensureGlobalBrand() {
  const loaderTitle = document.querySelector("#loader h1");
  if (loaderTitle) {
    loaderTitle.className = "global-brand";
    loaderTitle.innerHTML = BRAND_HTML;
  }
  const existingSticky = document.querySelector(".global-brand.sticky-brand");
  if (existingSticky) {
    existingSticky.className = "global-brand sticky-brand";
    existingSticky.innerHTML = BRAND_HTML;
  } else {
    const brand = document.createElement("div");
    brand.className = "global-brand sticky-brand";
    brand.innerHTML = BRAND_HTML;
    document.body.appendChild(brand);
  }
}

document.addEventListener("DOMContentLoaded", ensureGlobalBrand);

function ensureFooterNav() {
  const existing = document.querySelector(".footer-nav-right");
  if (existing) existing.remove();
  const footer = document.createElement("div");
  footer.className = "footer-nav-right";
  footer.innerHTML = `
    <a href="index.html" data-i18n="nav.home">HOME</a> ·
    <a href="creations.html" data-i18n="nav.creations">CREATIONS</a> ·
    <a href="cart.html" data-i18n="nav.cart">CART</a> ·
    <a href="contact.html" data-i18n="nav.contact">CONTACT</a> ·
    <a href="login.html" data-i18n="nav.login">LOGIN</a> ·
    <a href="privacy.html" data-i18n="nav.privacy">PRIVACY</a> ·
    <a href="https://instagram.com/armorygrayscvle" target="_blank" rel="noopener noreferrer">IG</a> ·
    <span class="footer-locale-wrapper">
      <button id="footer-locale" class="footer-locale" type="button" data-lang="en" data-i18n="menu.lang_en">EN</button>
      <div id="footer-locale-menu" class="footer-locale-menu">
        <button type="button" data-locale="pt" data-lang="pt" data-i18n="menu.lang_pt">PT</button>
        <button type="button" data-locale="de" data-lang="de" data-i18n="menu.lang_de">DE</button>
      </div>
    </span>
  `;
  document.body.appendChild(footer);
}

document.addEventListener("DOMContentLoaded", ensureFooterNav);

const LOCALE_ORDER = ["en", "de", "pt"];

function getLocaleFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const first = (parts[0] || "").toLowerCase();
  if (first === "pt") return "pt";
  if (first === "de") return "de";
  if (first === "en") return "en";
  return "en";
}

function getBaseFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const isLocaleFolder = ["en", "pt", "de"].includes((parts[0] || "").toLowerCase());
  const file = isLocaleFolder ? (parts[1] || "index.html") : (parts[0] || "index.html");
  return file.replace(/-(pt|de)(?=\.html$)/i, "").replace(/\.html$/i, "") || "index";
}

function buildLocaleHref(base, locale) {
  const cleanBase = base || "index";
  return `/${locale}/${cleanBase}.html`;
}

function resolveLocaleHref(base, locale) {
  const targetBase = base || "index";
  return buildLocaleHref(targetBase, locale);
}

function localePathExists(base) {
  return LOCALE_PAGES.includes(base);
}

function initFooterLocale() {
  const btn = document.getElementById("footer-locale");
  const menu = document.getElementById("footer-locale-menu");
  const wrapper = btn?.closest(".footer-locale-wrapper");
  if (!btn) return;
  if (!menu) return;
  const desiredLocales = ["pt", "de"];
  menu.innerHTML = desiredLocales
    .map((loc) => `<button type="button" class="footer-locale-option" data-locale="${loc}" data-lang="${loc}" data-i18n="menu.lang_${loc}">${loc.toUpperCase()}</button>`)
    .join("");
  btn.setAttribute("aria-haspopup", "true");
  btn.setAttribute("aria-expanded", "false");
  menu.setAttribute("role", "menu");
  let current = getLocaleFromPath();
  btn.textContent = current.toUpperCase();
  const base = getBaseFromPath();
  const options = Array.from(menu.querySelectorAll("button[data-locale]"));
  options.forEach((opt) => opt.setAttribute("role", "menuitem"));
  menu.setAttribute("aria-hidden", "true");

  function closeMenu() {
    menu?.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  }

  function openMenu() {
    menu.style.minWidth = `${btn.offsetWidth}px`;
    menu?.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    options.forEach((opt) => {
      const loc = opt.dataset.locale;
      opt.textContent = loc.toUpperCase();
    });
  }

  function toggleMenu(e) {
    e.stopPropagation();
    if (menu?.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  const toggleHandler = (e) => toggleMenu(e);
  btn.addEventListener("click", toggleHandler);
  btn.addEventListener("touchstart", toggleHandler, { passive: true });
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMenu(e);
    } else if (e.key === "Escape") {
      closeMenu();
    }
  });

  options.forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetLoc = opt.dataset.locale;
      if (!targetLoc || targetLoc === current) {
        closeMenu();
        return;
      }
      const target = resolveLocaleHref(base, targetLoc);
      closeMenu();
      window.location.href = target;
    });
    opt.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      const targetLoc = opt.dataset.locale;
      if (!targetLoc || targetLoc === current) {
        closeMenu();
        return;
      }
      closeMenu();
      window.location.href = resolveLocaleHref(base, targetLoc);
    }, { passive: true });
    opt.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  });

  const outsideClose = (e) => {
    if (!wrapper) return;
    if (!wrapper.contains(e.target)) closeMenu();
  };

  document.addEventListener("click", outsideClose);
  document.addEventListener("touchstart", outsideClose, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

if (document.readyState !== "loading") {
  initFooterLocale();
} else {
  document.addEventListener("DOMContentLoaded", initFooterLocale);
}

function shouldFadeLink(a) {
  const href = a.getAttribute("href") || "";
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (a.target && a.target !== "_self") return false;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  return true;
}

function initPageFade() {
  const body = document.body;
  if (!body) return;
  body.classList.add("page-fade-ready");

  function handleClick(e) {
    const anchor = e.target.closest("a");
    if (!anchor) return;
    if (!shouldFadeLink(anchor)) return;
    e.preventDefault();
    body.classList.add("page-fading");
    const target = anchor.href;
    setTimeout(() => {
      window.location.href = target;
    }, 320);
  }

  document.addEventListener("click", handleClick);
}

document.addEventListener("DOMContentLoaded", initPageFade);

/* LOCALE PICKER */
const localeButtons = document.querySelectorAll(".locale-btn");
const LOCALE_KEY = "preferredLocale";
const LOCALE_PAGES = [
  "index",
  "creations",
  "contact",
  "cart",
  "login",
  "privacy",
  "terms",
  "general"
];
const LEGACY_REDIRECTS = {};
const translations = {
  en: {
    "nav.home": "Home",
    "nav.creations": "Creations",
    "nav.cart": "Cart",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.privacy": "Privacy",
    "nav.terms": "Terms",
    "nav.general": "General",
    "menu.creations": "Creations",
    "menu.contact": "Contact",
    "menu.lang_en": "EN",
    "menu.lang_pt": "PT",
    "menu.lang_de": "DE",

    "login.eyebrow": "Account",
    "login.title": "Armory Grayscvle",
    "login.subtitle": "",
    "login.google": "Continue with Google",
    "login.apple": "Continue with Apple",
    "login.or": "or",
    "login.email": "Email",
    "login.password": "Password",
    "login.forgot": "Forgot your password?",
    "login.submit": "Log in",
    "login.create": "Create account",

    "cart.eyebrow": "Bag",
    "cart.title": "Your Cart",
    "cart.empty": "Your cart is empty.",
    "cart.continue": "Continue shopping",
    "cart.returns": "Returns & Exchanges",

    "contact.eyebrow": "Contact",
    "contact.headline": "Get in Touch",
    "contact.first": "First Name",
    "contact.last": "Last Name",
    "contact.email": "Email",
    "contact.phone": "Phone Number",
    "contact.order": "Order Number",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.consent": 'By clicking Submit, I acknowledge the <a href="privacy.html">Privacy Policy</a>.',
    "contact.submit": "Submit",

    "general.body": `
      <p class="info-eyebrow">General</p>
      <h1 class="info-headline">Information</h1>
      <p><strong>SHIPPING &amp; DELIVERY</strong><br>
      <em>Delivery Zones</em><br>
      ARMORY GRAYSCVLE ships within the European Union and to selected international destinations.<br>
      Orders can only be delivered to a valid physical street address.<br>
      Orders containing incomplete, invalid, or non-serviceable addresses may be refused or cancelled.<br>
      We do not ship to post office boxes, APO/FPO addresses, or similar forwarding services.</p>

      <p><em>Processing &amp; Production Time</em><br>
      Most ARMORY GRAYSCVLE pieces are made-to-order or produced in limited, non-repeatable runs.<br>
      As a result:<br>
      Production times may vary<br>
      Orders may require additional processing before shipment<br>
      Estimated delivery times begin after the order has been processed, not at checkout<br>
      Specific timelines, when applicable, will be communicated by email.</p>

      <p><em>Shipping Costs</em><br>
      Shipping costs depend on:<br>
      Destination<br>
      Order value<br>
      Weight and dimensions of the package<br>
      All applicable shipping fees are clearly displayed before order confirmation and are payable in addition to the product price (VAT included where applicable).</p>

      <p><em>Tracking</em><br>
      Once your order has shipped, you will receive a confirmation email containing your tracking information, when available.</p>

      <p><em>Delivery Issues</em><br>
      If your order has not arrived within a reasonable timeframe after shipment, please contact Customer Care promptly.<br>
      You are responsible for checking your order upon delivery.<br>
      Any visible damage or discrepancies should be noted with the carrier at the time of delivery, where possible.</p>

      <p><strong>RETURNS, REPLACEMENTS &amp; EXCHANGES</strong><br>
      <em>General Policy</em><br>
      ARMORY GRAYSCVLE operates on a limited-production and made-to-order model.<br>
      Returns are therefore strongly discouraged and accepted only where required by applicable EU consumer law.</p>

      <p><em>Right of Withdrawal (EU Customers)</em><br>
      In accordance with EU consumer protection law, customers residing in the European Union may have the right to withdraw from certain purchases within 14 days of delivery, unless an exemption applies.<br>
      The right of withdrawal does not apply to:<br>
      Made-to-order items<br>
      Customized or personalized products<br>
      Limited-run items produced specifically for the customer<br>
      Items that cannot be resold for hygiene or integrity reasons once opened or worn</p>

      <p><em>Conditions for Accepted Returns</em><br>
      Where a return is legally accepted:<br>
      Items must be unused, unworn, unwashed<br>
      Items must be returned in their original condition and packaging<br>
      Proof of purchase is required<br>
      ARMORY GRAYSCVLE reserves the right to assess the condition of returned items before approving any refund or replacement.</p>

      <p><em>Replacements</em><br>
      Where applicable, replacements are limited to the same item, size permitting.<br>
      Only one replacement per item will be considered.</p>

      <p><em>Refunds</em><br>
      Approved refunds are issued to the original payment method within a reasonable timeframe after receipt and inspection of the returned item.<br>
      Store credit is not issued.</p>

      <p><em>International Orders</em><br>
      For orders shipped outside the European Union:<br>
      Customs duties, import taxes, and handling fees may apply<br>
      These charges are the responsibility of the customer unless explicitly stated otherwise<br>
      International sales may be considered final, subject to local law</p>

      <p><strong>LEGAL</strong><br>
      <em>Intellectual Property</em><br>
      All designs, texts, images, and materials displayed on this website are the exclusive property of ARMORY GRAYSCVLE.<br>
      Any reproduction, distribution, modification, or unauthorized use, in whole or in part, is strictly prohibited.</p>

      <p><em>Limitation of Quantities</em><br>
      ARMORY GRAYSCVLE reserves the right to limit quantities per item, per order, or per customer in order to preserve fairness, availability, and the integrity of limited releases.<br>
      Orders placed in circumvention of such limits may be cancelled.</p>

      <p><strong>CONTACT</strong><br>
      For all enquiries related to orders, shipping, or legal matters:<br>
      <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "returns.body": `
      <p class="info-eyebrow">Returns</p>
      <h1 class="info-headline">Returns &amp; Exchanges</h1>
      <p>Each ARMORY GRAYSCVLE piece is produced in limited quantities, with intention and care. As a result, we do not operate under a traditional mass-return model.</p>
      <p>Where permitted by law, purchases are considered final.</p>
      <p>In accordance with European Union consumer law, customers located in the EU retain a 14-day right of withdrawal for distance purchases, unless an exception applies. This right does not apply to made-to-order items, customized pieces, or products produced in limited, non-repeatable runs once production has begun, as permitted under Directive 2011/83/EU.</p>
      <p>We encourage deliberate selection prior to purchase — including careful consideration of sizing and silhouette — and we remain available before checkout to assist with any questions.</p>
      <p>If an item arrives with a verified defect or if an incorrect piece is received, please contact us and the matter will be addressed with care and discretion.</p>
      <p>In select cases, size exchanges may be considered, subject to availability. Availability is not guaranteed.</p>
      <p>ARMORY GRAYSCVLE exists to promote conscious ownership — fewer pieces, chosen deliberately, and intended to be kept.</p>
      <p>For all return-related inquiries, contact:<br><a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "delivery.body": `
      <p class="info-eyebrow">Delivery</p>
      <h1 class="info-headline">Delivery Info</h1>
      <p><strong>Delivery Zones</strong><br>
      ARMORY GRAYSCVLE currently ships to European Union member states only.<br>
      International shipping may be introduced in the future on a limited, destination-specific basis.<br>
      Orders can only be delivered to a valid physical street address.<br>
      We do not ship to post office boxes or forwarding services.</p>
      <p><strong>Shipping Costs</strong><br>
      Shipping fees are calculated at checkout based on destination and order weight.</p>
      <p><strong>Delivery Timing</strong><br>
      Delivery times are estimates and may vary due to processing, carrier delays, or external conditions beyond our control.</p>
      <p><strong>Customs &amp; Duties</strong><br>
      Any customs duties, import taxes, or additional charges imposed by local authorities are the responsibility of the customer.</p>
      <p>For delivery-related inquiries, please contact <a href="mailto:office@armorygrayscvle.com">office@armorygrayscvle.com</a>.</p>
    `,

    "privacy.body": `
      <h1 class="info-title">PRIVACY POLICY</h1>
      <p><strong>Last Revised: January 9, 2026</strong></p>
      <p>We do not use cookies or similar tracking technologies.</p>
      <p>This Privacy Policy explains how ARMORY GRAYSCVLE collects, uses, and protects personal data in accordance with the General Data Protection Regulation (GDPR) and applicable EU law.</p>
      <p><strong>1. DATA CONTROLLER</strong><br>
      ARMORY GRAYSCVLE<br>
      Email: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
      <p><strong>2. PERSONAL DATA WE COLLECT</strong><br>
      We collect only data that is necessary for the operation of the Website and fulfillment of orders, including: Name; Email address; Shipping and billing address; Payment-related information (processed securely by third-party providers); Order history; Technical data (IP address, browser type, device data). We do not collect unnecessary or excessive personal data.</p>
      <p><strong>3. PURPOSE OF PROCESSING</strong><br>
      Your personal data is processed for: Order processing and fulfillment; Customer communication; Payment processing; Legal and accounting compliance; Website security and functionality. We do not use personal data for automated decision-making or profiling.</p>
      <p><strong>4. LEGAL BASIS FOR PROCESSING</strong><br>
      We process personal data on the basis of: Contractual necessity; Legal obligations; Legitimate interests (security, fraud prevention, site functionality); Consent, where required (e.g. optional communications).</p>
      <p><strong>5. DATA SHARING</strong><br>
      Personal data may be shared only with: Payment processors; Shipping and logistics providers; IT and hosting service providers. All third parties are required to process data in compliance with GDPR. We do not sell or trade personal data.</p>
      <p><strong>6. DATA RETENTION</strong><br>
      Personal data is retained only for as long as necessary to fulfill its purpose or to comply with legal obligations. When data is no longer required, it is securely deleted or anonymized.</p>
      <p><strong>7. YOUR RIGHTS UNDER GDPR</strong><br>
      You have the right to: Access your personal data; Request correction of inaccurate data; Request erasure (“right to be forgotten”), where applicable; Restrict or object to processing; Request data portability; Withdraw consent at any time, where processing is based on consent. Requests may be sent to <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a>.</p>
      <p><strong>8. COOKIES</strong><br>
      The Website may use essential cookies required for functionality and security. Where non-essential cookies are used, consent will be obtained in accordance with applicable law.</p>
      <p><strong>9. DATA SECURITY</strong><br>
      We implement appropriate technical and organizational measures to protect personal data against loss, misuse, unauthorized access, disclosure, or alteration. No system is entirely secure; however, we take data protection seriously.</p>
      <p><strong>10. INTERNATIONAL DATA TRANSFERS</strong><br>
      Where personal data is transferred outside the EU, appropriate safeguards are applied in accordance with GDPR requirements.</p>
      <p><strong>11. CHANGES TO THIS POLICY</strong><br>
      We may update this Privacy Policy from time to time. Changes take effect immediately upon publication.</p>
      <p><strong>12. CONTACT</strong><br>
      For privacy-related inquiries or to exercise your rights: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "terms.body": `
      <h1 class="info-title">TERMS &amp; CONDITIONS</h1>
      <p><strong>Last Revised: January 9, 2026</strong></p>
      <p>This website, www.armorygrayscvle.com (the “Website”), is provided by ARMORY GRAYSCVLE (“ARMORY GRAYSCVLE,” “we,” “us,” or “our”).</p>
      <p>These Terms &amp; Conditions (“Terms”) govern all access to and use of the Website, including browsing, account creation, and the purchase of any products offered through the Website.</p>
      <p>By accessing or using the Website, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must discontinue use of the Website.</p>
      <p><strong>USE OF THE WEBSITE</strong><br>
      The Website may only be used for lawful purposes. Any use that interferes with the integrity, security, operation, or intended experience of the Website is prohibited.<br>
      We reserve the right, at our sole discretion and without prior notice, to restrict, suspend, or terminate access to the Website or any part of it, including user accounts, where necessary to protect the Website, the brand, or its users.</p>
      <p><strong>USER ACCOUNTS</strong><br>
      Certain features may require the creation of an account. You are responsible for all activity conducted through your account and for maintaining the confidentiality of your login credentials.<br>
      We are not responsible for loss, damage, or unauthorized access resulting from your failure to safeguard your account information.</p>
      <p><strong>PRODUCTS, PRODUCTION, AND AVAILABILITY</strong><br>
      All products offered on the Website are produced in limited quantities, and many items are made-to-order or customized.<br>
      Some collections or drops are fully limited and non-repeatable. Once production has begun or a drop has concluded, products may not be reproduced.<br>
      Availability is not guaranteed and may change without notice. The absence of a product does not imply restock or future availability.</p>
      <p><strong>PRICING AND PAYMENT</strong><br>
      All prices are listed in EUR (€) and are VAT included, unless stated otherwise.<br>
      Prices, product details, and availability may be modified at any time without notice. Orders are not accepted until payment has been received in full.<br>
      We reserve the right to correct pricing errors and to cancel orders placed at incorrect prices. If payment has been received for a canceled order, a refund will be issued for the amount paid.</p>
      <p><strong>PRODUCT REPRESENTATION</strong><br>
      We make reasonable efforts to display products accurately. However, due to handcrafted production, limited runs, and material variation: Colors, textures, finishes, and measurements may vary; Measurements are approximate; Screen settings may affect visual representation. Such variations are inherent to the product and do not constitute defects.</p>
      <p><strong>SHIPPING AND DELIVERY</strong><br>
      We ship within the European Union and internationally.<br>
      Delivery times are estimates only and not guaranteed. Delays caused by carriers, customs authorities, or circumstances beyond our control are not our responsibility.<br>
      For international orders, customers are solely responsible for any customs duties, import taxes, or additional charges imposed by the destination country.<br>
      Risk of loss transfers to the customer once the order is handed to the carrier.</p>
      <p><strong>RIGHT OF WITHDRAWAL AND RETURNS (EU COMPLIANCE)</strong><br>
      Under European Union consumer law, customers located in the EU have the right to withdraw from a distance purchase within 14 days of delivery, without providing a reason, unless an exception applies.<br>
      This right of withdrawal does not apply to: Products made to order or customized to the customer; Products produced in limited, non-repeatable runs once production has begun. Where withdrawal rights apply, return conditions and procedures are detailed in our separate Returns Policy. Due to the intentional and limited nature of our production, returns are discouraged to the maximum extent permitted by law.</p>
      <p><strong>ACCESS CODES AND PRIVATE RELEASES</strong><br>
      Any access codes, promotional codes, or private release invitations are issued at our discretion. Such codes may not be shared, sold, transferred, or publicly distributed and may be revoked or expire at any time. Possession of a code does not guarantee product availability.</p>
      <p><strong>INTELLECTUAL PROPERTY</strong><br>
      All content on the Website — including designs, text, images, graphics, logos, layout, and overall visual identity — is owned by ARMORY GRAYSCVLE or its licensors and is protected by applicable intellectual property laws.<br>
      No content may be copied, reproduced, modified, distributed, or used without prior written consent.</p>
      <p><strong>PROHIBITED CONDUCT</strong><br>
      You agree not to: Access or attempt to access restricted areas of the Website; Use automated tools, bots, scrapers, or similar technologies; Interfere with the Website’s operation or security; Use the Website for unlawful, misleading, or abusive purposes. Unauthorized use may result in immediate termination of access and legal action.</p>
      <p><strong>DISCLAIMER</strong><br>
      The Website and all content are provided “AS IS” and “AS AVAILABLE.”<br>
      We make no representations or warranties of any kind, express or implied, regarding availability, accuracy, or suitability for any particular purpose.</p>
      <p><strong>LIMITATION OF LIABILITY</strong><br>
      To the fullest extent permitted by law, ARMORY GRAYSCVLE shall not be liable for any indirect, incidental, special, or consequential damages arising from or related to the use of the Website or products.<br>
      Our total liability shall not exceed the amount paid by the customer for the product giving rise to the claim.<br>
      Nothing in these Terms limits or excludes consumer rights that cannot be excluded under applicable European Union law.</p>
      <p><strong>GOVERNING LAW</strong><br>
      These Terms are governed by and construed in accordance with the laws of Portugal, without regard to conflict-of-law principles. Any disputes shall be subject to the exclusive jurisdiction of the courts of Portugal, unless otherwise required by mandatory consumer protection law.</p>
      <p><strong>MODIFICATIONS</strong><br>
      We reserve the right to revise these Terms at any time. Updates take effect immediately upon publication. Continued use of the Website constitutes acceptance of the revised Terms.</p>
      <p><strong>CONTACT</strong><br>
      ARMORY GRAYSCVLE<br>
      Email: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a><br>
      Location: Lisbon, Portugal</p>
    `
  },
  pt: {
    "nav.home": "Home",
    "nav.creations": "Criações",
    "nav.cart": "Saco",
    "nav.contact": "Contacto",
    "nav.login": "Login",
    "nav.privacy": "Privacidade",
    "nav.terms": "Termos",
    "nav.general": "Geral",
    "menu.creations": "Criações",
    "menu.contact": "Contacto",
    "menu.lang_en": "EN",
    "menu.lang_pt": "PT",
    "menu.lang_de": "DE",

    "login.eyebrow": "Conta",
    "login.title": "Armory Grayscvle",
    "login.subtitle": "",
    "login.google": "Continuar com Google",
    "login.apple": "Continuar com Apple",
    "login.or": "ou",
    "login.email": "Email",
    "login.password": "Palavra-passe",
    "login.forgot": "Esqueceu-se da palavra-passe?",
    "login.submit": "Entrar",
    "login.create": "Criar conta",

    "cart.eyebrow": "Saco",
    "cart.title": "O seu saco",
    "cart.empty": "O seu saco está vazio.",
    "cart.continue": "Continuar a comprar",
    "cart.returns": "Devoluções e Trocas",

    "contact.eyebrow": "Contacto",
    "contact.headline": "Fale connosco",
    "contact.first": "Nome",
    "contact.last": "Apelido",
    "contact.email": "Email",
    "contact.phone": "Telemóvel",
    "contact.order": "N.º de encomenda",
    "contact.subject": "Assunto",
    "contact.message": "Mensagem",
    "contact.consent": 'Ao clicar em Submeter, reconheço a <a href="privacy.html">Política de Privacidade</a>.',
    "contact.submit": "Submeter",

    "general.body": `
      <p class="info-eyebrow">Geral</p>
      <h1 class="info-headline">Informações</h1>
      <p><strong>Envios &amp; Entregas</strong><br>
      <em>Destinos</em><br>
      A ARMORY GRAYSCVLE envia para países da União Europeia e para destinos internacionais selecionados.<br>
      As encomendas só podem ser entregues numa morada física válida.<br>
      Encomendas com moradas incompletas, inválidas ou fora de serviço podem ser recusadas ou canceladas.<br>
      Não enviamos para apartados, endereços APO/FPO ou serviços de reexpedição.</p>

      <p><em>Tempo de Produção e Processamento</em><br>
      A maioria das peças é feita por encomenda ou em séries limitadas e irrepetíveis.<br>
      Os tempos de produção podem variar e podem ser necessários passos adicionais antes do envio.<br>
      Os prazos estimados começam após o processamento, não no checkout.<br>
      Quando aplicável, os prazos serão comunicados por email.</p>

      <p><em>Custos de Envio</em><br>
      Dependem do destino, valor da encomenda e peso/dimensões.<br>
      Todas as taxas são apresentadas antes da confirmação e são pagas além do preço do produto (IVA incluído quando aplicável).</p>

      <p><em>Tracking</em><br>
      Após expedição, receberá um email com tracking, quando disponível.</p>

      <p><em>Questões de Entrega</em><br>
      Se a encomenda não chegar num prazo razoável após a expedição, contacte-nos de imediato.<br>
      Deve verificar a encomenda no momento da entrega e registar eventuais danos ou discrepâncias junto do transportador sempre que possível.</p>

      <p><strong>Devoluções, Substituições &amp; Trocas</strong><br>
      <em>Política Geral</em><br>
      Operamos com produção limitada e feita por encomenda; as devoluções são desencorajadas e apenas aceites quando exigido pela lei de consumo da UE.</p>

      <p><em>Direito de Livre Resolução (Clientes UE)</em><br>
      Pode existir direito de resolução em 14 dias após a entrega, salvo exceções.<br>
      Este direito não se aplica a peças feitas por encomenda, personalizadas, séries limitadas irrepetíveis ou itens que não possam ser revendidos por motivos de higiene/integridade.</p>

      <p><em>Condições para Devoluções Aceites</em><br>
      Itens sem uso, sem lavagem e no estado/embalagem originais, com prova de compra.<br>
      Reservamo-nos o direito de avaliar o estado antes de aprovar reembolso ou substituição.</p>

      <p><em>Substituições</em><br>
      Quando aplicável, apenas para o mesmo artigo, sujeito a stock. Só é considerada uma substituição por artigo.</p>

      <p><em>Reembolsos</em><br>
      Reembolsos aprovados são emitidos para o mesmo método de pagamento, após receção e inspeção. Não emitimos crédito em loja.</p>

      <p><em>Encomendas Internacionais</em><br>
      Para envios fora da UE, impostos, taxas e encargos são da responsabilidade do cliente, salvo indicação em contrário. Vendas internacionais podem ser finais, conforme a lei local.</p>

      <p><strong>Legal</strong><br>
      <em>Propriedade Intelectual</em><br>
      Todo o conteúdo do site é propriedade exclusiva da ARMORY GRAYSCVLE. Qualquer reprodução, distribuição, modificação ou uso sem autorização é proibido.</p>

      <p><em>Limitação de Quantidades</em><br>
      Podemos limitar quantidades por artigo/encomenda/cliente para preservar a equidade e a integridade de lançamentos limitados. Encomendas que contornem estas limitações podem ser canceladas.</p>

      <p><strong>Contacto</strong><br>
      Para questões sobre encomendas, envios ou legal: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "returns.body": `
      <p class="info-eyebrow">Devoluções</p>
      <h1 class="info-headline">Devoluções &amp; Trocas</h1>
      <p>Cada peça ARMORY GRAYSCVLE é produzida em quantidades limitadas, com intenção e cuidado. Por isso, não seguimos um modelo de devoluções massificado.</p>
      <p>Quando a lei o permite, as compras são consideradas finais.</p>
      <p>Nos termos da lei de consumo da UE, clientes na UE têm 14 dias para resolver compras à distância, salvo exceção. Este direito não se aplica a peças feitas por encomenda, personalizadas ou a séries limitadas irrepetíveis após início de produção (Diretiva 2011/83/EU).</p>
      <p>Encorajamos uma escolha deliberada — incluindo tamanho e silhueta — e estamos disponíveis antes da compra para esclarecer dúvidas.</p>
      <p>Se um artigo chegar com defeito verificado ou se recebeu o artigo errado, contacte-nos para tratarmos da situação com cuidado e discrição.</p>
      <p>Em alguns casos, podem ser consideradas trocas de tamanho, sujeitas a disponibilidade (não garantida).</p>
      <p>ARMORY GRAYSCVLE existe para promover posse consciente — menos peças, escolhidas deliberadamente, para ficar.</p>
      <p>Questões sobre devoluções: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "delivery.body": `
      <p class="info-eyebrow">Envios</p>
      <h1 class="info-headline">Informação de Entrega</h1>
      <p><strong>Destinos</strong><br>
      Enviamos apenas para países da União Europeia.<br>
      O envio internacional poderá ser introduzido futuramente de forma limitada e específica por destino.<br>
      Entregamos apenas em moradas físicas válidas.<br>
      Não enviamos para apartados ou serviços de reexpedição.</p>
      <p><strong>Custos de Envio</strong><br>
      Calculados no checkout consoante destino e peso/dimensão.</p>
      <p><strong>Prazo de Entrega</strong><br>
      Prazos são estimativas e podem variar por processamento, transportadora ou fatores externos.</p>
      <p><strong>Direitos &amp; Taxas</strong><br>
      Impostos ou taxas impostas pelas autoridades locais são responsabilidade do cliente.</p>
      <p>Contactos sobre entregas: <a href="mailto:office@armorygrayscvle.com">office@armorygrayscvle.com</a></p>
    `,

    "privacy.body": `
      <h1 class="info-title">POLÍTICA DE PRIVACIDADE</h1>
      <p><strong>Última revisão: 9 de janeiro de 2026</strong></p>
      <p>Não utilizamos cookies ou tecnologias de rastreamento semelhantes.</p>
      <p>Esta Política de Privacidade explica como a ARMORY GRAYSCVLE recolhe, usa e protege dados pessoais em conformidade com o RGPD e a lei aplicável da UE.</p>
      <p><strong>1. RESPONSÁVEL PELO TRATAMENTO</strong><br>
      ARMORY GRAYSCVLE<br>
      Email: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
      <p><strong>2. DADOS PESSOAIS RECOLHIDOS</strong><br>
      Apenas os necessários para operar o site e cumprir encomendas: Nome; Email; Morada de envio e faturação; Informação de pagamento (processada por terceiros); Histórico de encomendas; Dados técnicos (IP, browser, dispositivo). Não recolhemos dados excessivos.</p>
      <p><strong>3. FINALIDADES</strong><br>
      Processamento e envio de encomendas; Comunicação com o cliente; Processamento de pagamentos; Cumprimento legal e contabilístico; Segurança e funcionamento do site. Não fazemos decisões automatizadas ou perfis.</p>
      <p><strong>4. FUNDAMENTO JURÍDICO</strong><br>
      Necessidade contratual; Obrigações legais; Interesses legítimos (segurança, prevenção de fraude, funcionalidade); Consentimento quando necessário (ex. comunicações opcionais).</p>
      <p><strong>5. PARTILHA DE DADOS</strong><br>
      Apenas com: processadores de pagamento; logística; serviços de TI/hosting. Todos devem cumprir RGPD. Não vendemos nem trocamos dados.</p>
      <p><strong>6. CONSERVAÇÃO</strong><br>
      Apenas pelo tempo necessário para a finalidade ou obrigação legal. Depois, apagamos ou anonimizamos.</p>
      <p><strong>7. OS SEUS DIREITOS</strong><br>
      Aceder, corrigir, apagar, restringir/opor, portabilidade, retirar consentimento (quando aplicável). Pedidos para <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a>.</p>
      <p><strong>8. COOKIES</strong><br>
      Podem ser usados cookies essenciais para funcionalidade/segurança. Cookies não essenciais só com consentimento, conforme lei.</p>
      <p><strong>9. SEGURANÇA</strong><br>
      Medidas técnicas/organizacionais para proteger os dados. Nenhum sistema é totalmente seguro, mas levamos a proteção a sério.</p>
      <p><strong>10. TRANSFERÊNCIAS INTERNACIONAIS</strong><br>
      Se houver transferências fora da UE, aplicam-se garantias adequadas segundo o RGPD.</p>
      <p><strong>11. ALTERAÇÕES</strong><br>
      Podemos atualizar esta política; as alterações são eficazes na publicação.</p>
      <p><strong>12. CONTACTO</strong><br>
      Questões de privacidade ou exercício de direitos: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "terms.body": `
      <h1 class="info-title">TERMOS &amp; CONDIÇÕES</h1>
      <p><strong>Última revisão: 9 de janeiro de 2026</strong></p>
      <p>O site www.armorygrayscvle.com é operado pela ARMORY GRAYSCVLE (“ARMORY GRAYSCVLE”, “nós”).</p>
      <p>Estes Termos regem o acesso e uso do site, incluindo navegação, criação de conta e compra de produtos.</p>
      <p>Ao usar o site, confirma que leu e aceita os Termos; se não concorda, deve cessar o uso.</p>
      <p><strong>USO DO SITE</strong><br>
      Só pode usar o site para fins lícitos. É proibido qualquer uso que afete a integridade, segurança ou funcionamento do site.<br>
      Podemos restringir ou terminar o acesso, incluindo contas, para proteger o site, a marca ou os utilizadores.</p>
      <p><strong>CONTAS</strong><br>
      Algumas funções exigem conta. É responsável por toda a atividade e por manter as credenciais confidenciais.<br>
      Não somos responsáveis por perdas ou acessos não autorizados resultantes de falta de proteção das credenciais.</p>
      <p><strong>PRODUTOS, PRODUÇÃO, DISPONIBILIDADE</strong><br>
      Produtos em quantidades limitadas; muitos são feitos por encomenda ou personalizados.<br>
      Algumas coleções são irrepetíveis; após início de produção ou fecho de drop, podem não ser reproduzidas.<br>
      Disponibilidade não é garantida e pode mudar sem aviso.</p>
      <p><strong>PREÇOS E PAGAMENTO</strong><br>
      Preços em EUR (€), IVA incluído salvo indicação. Podem mudar sem aviso. Encomendas só são aceites após pagamento integral.<br>
      Podemos corrigir erros de preço e cancelar encomendas com preço incorreto; se pago, será reembolsado.</p>
      <p><strong>REPRESENTAÇÃO DE PRODUTO</strong><br>
      Esforçamo-nos por mostrar os produtos com precisão, mas devido a produção artesanal e séries limitadas podem existir variações de cor, textura, acabamento e medidas (aproximadas). Ajustes de ecrã podem afetar a visualização. Estas variações não constituem defeito.</p>
      <p><strong>ENVIO E ENTREGA</strong><br>
      Enviamos na UE e, quando aplicável, internacionalmente.<br>
      Prazos de entrega são estimativas e podem sofrer atrasos de transportadoras, alfândegas ou fatores externos.<br>
      Taxas alfandegárias/impostos fora do controlo da ARMORY GRAYSCVLE são do cliente.<br>
      O risco transfere para o cliente quando a encomenda é entregue ao transportador.</p>
      <p><strong>DIREITO DE LIVRE RESOLUÇÃO &amp; DEVOLUÇÕES (UE)</strong><br>
      Clientes UE podem ter direito de resolução em 14 dias após entrega, salvo exceções.<br>
      Não se aplica a peças feitas por encomenda/personalizadas ou séries limitadas irrepetíveis após início de produção.<br>
      Onde aplicável, condições e procedimentos constam da nossa política de devoluções.<br>
      Devido à produção intencional e limitada, as devoluções são desencorajadas na medida da lei.</p>
      <p><strong>CÓDIGOS DE ACESSO E LANÇAMENTOS PRIVADOS</strong><br>
      Códigos/invites são discricionários; não podem ser partilhados, vendidos ou tornados públicos e podem ser revogados. Possuir um código não garante disponibilidade.</p>
      <p><strong>PROPRIEDADE INTELECTUAL</strong><br>
      Todo o conteúdo do site é propriedade da ARMORY GRAYSCVLE ou licenciantes e protegido por lei. Não pode ser copiado, reproduzido, modificado ou distribuído sem autorização.</p>
      <p><strong>CONDUTA PROIBIDA</strong><br>
      Não pode: aceder a áreas restritas; usar bots/scrapers; interferir com a segurança/operacionalidade; usar para fins ilícitos ou abusivos. Uso não autorizado pode levar ao bloqueio e ação legal.</p>
      <p><strong>EXCLUSÃO DE GARANTIAS</strong><br>
      O site e conteúdos são fornecidos “TAL COMO ESTÃO”. Não damos garantias de disponibilidade, exatidão ou adequação.</p>
      <p><strong>LIMITAÇÃO DE RESPONSABILIDADE</strong><br>
      Na medida permitida por lei, não somos responsáveis por danos indiretos, incidentais ou consequenciais relacionados com o uso do site ou produtos.<br>
      A responsabilidade total não excederá o montante pago pelo produto em causa.<br>
      Nada limita direitos de consumidor irrenunciáveis.</p>
      <p><strong>LEI APLICÁVEL</strong><br>
      Lei portuguesa; foro de Portugal, salvo disposição imperativa de proteção do consumidor.</p>
      <p><strong>ALTERAÇÕES</strong><br>
      Podemos rever estes Termos a qualquer momento; tornam-se eficazes na publicação. O uso continuado implica aceitação.</p>
      <p><strong>CONTACTO</strong><br>
      ARMORY GRAYSCVLE<br>
      Email: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a><br>
      Localização: Lisboa, Portugal</p>
    `
  },
  de: {
    "nav.home": "Home",
    "nav.creations": "Kreationen",
    "nav.cart": "Tasche",
    "nav.contact": "Kontakt",
    "nav.login": "Login",
    "nav.privacy": "Datenschutz",
    "nav.terms": "AGB",
    "nav.general": "Allgemein",
    "menu.creations": "Kreationen",
    "menu.contact": "Kontakt",
    "menu.lang_en": "EN",
    "menu.lang_pt": "PT",
    "menu.lang_de": "DE",

    "login.eyebrow": "Konto",
    "login.title": "Armory Grayscvle",
    "login.subtitle": "",
    "login.google": "Weiter mit Google",
    "login.apple": "Weiter mit Apple",
    "login.or": "oder",
    "login.email": "Email",
    "login.password": "Passwort",
    "login.forgot": "Passwort vergessen?",
    "login.submit": "Anmelden",
    "login.create": "Konto anlegen",

    "cart.eyebrow": "Tasche",
    "cart.title": "Ihre Tasche",
    "cart.empty": "Ihre Tasche ist leer.",
    "cart.continue": "Weiter einkaufen",
    "cart.returns": "Rueckgabe & Umtausch",

    "contact.eyebrow": "Kontakt",
    "contact.headline": "Kontakt aufnehmen",
    "contact.first": "Vorname",
    "contact.last": "Nachname",
    "contact.email": "Email",
    "contact.phone": "Telefon",
    "contact.order": "Bestellnummer",
    "contact.subject": "Betreff",
    "contact.message": "Nachricht",
    "contact.consent": 'Mit Senden bestätige ich die <a href="privacy.html">Datenschutzrichtlinie</a>.',
    "contact.submit": "Senden",

    "general.body": `
      <p class="info-eyebrow">Allgemein</p>
      <h1 class="info-headline">Information</h1>
      <p><strong>VERSAND &amp; LIEFERUNG</strong><br>
      <em>Gebiete</em><br>
      ARMORY GRAYSCVLE liefert innerhalb der EU und zu ausgewaehlten internationalen Zielen.<br>
      Nur physische Adressen; keine Postfaecher, APO/FPO oder Weiterleitungsdienste.</p>

      <p><em>Fertigung &amp; Verarbeitung</em><br>
      Viele Stuecke sind Made-to-Order oder in knappen Serien.<br>
      Zeiten koennen variieren; Laufzeiten beginnen erst nach Verarbeitung.</p>

      <p><em>Versandkosten</em><br>
      Abhaengig von Ziel, Warenwert, Gewicht und Abmessungen.<br>
      Alle Gebuehren werden vor Bestaetigung gezeigt; Preise enthalten MwSt., wo anwendbar.</p>

      <p><em>Tracking</em><br>
      Nach Versand erhalten Sie, sofern verfuegbar, eine Tracking-Info per Email.</p>

      <p><em>Lieferprobleme</em><br>
      Wenn eine Sendung verzoegert, melden Sie sich zeitnah.<br>
      Pruefen Sie die Lieferung bei Erhalt; sichtbare Schaeden oder Abweichungen beim Zusteller notieren, wenn moeglich.</p>

      <p><strong>RUECKGABEN, ERSATZ &amp; UMTAUSCH</strong><br>
      <em>Grundsatz</em><br>
      Wir arbeiten bewusst und limitiert; Rueckgaben sind ungern gesehen und nur, wenn gesetzlich gefordert.</p>

      <p><em>Widerruf (EU)</em><br>
      EU-Kunden koennen, soweit anwendbar, binnen 14 Tagen widerrufen, ausser bei Ausnahmen.<br>
      Kein Widerruf bei Sonderanfertigungen, personalisierten Stuecken oder limitierten Serien nach Produktionsstart.</p>

      <p><em>Bedingungen</em><br>
      Artikel ungetragen, ungewaschen, im Originalzustand und mit Kaufnachweis.<br>
      Wir pruefen den Zustand vor Rueckerstattung oder Ersatz.</p>

      <p><em>Erstattungen</em><br>
      Erfolgen auf die urspruengliche Zahlungsart nach Eingang und Pruefung.</p>

      <p><em>Internationale Bestellungen</em><br>
      Zusaetzliche Zoelle/Steuern/Abgaben liegen beim Kunden, sofern nicht anders genannt.<br>
      Internationale Verkaeufe koennen final sein, vorbehaltlich lokalen Rechts.</p>

      <p><strong>RECHTLICHES</strong><br>
      <em>Geistiges Eigentum</em><br>
      Saemtliche Inhalte gehoeren ARMORY GRAYSCVLE. Reproduktion oder Nutzung ohne Zustimmung ist untersagt.</p>

      <p><em>Mengenlimits</em><br>
      Wir koennen Mengen pro Artikel/Bestellung/Kunde begrenzen, um Fairness und Integritaet zu wahren. Versuche zur Umgehung koennen storniert werden.</p>

      <p><strong>KONTAKT</strong><br>
      Anfragen zu Bestellungen, Versand oder Recht:<br>
      <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "returns.body": `
      <p class="info-eyebrow">Rueckgaben</p>
      <h1 class="info-headline">Rueckgabe &amp; Umtausch</h1>
      <p>Jedes Stueck ist limitiert und bedacht gefertigt. Massen-Retouren gehoeren nicht zu unserem Modell.</p>
      <p>Soweit rechtlich zulaessig, gelten Kauefe als final.</p>
      <p>EU-Kunden haben, wenn keine Ausnahme greift, 14 Tage Widerrufsrecht. Nicht anwendbar auf Sonderanfertigungen, personalisierte Stuecke oder limitierte Serien nach Produktionsstart.</p>
      <p>Wir bitten um bewusste Auswahl vor dem Kauf. Wir beraten vorab gern.</p>
      <p>Bei nachweislichem Mangel oder falscher Lieferung loesen wir den Fall diskret.</p>
      <p>Groessentausch nur ausnahmsweise und nur bei Verfuegbarkeit.</p>
      <p>ARMORY GRAYSCVLE steht fuer bewusstes Besitzen — weniger, gezielt, zum Behalten.</p>
      <p>Rueckgabeanfragen:<br><a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "privacy.body": `
      <h1 class="info-title">DATENSCHUTZ</h1>
      <p><strong>Letzte Aktualisierung: 9. Januar 2026</strong></p>
      <p>Wir nutzen keine Cookies oder aehnliche Tracking-Technologien.</p>
      <p>Diese Richtlinie erklaert, wie ARMORY GRAYSCVLE personenbezogene Daten gemaess DSGVO verarbeitet.</p>
      <p><strong>1. VERANTWORTLICHER</strong><br>
      ARMORY GRAYSCVLE<br>
      Email: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
      <p><strong>2. DATEN</strong><br>
      Wir erfassen nur, was fuer Betrieb und Bestellungen noetig ist: Name, Email, Liefer- und Rechnungsadresse, zahlungsbezogene Infos (ueber Drittanbieter), Bestellhistorie, technische Daten (IP, Browser, Geraet). Keine ueberfluessigen Daten.</p>
      <p><strong>3. ZWECKE</strong><br>
      Bestellabwicklung, Kommunikation, Zahlung, rechtliche Pflichten, Sicherheit. Keine Profilbildung.</p>
      <p><strong>4. RECHTSGRUNDLAGEN</strong><br>
      Vertrag, gesetzliche Pflichten, berechtigtes Interesse (Sicherheit, Betrugsschutz, Funktion), Einwilligung wo noetig.</p>
      <p><strong>5. WEITERGABE</strong><br>
      Nur an Zahlungsdienstleister, Versand/Logistik, IT/Hosting. Keine Datenverkaeufe.</p>
      <p><strong>6. AUFBEWAHRUNG</strong><br>
      Nur solange erforderlich oder gesetzlich vorgeschrieben; danach Loeschung oder Anonymisierung.</p>
      <p><strong>7. RECHTE</strong><br>
      Auskunft, Berichtigung, Loeschung (soweit anwendbar), Einschraenkung/Widerspruch, Datenuebertragbarkeit, Widerruf von Einwilligungen. Anfragen an <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a>.</p>
      <p><strong>8. COOKIES</strong><br>
      Wir setzen nur notwendige Cookies fuer Funktion/Sicherheit ein. Keine optionalen Cookies ohne Einwilligung.</p>
      <p><strong>9. SICHERHEIT</strong><br>
      Technische und organisatorische Schutzmassnahmen; kein System ist perfekt, aber Schutz hat Prioritaet.</p>
      <p><strong>10. DATENTRANSFER</strong><br>
      Bei Uebermittlungen ausserhalb der EU nutzen wir DSGVO-konforme Sicherungen.</p>
      <p><strong>11. AENDERUNGEN</strong><br>
      Anpassungen treten mit Veroeffentlichung in Kraft.</p>
      <p><strong>12. KONTAKT</strong><br>
      Datenschutzanfragen an <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a></p>
    `,

    "terms.body": `
      <h1 class="info-title">AGB</h1>
      <p><strong>Letzte Aktualisierung: 9. Januar 2026</strong></p>
      <p>www.armorygrayscvle.com wird von ARMORY GRAYSCVLE betrieben.</p>
      <p>Diese Bedingungen regeln Nutzung, Konto und Kauefe.</p>
      <p><strong>NUTZUNG</strong><br>
      Nur rechtmaessige Nutzung. Keine Stoerung von Integritaet, Sicherheit oder Betrieb. Wir koennen Zugriff sperren, wenn noetig.</p>
      <p><strong>KONTO</strong><br>
      Sie sichern Ihre Zugangsdaten. Verantwortung fuer alle Aktionen im Konto.</p>
      <p><strong>PRODUKTE</strong><br>
      Limitierte Stuecke, oft auf Bestellung oder personalisiert. Verfuegbarkeit kann jederzeit aendern; kein Anspruch auf Restock.</p>
      <p><strong>PREISE &amp; ZAHLUNG</strong><br>
      Preise in EUR inkl. MwSt. (sofern angegeben). Aenderungen ohne Vorankuendigung moeglich. Bestellung gilt erst nach Zahlungseingang. Preisfehler koennen korrigiert und Bestellungen storniert werden; gezahlte Betraege werden erstattet.</p>
      <p><strong>DARSTELLUNG</strong><br>
      Wir zeigen Produkte moeglichst exakt, doch handwerkliche Fertigung und limitierte Serien bedeuten Variationen in Farbe, Textur, Finish, Mass. Screens koennen Darstellung beeinflussen. Diese Abweichungen sind kein Mangel.</p>
      <p><strong>VERSAND</strong><br>
      Versand in der EU und selektiv international. Lieferzeiten sind Schaetzungen. Verzoegerungen durch Carrier/Zoll/Fremdfaktoren liegen ausserhalb unserer Kontrolle. Bei internationalen Bestellungen traegt der Kunde Zoelle und Steuern. Risiko geht mit Uebergabe an den Carrier auf den Kunden ueber.</p>
      <p><strong>WIDERRUF &amp; RUECKGABE (EU)</strong><br>
      EU-Kunden koennen binnen 14 Tagen widerrufen, sofern keine Ausnahme. Kein Widerruf bei Auftragsarbeiten, personalisierten Stuecken oder limitierten Serien nach Produktionsstart. Bedingungen stehen in der Rueckgaberichtlinie. Rueckgaben bleiben auf das gesetzliche Minimum beschraenkt.</p>
      <p><strong>ZUGANGSCODES</strong><br>
      Codes/Einladungen sind diskretionaer, nicht uebertragbar, koennen jederzeit entzogen werden. Kein Anspruch auf Verfuegbarkeit.</p>
      <p><strong>GEISTIGES EIGENTUM</strong><br>
      Alle Inhalte gehoeren ARMORY GRAYSCVLE oder Lizenzgebern. Keine Nutzung ohne schriftliche Zustimmung.</p>
      <p><strong>VERBOTENE HANDLUNGEN</strong><br>
      Kein Zugriff auf geschuetzte Bereiche, keine Bots/Scraper, keine Stoerung der Sicherheit oder missbraeuchliche Nutzung. Verstoss kann Sperre und rechtliche Schritte nach sich ziehen.</p>
      <p><strong>HAFTUNGSAUSSCHLUSS</strong><br>
      Website und Inhalte werden "WIE BESEHEN" bereitgestellt. Keine Zusicherungen zur Verfuegbarkeit, Genauigkeit oder Eignung.</p>
      <p><strong>HAFTUNGSBEGRENZUNG</strong><br>
      Soweit zulaessig keine Haftung fuer indirekte, beilaufige oder Folgeschaeden. Gesamthaftung hoechstens der gezahlte Betrag fuer den betroffenen Artikel. Zwingende Verbraucherrechte bleiben unberuehrt.</p>
      <p><strong>RECHTSWAHL</strong><br>
      Portugiesisches Recht; Gerichtsstand Portugal, soweit zwingendes Verbraucherschutzrecht nichts anderes vorgibt.</p>
      <p><strong>AENDERUNGEN</strong><br>
      Wir koennen diese Bedingungen anpassen; Wirksamkeit mit Veroeffentlichung. Fortgesetzte Nutzung gilt als Zustimmung.</p>
      <p><strong>KONTAKT</strong><br>
      ARMORY GRAYSCVLE<br>
      Email: <a href="mailto:customercare@armorygrayscvle.com">customercare@armorygrayscvle.com</a><br>
      Standort: Lissabon, Portugal</p>
    `
  }
};

function applyTranslations(lang = "en") {
  const dict = translations[lang] || translations.en;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = dict[key] || translations.en[key];
    if (val) el.textContent = val;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const val = dict[key] || translations.en[key];
    if (val) el.innerHTML = val;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = dict[key] || translations.en[key];
    if (val) el.placeholder = val;
  });
}

function getSavedLocale() {
  try {
    return localStorage.getItem(LOCALE_KEY);
  } catch (err) {
    return null;
  }
}

function getCurrentLocaleFromPage() {
  return getLocaleFromPath();
}

function getBasePageName() {
  return getBaseFromPath();
}

function hasLocalePair() {
  return true;
}

function handleLegacyRedirect() {
  const file = (window.location.pathname.split("/").pop() || "").toLowerCase().replace(/\.html$/, "");
  if (LEGACY_REDIRECTS[file]) {
    window.location.replace(LEGACY_REDIRECTS[file]);
  }
}

function buildLocaleHref(targetLocale = "en") {
  const base = getBasePageName();
  return `/${targetLocale}/${base}.html`;
}

function rewriteHrefForLocale(href = "", lang = "en") {
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  const [pathAndQuery, hash] = href.split("#");
  const [path, query] = pathAndQuery.split("?");
  const normalized = path.replace(/^\/(en|pt|de)\//i, "/").replace(/-(pt|de)(?=\.html$)/i, ".html");
  const match = normalized.match(/^\/?([a-z0-9_-]+)\.html$/i);
  const base = match ? match[1].toLowerCase() : "index";
  if (!localePathExists(base)) return href;
  const newPath = `/${lang}/${base}.html${query ? `?${query}` : ""}`;
  return hash ? `${newPath}#${hash}` : newPath;
}

function rewriteLocaleLinks(lang = "en") {
  document.querySelectorAll("a[href]").forEach((anchor) => {
    const original = anchor.getAttribute("href") || "";
    const updated = rewriteHrefForLocale(original, lang);
    if (updated !== original) {
      anchor.setAttribute("href", updated);
    }
  });
}

function enforceLocaleOnLoad() {
  const saved = getSavedLocale();
  if (!saved) return;
  const current = getCurrentLocaleFromPage();
  if (saved !== current) {
    const base = getBasePageName();
    if (!localePathExists(base)) return;
    window.location.replace(buildLocaleHref(saved));
  }
}

enforceLocaleOnLoad();
handleLegacyRedirect();

function updateLocaleButtons(lang = "en") {
  localeButtons.forEach((btn) => {
    const btnLocale = btn.getAttribute("data-locale") || "en";
    btn.classList.toggle("locale-active", btnLocale === lang);
  });
}

function handleLocaleSwitch(targetLocale = "en") {
  const lang = targetLocale === "pt" ? "pt" : targetLocale === "de" ? "de" : "en";
  try {
    localStorage.setItem(LOCALE_KEY, lang);
  } catch (err) {
    /* ignore */
  }
  updateLocaleButtons(lang);
  try {
    rewriteLocaleLinks(lang);
    const base = getBasePageName();
    if (localePathExists(base)) {
      window.location.replace(resolveLocaleHref(base, lang));
      return;
    }
    if (window.i18n && typeof window.i18n.setLang === "function") {
      window.i18n.setLang(lang);
    } else {
      applyTranslations(lang);
    }
  } catch (err) {
    applyTranslations(lang);
  }
}

const initialLocale = getSavedLocale() || getCurrentLocaleFromPage() || "en";
updateLocaleButtons(initialLocale);
rewriteLocaleLinks(initialLocale);
applyTranslations(initialLocale);

if (localeButtons.length) {
  localeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const locale = btn.getAttribute("data-locale") || "en";
      handleLocaleSwitch(locale);
    });
  });
}

/* FAB MENU TOGGLE */
const fabStack = document.querySelector(".ch-fab-stack");

/* SAVE / WISHLIST */
const SAVED_KEY = "savedItems";

function loadSavedItems() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function persistSavedItems(items) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  } catch (err) {
    /* ignore */
  }
}

function isSavedItem(id) {
  const list = loadSavedItems();
  return list.some((item) => item.id === id);
}

function toggleSavedItem(data) {
  const list = loadSavedItems();
  const existingIndex = list.findIndex((item) => item.id === data.id);
  if (existingIndex >= 0) {
    list.splice(existingIndex, 1);
  } else {
    list.push(data);
  }
  persistSavedItems(list);
  updateSavedIcons();
  renderSavedPage();
}

function updateSavedIcons() {
  const savedNow = loadSavedItems();
  const ids = new Set(savedNow.map((item) => item.id));
  document.querySelectorAll(".saved-toggle, .saved-link").forEach((btn) => {
    const id = btn.getAttribute("data-item-id");
    if (!id) return;
    btn.classList.toggle("saved-active", ids.has(id));
    btn.textContent = ids.has(id) ? "Saved" : "Add to wishlist";
  });
}

/* SEARCH TOGGLE */
const searchToggle = document.querySelectorAll(".search-toggle");
searchToggle.forEach((btn) => {
  btn.addEventListener("click", () => {
    const inline = btn.parentElement?.querySelector(".search-inline");
    if (inline) {
      inline.classList.toggle("open");
      const input = inline.querySelector("input");
      if (inline.classList.contains("open") && input) input.focus();
    }
  });
});

/* CART UI + TOAST */
const checkoutPage = "checkout.html";

// Build toast once
const toastBackdrop = document.createElement("div");
toastBackdrop.className = "cart-toast-backdrop";
toastBackdrop.innerHTML = `
  <div class="cart-toast" role="dialog" aria-live="polite">
    <div class="cart-toast-img">
      <img data-toast-image src="" alt="Item added" />
    </div>
    <div class="cart-toast-message">
      <div>Item added to your cart</div>
      <div class="cart-toast-name" data-toast-name></div>
    </div>
    <div class="cart-toast-actions">
      <button type="button" data-toast-checkout>Checkout</button>
      <button type="button" data-toast-view>View Cart</button>
      <button type="button" data-toast-continue>Continue Shopping</button>
    </div>
    <div class="cart-toast-close" data-toast-close>Close</div>
  </div>
`;
document.body.appendChild(toastBackdrop);

const toastImage = toastBackdrop.querySelector("[data-toast-image]");
const toastName = toastBackdrop.querySelector("[data-toast-name]");
const toastCheckout = toastBackdrop.querySelector("[data-toast-checkout]");
const toastView = toastBackdrop.querySelector("[data-toast-view]");
const toastContinue = toastBackdrop.querySelector("[data-toast-continue]");
const toastClose = toastBackdrop.querySelector("[data-toast-close]");
let toastHideTimer;

function hideCartToast() {
  toastBackdrop.classList.remove("active");
}

function showCartToast(item = {}) {
  const imgSrc = item.image || item.imagePath || item?.item?.image || "";
  const name = item.name || item?.item?.name || "Item";

  if (toastImage) {
    if (imgSrc) {
      toastImage.src = imgSrc;
      toastImage.style.visibility = "visible";
    } else {
      toastImage.removeAttribute("src");
      toastImage.style.visibility = "hidden";
    }
  }
  if (toastName) toastName.textContent = name;

  toastBackdrop.classList.add("active");
  clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(hideCartToast, 4500);
}

toastBackdrop.addEventListener("click", (e) => {
  if (e.target === toastBackdrop) {
    hideCartToast();
  }
});

[toastContinue, toastClose].forEach((el) => {
  if (el) {
    el.addEventListener("click", hideCartToast);
  }
});

if (toastCheckout) {
  toastCheckout.addEventListener("click", () => {
    window.location.href = checkoutPage;
  });
}

if (toastView) {
  toastView.addEventListener("click", () => {
    window.location.href = "cart.html";
    hideCartToast();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && toastBackdrop.classList.contains("active")) {
    hideCartToast();
  }
});

function initSnipcartBindings(attempt = 0) {
  const maxAttempts = 25;
  if (!window.Snipcart || !window.Snipcart.events) {
    if (attempt < maxAttempts) {
      setTimeout(() => initSnipcartBindings(attempt + 1), 400);
    }
    return;
  }

  const { events } = window.Snipcart;

  if (events?.on) {
    events.on("item.added", (item) => {
      showCartToast(item);
    });
    events.on("cart.confirmed", resetCheckoutButtons);
    events.on("cart.closed", resetCheckoutButtons);
    events.on("cart.canceled", resetCheckoutButtons);
  }
}

initSnipcartBindings();
renderSavedPage();
renderCartPage();
bindCartLiveUpdates();
bindCartButtons();
enforceShippingRules();
renderProductPage();

/* PRODUCT DETAIL PAGE */
async function renderProductPage() {
  const detail = document.getElementById("product-detail");
  const gallery = document.getElementById("product-gallery");
  if (!detail || !gallery) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) {
    detail.innerHTML = `<p class="products-empty">Product unavailable.</p>`;
    return;
  }

  try {
    const res = await fetch("products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch failed");
    const products = await res.json();
    const product = Array.isArray(products)
      ? products.find((p) => buildItemId(p) === productId)
      : null;

    if (!product) {
      detail.innerHTML = `<p class="products-empty">Product unavailable.</p>`;
      return;
    }

    const itemId = buildItemId(product);
    const itemPrice = formatPrice(product.price);
    const primaryImage =
      (Array.isArray(product.images) && product.images.length && product.images[0]) ||
      product.image ||
      "";

    gallery.innerHTML = "";
    const img = document.createElement("img");
    img.src = primaryImage;
    img.alt = product.name || "Product image";
    gallery.appendChild(img);

    detail.innerHTML = "";
    const title = document.createElement("h1");
    title.className = "product-detail-title";
    title.textContent = product.name || "";

    const price = document.createElement("p");
    price.className = "product-detail-price";
    price.textContent = product.price || "";

    const desc = document.createElement("p");
    desc.className = "product-detail-desc";
    desc.textContent = product.description || "";

    const actions = document.createElement("div");
    actions.className = "product-detail-actions";

    const addBtn = document.createElement("button");
    addBtn.className = "snipcart-add-item";
    addBtn.textContent = "Add to bag";
    addBtn.setAttribute("data-item-id", itemId);
    addBtn.setAttribute("data-item-name", product.name || "Product");
    addBtn.setAttribute("data-item-price", itemPrice);
    addBtn.setAttribute("data-item-currency", "EUR");
    addBtn.setAttribute("data-item-url", buildStoreUrl(window.location.pathname || "/"));
    addBtn.setAttribute("data-item-description", product.description || "");
    addBtn.setAttribute("data-item-image", primaryImage);

    const savedBtn = document.createElement("button");
    savedBtn.type = "button";
    savedBtn.className = "saved-toggle saved-link";
    savedBtn.setAttribute("aria-label", "Add to wishlist");
    savedBtn.setAttribute("data-item-id", itemId);
    savedBtn.setAttribute("data-item-name", product.name || "");
    savedBtn.setAttribute("data-item-price", itemPrice);
    savedBtn.setAttribute("data-item-image", primaryImage);
    savedBtn.textContent = "Add to wishlist";
    savedBtn.addEventListener("click", () => {
      toggleSavedItem({
        id: itemId,
        name: product.name || "Saved item",
        price: product.price || "",
        numericPrice: itemPrice,
        image: primaryImage || "",
      });
    });

    actions.append(addBtn, savedBtn);
    detail.append(title, price, desc, actions);
    updateSavedIcons();
  } catch (err) {
    detail.innerHTML = `<p class="products-empty">Product unavailable.</p>`;
  }
}

/* SAVED PAGE RENDER */
function renderSavedPage() {
  const savedListEl = document.getElementById("saved-list");
  const emptyEl = document.getElementById("saved-empty");
  if (!savedListEl || !emptyEl) return;

  const savedItems = loadSavedItems();
  if (!savedItems.length) {
    savedListEl.innerHTML = "";
    emptyEl.style.display = "flex";
    return;
  }

  emptyEl.style.display = "none";
  savedListEl.innerHTML = "";

  savedItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "saved-card";

    const link = document.createElement("a");
    link.href = `product.html?id=${item.id}`;
    link.className = "product-link";

    const imgWrap = document.createElement("div");
    imgWrap.className = "saved-image";
    const img = document.createElement("img");
    img.src = item.image || "";
    img.alt = item.name || "Saved item";
    imgWrap.appendChild(img);
    link.appendChild(imgWrap);

    const meta = document.createElement("div");
    meta.className = "saved-meta";
    const title = document.createElement("h3");
    title.className = "saved-name";
    title.textContent = item.name || "";
    const titleLink = document.createElement("a");
    titleLink.href = `product.html?id=${item.id}`;
    titleLink.className = "product-link";
    titleLink.appendChild(title);
    const price = document.createElement("p");
    price.className = "saved-price";
    price.textContent = item.price || "";
    meta.append(titleLink, price);

    const actions = document.createElement("div");
    actions.className = "saved-actions";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "saved-action-link";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      toggleSavedItem({ id: item.id });
    });

    const add = document.createElement("button");
    add.type = "button";
    add.className = "saved-action-button";
    add.textContent = "Add to bag";
    add.addEventListener("click", async () => {
      try {
        await ensureSnipcartReady();
        await window.Snipcart.api.cart.items.add({
          id: item.id,
          name: item.name || "Saved item",
          price: item.numericPrice || formatPrice(item.price || "0"),
          url: buildStoreUrl(window.location.pathname || "/"),
          image: item.image || "",
        });
      } catch (err) {
        /* silent */
      }
    });

    actions.append(add, remove);

    card.append(link, meta, actions);
    savedListEl.appendChild(card);
  });
}

/* CART PAGE RENDER */
async function ensureSnipcartReady(attempt = 0) {
  const maxAttempts = 40;
  if (window.Snipcart && window.Snipcart.api && window.Snipcart.api.cart) {
    return;
  }
  if (attempt >= maxAttempts) throw new Error("Snipcart not ready");
  await new Promise((res) => setTimeout(res, 250));
  return ensureSnipcartReady(attempt + 1);
}

async function renderCartPage() {
  const cartWrap = document.getElementById("cart-page");
  const emptyEl = document.getElementById("cart-empty");
  const filledEl = document.getElementById("cart-filled");
  const itemsEl = document.getElementById("cart-items");
  const summaryEl = document.getElementById("cart-summary");
  if (!cartWrap || !emptyEl || !filledEl || !itemsEl || !summaryEl) return;

  try {
    await ensureSnipcartReady();
    const cart = await window.Snipcart.api.cart.get();
    const items = Array.isArray(cart?.items) ? cart.items : [];

    if (!items.length) {
      emptyEl.style.display = "flex";
      filledEl.style.display = "none";
      return;
    }

    emptyEl.style.display = "none";
    filledEl.style.display = "grid";
    itemsEl.innerHTML = "";
    let subtotal = 0;

    items.forEach((item) => {
      const priceNum = parseFloat(item.price || 0);
      subtotal += priceNum * (item.quantity || 1);

      const row = document.createElement("article");
      row.className = "cart-item-row";

      const imgWrap = document.createElement("div");
      imgWrap.className = "cart-item-image";
      const img = document.createElement("img");
      img.src = item.image || "";
      img.alt = item.name || "Cart item";
      imgWrap.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "cart-item-meta";
      const title = document.createElement("div");
      title.className = "cart-item-title";
      title.textContent = item.name || "";
      const variant = document.createElement("div");
      variant.className = "cart-item-variant";
      variant.textContent = item.customFields
        ? Object.values(item.customFields).join(" · ")
        : "";

      const price = document.createElement("div");
      price.className = "cart-item-price";
      price.textContent = item.price ? `€${formatPrice(item.price)}` : "";
      meta.append(title, variant, price);

      const controls = document.createElement("div");
      controls.className = "cart-item-controls";

      const qtyWrap = document.createElement("div");
      qtyWrap.className = "cart-qty";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "–";
      minus.addEventListener("click", () => updateCartItem(item, Math.max(0, (item.quantity || 1) - 1)));
      const qty = document.createElement("span");
      qty.textContent = item.quantity || 1;
      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.addEventListener("click", () => updateCartItem(item, (item.quantity || 1) + 1));
      qtyWrap.append(minus, qty, plus);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => removeCartItem(item));

      controls.append(qtyWrap, remove);

      row.append(imgWrap, meta, controls);
      itemsEl.appendChild(row);
    });

  const shippingNote = cart?.summary?.shipping || "";
  const total = cart?.summary?.total || subtotal;
  summaryEl.innerHTML = `
    <div class="summary-row">
      <span>Subtotal</span>
      <span>€${formatPrice(subtotal)}</span>
    </div>
    <div class="summary-row summary-note">${shippingNote || "Shipping calculated at checkout. We currently ship within EU member states only. Prices shown include VAT where applicable."}</div>
    <div class="summary-row summary-total">
      <span>Total</span>
      <span>€${formatPrice(total)}</span>
    </div>
    <button class="summary-checkout snipcart-checkout" type="button">Checkout</button>
  `;
    guardCheckoutTriggers();
  } catch (err) {
    if (cartWrap) {
      cartWrap.innerHTML = `<p class="products-empty">Cart unavailable. Try again.</p>`;
    }
  }
}

async function updateCartItem(item, quantity) {
  try {
    await ensureSnipcartReady();
    if (quantity <= 0) {
      await window.Snipcart.api.cart.items.remove(item.uniqueId || item.id);
    } else {
      await window.Snipcart.api.cart.items.update({
        uniqueId: item.uniqueId || item.id,
        quantity,
      });
    }
    renderCartPage();
  } catch (err) {
    /* silent */
  }
}

async function removeCartItem(item) {
  try {
    await ensureSnipcartReady();
    await window.Snipcart.api.cart.items.remove(item.uniqueId || item.id);
    renderCartPage();
  } catch (err) {
    /* silent */
  }
}

/* CART BUTTONS */
function bindCartButtons(attempt = 0) {
  const buttons = document.querySelectorAll("[data-open-cart]");
  if (!buttons.length) return;

  const handler = async (e) => {
    e.preventDefault();
    try {
      await ensureSnipcartReady();
      if (window.Snipcart?.api?.theme?.cart?.open) {
        window.Snipcart.api.theme.cart.open();
        return;
      }
    } catch (err) {
      /* fall back */
    }
    window.location.href = "cart.html";
  };

  buttons.forEach((btn) => {
    btn.removeEventListener("click", handler);
    btn.addEventListener("click", handler);
  });
}

function bindCartLiveUpdates() {
  const cartWrap = document.getElementById("cart-page");
  if (!cartWrap) return;
  ensureSnipcartReady()
    .then(() => {
      const events = window.Snipcart?.events;
      if (!events?.on) return;
      ["item.added", "item.updated", "item.removed", "cart.confirmed", "cart.canceled"].forEach((evt) => {
        events.on(evt, renderCartPage);
      });
    })
    .catch(() => {});
}

/* PRODUCTS */
const STORE_BASE_URL = "https://armorygrayscvle.com/";

function buildStoreUrl(path = "/") {
  try {
    return new URL(path || "/", STORE_BASE_URL).href;
  } catch (err) {
    return STORE_BASE_URL;
  }
}

function formatPrice(value) {
  const numeric = parseFloat(String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) return "0.00";
  return numeric.toFixed(2);
}

function buildItemId(product) {
  const base = product?.id || product?.name || "product";
  const cleaned = String(base).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "product";
}

const productList = document.getElementById("product-list");

async function loadProducts() {
  if (!productList) return;

  try {
    const res = await fetch("products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch failed");
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      productList.innerHTML = `<p class="products-empty">Products will appear here.</p>`;
      return;
    }

    productList.innerHTML = "";
    products.forEach((product) => {
      const card = document.createElement("section");
      card.className = "product-card";
      card.setAttribute("data-item-id", buildItemId(product));

      const link = document.createElement("a");
      link.href = `product.html?id=${buildItemId(product)}`;
      link.className = "product-link";

      const imageWrap = document.createElement("div");
      imageWrap.className = "product-image";
      const frame = document.createElement("div");
      frame.className = "product-image-frame";
      const img = document.createElement("img");
      const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
      img.src = images[0];
      img.alt = product.name || "Product image";
      frame.appendChild(img);
      imageWrap.appendChild(frame);

      const meta = document.createElement("div");
      meta.className = "product-meta";

      const name = document.createElement("h3");
      name.className = "product-name";
      name.textContent = product.name || "";

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = product.price || "";

      meta.append(name, price);
      link.append(imageWrap, meta);
      card.append(link);

      productList.appendChild(card);
    });
    updateSavedIcons();
  } catch (error) {
    productList.innerHTML = `<p class="products-empty">Products unavailable. Check back soon.</p>`;
  }
}

loadProducts();

/* CONTACT FORM */
const CONTACT_ENDPOINT = "https://formspree.io/f/mzzbgngb";

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("contact-status");
  const submitBtn = form.querySelector(".contact-submit");

  const lang = (document.documentElement.lang || "en").toLowerCase();
  const locale = lang.startsWith("pt") ? "pt" : lang.startsWith("de") ? "de" : "en";
  const copy = {
    en: {
      success: "Message sent. We'll respond shortly.",
      error: "Unable to send. Please try again.",
      invalid: "Check name, email, and message.",
      email: "Enter a valid email.",
    },
    pt: {
      success: "Mensagem enviada. Responderemos em breve.",
      error: "Não foi possível enviar. Tente novamente.",
      invalid: "Verifique nome, email e mensagem.",
      email: "Introduza um email válido.",
    },
    de: {
      success: "Nachricht gesendet. Wir melden uns bald.",
      error: "Senden nicht moeglich. Bitte erneut versuchen.",
      invalid: "Name, Email und Nachricht pruefen.",
      email: "Gueltige Email angeben.",
    },
  }[locale];

  const setStatus = (msg = "", type = "") => {
    if (!status) return;
    status.textContent = msg;
    status.className = `contact-status${type ? ` ${type}` : ""}`;
  };

  const validateEmail = (value = "") => {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (form.querySelector("[name='name']")?.value || "").trim();
    const email = (form.querySelector("[name='email']")?.value || "").trim();
    const message = (form.querySelector("[name='message']")?.value || "").trim();

    if (!name || !email || !message) {
      setStatus(copy.invalid, "error");
      return;
    }
    if (!validateEmail(email)) {
      setStatus(copy.email, "error");
      return;
    }

    submitBtn?.setAttribute("disabled", "true");
    setStatus("");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error("Submit failed");

      form.reset();
      setStatus(copy.success, "success");
    } catch (err) {
      setStatus(copy.error, "error");
    } finally {
      submitBtn?.removeAttribute("disabled");
    }
  });
}

initContactForm();

/* SHIPPING RULES */
const ALLOWED_SHIP_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
]);

function isAllowedCountry(code = "") {
  return ALLOWED_SHIP_COUNTRIES.has(String(code).toUpperCase());
}

/* CHECKOUT DOUBLE-SUBMIT GUARD */
function resetCheckoutButtons() {
  checkoutBusy = false;
  document.querySelectorAll(".snipcart-checkout").forEach((btn) => {
    btn.classList.remove("is-checkout-busy");
    btn.removeAttribute("aria-busy");
    if (btn.tagName === "BUTTON") {
      btn.disabled = false;
    }
  });
}

function guardCheckoutTriggers() {
  const triggers = document.querySelectorAll(".snipcart-checkout");
  if (!triggers.length) return;

  triggers.forEach((btn) => {
    if (btn._checkoutGuard) {
      btn.removeEventListener("click", btn._checkoutGuard);
    }
    btn._checkoutGuard = (e) => {
      if (checkoutBusy) {
        e.preventDefault();
        return;
      }
      checkoutBusy = true;
      btn.classList.add("is-checkout-busy");
      btn.setAttribute("aria-busy", "true");
      if (btn.tagName === "BUTTON") {
        btn.disabled = true;
      }
      setTimeout(resetCheckoutButtons, 8000);
    };
    btn.addEventListener("click", btn._checkoutGuard);
  });
}

function enforceShippingRules(attempt = 0) {
  const maxAttempts = 25;
  if (!window.Snipcart || !window.Snipcart.events) {
    if (attempt < maxAttempts) setTimeout(() => enforceShippingRules(attempt + 1), 400);
    return;
  }

  const { events, api } = window.Snipcart;
  if (!events?.on) return;

  const shippingMessage = "We currently ship to EU member states only.";

  events.on("shippingaddress.changed", (address) => {
    if (!address?.country) return;
    if (isAllowedCountry(address.country)) return;
    try {
      api?.cart?.notifications?.show?.({
        type: "error",
        message: shippingMessage,
        dismissable: true,
      });
    } catch (err) {
      /* ignore */
    }
  });

  events.on("beforeCheckoutConfirmation", (cart) => {
    const country = cart?.shippingAddress?.country;
    if (country && !isAllowedCountry(country)) {
      throw new Error(shippingMessage);
    }
  });
}
