console.log('Iniciando insight_track.js');
const API_URL = 'https://nanasyncbackend.onrender.com';

let empleados = [];
let empleadoSeleccionado = null;

// 🔄 1. Obtener lista de empleados desde la API o mock si falla
async function fetchEmpleados() {
  console.log('Buscando empleados desde API...');
  try {
    const res = await fetch(`${API_URL}/api/empleados`);
    if (res.ok) {
      empleados = await res.json();
      console.log('Empleados obtenidos desde API:', empleados);
    } else {
      console.warn('API no respondió correctamente. Usando datos mock.');
      usarDatosMock();
    }
  } catch (err) {
    console.error('Error en fetchEmpleados():', err.message);
    usarDatosMock();
  }
}

function usarDatosMock() {
  empleados = [
    { id: '1001', nombre: 'Lidia González', puesto: 'Atención al Cliente', horario: '09:00 – 17:00', rol: 'empleado', estado: 'inactivo', vinculado: false },
    { id: 'admin01', nombre: 'Sandra Morales', puesto: 'Jefe de Operaciones', horario: '08:00 – 16:00', rol: 'admin', estado: 'inactivo', vinculado: false }
  ];
}

// ⏰ 2. Utilidades de horario y estado visual
function horaDentroDeRango(rango) {
  const [start, end] = rango.split('–').map(h => parseInt(h.trim().split(':')[0]));
  const ahora = new Date().getHours();
  return ahora >= start && ahora < end;
}

function estadoColor(empleado) {
  const ahora = new Date();
  const [start, end] = empleado.horario.split('–').map(h => parseInt(h.trim().split(':')[0]));
  const horaFin = end;
  const loggedIn = empleado.estado === 'activo';
  const fueraHorario = ahora.getHours() >= horaFin;

  if (loggedIn) return 'dot-green';
  if (!loggedIn && horaDentroDeRango(empleado.horario)) return 'dot-red parpadeo';
  if (!loggedIn && fueraHorario) return 'dot-blink';
  return 'dot-red';
}

// 🧱 3. Crear tarjeta visual para cada empleado
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

// 📋 4. Renderizar panel de Actividad
function cargarActividad() {
  const grid = document.getElementById('actividad-grid');
  if (!grid) return console.error('Grid de actividad no encontrado');
  grid.innerHTML = '';
  empleados.forEach(emp => grid.appendChild(crearTarjeta(emp)));
}

// 👁️ 5. Renderizar panel de Monitorización
function cargarMonitorizacion() {
  const grid = document.getElementById('monitorizacion-grid');
  if (!grid) return console.error('Grid de monitorización no encontrado');
  grid.innerHTML = '';
  const logueados = empleados.filter(emp => emp.estado === 'activo');
  logueados.forEach(emp => grid.appendChild(crearTarjeta(emp, true)));
}

// 🔄 6. Cambiar entre pestañas
function switchTab(tab) {
  console.log('➡️ Cambiando a pestaña:', tab);
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('visible'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById(`${tab}-panel`);
  if (panel) panel.classList.add('visible');

  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');

  if (tab === 'actividad') cargarActividad();
  if (tab === 'monitorizacion') cargarMonitorizacion();
}

// 📡 7. Solicitar monitorización (placeholder)
function solicitarMonitorizacion() {
  if (empleadoSeleccionado) {
    showNotification(`Monitorización solicitada para ${empleadoSeleccionado.nombre}`, 'success');
  }
  closeModal('modal');
}

// 🚀 8. Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Insight Track listo');
  await fetchEmpleados();

  // Activar listeners de las tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // ✅ Forzar inicio en pestaña "actividad"
  switchTab('actividad');
});

// 🔧 9. Funciones globales heredadas
function getActiveEmployee() {
  return window.parent.getActiveEmployee();
}
function showNotification(msg, type) {
  return window.parent.showNotification(msg, type);
}
function openModal(modalId) {
  return window.parent.openModal(modalId);
}
function closeModal(modalId) {
  return window.parent.closeModal(modalId);
}
