// Central Snipcart configuration applied before the Snipcart script loads.
// Ensures the provided public API key and cart options are consistent site-wide.
(function () {
  const settings = {
    publicApiKey: "YjUyZGQ5ZmEtYzA1MC00YTBhLTliNGItNWFhY2FlNTZmYTUzNjM5MDEyMjgzOTUxMjUwNjQx",
    loadStrategy: "onload",
    modalStyle: "side",
    currency: "eur",
    addProductBehavior: "none",
  };

  // Merge with any existing settings without losing required values.
  window.SnipcartSettings = {
    ...(window.SnipcartSettings || {}),
    ...settings,
  };
})();
