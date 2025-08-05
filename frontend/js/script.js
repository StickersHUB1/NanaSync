// Función para mostrar notificaciones
function showNotification(message, type = 'error') {
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
  }, 3000);
}

// Función para cargar páginas dinámicamente
const API_URL = 'https://nanasyncbackend.onrender.com';
async function loadPage(page) {
  const main = document.querySelector('main');
  if (!main) {
    console.error('Elemento main no encontrado');
    showNotification('Error: No se pudo cargar la página');
    return;
  }

  try {
    main.style.opacity = '0'; // Transición suave
    const response = await fetch(`${page}.html`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    main.innerHTML = await response.text();
    main.style.opacity = '1'; // Restaurar opacidad
    // Cargar scripts específicos si es necesario
    if (page === 'fichaje') {
      const script = document.createElement('script');
      script.src = 'frontend/js/fichaje.js';
      document.body.appendChild(script);
    } else if (page === 'insight_track') {
      const script = document.createElement('script');
      script.src = 'frontend/js/insight_track.js';
      document.body.appendChild(script);
    }
  } catch (error) {
    main.innerHTML = '<p>Error al cargar la página. Intenta de nuevo.</p>';
    showNotification(`Error: ${error.message}`);
    console.error(error);
  }
}

// Navegación basada en el sidebar
document.addEventListener('DOMContentLoaded', () => {
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

  // Cargar página inicial
