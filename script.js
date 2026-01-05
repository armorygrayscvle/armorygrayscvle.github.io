// Remove any old service workers that could cache stale assets
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const main = document.getElementById("main-content");

  setTimeout(() => {
    loader.style.opacity = "0";
    main.style.opacity = "1";

    setTimeout(() => {
      loader.style.display = "none";
      document.body.style.overflow = "auto";
    }, 1200);

  }, 1200);
});

/* NOTICE TOGGLE + FORMSPREE */
const noticeBar = document.getElementById("notice-bar");
const noticeToggle = document.getElementById("notice-toggle");
const logoToggle = document.getElementById("logo-toggle");
const form = document.getElementById("notice-form");
const noticeHelper = document.getElementById("notice-helper");
const discountCode = "GRAYSCVLE"; // 10% off code shown after successful signup

function openNotice() {
  if (!noticeBar) return;
  noticeBar.classList.add("open");
}

async function applyDiscountCode() {
  if (window.Snipcart && Snipcart.api && Snipcart.api.discounts) {
    try {
      await Snipcart.api.discounts.applyDiscountCode(discountCode);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

function setHelperMessage(message, actions = []) {
  if (!noticeHelper) return;
  noticeHelper.innerHTML = message;

  // remove old actions
  const existing = noticeHelper.parentElement?.querySelector(".notice-actions");
  if (existing) existing.remove();

  if (actions.length) {
    const actionWrap = document.createElement("div");
    actionWrap.className = "notice-actions";
    actions.forEach((btn) => actionWrap.appendChild(btn));
    noticeHelper.parentElement?.appendChild(actionWrap);
  }
}

function createCopyButton() {
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy code";
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = "Copy code"), 1500);
    } catch (err) {
      copyBtn.textContent = "Copy failed";
      setTimeout(() => (copyBtn.textContent = "Copy code"), 1500);
    }
  });
  return copyBtn;
}

function createShopButton() {
  const shopBtn = document.createElement("button");
  shopBtn.type = "button";
  shopBtn.textContent = "Shop now";
  shopBtn.addEventListener("click", async () => {
    const ok = await applyDiscountCode();
    if (!ok) {
      setHelperMessage(
        'Code couldn’t be applied automatically — you can still enter GRAYSCVLE at checkout.'
      );
    }
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  });
  return shopBtn;
}

if (noticeToggle) {
  noticeToggle.addEventListener("click", openNotice);
  noticeToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openNotice();
    }
  });
}

if (logoToggle) {
  const goHome = () => {
    window.location.href = "index.html";
  };

  logoToggle.addEventListener("click", goHome);
  logoToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goHome();
    }
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: {
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const copyBtn = createCopyButton();
        const shopBtn = createShopButton();
        setHelperMessage(`USE “${discountCode}” FOR 10% DISCOUNT`, [copyBtn, shopBtn]);
        form.reset();
        const applied = await applyDiscountCode();
        if (!applied) {
          setHelperMessage(
            'Code couldn’t be applied automatically — you can still enter GRAYSCVLE at checkout.',
            [copyBtn, shopBtn]
          );
        }
      } else {
        setHelperMessage("Error. Try again.");
      }
    } catch (err) {
      setHelperMessage("Error. Try again.");
    }
  });
}

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
    if (window.Snipcart?.api?.theme?.cart?.open) {
      window.Snipcart.api.theme.cart.open();
    }
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

      const itemId = buildItemId(product);
      const itemPrice = formatPrice(product.price);
      const itemUrl = buildStoreUrl(window.location.pathname || "/");

      const addBtn = document.createElement("button");
      addBtn.className = "snipcart-add-item";
      addBtn.textContent = "ADD TO CART";
      addBtn.setAttribute("data-item-id", itemId);
      addBtn.setAttribute("data-item-name", product.name || "Product");
      addBtn.setAttribute("data-item-price", itemPrice);
      addBtn.setAttribute("data-item-currency", "EUR");
      addBtn.setAttribute("data-item-url", itemUrl);
      addBtn.setAttribute("data-item-description", product.description || "");
      addBtn.setAttribute("data-item-image", images[0]);

      meta.append(name, price, addBtn);
      card.append(imageWrap, meta);

      productList.appendChild(card);
    });
  } catch (error) {
    productList.innerHTML = `<p class="products-empty">Products unavailable. Check back soon.</p>`;
  }
}

loadProducts();
