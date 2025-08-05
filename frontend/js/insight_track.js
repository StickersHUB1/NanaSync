console.log('Iniciando insight_track.js');
const API_URL = 'https://nanasyncbackend.onrender.com';

let empleados = [];
let empleadoSeleccionado = null;

async function fetchEmpleados() {
  console.log('Buscando empleados desde API');
  try {
    const res = await fetch(`${API_URL}/api/empleados`);
    if (res.ok) {
      empleados = await res.json();
      console.log('Empleados obtenidos:', empleados);
    } else {
      empleados = [
        { id: '1001', nombre: 'Lidia González', puesto: 'Atención al Cliente', horario: '09:00 – 17:00', rol: 'empleado', estado: 'inactivo', vinculado: false },
        { id: 'admin01', nombre: 'Sandra Morales', puesto: 'Jefe de Operaciones', horario: '08:00 – 16:00', rol: 'admin', estado: 'inactivo', vinculado: false }
      ];
      console.warn('Usando datos temporales por fallo en la API');
    }
  } catch (err) {
    console.error('Error fetching empleados:', err);
    empleados = [
      { id: '1001', nombre: 'Lidia González', puesto: 'Atención al Cliente', horario: '09:00 – 17:00', rol: 'empleado', estado: 'inactivo', vinculado: false },
      { id: 'admin01', nombre: 'Sandra Morales', puesto: 'Jefe de Operaciones', horario: '08:00 – 16:00', rol: 'admin', estado: 'inactivo', vinculado: false }
    ];
  }
}

function horaDentroDeRango(rango) {
  const [start, end] = rango.split('–').map(h => parseInt(h.trim().split(':')[0]));
  const ahora = new Date().getHours();
  console.log('Hora actual:', ahora, 'Rango:', rango, 'Dentro:', ahora >= start && ahora < end);
  return ahora >= start && ahora < end;
}

function estadoColor(empleado) {
  const ahora = new Date();
  const [start, end] = empleado.horario.split('–').map(h => {
    const [hours] = h.trim().split(':');
    return parseInt(hours);
  });
  const horaFin = end;
  const loggedIn = empleado.estado === 'activo';
  const fueraHorario = ahora.getHours() >= horaFin;

  if (loggedIn) {
    console.log('Estado:', empleado.nombre, 'Verde (logueado)');
    return 'dot-green';
  } else if (!loggedIn && horaDentroDeRango(empleado.horario)) {
    console.log('Estado:', empleado.nombre, 'Rojo parpadeando (debe estar logueado)');
    return 'dot-red parpadeo';
  } else if (!loggedIn) {
    console.log('Estado:', empleado.nombre, 'Rojo (no logueado)');
    return 'dot-red';
  } else if (fueraHorario && !loggedIn) {
    console.log('Estado:', empleado.nombre, 'Rojo/Verde alternando (olvidó logout)');
    return 'dot-blink'; // Estilo personalizado para alternar
  }
  return 'dot-red';
}

function crearTarjeta(empleado, esInteractivo = false) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = empleado.id;

  const dot = document.createElement('div');
  dot.className = `status-dot ${estadoColor(empleado)}`;

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
  console.log('Cargando actividad');
  const grid = document.getElementById('actividad-grid');
  if (!grid) {
    console.error('Grid de actividad no encontrado');
    return;
  }
  grid.innerHTML = '';
  empleados.forEach(emp => grid.appendChild(crearTarjeta(emp)));
}

function cargarMonitorizacion() {
  console.log('Cargando monitorización');
  const grid = document.getElementById('monitorizacion-grid');
  if (!grid) {
    console.error('Grid de monitorización no encontrado');
    return;
  }
  grid.innerHTML = '';
  const logueados = empleados.filter(emp => emp.estado === 'activo');
  console.log('Empleados logueados:', logueados);
  logueados.forEach(emp => grid.appendChild(crearTarjeta(emp, true)));
}

function switchTab(tab) {
  console.log('Cambiando a pestaña:', tab);
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('visible'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById(`${tab}-panel`);
  if (panel) panel.classList.add('visible');

  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');

  if (tab === 'actividad') cargarActividad();
  if (tab === 'monitorizacion') cargarMonitorizacion();
}

function solicitarMonitorizacion() {
  console.log('Solicitando monitorización para:', empleadoSeleccionado?.nombre);
  if (empleadoSeleccionado) {
    showNotification(`Monitorización solicitada para ${empleadoSeleccionado.nombre}`, 'success');
  }
  closeModal('modal');
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM de insight_track cargado');
  await fetchEmpleados();
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });
  switchTab('actividad');
});

// Funciones auxiliares
function getActiveEmployee() {
  return window.parent.getActiveEmployee();
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
