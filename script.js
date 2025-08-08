// ============================
// Config
// ============================
const API_BASE = "https://nanasyncbackend.onrender.com";

// ============================
// Logger (navegador + Render)
// ============================
function enviarLog(level, message, context = null) {
  // Consola del navegador
  const tag = `[${level.toUpperCase()}] ${message}`;
  if (level === "error") console.error(tag, context || "");
  else if (level === "warn") console.warn(tag, context || "");
  else console.info(tag, context || "");

  // Enviar a Render (ignora fallo)
  fetch(`${API_BASE}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message, context })
  }).catch(() => {});
}

// ============================
// Utilidades DOM / Estado
// ============================
const $ = (sel, root = document) => root.querySelector(sel);

function setEmpresaAutenticada(obj) {
  localStorage.setItem("empresaAutenticada", JSON.stringify(obj));
  enviarLog("info", "empresaAutenticada guardada", obj);
}
function getEmpresaAutenticada() {
  try {
    const raw = localStorage.getItem("empresaAutenticada");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearEmpresaAutenticada() {
  localStorage.removeItem("empresaAutenticada");
  enviarLog("info", "empresaAutenticada limpiada");
}

function setEmpleadoAutenticado(obj) {
  localStorage.setItem("empleadoAutenticado", JSON.stringify(obj));
  enviarLog("info", "empleadoAutenticado guardado", { usuario: obj?.usuario, _id: obj?._id });
}
function getEmpleadoAutenticado() {
  try {
    const raw = localStorage.getItem("empleadoAutenticado");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearEmpleadoAutenticado() {
  localStorage.removeItem("empleadoAutenticado");
  enviarLog("info", "empleadoAutenticado limpiado");
}

// ============================
// SPA / Navegación
// ============================
document.addEventListener("DOMContentLoaded", () => {
  enviarLog("info", "DOM cargado - inicializando app");
  const links = document.querySelectorAll(".sidebar-nav a");
  const main = document.getElementById("main-content");

  async function cargarPagina(page) {
    try {
      enviarLog("info", "SPA cargarPagina", { page });
      if (!page.endsWith(".html")) page += ".html";
      const res = await fetch(page, { cache: "no-cache" });
      if (!res.ok) throw new Error(`No se pudo cargar ${page}`);
      const html = await res.text();
      main.innerHTML = html;

      // Re-enlazar eventos de la vista cargada
      inicializarComponentes();

      // Si volvemos a empresas y ya hay sesión empresa, muestra dashboard
      if (page === "empresas.html" && getEmpresaAutenticada()) {
        mostrarDashboard();
      }
      main.scrollTo?.(0, 0);
    } catch (err) {
      enviarLog("error", "SPA error cargando página", { page, error: err.message });
      main.innerHTML = `<p>Error al cargar el contenido.</p>`;
    }
  }

  function activarNavegacion() {
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (link.hasAttribute("data-home")) {
          enviarLog("info", "SPA home -> reload");
          location.reload();
          return;
        }
        const page = link.getAttribute("data-page");
        if (page) cargarPagina(page);
      });
    });
  }

  activarNavegacion();
  inicializarComponentes(); // inicial para la home
});

// ============================
// Inicialización de vistas (se llama tras cada carga)
// ============================
function inicializarComponentes() {
  enviarLog("info", "Inicializando componentes de la vista actual");

  initModalesAuth();
  initDashboardTabs();
  initRegistroEmpresa();
  initLoginEmpresa();
  initAltaEmpleado();
  initLoginEmpleado(); // si estamos en empleados.html
}

// ============================
// Modales Auth (empresa)
// ============================
function initModalesAuth() {
  const modal = $("#modal-auth");
  const btnOpenRegistro = $("#btn-open-registro");
  const btnOpenLogin = $("#btn-open-login");
  const btnCloseModal = $("#btn-close-modal");

  const formRegistro = $("#form-registro-empresa");
  const formLogin = $("#form-login-empresa");

  if (!modal) return; // vista no tiene modal

  if (btnOpenRegistro) {
    btnOpenRegistro.onclick = () => {
      enviarLog("info", "Abrir modal REGISTRO");
      modal.style.display = "flex";
      if (formRegistro) formRegistro.style.display = "flex";
      if (formLogin) formLogin.style.display = "none";
    };
  }
  if (btnOpenLogin) {
    btnOpenLogin.onclick = () => {
      enviarLog("info", "Abrir modal LOGIN");
      modal.style.display = "flex";
      if (formLogin) formLogin.style.display = "flex";
      if (formRegistro) formRegistro.style.display = "none";
    };
  }
  if (btnCloseModal) {
    btnCloseModal.onclick = () => {
      enviarLog("info", "Cerrar modal AUTH");
      modal.style.display = "none";
      if (formLogin) formLogin.style.display = "none";
      if (formRegistro) formRegistro.style.display = "none";
    };
  }
}

// ============================
// Dashboard Empresa (mostrar sección)
// ============================
function mostrarDashboard(root = document) {
  const empresa = getEmpresaAutenticada();
  if (!empresa) return;

  const nombreSpan = $("#empresa-nombre", root);
  if (nombreSpan) nombreSpan.textContent = empresa.nombre;

  [".empresa-auth-cta", ".empresa-intro", ".empresa-subscription"].forEach((sel) => {
    const el = $(sel, root);
    if (el) el.classList.add("hidden");
  });

  const dashboard = $("#empresa-dashboard", root);
  if (dashboard) {
    dashboard.classList.remove("hidden");
    dashboard.style.display = "block";
  }

  // Botón logout único
  if (!$("#btn-logout", dashboard)) {
    const header = dashboard?.querySelector(".dashboard-header") || dashboard;
    const btnLogout = document.createElement("button");
    btnLogout.id = "btn-logout";
    btnLogout.className = "btn btn-secondary";
    btnLogout.textContent = "Cerrar sesión";
    btnLogout.addEventListener("click", () => {
      enviarLog("info", "Logout empresa");
      clearEmpresaAutenticada();
      [".empresa-auth-cta", ".empresa-intro", ".empresa-subscription"].forEach((sel) => {
        const el = $(sel);
        if (el) el.classList.remove("hidden");
      });
      if (dashboard) {
        dashboard.classList.add("hidden");
        dashboard.style.display = "none";
      }
      btnLogout.remove();
    });
    header?.appendChild(btnLogout);
  }
}

// ============================
// Tabs Dashboard (carga parciales)
// ============================
function initDashboardTabs() {
  const dashboard = $("#empresa-dashboard");
  const dashboardContent = $("#dashboard-content");
  if (!dashboard) return;

  dashboard.querySelectorAll(".dashboard-tabs button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const page = btn.getAttribute("data-page");
      if (!page || !dashboardContent) return;
      try {
        enviarLog("info", "Dashboard tab click", { page });
        const res = await fetch(page, { cache: "no-cache" });
        if (!res.ok) throw new Error("No se pudo cargar la página.");
        const html = await res.text();
        dashboardContent.innerHTML = html;
        inicializarComponentes(); // rebind en el parcial
      } catch (err) {
        enviarLog("error", "Error cargando parcial dashboard", { page, error: err.message });
        dashboardContent.innerHTML = "<p>Error al cargar el contenido.</p>";
      }
    });
  });
}

// ============================
// Registro Empresa
// ============================
function initRegistroEmpresa() {
  const form = $("#form-registro-empresa");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = $("#nombre")?.value?.trim();
    const email = $("#email")?.value?.trim();
    const password = $("#password")?.value;

    if (!nombre || !email || !password) {
      enviarLog("warn", "Registro empresa: campos faltantes", { nombreOk: !!nombre, emailOk: !!email, passOk: !!password });
      return alert("⚠️ Todos los campos son obligatorios");
    }

    try {
      enviarLog("info", "POST /api/empresas", { nombre, email });
      const res = await fetch(`${API_BASE}/api/empresas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json().catch(() => ({}));
      enviarLog("info", "Respuesta /api/empresas", { status: res.status, data });

      if (!res.ok) return alert(`❌ ${data.error || "Error creando empresa"}`);

      setEmpresaAutenticada({ _id: data._id, nombre: data.nombre, email: data.email });
      alert("✅ Empresa registrada correctamente.");
      $("#modal-auth") && ($("#modal-auth").style.display = "none");
      mostrarDashboard();
    } catch (err) {
      enviarLog("error", "Registro empresa error", { error: err.message });
      alert("❌ Error de red");
    }
  });
}

// ============================
// Login Empresa
// ============================
function initLoginEmpresa() {
  const form = $("#form-login-empresa");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#login-email")?.value?.trim();
    const password = $("#login-password")?.value;

    if (!email || !password) {
      enviarLog("warn", "Login empresa: campos faltantes", { emailOk: !!email, passOk: !!password });
      return alert("⚠️ Email y contraseña requeridos");
    }

    try {
      enviarLog("info", "POST /api/login-empresa", { email });
      const res = await fetch(`${API_BASE}/api/login-empresa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      enviarLog("info", "Respuesta /api/login-empresa", { status: res.status, data });

      if (!res.ok) return alert(`❌ ${data.error || "Credenciales inválidas"}`);

      setEmpresaAutenticada({ _id: data._id, nombre: data.nombre, email: data.email });
      alert(`✅ Bienvenido ${data.nombre}`);
      $("#modal-auth") && ($("#modal-auth").style.display = "none");
      mostrarDashboard();
    } catch (err) {
      enviarLog("error", "Login empresa error", { error: err.message });
      alert("❌ Error de red");
    }
  });
}

// ============================
// Alta Empleado (Gestión) con credenciales opcionales
// ============================
function initAltaEmpleado() {
  const form = $("#form-nuevo-empleado");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const empresa = getEmpresaAutenticada();
    if (!empresa?._id && !empresa?.id) {
      enviarLog("warn", "Alta empleado sin empresa autenticada");
      return alert("⚠️ Debes iniciar sesión como empresa.");
    }

    const datos = {
      nombre: form.nombre?.value?.trim(),
      edad: Number(form.edad?.value),
      puesto: form.puesto?.value?.trim(),
      rango: form.rango?.value?.trim(),
      horario: { entrada: form.entrada?.value, salida: form.salida?.value },
      rol: "empleado",
      estadoConexion: "inactivo",
      fichado: false,
      ultimoFichaje: new Date().toISOString(),
      empresaId: empresa._id || empresa.id,
      // opcionales si existen en el formulario
      usuario: form.usuario?.value?.trim() || undefined,
      password: form.password?.value || undefined
    };

    if (!datos.nombre || !Number.isFinite(datos.edad) || !datos.puesto || !datos.rango || !datos.horario?.entrada || !datos.horario?.salida) {
      enviarLog("warn", "Alta empleado: validación fallida", datos);
      return alert("⚠️ Completa todos los campos obligatorios");
    }

    try {
      enviarLog("info", "POST /api/empleados", { ...datos, password: datos.password ? "***" : undefined });
      const res = await fetch(`${API_BASE}/api/empleados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      const resultado = await res.json().catch(() => ({}));
      enviarLog("info", "Respuesta /api/empleados", { status: res.status, resultado });

      const out = $("#respuesta-empleado");
      if (!res.ok) {
        if (out) out.innerText = "❌ Error: " + (resultado.error || "No se pudo crear");
        return;
      }

      // Mostrar credenciales generadas (si el backend las devolvió)
      if (out) {
        const cred = [];
        if (resultado.usuario) cred.push(`Usuario: ${resultado.usuario}`);
        if (resultado.tempPassword) cred.push(`Password temporal: ${resultado.tempPassword}`);
        out.innerHTML = `✅ Empleado añadido correctamente` + (cred.length ? `<br><small>${cred.join(" — ")}</small>` : "");
      }
      form.reset?.();
    } catch (err) {
      enviarLog("error", "Alta empleado error", { error: err.message });
      const out = $("#respuesta-empleado");
      if (out) out.innerText = "❌ Error al conectar con el servidor";
    }
  });
}

// ============================
// Login Empleado + Perfil (empleados.html)
// ============================
function initLoginEmpleado() {
  const form = $("#form-login-empleado");
  if (!form) return; // no estamos en empleados.html

  const dash = $("#empleado-dashboard");
  const perfil = $("#empleado-perfil");
  const btnLogout = $("#btn-logout-empleado");

  // Si ya hay sesión de empleado, muestra directamente
  const empSaved = getEmpleadoAutenticado();
  if (empSaved && dash && perfil) {
    form.classList.add("hidden");
    dash.classList.remove("hidden");
    perfil.innerHTML = perfilHTML(empSaved);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = $("#emp-usuario")?.value?.trim();
    const password = $("#emp-password")?.value;

    if (!usuario || !password) {
      enviarLog("warn", "Login empleado: campos faltantes", { usuarioOk: !!usuario, passOk: !!password });
      return alert("⚠️ Usuario y contraseña requeridos");
    }

    try {
      enviarLog("info", "POST /api/login-empleado", { usuario });
      const res = await fetch(`${API_BASE}/api/login-empleado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password })
      });
      const emp = await res.json().catch(() => ({}));
      enviarLog("info", "Respuesta /api/login-empleado", { status: res.status, emp });

      if (!res.ok) return alert(`❌ ${emp.error || "Credenciales inválidas"}`);

      setEmpleadoAutenticado(emp);
      if (form) form.classList.add("hidden");
      if (dash) dash.classList.remove("hidden");
      if (perfil) perfil.innerHTML = perfilHTML(emp);
    } catch (err) {
      enviarLog("error", "Login empleado error", { error: err.message });
      alert("❌ Error de red");
    }
  });

  btnLogout?.addEventListener("click", () => {
    clearEmpleadoAutenticado();
    dash?.classList.add("hidden");
    form?.classList.remove("hidden");
  });

  function perfilHTML(emp) {
    return `
      <strong>${emp.nombre}</strong><br/>
      Usuario: ${emp.usuario}<br/>
      Puesto: ${emp.puesto} — Rango: ${emp.rango}<br/>
      Horario: ${emp.horario?.entrada || "-"} - ${emp.horario?.salida || "-"}
    `;
  }
}
