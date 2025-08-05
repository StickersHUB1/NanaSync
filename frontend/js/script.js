// ✅ frontend/js/script.js
function loadPage(url) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.text();
    })
    .then(html => {
      document.getElementById("main-content").innerHTML = html;

      // Cargar script específico si corresponde
      if (url.includes("insight_track")) {
        const script = document.createElement("script");
        script.src = "frontend/js/insight_track.js";
        script.defer = true;
        document.body.appendChild(script);
      }

      if (url.includes("fichaje")) {
        const script = document.createElement("script");
        script.src = "frontend/js/fichaje.js";
        script.defer = true;
        document.body.appendChild(script);
      }

      if (url.includes("dashboard")) {
        const script = document.createElement("script");
        script.src = "frontend/js/dashboard.js";
        script.defer = true;
        document.body.appendChild(script);
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("main-content").innerHTML = `
        <h2>Error</h2>
        <p>No se pudo cargar <code>${url}</code>.</p>
      `;
    });
}

// Cargar dashboard por defecto al iniciar
window.addEventListener("DOMContentLoaded", () => loadPage("dashboard.html"));
