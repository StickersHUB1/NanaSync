function loadPage(url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
if (url.includes('insight_track')) {
  const script = document.createElement('script');
  script.src = 'frontend/js/insight_track.js';
  script.defer = true;
  document.body.appendChild(script);
}
    })
    .catch(err => {
      document.getElementById('main-content').innerHTML = '<p>Error al cargar el módulo.</p>';
      console.error(err);
    });
}

window.addEventListener('DOMContentLoaded', () => {
  loadPage('partials/dashboard.html');
});
