function loadPage(url) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.text();
    })
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // Cargar el JS específico si es necesario
      const script = document.createElement('script');
      script.defer = true;

      if (url.includes('dashboard')) {
        script.src = 'frontend/js/dashboard.js';
        document.body.appendChild(script);
      }

      if (url.includes('fichaje')) {
        script.src = 'frontend/js/fichaje.js';
        document.body.appendChild(script);
      }

      if (url.includes('insight_track')) {
        script.src = 'frontend/js/insight_track.js';
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

// Navegación con protección para Insight Track
function navegarInsight() {
  const datos = JSON.parse(localStorage.getItem("empleadoActivo"));
  if (!datos || datos.rol !== "admin") {
    document.getElementById("bloqueo-insight").style.display = "flex";
    return;
  }
  loadPage("insight_track.html");
}

// Cierre del modal de bloqueo
function cerrarBloqueo() {
  document.getElementById("bloqueo-insight").style.display = "none";
}

// Al iniciar, cargar el dashboard por defecto
window.addEventListener("DOMContentLoaded", () => {
  loadPage("dashboard.html");
});
