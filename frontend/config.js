window.APP_CONFIG = {
  API_BASE: (() => {
    const meta = document.querySelector('meta[name="api-base"]');
    if (meta && meta.content) {
      return meta.content.replace(/\/$/, "");
    }

    const { protocol, hostname, port } = window.location;

    // Opening HTML files directly (file://) — always use local API
    if (protocol === "file:" || !hostname) {
      return "http://localhost:5000";
    }

    // Frontend served by Express on the same port as the API
    if (port === "5000") {
      return window.location.origin;
    }

    return `${protocol}//${hostname}:5000`;
  })(),
};
