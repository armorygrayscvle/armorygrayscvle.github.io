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

/* FORMSPREE (NO REDIRECT, CLEAN CONFIRMATION) */
const form = document.getElementById("notice-form");
const discountCode = "ARMORY10"; // 10% off code shown after successful signup

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
        <div class="discount-success">
          <p>You're in. Use <span class="discount-code">${discountCode}</span> for 10% off.</p>
        </div>
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
      img.src = product.image;
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
      productList.appendChild(card);
    });
  } catch (error) {
    productList.innerHTML = `<p class="products-empty">Products unavailable. Check back soon.</p>`;
  }
}

loadProducts();
