function loadPage(url) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.text();
    })
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // Cargar script específico si corresponde
      if (url.includes('insight_track')) {
        const script = document.createElement('script');
        script.src = 'js/insight_track.js';
        script.defer = true;
        document.body.appendChild(script);
      }

      if (url.includes('fichaje')) {
        const script = document.createElement('script');
        script.src = 'js/fichaje.js'; // solo si usas uno separado
        script.defer = true;
        document.body.appendChild(script);
      }

      if (url.includes('dashboard')) {
        const script = document.createElement('script');
        script.src = 'js/dashboard.js'; // opcional si tu dashboard tiene lógica
        script.defer = true;
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
