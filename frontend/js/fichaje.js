console.log('Iniciando fichaje.js');

// ⚠️ Asegúrate de que API_URL ya está definido en script.js y es global

// ==================== LOGIN ====================
async function login(id, password) {
  console.log('Intentando login con ID:', id);
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    const data = await res.json();

    if (res.ok) {
      console.log('Login exitoso, datos:', data);
      localStorage.setItem('empleadoActivo', JSON.stringify(data));
      mostrarPerfil(data);
    } else {
      console.warn('Login fallido:', data.error);
      showNotification(data.error || 'Credenciales incorrectas');
    }
  } catch (err) {
    console.error('Error en login:', err);
    showNotification('Error de conexión con el servidor');
  }
}

// ==================== PERFIL ====================
function mostrarPerfil(empleado) {
  const profile = document.getElementById('profile');
  const form = document.getElementById('login-form');
  if (!profile || !form) {
    console.error('Elemento "profile" o "form" no encontrado en el DOM.');
    return;
  }

  form.style.display = 'none';
  profile.style.display = 'block';

  const photo = profile.querySelector('.photo');
  if (photo) {
    photo.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  document.getElementById('emp-name').textContent = empleado.nombre;
  document.getElementById('emp-role').textContent = empleado.rol;
  document.getElementById('emp-specialty').textContent = empleado.puesto;
}

// ==================== LOGOUT ====================
async function confirmarTerminar() {
  const empleado = getActiveEmployee();
  if (!empleado) return;

  try {
    await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: empleado.id })
    });

    localStorage.removeItem('empleadoActivo');
    console.log('Logout exitoso');

    const profile = document.getElementById('profile');
    const form = document.getElementById('login-form');
    if (profile && form) {
      profile.style.display = 'none';
      form.style.display = 'block';
    }

    showNotification('Sesión cerrada correctamente', 'success');
  } catch (err) {
    console.error('Error cerrando sesión:', err);
    showNotification('Error al cerrar sesión');
  }

  closeModal('modal');
}

// ==================== INIT DOM ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado completamente (fichaje.js)');

  const form = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');

  if (form && loginBtn) {
    form.addEventListener('submit', (e) => {
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

  // 🔁 Mostrar perfil si ya hay sesión activa
  const empleado = getActiveEmployee();
  if (empleado) {
    console.log('Empleado activo detectado al cargar página:', empleado);
    setTimeout(() => mostrarPerfil(empleado), 100); // Delay mínimo para asegurar HTML cargado
  }
});

// ==================== UTILS ====================
function terminarTurno() {
  openModal('modal');
}

function getActiveEmployee() {
  try {
    return JSON.parse(localStorage.getItem('empleadoActivo')) || null;
  } catch {
    return null;
  }
}

function showNotification(message, type) {
  if (window.parent && typeof window.parent.showNotification === 'function') {
    window.parent.showNotification(message, type);
  } else {
    alert(message); // Fallback para pruebas locales
  }
}

function openModal(modalId) {
  if (window.parent && typeof window.parent.openModal === 'function') {
    window.parent.openModal(modalId);
  }
}

function closeModal(modalId) {
  if (window.parent && typeof window.parent.closeModal === 'function') {
    window.parent.closeModal(modalId);
  }
}
