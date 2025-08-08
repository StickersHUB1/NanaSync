// ============================
// NanaSync - script.js (COMPLETO, actualizado)
// ============================

// 🔗 Backend
const API_BASE = "https://nanasyncbackend.onrender.com";

// 🪵 Logger (navegador + Render)
function enviarLog(level, message, context = null) {
  const tag = `[${level.toUpperCase()}] ${message}`;
  try {
    if (level === "error") console.error(tag, context || "");
    else if (level === "warn") console.warn(tag, context || "");
    else console.info(tag, context || "");
  } catch (_) {}
  // Enviar a Render (ignora fallo)
  fetch(`${API_BASE}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message, context })
  }).catch(() => {});
}

// 🧠 Estado (empresa/empleado)
let empresaAutenticada = null;

function setEmpresaAutenticada(data) {
  empresaAutenticada = data ? { id: data._id || data.id, _id: data._id || data.id, nombre: data.nombre, email: data.email } : null;
  localStorage.setItem("empresaAutenticada", JSON.stringify(empresaAutenticada));
  enviarLog("info", "empresaAutenticada guardada", empresaAutenticada);
}
function restoreEmpresaAutenticada() {
  try {
    const raw = localStorage.getItem("empresaAutenticada");
    if (raw) {
      const parsed = JSON.parse(raw);
      empresaAutenticada = parsed ? { id: parsed._id || parsed.id, _id: parsed._id || parsed.id, nombre: parsed.nombre, email: parsed.email } : null;
    }
  } catch (_) {}
}
function clearEmpresaAutenticada() {
  empresaAutenticada = null;
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
  } catch { return null; }
}
function clearEmpleadoAutenticado() {
  localStorage.removeItem("empleadoAutenticado");
  enviarLog("info", "empleadoAutenticado limpiado");
}

// 🧰 DOM helper
const $ = (sel, root = document) => root.querySelector(sel);

// ============================
// SPA
// ============================
document.addEventListener("DOMContentLoaded", () => {
  enviarLog("info", "DOM cargado - init");
  restoreEmpresaAutenticada();

  const links = document.querySelectorAll(".sidebar-nav a");
  const main = document.getElementById("main-content");

  const activarNavegacion = () => {
    links.forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();

        if (link.hasAttribute("data-home")) {
          enviarLog("info", "NAV -> home reload");
          location.reload();
          return;
        }

        let page = link.getAttribute("data-page");
        enviarLog("info", "NAV -> click", { page });
        if (!page) return;
        if (!page.endsWith(".html")) page += ".html";

        try {
          enviarLog("info", "SPA fetch", { page });
          const response = await fetch(page, { cache: "no-cache" });
          if (!response.ok) throw new Error("No se pudo cargar la página.");
          const html = await response.text();
          main.innerHTML = html;

          inicializarComponentes();

          if (page === "empresas.html" && empresaAutenticada) {
            mostrarDashboard();
          }

          main.scrollTo?.(0, 0);
        } catch (err) {
          enviarLog("error", "SPA error cargando", { page, error: err.message });
          main.innerHTML = `<p>Error al cargar el contenido.</p>`;
        }
      });
    });
  };

  activarNavegacion();
  inicializarComponentes(); // primera vista (home)
});

// ============================
// Inicialización por vista
// ============================
function inicializarComponentes() {
  enviarLog("info", "Init componentes vista");

  initModalesAuth();
  initDashboardTabs();
  initRegistroEmpresa();
  initLoginEmpresa();
  initAltaEmpleado();
  initLoginEmpleado();     // empleados.html
  initEmpleadosTab();      // pestaña EMPLEADOS dentro de empresas.html
}

// ============================
// Modales (registro/login empresa)
// ============================
function initModalesAuth() {
  const modal = $("#modal-auth");
  const btnOpenRegistro = $("#btn-open-registro");
  const btnOpenLogin = $("#btn-open-login");
  const btnCloseModal = $("#btn-close-modal");

  const formRegistro = $("#form-registro-empresa");
  const formLogin = $("#form-login-empresa");

  if (!modal) return;

  if (btnOpenRegistro) {
    btnOpenRegistro.onclick = () => {
      enviarLog("info", "Modal -> abrir REGISTRO");
      modal.style.display = "flex";
      formRegistro && (formRegistro.style.display = "flex");
      formLogin && (formLogin.style.display = "none");
    };
  }
  if (btnOpenLogin) {
    btnOpenLogin.onclick = () => {
      enviarLog("info", "Modal -> abrir LOGIN");
      modal.style.display = "flex";
      formLogin && (formLogin.style.display = "flex");
      formRegistro && (formRegistro.style.display = "none");
    };
  }
  if (btnCloseModal) {
    btnCloseModal.onclick = () => {
      enviarLog("info", "Modal -> cerrar AUTH");
      modal.style.display = "none";
      formLogin && (formLogin.style.display = "none");
      formRegistro && (formRegistro.style.display = "none");
    };
  }
}

// ============================
// Dashboard Empresa (mostrar)
// ============================
function mostrarDashboard(root = document) {
  enviarLog("info", "Mostrar dashboard empresa");
  const dashboard = $("#empresa-dashboard");
  const sectionAuth = $(".empresa-auth-cta");
  const sectionIntro = $(".empresa-intro");
  const sectionSubscription = $(".empresa-subscription");

  if (!dashboard) return;

  sectionAuth?.classList.add("hidden");
  sectionIntro?.classList.add("hidden");
  sectionSubscription?.classList.add("hidden");

  dashboard.classList.remove("hidden");
  dashboard.style.display = "block";

  if (!document.getElementById("btn-logout")) {
    const header = dashboard.querySelector(".dashboard-header");
    const btnLogout = document.createElement("button");
    btnLogout.textContent = "Cerrar sesión";
    btnLogout.className = "btn btn-secondary";
    btnLogout.id = "btn-logout";
    btnLogout.addEventListener("click", () => {
      enviarLog("info", "Empresa -> logout");
      clearEmpresaAutenticada();
      sectionAuth?.classList.remove("hidden");
      sectionIntro?.classList.remove("hidden");
      sectionSubscription?.classList.remove("hidden");
      dashboard.classList.add("hidden");
      dashboard.style.display = "none";
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

  const tabButtons = dashboard.querySelectorAll(".dashboard-tabs button");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const page = btn.getAttribute("data-page");
      enviarLog("info", "Dashboard tab", { page });
      if (!page || !dashboardContent) return;

      try {
        const response = await fetch(page, { cache: "no-cache" });
        if (!response.ok) throw new Error("No se pudo cargar la página.");
        const html = await response.text();
        dashboardContent.innerHTML = html;

        // modo visual correcto para el tab de empleados (quita centrado/verde)
        dashboardContent.classList.add("empleados-mode");

        inicializarComponentes(); // re-bind en parcial
      } catch (err) {
        enviarLog("error", "Dashboard parcial error", { page, error: err.message });
        dashboardContent.innerHTML = "<p>Error al cargar el contenido.</p>";
      }
    });
  });
}

// ============================
// Registro Empresa
// ============================
function initRegistroEmpresa() {
  const formRegistro = document.getElementById("form-registro-empresa");
  if (!formRegistro) return;

  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;

    if (!nombre || !email || !password) {
      enviarLog("warn", "Registro empresa -> faltan campos", { nombreOk: !!nombre, emailOk: !!email, passOk: !!password });
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
      enviarLog("info", "RESP /api/empresas", { status: res.status, data });

      if (!res.ok) return alert(`❌ ${data.error || "Error creando empresa"}`);

      setEmpresaAutenticada(data);
      alert("✅ Empresa registrada correctamente.");
      const modal = document.getElementById("modal-auth");
      if (modal) modal.style.display = "none";
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
  const formLogin = document.getElementById("form-login-empresa");
  if (!formLogin) return;

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email")?.value?.trim();
    const password = document.getElementById("login-password")?.value;

    if (!email || !password) {
      enviarLog("warn", "Login empresa -> faltan campos", { emailOk: !!email, passOk: !!password });
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
      enviarLog("info", "RESP /api/login-empresa", { status: res.status, data });

      if (!res.ok) return alert(`❌ ${data.error || "Credenciales inválidas"}`);

      setEmpresaAutenticada(data);
      alert(`✅ Bienvenido ${data.nombre}`);
      const modal = document.getElementById("modal-auth");
      if (modal) modal.style.display = "none";
      mostrarDashboard();
    } catch (err) {
      enviarLog("error", "Login empresa error", { error: err.message });
      alert("❌ Error de red");
    }
  });
}

// ============================
// Alta Empleado (Gestión) – soporta usuario/password opcionales
// ============================
function initAltaEmpleado() {
  const formEmpleado = document.getElementById("form-nuevo-empleado");
  if (!formEmpleado) return;

  formEmpleado.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!empresaAutenticada?.id && !empresaAutenticada?._id) {
      enviarLog("warn", "Alta empleado sin login empresa");
      alert("⚠️ Debes estar logueado como empresa para añadir empleados.");
      return;
    }

    const form = e.target;
    const datos = {
      nombre: form.nombre?.value?.trim(),
      edad: Number(form.edad?.value),
      puesto: form.puesto?.value?.trim(),
      rango: form.rango?.value?.trim(),
      horario: {
        entrada: form.entrada?.value,
        salida: form.salida?.value
      },
      rol: "empleado",
      estadoConexion: "inactivo",
      fichado: false,
      ultimoFichaje: new Date().toISOString(),
      empresaId: empresaAutenticada._id || empresaAutenticada.id,
      // opcionales si existen en el formulario
      usuario: form.usuario?.value?.trim() || undefined,
      password: form.password?.value || undefined
    };

    if (!datos.nombre || !Number.isFinite(datos.edad) || !datos.puesto || !datos.rango || !datos.horario?.entrada || !datos.horario?.salida) {
      enviarLog("warn", "Alta empleado -> validación fallida", datos);
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
      enviarLog("info", "RESP /api/empleados", { status: res.status, resultado });

      const out = document.getElementById("respuesta-empleado");
      if (!res.ok) {
        out && (out.innerText = "❌ Error: " + (resultado.error || "No se pudo crear"));
        return;
      }

      // Mostrar credenciales devueltas (usuario + password temporal si las generó el backend)
      if (out) {
        const cred = [];
        if (resultado.usuario) cred.push(`Usuario: ${resultado.usuario}`);
        if (resultado.tempPassword) cred.push(`Password temporal: ${resultado.tempPassword}`);
        out.innerHTML = `✅ Empleado añadido correctamente` + (cred.length ? `<br><small>${cred.join(" — ")}</small>` : "");
      }

      form.reset?.();
    } catch (err) {
      enviarLog("error", "Alta empleado error", { error: err.message });
      const out = document.getElementById("respuesta-empleado");
      out && (out.innerText = "❌ Error al conectar con el servidor");
    }
  });
}

// ============================
// Login Empleado + Perfil (empleados.html)
// ============================
function initLoginEmpleado() {
  const form = document.getElementById("form-login-empleado");
  if (!form) return; // no estamos en empleados.html

  const dash = document.getElementById("empleado-dashboard");
  const perfil = document.getElementById("empleado-perfil");
  const btnLogout = document.getElementById("btn-logout-empleado");

  // Restaurar sesión empleado si existe
  const empSaved = getEmpleadoAutenticado();
  if (empSaved && dash && perfil) {
    form.classList.add("hidden");
    dash.classList.remove("hidden");
    perfil.innerHTML = perfilHTML(empSaved);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("emp-usuario")?.value?.trim();
    const password = document.getElementById("emp-password")?.value;

    if (!usuario || !password) {
      enviarLog("warn", "Login empleado -> faltan campos", { usuarioOk: !!usuario, passOk: !!password });
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
      enviarLog("info", "RESP /api/login-empleado", { status: res.status, emp });

      if (!res.ok) return alert(`❌ ${emp.error || "Credenciales inválidas"}`);

      setEmpleadoAutenticado(emp);
      form.classList.add("hidden");
      dash?.classList.remove("hidden");
      perfil && (perfil.innerHTML = perfilHTML(emp));
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

// ============================
// Pestaña EMPLEADOS (dentro de empresas.html)
// ============================
async function initEmpleadosTab() {
  const grid = document.getElementById("emp-grid");
  if (!grid) return;

  // Modo visual correcto: desactiva centrado/verde del dashboard-content
  const dc = document.getElementById("dashboard-content");
  dc?.classList.add("empleados-mode");

  const qInput = document.getElementById("emp-q");
  const btnRefresh = document.getElementById("emp-refresh");
  const summary = document.getElementById("emp-summary");
  const empty = document.getElementById("emp-empty");

  const empresaStore = JSON.parse(localStorage.getItem("empresaAutenticada") || "null");
  const empresaId = empresaStore?._id || empresaStore?.id;

  if (!empresaId) {
    grid.innerHTML = "";
    empty?.classList.remove("hidden");
    empty && (empty.textContent = "Inicia sesión como empresa para ver la plantilla.");
    return;
  }

  let page = 1;
  const limit = 50;

  const fetchAndRender = async () => {
    try {
      const q = (qInput?.value || "").trim();
      const url = new URL(`${API_BASE}/api/empleados`);
      url.searchParams.set("empresaId", empresaId);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      if (q) url.searchParams.set("q", q);

      const res = await fetch(url.toString());
      const data = await res.json();
      const items = data?.items ?? (Array.isArray(data) ? data : []);

      if (summary) {
        const total = data?.total ?? items.length;
        summary.textContent = `Total: ${total}${data?.page ? ` · Página ${data.page}` : ""}`;
      }

      if (!items.length) {
        grid.innerHTML = "";
        empty?.classList.remove("hidden");
        return;
      }

      empty?.classList.add("hidden");
      grid.innerHTML = items.map(cardEmpleadoHTML).join("");
    } catch (err) {
      enviarLog("error", "Listar empleados error", { error: err.message });
      grid.innerHTML = "";
      empty?.classList.remove("hidden");
      empty && (empty.textContent = "No se pudo cargar la lista.");
    }
  };

  qInput?.addEventListener("input", debounce(fetchAndRender, 250));
  btnRefresh?.addEventListener("click", fetchAndRender);
  fetchAndRender();
}

function cardEmpleadoHTML(emp) {
  const activo = String(emp.estadoConexion || "").toLowerCase() === "activo";
  const estadoColor = activo ? "#22c55e" : "#ef4444";
  const entrada = emp?.horario?.entrada || "--:--";
  const salida  = emp?.horario?.salida  || "--:--";
  const usuario = (emp.usuario || "").toLowerCase();

  return `
    <div class="empleado-card">
      <span class="estado-dot" style="background:${estadoColor};"></span>
      <div class="estado-header">
        <div class="foto-placeholder">Foto de<br/>Perfil</div>
      </div>
      <div class="emp-datos">
        <div class="emp-usuario">${usuario}</div>
        <div>${emp.puesto || "-"}</div>
        <div class="emp-meta">${emp.rango || "-"}</div>
        <div class="emp-meta">H: ${entrada} - ${salida}</div>
      </div>
      <div class="emp-actions">
        <button class="btn btn-secondary" data-admin="${emp._id}">Administrar</button>
      </div>
    </div>
  `;
}

// util
function debounce(fn, ms=300){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }
