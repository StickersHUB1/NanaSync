function loadPage(url) {
  // Bloquear acceso a Insight Track si es empleado
  if (url.includes('insight_track') && localStorage.getItem('empleadoActivo')) {
    mostrarAlerta("Solo usuarios autorizados pueden acceder a Insight Track.");
    return;
  }

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.text();
    })
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
      cargarScriptRelacionado(url);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('main-content').innerHTML = `
        <h2>Error</h2>
        <p>No se pudo cargar <code>${url}</code>.</p>
      `;
    });
}

function cargarScriptRelacionado(url) {
  const map = {
    'insight_track': 'frontend/js/insight_track.js',
    'fichaje': 'frontend/js/fichaje.js',
    'dashboard': 'frontend/js/dashboard.js'
  };

  for (const key in map) {
    if (url.includes(key)) {
      const src = map[key];
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }
}

// Modal de acceso denegado
function mostrarAlerta(mensaje) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box">
      <h3>⛔ Acceso Denegado</h3>
      <p>${mensaje}</p>
      <button onclick="this.parentElement.parentElement.remove()">Aceptar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
  loadPage('dashboard.html');
});
