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
     
