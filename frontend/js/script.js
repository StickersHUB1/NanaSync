function loadPage(url) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.text();
    })
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // Cargar script específico según el contenido cargado
      const script = document.createElement('script');
      script.defer = true;

      if (url.includes('insight_track')) {
        script.src = 'js/insight_track.js';
      } else if (url.includes('fichaje')) {
        script.src = 'js/fichaje.js';
      } else if (url.includes('dashboard')) {
        script.src = 'js/dashboard.js';
      } else {
        return; // No se carga script si no aplica
      }

      document.body.appendChild(script);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('main-content').innerHTML = `
        <h2>Error</h2>
        <p>No se pudo cargar <code>${url}</code>.</p>
      `;
    });
}

// Carga inicial opcional (ej: dashboard al abrir)
window.addEventListener('DOMContentLoaded', () => {
  loadPage('dashboard.html'); // Puedes cambiar por el módulo por defecto
});
