console.log('Iniciando fichaje.js');
// const API_URL = 'https://nanasyncbackend.onrender.com';

async function login(id, password) {
  console.log('Intentando login con id:', id);
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    const data = await res.json();
    console.log('Respuesta de login:', data);
    if (res.ok) {
      localStorage.setItem('empleadoActivo', JSON.stringify(data));
      console.log('Sesión almacenada en localStorage');
      mostrarPerfil(data);
    } else {
      showNotification(data.error || 'Credenciales incorrectas');
    }
  } catch (err) {
    console.error('Error en login:', err);
    showNotification('Error de conexión con el servidor');
  }
}

function mostrarPerfil(empleado) {
  console.log('Mostrando perfil para:', empleado.nombre);
  const profile = document.getElementById('profile');
  const form = document.getElementById('login-form');
  if (!profile || !form) {
    console.error('Elementos profile o form no encontrados');
    return;
  }
  form.style.display = 'none';
  profile.style.display = 'block';

  const photo = profile.querySelector('.photo');
  if (photo) photo.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16); // Placeholder color
  document.getElementById('emp-name').textContent = empleado.nombre;
  document.getElementById('emp-role').textContent = empleado.rol;
  document.getElementById('emp-specialty').textContent = empleado.puesto; // Usamos puesto como especialidad
}

function terminarTurno() {
  console.log('Iniciando proceso de cerrar sesión');
  openModal('modal');
}

async function confirmarTerminar() {
  console.log('Confirmando cierre de sesión');
  const empleado = getActiveEmployee();
  if (empleado) {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: empleado.id })
      });
      localStorage.removeItem('empleadoActivo');
      console.log('Sesión eliminada de localStorage');
      const profile = document.getElementById('profile');
      const form = document.getElementById('login-form');
      if (profile && form) {
        profile.style.display = 'none';
        form.style.display = 'block';
      }
      showNotification('Sesión cerrada', 'success');
    } catch (err) {
      console.error('Error en logout:', err);
      showNotification('Error al cerrar sesión');
    }
  }
  closeModal('modal');
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM de fichaje cargado');
  const form = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  if (form && loginBtn) {
    form.addEventListener('submit', (e) => {
      console.log('Formulario de login enviado');
      e.preventDefault();
      loginBtn.disabled = true;
      loginBtn.textContent = 'Cargando...';

      const id = document.getElementById('employeeId').value.trim();
      const password = document.getElementById('password').value.trim();

      login(id, password).then(() => {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Iniciar Sesión';
      });
    });
  }

  const empleado = getActiveEmployee();
  if (empleado) {
    console.log('Sesión activa detectada, mostrando perfil');
    mostrarPerfil(empleado);
  }
});

// Funciones auxiliares
function getActiveEmployee() {
  const empleado = JSON.parse(localStorage.getItem('empleadoActivo')) || null;
  console.log('Empleado activo:', empleado);
  return empleado;
}

function showNotification(message, type) {
  window.parent.showNotification(message, type);
}

function openModal(modalId) {
  window.parent.openModal(modalId);
}

function closeModal(modalId) {
  window.parent.closeModal(modalId);
}
