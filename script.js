// ✅ URL base del backend en Render
const API_URL = "https://nanasyncbackend.onrender.com";

// 📌 Helper para seleccionar elementos
const $ = (sel, root = document) => root.querySelector(sel);

// 📌 Guardar y obtener empresa autenticada
function setEmpresaAutenticada(data) {
  localStorage.setItem("empresaAutenticada", JSON.stringify(data));
}
function getEmpresaAutenticada() {
  return JSON.parse(localStorage.getItem("empresaAutenticada"));
}

// 📌 Registro de empresa
const formRegistro = document.getElementById("form-registro-empresa");
formRegistro?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = $("#nombre").value.trim();
  const email = $("#email").value.trim();
  const password = $("#password").value.trim();

  try {
    const res = await fetch(`${API_URL}/api/empresas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(`❌ Error: ${data.error}`);
      return;
    }

    alert("✅ Empresa registrada correctamente.");
    $("#modal-auth").style.display = "none";
  } catch (err) {
    console.error("Error registrando empresa:", err);
    alert("❌ Error de red");
  }
});

// 📌 Login de empresa
const formLogin = document.getElementById("form-login-empresa");
formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("#login-email").value.trim();
  const password = $("#login-password").value.trim();

  try {
    const res = await fetch(`${API_URL}/api/login-empresa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(`❌ Error: ${data.error}`);
      return;
    }

    setEmpresaAutenticada(data);
    alert(`✅ Bienvenido ${data.nombre}`);
    mostrarDashboard();
  } catch (err) {
    console.error("Error iniciando sesión:", err);
    alert("❌ Error de red");
  }
});

// 📌 Mostrar dashboard de empresa
function mostrarDashboard(root = document) {
  const empresa = getEmpresaAutenticada();
  if (!empresa) return;

  const nombreSpan = document.getElementById("empresa-nombre");
  if (nombreSpan) nombreSpan.textContent = empresa.nombre;

  $(".empresa-auth-cta", root)?.classList.add("hidden");
  $(".empresa-intro", root)?.classList.add("hidden");
  $(".empresa-subscription", root)?.classList.add("hidden");

  const dashboard = $("#empresa-dashboard", root);
  if (dashboard) {
    dashboard.classList.remove("hidden");
    dashboard.style.display = "block";
  }
}

// 📌 Añadir empleado
const formEmpleado = document.getElementById("form-nuevo-empleado");
formEmpleado?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const empresa = getEmpresaAutenticada();
  if (!empresa) {
    alert("❌ Debes iniciar sesión primero.");
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

  try {
    const res = await fetch(`${API_URL}/api/empleados`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(`❌ Error: ${data.error}`);
      return;
    }

    alert(`✅ Empleado ${data.nombre} añadido correctamente`);
    e.target.reset();
  } catch (err) {
    console.error("Error registrando empleado:", err);
    alert("❌ Error de red");
  }
});

// ======================================================
// 🔹 LÓGICA DE NAVEGACIÓN DEL SIDEBAR (manteniendo tu flujo SPA)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar-nav a");
  const main = document.getElementById("main-content");

  const isLoggedIn = () => localStorage.getItem("empresaActiva") === "true";
  const setLoggedIn = () => localStorage.setItem("empresaActiva", "true");
  const logout = () => localStorage.removeItem("empresaActiva");

  const cargarPagina = async (url) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      main.innerHTML = html;

      if (url.includes("empresas.html") && isLoggedIn()) {
        mostrarDashboard();
      }
    } catch (err) {
      console.error("Error cargando página:", err);
      main.innerHTML = "<p>Error cargando contenido.</p>";
    }
  };

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page) {
        cargarPagina(page);
      }
    });
  });

  // Cargar página inicial
  const firstPage = links[0]?.getAttribute("data-page");
  if (firstPage) {
    cargarPagina(firstPage);
  }
});
