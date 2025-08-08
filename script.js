// script.js (module)
const API_BASE = 'https://nanasync-backend.onrender.com/api';

// --- Estado persistente ---
let empresaAutenticada = (() => {
  try { return JSON.parse(localStorage.getItem('empresaAutenticada')) || null; }
  catch { return null; }
})();

const saveEmpresa = (emp) => {
  empresaAutenticada = emp;
  localStorage.setItem('empresaAutenticada', JSON.stringify(emp));
};
const clearEmpresa = () => {
  empresaAutenticada = null;
  localStorage.removeItem('empresaAutenticada');
};

// --- Utilidades ---
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

async function fetchPage(page) {
  const main = $('#main-content');
  if (!main) return;

  const url = page?.endsWith('.html') ? page : `${page}.html`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  const html = await res.text();
  main.innerHTML = html;
  initComponents(main);
  main.scrollTo?.(0, 0);
}

// --- Inicialización de listeners globales ---
document.addEventListener('DOMContentLoaded', () => {
  // Delegación de clicks del sidebar y CTA
  document.body.addEventListener('click', async (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    // CTA Solicitar -> abre modal login/registro si existe
    if (a.id === 'cta-solicitar') {
      e.preventDefault();
      const btnOpen = document.getElementById('btn-open-registro') || document.getElementById('btn-open-login');
      if (btnOpen) btnOpen.click();
      else await fetchPage('empresas.html');
      return;
    }

    // Navegación SPA-lite
    if (a.matches('.sidebar-nav a,[data-page]')) {
      e.preventDefault();
      if (a.hasAttribute('data-home')) {
        // Re-render del home sin recargar completamente
        window.location.hash = '';
        window.location.reload(); // simple y robusto para el hero
        return;
      }
      const page = a.getAttribute('data-page');
      if (page) {
        try { await fetchPage(page); }
        catch (err) { console.error(err); $('#main-content').innerHTML = `<p>Error al cargar el contenido.</p>`; }
      }
    }
  });

  // Bootstrap inicial
  initComponents(document);
});

// --- Componentes que viven dentro de páginas parciales ---
function initComponents(root) {
  initModalesAuth(root);
  initDashboard(root);

  // Formularios auth
  const formRegistro = $('#form-registro-empresa', root);
  formRegistro?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = $('#nombre').value.trim();
    const email = $('#email').value.trim();
    const password = $('#password').value;

    try {
      const data = await api('/empresas', { method: 'POST', body: JSON.stringify({ nombre, email, password }) });
      saveEmpresa({ id: data._id, nombre: data.nombre, email: data.email });
      alert('✅ Empresa registrada correctamente.');
      $('#modal-auth')?.style && ($('#modal-auth').style.display = 'none');
      mostrarDashboard(root);
    } catch (err) {
      console.error('Error registrando empresa:', err);
      alert(`❌ ${err.message}`);
    }
  });

  const formLogin = $('#form-login-empresa', root);
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;

    try {
      const data = await api('/login-empresa', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveEmpresa({ id: data._id, nombre: data.nombre, email: data.email });
      alert('✅ Sesión iniciada correctamente.');
      $('#modal-auth')?.style && ($('#modal-auth').style.display = 'none');
      mostrarDashboard(root);
    } catch (err) {
      console.error('Error en login:', err);
      alert(`❌ ${err.message}`);
    }
  });

  const formEmpleado = $('#form-nuevo-empleado', root);
  formEmpleado?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!empresaAutenticada?.id) {
      alert('⚠️ Debes estar logueado como empresa para añadir empleados.');
      return;
    }
    const f = e.target;
    const datos = {
      nombre: f.nombre.value.trim(),
      edad: Number(f.edad.value),
      puesto: f.puesto.value.trim(),
      rango: f.rango.value.trim(),
      horario: { entrada: f.entrada.value, salida: f.salida.value },
      rol: 'empleado',
      estadoConexion: 'inactivo',
      fichado: false,
      ultimoFichaje: new Date().toISOString(),
      empresaId: empresaAutenticada.id
    };

    try {
      await api('/empleados', { method: 'POST', body: JSON.stringify(datos) });
      const out = document.getElementById('respuesta-empleado');
      if (out) out.innerText = '✅ Empleado añadido correctamente';
      f.reset?.();
    } catch (err) {
      console.error(err);
      const out = document.getElementById('respuesta-empleado');
      if (out) out.innerText = `❌ ${err.message}`;
    }
  });

  // Autologin -> mostrar dashboard
  if (empresaAutenticada && $('#empresa-dashboard', root)) {
    mostrarDashboard(root);
  }
}

function mostrarDashboard(root = document) {
  const dashboard = $('#empresa-dashboard', root);
  if (!dashboard) return;

  $('.empresa-auth-cta', root)?.classList.add('hidden');
  $('.empresa-intro', root)?.classList.add('hidden');
  $('.empresa-subscription', root)?.classList.add('hidden');

  dashboard.classList.remove('hidden');
  dashboard.style.display = 'block';

  // Añadir Logout si no existe
  if (!$('#btn-logout', dashboard)) {
    const header = $('.dashboard-header', dashboard) || dashboard;
    const btnLogout = document.createElement('button');
    btnLogout.textContent = 'Cerrar sesión';
    btnLogout.className = 'btn btn-secondary';
    btnLogout.id = 'btn-logout';
    btnLogout.addEventListener('click', () => {
      clearEmpresa();
      $('.empresa-auth-cta')?.classList.remove('hidden');
      $('.empresa-intro')?.classList.remove('hidden');
      $('.empresa-subscription')?.classList.remove('hidden');
      dashboard.classList.add('hidden');
      dashboard.style.display = 'none';
      btnLogout.remove();
    });
    header.appendChild(btnLogout);
  }
}

function initModalesAuth(root = document) {
  const modal = $('#modal-auth', root);
  const btnOpenRegistro = $('#btn-open-registro', root);
  const btnOpenLogin = $('#btn-open-login', root);
  const btnCloseModal = $('#btn-close-modal', root);
  const formRegistro = $('#form-registro-empresa', root);
  const formLogin = $('#form-login-empresa', root);

  if (!(modal && btnOpenRegistro && btnOpenLogin && btnCloseModal && formRegistro && formLogin)) return;

  btnOpenRegistro.addEventListener('click', () => {
    modal.style.display = 'flex';
    formRegistro.style.display = 'flex';
    formLogin.style.display = 'none';
  });

  btnOpenLogin.addEventListener('click', () => {
    modal.style.display = 'flex';
    formLogin.style.display = 'flex';
    formRegistro.style.display = 'none';
  });

  btnCloseModal.addEventListener('click', () => {
    modal.style.display = 'none';
    formLogin.style.display = 'none';
    formRegistro.style.display = 'none';
  });
}

function initDashboard(root = document) {
  const dashboard = $('#empresa-dashboard', root);
  const dashboardContent = $('#dashboard-content', root);
  if (!dashboard) return;

  // Delegación: sirve para botones que aparecen tras cargar parciales
  dashboard.addEventListener('click', async (e) => {
    const btn = e.target.closest('.dashboard-tabs button');
    if (!btn) return;
    const page = btn.getAttribute('data-page');
    if (!page || !dashboardContent) return;
    try {
      const res = await fetch(page, { cache: 'no-cache' });
      if (!res.ok) throw new Error('No se pudo cargar la página.');
      const html = await res.text();
      dashboardContent.innerHTML = html;
      initComponents(dashboardContent); // re-activar scripts dentro del parcial
    } catch (err) {
      dashboardContent.innerHTML = '<p>Error al cargar el contenido.</p>';
      console.error(err);
    }
  });
}
