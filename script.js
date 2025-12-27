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
const form = document.getElementById("signup-form");
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
          <button type="button" id="copy-code-btn">Copy code</button>
        </div>
      `;

      const copyBtn = document.getElementById("copy-code-btn");
      copyBtn?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(discountCode);
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy code";
          }, 2000);
        } catch (err) {
          copyBtn.textContent = "Copy failed";
          setTimeout(() => {
            copyBtn.textContent = "Copy code";
          }, 2000);
        }
      });
    } else {
      form.innerHTML = "<p style='opacity:.6'>Error. Try again.</p>";
    }
  });
}
