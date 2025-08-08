// ============================
// ✅ Config
// ============================
const API_URL = "https://nanasyncbackend.onrender.com";

// ============================
// 🛠️ Helpers de logging
// ============================
const ts = () => new Date().toISOString();
const mask = (str) => (typeof str === "string" ? `${"*".repeat(Math.max(0, str.length - 2))}${str.slice(-2)}` : str);

function logInfo(ctx, msg, data) {
  console.info(`[${ts()}] ℹ️ ${ctx} :: ${msg}`, data ?? "");
}
function logWarn(ctx, msg, data) {
  console.warn(`[${ts()}] ⚠️ ${ctx} :: ${msg}`, data ?? "");
}
function logErr(ctx, msg, err, extra) {
  console.error(`[${ts()}] ❌ ${ctx} :: ${msg}`, { error: err?.message, stack: err?.stack, ...extra });
}

function groupStart(ctx, title, data) {
  console.groupCollapsed(`[${ts()}] 🔷 ${ctx} :: ${title}`);
  if (data !== undefined) console.log("↳ payload:", data);
}
function groupEnd() {
  console.groupEnd();
}

// ============================
// 🔎 DOM helpers
// ============================
const $ = (sel, root = document) => root.querySelector(sel);

// ============================
// 💾 Estado empresa (localStorage)
// ============================
function setEmpresaAutenticada(data) {
  groupStart("AuthStorage", "Guardar empresaAutenticada", data);
  try {
    localStorage.setItem("empresaAutenticada", JSON.stringify(data));
    logInfo("AuthStorage", "Guardado en localStorage", { key: "empresaAutenticada" });
  } catch (e) {
    logErr("AuthStorage", "Fallo guardando en localStorage", e);
  } finally {
    groupEnd();
  }
}
function getEmpresaAutenticada() {
  groupStart("AuthStorage", "Leer empresaAutenticada");
  try {
    const raw = localStorage.getItem("empresaAutenticada");
    logInfo("AuthStorage", "Leído de localStorage", { key: "empresaAutenticada", raw });
    const parsed = raw ? JSON.parse(raw) : null;
    logInfo("AuthStorage", "Parse OK", parsed);
    return parsed;
  } catch (e) {
    logErr("AuthStorage", "Fallo leyendo/parsing localStorage", e);
    return null;
  } finally {
    groupEnd();
  }
}

// ============================
// 🧭 Navegación SPA (sidebar)
// ============================
document.addEventListener("DOMContentLoaded", () => {
  groupStart("App", "DOMContentLoaded");
  const links = document.querySelectorAll(".sidebar-nav a");
  const main = document.getElementById("main-content");

  const isLoggedInLegacy = () => localStorage.getItem("empresaActiva") === "true"; // legado tuyo
  const setLoggedInLegacy = () => localStorage.setItem("empresaActiva", "true");
  const logoutLegacy = () => localStorage.removeItem("empresaActiva");

  async function cargarPagina(url) {
    groupStart("SPA", "Cargar página", { url });
    logInfo("SPA", "Inicio de operación", { url });
    try {
      logInfo("SPA", "HTTP -> fetch (GET)", { url, method: "GET" });
      const res = await fetch(url, { cache: "no-cache" });
      logInfo("SPA", "HTTP <- response", { ok: res.ok, status: res.status });
      const html = await res.text();
      main.innerHTML = html;
      logInfo("SPA", "DOM update", { action: "replace main.innerHTML", target: "#main-content", length: html.length });

      if (url.includes("empresas.html") && (isLoggedInLegacy() || getEmpresaAutenticada())) {
        logInfo("SPA", "Detectado estado logueado: mostrarDashboard()");
        mostrarDashboard();
      }
    } catch (e) {
      logErr("SPA", "Error cargando página", e, { url });
      main.innerHTML = "<p>Error cargando contenido.</p>";
    } finally {
      groupEnd();
    }
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      logInfo("SPA", "Click en link sidebar", { page, href: link.href });
      if (page) cargarPagina(page);
      if (link.hasAttribute("data-home")) {
        logInfo("SPA", "Home solicitado (reload)");
        location.reload();
      }
    });
  });

  // Cargar página inicial si existe
  const firstPage = links[0]?.getAttribute("data-page");
  if (firstPage) {
    logInfo("SPA", "Cargar primera página automáticamente", { firstPage });
    cargarPagina(firstPage);
  }
  groupEnd();
});

// ============================
// 🧩 Modales (abrir/cerrar)
// ============================
document.getElementById("btn-open-registro")?.addEventListener("click", () => {
  logInfo("Modal", "Abrir modal REGISTRO", { modal: "#modal-auth" });
  document.getElementById("modal-auth").style.display = "block";
  document.getElementById("form-registro-empresa").style.display = "block";
  document.getElementById("form-login-empresa").style.display = "none";
});

document.getElementById("btn-open-login")?.addEventListener("click", () => {
  logInfo("Modal", "Abrir modal LOGIN", { modal: "#modal-auth" });
  document.getElementById("modal-auth").style.display = "block";
  document.getElementById("form-login-empresa").style.display = "block";
  document.getElementById("form-registro-empresa").style.display = "none";
});

document.getElementById("btn-close-modal")?.addEventListener("click", () => {
  logInfo("Modal", "Cerrar modal", { modal: "#modal-auth" });
  document.getElementById("modal-auth").style.display = "none";
});

// ============================
// 🧠 Mostrar dashboard empresa
// ============================
function mostrarDashboard(root = document) {
  groupStart("Dashboard", "Mostrar dashboard");
  const empresa = getEmpresaAutenticada();
  if (!empresa) {
    logWarn("Dashboard", "No hay empresa autenticada en storage");
    groupEnd();
    return;
  }

  const nombreSpan = document.getElementById("empresa-nombre");
  if (nombreSpan) {
    nombreSpan.textContent = empresa.nombre;
    logInfo("Dashboard", "DOM update", { target: "#empresa-nombre", value: empresa.nombre });
  }

  [".empresa-auth-cta", ".empresa-intro", ".empresa-subscription"].forEach((sel) => {
    const el = $(sel, root);
    if (el) {
      el.classList.add("hidden");
      logInfo("Dashboard", "DOM update (ocultar)", { selector: sel, class: "hidden" });
    }
  });

  const dashboard = $("#empresa-dashboard", root);
  if (dashboard) {
    dashboard.classList.remove("hidden");
    dashboard.style.display = "block";
    logInfo("Dashboard", "DOM update (mostrar)", { selector: "#empresa-dashboard" });
  }
  groupEnd();
}

// ============================
// 📝 Registro de empresa
// ============================
const formRegistro = document.getElementById("form-registro-empresa");
formRegistro?.addEventListener("submit", async (e) => {
  groupStart("RegistroEmpresa", "Submit");
  e.preventDefault();

  const nombre = $("#nombre").value.trim();
  const email = $("#email").value.trim();
  const password = $("#password").value.trim();

  // Validación
  if (!nombre || !email || !password) {
    logWarn("RegistroEmpresa", "Datos inválidos/faltantes", { nombreOk: !!nombre, emailOk: !!email, passOk: !!password });
    alert("❌ Todos los campos son obligatorios");
    groupEnd();
    return;
  }

  logInfo("RegistroEmpresa", "Parámetros recibidos", { nombre, email, password: mask(password) });

  try {
    const url = `${API_URL}/api/empresas`;
    logInfo("RegistroEmpresa", "HTTP -> fetch", { url, method: "POST", body: { nombre, email, password: "<masked>" } });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });

    logInfo("RegistroEmpresa", "HTTP <- response", { ok: res.ok, status: res.status });
    const data = await res.json().catch(() => ({}));
    logInfo("RegistroEmpresa", "Response data", data);

    if (!res.ok) {
      alert(`❌ Error: ${data.error}`);
      groupEnd();
      return;
    }

    alert("✅ Empresa registrada correctamente.");
    document.getElementById("modal-auth").style.display = "none";
    logInfo("RegistroEmpresa", "DOM update", { hide: "#modal-auth" });
  } catch (err) {
    logErr("RegistroEmpresa", "Excepción en fetch", err);
    alert("❌ Error de red");
  } finally {
    groupEnd();
  }
});

// ============================
// 🔐 Login de empresa
// ============================
const formLogin = document.getElementById("form-login-empresa");
formLogin?.addEventListener("submit", async (e) => {
  groupStart("LoginEmpresa", "Submit");
  e.preventDefault();

  const email = $("#login-email").value.trim();
  const password = $("#login-password").value.trim();

  // Validación
  if (!email || !password) {
    logWarn("LoginEmpresa", "Datos inválidos/faltantes", { emailOk: !!email, passOk: !!password });
    alert("❌ Email y contraseña requeridos");
    groupEnd();
    return;
  }

  logInfo("LoginEmpresa", "Parámetros recibidos", { email, password: mask(password) });

  try {
    const url = `${API_URL}/api/login-empresa`;
    logInfo("LoginEmpresa", "HTTP -> fetch", { url, method: "POST", body: { email, password: "<masked>" } });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    logInfo("LoginEmpresa", "HTTP <- response", { ok: res.ok, status: res.status });
    const data = await res.json().catch(() => ({}));
    logInfo("LoginEmpresa", "Response data", data);

    if (!res.ok) {
      alert(`❌ Error: ${data.error}`);
      groupEnd();
      return;
    }

    setEmpresaAutenticada(data);
    alert(`✅ Bienvenido ${data.nombre}`);
    document.getElementById("modal-auth").style.display = "none";
    logInfo("LoginEmpresa", "DOM update", { hide: "#modal-auth" });

    mostrarDashboard();
  } catch (err) {
    logErr("LoginEmpresa", "Excepción en fetch", err);
    alert("❌ Error de red");
  } finally {
    groupEnd();
  }
});

// ============================
// 👤 Añadir empleado (Gestión)
// ============================
const formEmpleado = document.getElementById("form-nuevo-empleado");
formEmpleado?.addEventListener("submit", async (e) => {
  groupStart("AltaEmpleado", "Submit");
  e.preventDefault();

  const empresa = getEmpresaAutenticada();
  if (!empresa) {
    logWarn("AltaEmpleado", "Sin empresa autenticada");
    alert("❌ Debes iniciar sesión primero.");
    groupEnd();
    return;
  }

  const datos = {
    nombre: e.target.nombre.value.trim(),
    edad: parseInt(e.target.edad.value, 10),
    puesto: e.target.puesto.value.trim(),
    rango: e.target.rango.value.trim(),
    horario: {
      entrada: e.target.entrada.value,
      salida: e.target.salida.value
    },
    empresaId: empresa._id
  };

  // Validación previa
  if (!datos.nombre || !Number.isFinite(datos.edad) || !datos.puesto || !datos.rango || !datos.horario.entrada || !datos.horario.salida) {
    logWarn("AltaEmpleado", "Datos inválidos/faltantes", datos);
    alert("❌ Completa todos los campos del empleado");
    groupEnd();
    return;
  }

  logInfo("AltaEmpleado", "Parámetros recibidos", datos);

  try {
    const url = `${API_URL}/api/empleados`;
    logInfo("AltaEmpleado", "HTTP -> fetch", { url, method: "POST", body: datos });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    logInfo("AltaEmpleado", "HTTP <- response", { ok: res.ok, status: res.status });
    const data = await res.json().catch(() => ({}));
    logInfo("AltaEmpleado", "Response data", data);

    if (!res.ok) {
      alert(`❌ Error: ${data.error}`);
      groupEnd();
      return;
    }

    alert(`✅ Empleado ${data.nombre} añadido correctamente`);
    e.target.reset();
    logInfo("AltaEmpleado", "DOM update", { action: "form.reset()" });
  } catch (err) {
    logErr("AltaEmpleado", "Excepción en fetch", err);
    alert("❌ Error de red");
  } finally {
    groupEnd();
  }
});
