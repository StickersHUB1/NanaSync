// Gestión de autenticación
function isAdmin() {
  const datos = JSON.parse(localStorage.getItem('empleadoActivo'));
  return datos && datos.rol === 'admin';
}

function getActiveEmployee() {
  return JSON.parse(localStorage.getItem('empleadoActivo'));
}

function logout() {
  localStorage.removeItem('empleadoActivo');
  loadPage('fichaje.html');
}
