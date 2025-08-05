const API_URL = 'https://nanasyncbackend.onrender.com';

const empleados = [
  {
    nombre: 'Aitana Rodríguez Santos',
    puesto: 'Atención al Cliente',
    horario: '06:00 – 14:00',
    estado: 'activo'
  },
  {
    nombre: 'Javier Torres Mejía',
    puesto: 'Soporte Técnico',
    horario: '14:00 – 22:00',
    estado: 'inactivo'
  },
  {
    nombre: 'Lucía Moreno García',
    puesto: 'Administración',
    horario: '09:00 – 17:00',
    estado: 'activo'
  },
  {
    nombre: 'Pedro Ruiz Cortés',
    puesto: 'Ventas',
    horario: '10:00 – 18:00',
    estado: 'inactivo'
  }
];

let empleadoSeleccionado = null;

function horaDentroDeRango(rango) {
  const [start, end] = rango.split('–').map(h => parseInt(h.trim().split(':')[0]));
  const ahora = new Date().getHours();
  return ahora >= start && ahora < end;
}

function crearTarjeta(empleado, esInteractivo = false) {
  const card = document.createElement('div');
  card.className = 'card';

  const dot = document.createElement('div');
  dot.className = `status-dot ${empleado.estado === 'activo' ? 'dot-green' : 'dot-red'}`;
  if (empleado.estado === 'inactivo' && horaDentroDeRango(empleado.horario)) {
    dot.classList.add('parpadeo');
  }

  const photo = document.createElement('div');
  photo.className = 'photo';

  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<strong>${empleado.nombre}</strong><br>${empleado.puesto}<br>${empleado.horario}`;

  card.append(dot, photo, info);

  if (esInteractivo) {
    card.style.cursor = 'pointer';
    card.title = 'Haz clic para gestionar';
    card.addEventListener('click', () => {
      empleadoSeleccionado = empleado;
      openModal('modal');
      document.getElementById('modal-title').textContent = empleado.nombre;
    });
  }

  return card;
}

function cargarActividad() {
  const grid = document.getElementById('actividad-grid');
  if (!grid) return;
  grid.innerHTML = '';
  empleados.forEach(emp => grid.appendChild(crearTarjeta(emp)));
}

function cargarMonitorizacion() {
  const grid = document.getElementById('monitorizacion-grid');
  if (!grid) return;
  grid.innerHTML = '';
  empleados
    .filter(emp => emp.estado === 'activo')
    .forEach(emp => grid.appendChild(crearTarjeta(emp, true)));
}

function cargarVincular() {
  const form = document.getElementById('vincular-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idEmpleado = document.getElementById('employeeId').value;
    const nombreDispositivo = document.getElementById('deviceName').value;

    try {
      const res = await fetch(`${API_URL}/api/vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEmpleado, nombreDispositivo })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Dispositivo vinculado correctamente', 'success');
      } else {
        showNotification(data.error || 'Error al vincular dispositivo');
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor');
    }
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('visible'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById(`${tab}-panel`);
  if (panel) panel.classList.add('visible');

  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');

  if (tab === 'actividad') cargarActividad();
  if (tab === 'monitorizacion') cargarMonitorizacion();
  if (tab === 'vincular') cargarVincular();
}

function accionSolicitarMonitorizacion() {
  if (!empleadoSeleccionado) return;
  showNotification(`Solicitud de monitorización enviada a ${empleadoSeleccionado.nombre}`, 'success');
  closeModal('modal');
}

window.addEventListener('DOMContentLoaded', () => {
  if (!isAdmin()) {
    document.getElementById('main-content').innerHTML = `
      <div class="access-denied">
        <h2>🚫 Acceso restringido</h2>
        <p>Solo usuarios con permisos de administrador pueden acceder a Insight Track.</p>
      </div>`;
    return;
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  switchTab('actividad');
});
