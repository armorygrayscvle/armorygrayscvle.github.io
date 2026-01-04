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
    if (window.Snipcart && Snipcart.api && Snipcart.api.cart) {
      try {
        await Snipcart.api.cart.open();
      } catch (e) {
        // ignore
      }
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

/* PRODUCTS */
const productList = document.getElementById("product-list");

async function loadProducts() {
  if (!productList) return;

  try {
    const res = await fetch("products.json", { cache: "no-cache" });
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

      const addBtn = document.createElement("button");
      addBtn.className = "snipcart-add-item";
      addBtn.textContent = "ADD TO CART";
      addBtn.setAttribute("data-item-id", (product.name || "product").toLowerCase().replace(/\s+/g, "-"));
      addBtn.setAttribute("data-item-name", product.name || "Product");
      addBtn.setAttribute("data-item-price", (product.price || "").replace(/[^\d.]/g, "") || "0.00");
      addBtn.setAttribute("data-item-url", window.location.href);
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
