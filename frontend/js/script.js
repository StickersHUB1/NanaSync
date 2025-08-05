console.log('Iniciando script.js');

// Función para mostrar notificaciones
function showNotification(message, type = 'error') {
  console.log('Mostrando notificación:', message, 'Tipo:', type);
  const notification = document.getElementById('notification');
  if (!notification) {
    console.error('Elemento notification no encontrado');
    return;
  }
  notification.textContent = message;
  notification.className = `notification ${type === 'success' ? 'success' : ''}`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
    console.log('Notificación ocultada');
  }, 3000);
}

// Función para cargar páginas dinámicamente
const API_URL = 'https://nanasyncbackend.onrender.com';
console.log('API_URL configurada como:', API_URL);
async function loadPage(page) {
  console.log('Cargando página:', page);
  const main = document.querySelector('main');
  if (!main) {
    console.error('Elemento main no encontrado');
    showNotification('Error: No se pudo cargar la página');
    return;
  }

  try {
    console.log('Solicitando:', `${page}.html`);
    main.style.opacity = '0';
    const response = await fetch(`${page}.html`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    main.innerHTML = await response.text();
    main.style.opacity = '1';
    console.log('Página cargada exitosamente:', page);

    // Cargar scripts específicos
    if (page === 'fichaje') {
      console.log('Cargando fichaje.js');
      const script = document.createElement('script');
      script.src = 'frontend/js/fichaje.js';
      document.body.appendChild(script);
    } else if (page === 'insight_track') {
      console.log('Cargando insight_track.js');
      const script = document.createElement('script');
      script.src = 'frontend/js/insight_track.js';
      document.body.appendChild(script);
    } else if (page === 'inicio') {
      console.log('Cargando inicio.js (si existe)');
      // Añadir inicio.js si lo creas
    }

    // Verificar sesión para Inicio e Insight Track
    const empleado = getActiveEmployee();
    if (!empleado && (page === 'inicio' || page === 'insight_track')) {
      console.log('Acceso denegado sin sesión a:', page);
      main.innerHTML = '<div class="access-denied"><h2>🚫 Acceso restringido</h2><p>Debes iniciar sesión para acceder a esta sección.</p></div>';
    }
  } catch (error) {
    console.error('Error al cargar página:', error);
    main.innerHTML = '<p>Error al cargar la página. Intenta de nuevo.</p>';
    showNotification(`Error: ${error.message}`);
  }
}

// Navegación basada en el sidebar
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM completamente cargado');
  const links = document.querySelectorAll('.sidebar a');
  const main = document.querySelector('main');
  if (!main) {
    console.error('Elemento main no encontrado al cargar el DOM');
    return;
  }

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      console.log('Click en enlace:', link.href);
      e.preventDefault();
      const page = link.getAttribute('href');
      if (page) loadPage(page);
    });
  });

  // Cargar fichaje.html por defecto para login
  console.log('Cargando página inicial: fichaje');
  loadPage('fichaje');
});

// Funciones auxiliares
function getActiveEmployee() {
  const empleado = JSON.parse(localStorage.getItem('empleadoActivo')) || null;
  console.log('Empleado activo:', empleado);
  return empleado;
}

function isAdmin() {
  const admin = getActiveEmployee() && getActiveEmployee().rol === 'admin';
  console.log('¿Es admin?', admin);
  return admin;
}

function closeModal(modalId) {
  console.log('Cerrando modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function openModal(modalId) {
  console.log('Abriendo modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'block';
}
