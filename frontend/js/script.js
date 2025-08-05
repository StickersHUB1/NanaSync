function loadPage(url) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.text();
    })
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // Cargar el JS correspondiente según la página
      let scriptName = "";
      if (url.includes("dashboard")) scriptName = "dashboard.js";
      if (url.includes("fichaje")) scriptName = "fichaje.js";
      if (url.includes("insight_track")) scriptName = "insight_track.js";

      if (scriptName) {
        const script = document.createElement("script");
        script.src = `frontend/js/${scriptName}`;
        script.defer = true;
        script.onload = () => {
          if (url.includes("insight_track")) {
            if (typeof switchTab === "function") {
              switchTab("actividad"); // Activar pestaña por defecto
            }
          }
        };
        document.body.appendChild(script);
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('main-content').innerHTML = `
        <h2>Error</h2>
        <p>No se pudo cargar <code>${url}</code>.</p>
      `;
    });
}

function handleInsightTrackAccess() {
  const empleadoActivo = localStorage.getItem("empleadoActivo");
  if (!empleadoActivo) {
    // No ha iniciado sesión aún
    loadPage("insight_track.html");
    return;
  }

  const datos = JSON.parse(empleadoActivo);
  if (datos.rol && datos.rol === "admin") {
    loadPage("insight_track.html");
  } else {
    mostrarAccesoDenegado();
  }
}

function mostrarAccesoDenegado() {
  const modal = document.getElementById("access-denied-modal");
  if (modal) modal.style.display = "flex";
}

function cerrarAccesoDenegado() {
  const modal = document.getElementById("access-denied-modal");
  if (modal) modal.style.display = "none";
}

// Cargar Dashboard por defecto al iniciar
window.addEventListener("DOMContentLoaded", () => {
  loadPage("dashboard.html");
});
