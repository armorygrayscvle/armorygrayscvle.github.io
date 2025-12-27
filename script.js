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
      form.innerHTML = "<p style='opacity:.6'>Thank you.</p>";
    } else {
      form.innerHTML = "<p style='opacity:.6'>Error. Try again.</p>";
    }
  });
}
