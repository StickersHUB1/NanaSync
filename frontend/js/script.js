console.log('Iniciando script.js');

const API_URL = 'https://nanasyncbackend.onrender.com';
console.log('API_URL configurada como:', API_URL);

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
    const html = await response.text();
    main.innerHTML = html;
    main.style.opacity = '1';
    console.log('Página cargada exitosamente:', page);

    const empleado = getActiveEmployee();

    // Bloqueo si no hay sesión
    if (!empleado && (page === 'inicio' || page === 'insight_track')) {
      console.warn('Acceso denegado por falta de sesión');
      main.innerHTML = `
        <div class="access-denied">
          <h2>🚫 Acceso restringido</h2>
          <p>Debes iniciar sesión para acceder a esta sección.</p>
        </div>`;
      return;
    }

    // Bloqueo si no es admin
    if (page === 'insight_track' && empleado?.rol !== 'admin') {
      console.warn('Acceso denegado para no-admin a Insight Track');
      main.innerHTML = `
        <div class="access-denied">
          <h2>🚫 Solo administradores</h2>
          <p>No tienes permisos para acceder a Insight Track.</p>
        </div>`;
      return;
    }

    // Cargar script correspondiente
    let scriptSrc = '';
    if (page === 'fichaje') scriptSrc = 'frontend/js/fichaje.js';
    else if (page === 'insight_track') scriptSrc = 'frontend/js/insight_track.js';
    else if (page === 'inicio') scriptSrc = 'frontend/js/inicio.js';

    if (scriptSrc) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.onload = () => console.log(`${scriptSrc} cargado`);
      document.body.appendChild(script);
    }

  } catch (error) {
    console.error('Error al cargar página:', error);
    main.innerHTML = '<p>Error al cargar la página. Intenta de nuevo.</p>';
    showNotification(`Error: ${error.message}`);
  }
}

// Navegación desde el sidebar
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
      e.preventDefault();
      const page = link.getAttribute('href');
      if (page) loadPage(page);
    });
  });

  // Cargar por defecto fichaje
  console.log('Cargando página inicial: fichaje');
  loadPage('fichaje');
});

// Funciones auxiliares globales
function getActiveEmployee() {
  const empleado = JSON.parse(localStorage.getItem('empleadoActivo')) || null;
  console.log('Empleado activo:', empleado);
  return empleado;
}

function isAdmin() {
  const admin = getActiveEmployee()?.rol === 'admin';
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
