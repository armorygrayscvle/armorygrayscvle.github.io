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

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const main = document.getElementById("main-content");
  jumpToInfo();

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

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeChMenu();
});

/* LOCALE PICKER */
const localeButtons = document.querySelectorAll(".locale-btn");
const LOCALE_KEY = "preferredLocale";

function setLocale(locale = "en", options = {}) {
  const lang = locale || "en";
  document.documentElement.lang = lang;
  localeButtons.forEach((btn) => {
    const btnLocale = btn.getAttribute("data-locale");
    btn.classList.toggle("locale-active", btnLocale === lang);
  });
  try {
    localStorage.setItem(LOCALE_KEY, lang);
  } catch (err) {
    /* ignore */
  }

  if (options.reloadHome && lang === "pt") {
    window.location.href = "index.html";
  }
}

if (localeButtons.length) {
  const savedLocale = (() => {
    try {
      return localStorage.getItem(LOCALE_KEY);
    } catch (err) {
      return null;
    }
  })();
  setLocale(savedLocale || "en");
  localeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const locale = btn.getAttribute("data-locale") || "en";
      setLocale(locale, { reloadHome: true });
    });
  });
}

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
  }
}

initSnipcartBindings();
renderSavedPage();
renderCartPage();
bindCartButtons();
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
    addBtn.textContent = "ADD TO CART";
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
    add.textContent = "Add to cart";
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
      <div class="summary-row summary-note">${shippingNote || "Shipping calculated at checkout."}</div>
      <div class="summary-row summary-total">
        <span>Total</span>
        <span>€${formatPrice(total)}</span>
      </div>
      <button class="summary-checkout" type="button" id="checkout-trigger">Checkout</button>
    `;

    const checkoutBtn = document.getElementById("checkout-trigger");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        window.location.href = "checkout.html";
      });
    }
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

  const handler = (e) => {
    e.preventDefault();
    window.location.href = "cart.html";
  };

  buttons.forEach((btn) => {
    btn.removeEventListener("click", handler);
    btn.addEventListener("click", handler);
  });
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
      const nameLink = document.createElement("a");
      nameLink.href = `product.html?id=${buildItemId(product)}`;
      nameLink.className = "product-link";
      nameLink.appendChild(name);

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = product.price || "";

      const itemId = buildItemId(product);
      const itemPrice = formatPrice(product.price);
      const itemUrl = buildStoreUrl(window.location.pathname || "/");
      const primaryImage = images[0];

      const addBtn = document.createElement("button");
      addBtn.className = "snipcart-add-item";
      addBtn.textContent = "ADD TO CART";
      addBtn.setAttribute("data-item-id", itemId);
      addBtn.setAttribute("data-item-name", product.name || "Product");
      addBtn.setAttribute("data-item-price", itemPrice);
      addBtn.setAttribute("data-item-currency", "EUR");
      addBtn.setAttribute("data-item-url", itemUrl);
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

      const imageLink = document.createElement("a");
      imageLink.href = `product.html?id=${buildItemId(product)}`;
      imageLink.className = "product-link";
      imageLink.appendChild(imageWrap);

      meta.append(nameLink, price, addBtn, savedBtn);
      card.append(imageLink, meta);

      productList.appendChild(card);
    });
    updateSavedIcons();
  } catch (error) {
    productList.innerHTML = `<p class="products-empty">Products unavailable. Check back soon.</p>`;
  }
}

loadProducts();
