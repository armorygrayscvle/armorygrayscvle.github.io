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
const form = document.getElementById("notice-form");
const discountCode = "ARMORY10"; // 10% off code shown after successful signup

function openNotice() {
  if (!noticeBar) return;
  noticeBar.classList.add("open");
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

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const response = await fetch(form.action, {
      method: "POST",
      body: data,
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      form.innerHTML = `
        <span class="notice-success">USE “GRAYSCVLE” FOR 10% DISCOUNT.</span>
      `;
    } else {
      form.innerHTML = "<p style='opacity:.6'>Error. Try again.</p>";
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
      const card = document.createElement("article");
      card.className = "product-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "product-image";
      const img = document.createElement("img");
      const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
      img.src = images[0];
      img.alt = product.name || "Product image";
      imageWrap.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "product-meta";

      const name = document.createElement("h3");
      name.className = "product-name";
      name.textContent = product.name || "";

      const desc = document.createElement("p");
      desc.className = "product-description";
      desc.textContent = product.description || "";

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = product.price || "";

      meta.append(name, desc, price);
      card.append(imageWrap, meta);

      // thumbs
      if (images.length > 1) {
        const thumbs = document.createElement("div");
        thumbs.className = "thumbs";
        images.forEach((src, idx) => {
          const t = document.createElement("button");
          t.type = "button";
          t.className = "thumb";
          t.setAttribute("aria-label", `View image ${idx + 1} of ${product.name || "product"}`);
          const ti = document.createElement("img");
          ti.src = src;
          ti.alt = product.name || "Product thumbnail";
          t.appendChild(ti);
          t.addEventListener("click", () => {
            img.src = src;
          });
          thumbs.appendChild(t);
        });
        card.appendChild(thumbs);
      }

      // hover states: zoom handled by CSS; toggle description
      imageWrap.addEventListener("mouseenter", () => {
        meta.classList.add("show-description");
      });
      imageWrap.addEventListener("mouseleave", () => {
        meta.classList.remove("show-description");
      });
      productList.appendChild(card);
    });
  } catch (error) {
    productList.innerHTML = `<p class="products-empty">Products unavailable. Check back soon.</p>`;
  }
}

loadProducts();
