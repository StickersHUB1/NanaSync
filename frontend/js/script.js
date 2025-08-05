// Mapa de scripts asociados a cada página
const pageScripts = {
  'dashboard.html': 'frontend/js/dashboard.js',
  'fichaje.html': 'frontend/js/fichaje.js',
  'insight_track.html': 'frontend/js/insight_track.js'
};

// Caché para evitar recargas innecesarias
let currentPage = null;
let currentScript = null;

// Función para mostrar notificaciones
function showNotification(message, type = 'error') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Cargar página dinámicamente
async function loadPage(url) {
  if (currentPage === url) return; // Evitar recarga de la misma página
  currentPage = url;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const html = await res.text();
    
    const mainContent = document.getElementById('main-content');
    mainContent.style.opacity = '0';
    mainContent.innerHTML = html;
    
    // Transición suave
    setTimeout(() => {
      mainContent.style.opacity = '1';
    }, 100);

    // Limpiar script anterior
    if (currentScript) {
      currentScript.remove();
      currentScript = null;
    }

    // Cargar script asociado
    if (pageScripts[url]) {
      currentScript = document.createElement('script');
      currentScript.src = pageScripts[url];
      currentScript.defer = true;
      document.body.appendChild(currentScript);
    }
  } catch (err) {
    console.error(err);
    showNotification(`No se pudo cargar ${url}.`);
    document.getElementById('main-content').innerHTML = `
      <h2>Error</h2>
      <p>No se pudo cargar <code>${url}</code>.</p>
    `;
  }
}

// Gestión de navegación
function setupNavigation() {
  document.querySelectorAll('.sidebar a, .insight-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (link.classList.contains('insight-link') && !isAdmin()) {
        openModal('bloqueo-insight');
        return;
      }
      loadPage(page);
    });
  });
}

// Gestión de modales
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modalId);
  });
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadPage('dashboard.html');
});
