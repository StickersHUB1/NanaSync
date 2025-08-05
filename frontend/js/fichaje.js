const API_URL = 'https://nanasyncbackend.onrender.com';

async function login(id, password) {
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('empleadoActivo', JSON.stringify(data));
      return data;
    } else {
      showNotification(data.error || 'Credenciales incorrectas');
      return null;
    }
  } catch (err) {
    showNotification('Error de conexión con el servidor');
    console.error(err);
    return null;
  }
}

function mostrarPerfil(empleado) {
  if (!profile || !form) return;
  form.style.display = 'none';
  profile.style.display = 'block';

  document.getElementById('emp-name').textContent = empleado.nombre;
  document.getElementById('emp-role').textContent = `${empleado.puesto} (${empleado.rol})`;
  document.getElementById('emp-hours').textContent = `Horario: ${empleado.horario}`;
}

function terminarTurno() {
  openModal('modal');
}

async function confirmarTerminar() {
  const empleado = getActiveEmployee();
  if (empleado) {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: empleado.id })
      });
      logout();
    } catch (err) {
      showNotification('Error al cerrar sesión');
    }
  }
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  checkinBtn.disabled = true;
  checkinBtn.textContent = 'Cargando...';

  const id = document.getElementById('employeeId').value.trim();
  const password = document.getElementById('password').value.trim();

  const empleado = await login(id, password);
  if (empleado) mostrarPerfil(empleado);

  checkinBtn.disabled = false;
  checkinBtn.textContent = '🕒 Fichar Entrada';
});

window.addEventListener('DOMContentLoaded', () => {
  const activo = getActiveEmployee();
  if (activo) mostrarPerfil(activo);
});
