function loadPage(url) {
  // Verificar si el empleado autenticado intenta acceder a Insight Track
  const sesion = JSON.parse(localStorage.getItem('empleadoActivo'));
  if (url.includes('insight_track') && sesion) {
    mostrarAccesoDenegado();
    return;
  }

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.text();
    })
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // Eliminar scripts dinámicos previos para evitar duplicados
      const prevScripts = document.querySelectorAll('script[data-dynamic]');
      prevScripts.forEach(s => s.remove());

      // Determinar qué script cargar según la vista
      let scriptPath = '';
      if (url.includes('insight_track')) {
        scriptPath = 'frontend/js/insight_track.js';
      } else if (url.includes('fichaje')) {
        scriptPath = 'frontend/js/fichaje.js';
      } else if (url.includes('dashboard')) {
        scriptPath = 'frontend/js/dashboard.js';
      }

      // Cargar el script correspondiente si aplica
      if (scriptPath) {
        const script = document.createElement('script');
        script.src = scriptPath;
        script.defer = true;
        script.dataset.dynamic = 'true';
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

// Modal de acceso denegado si es empleado
function mostrarAccesoDenegado() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box">
      <h3>🚫 Acceso Denegado</h3>
      <p>Solo el personal autorizado puede acceder a esta sección.</p>
      <button onclick="this.closest('.modal-overlay').remove()">Aceptar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Cargar contenido inicial (dashboard)
window.addEventListener('DOMContentLoaded', () => {
  loadPage('dashboard.html');
});
