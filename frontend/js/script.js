console.log("Iniciando script.js");

const API_URL = "https://nanasyncbackend.onrender.com";
console.log("API_URL configurada como:", API_URL);

// Mapear rutas a archivos
const routes = {
  "/": "inicio",
  "/inicio": "inicio",
  "/fichaje": "fichaje",
  "/dashboard": "dashboard",
  "/insight_track": "insight_track",
};

const loadedScripts = new Set();

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
  router();
  // Captura clicks en <a data-link>
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });

  window.onpopstate = () => {
    router();
  };
});

// Navegación limpia
function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

function updateActiveLink(path) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = new URL(link.href).pathname;
    link.classList.toggle("active", href === path);
  });
}

async function router() {
  const path = window.location.pathname;
  const page = routes[path] || "inicio";
  updateActiveLink(path); // ✅ activa el enlace del sidebar
  await loadPage(page);
}


// Carga dinámica de página
async function loadPage(pageName) {
  const response = await fetch(`${pageName}.html`);
  const html = await response.text();
  document.querySelector("main").innerHTML = html;

  const scriptPath = `frontend/js/${pageName}.js`;
  if (!loadedScripts.has(scriptPath)) {
    const script = document.createElement("script");
    script.src = scriptPath;
    script.defer = true;
    document.body.appendChild(script);
    loadedScripts.add(scriptPath);
    console.log(`Script cargado: ${scriptPath}`);
  }

  // Acceso restringido
  if (pageName === "insight_track") {
    const empleado = getActiveEmployee();
    if (!empleado || empleado.rol !== "admin") {
      showNotification("Acceso restringido: solo administradores");
      document.querySelector("main").innerHTML = `
        <div class="access-denied">
          <h2>🚫 Acceso Denegado</h2>
          <p>Solo los empleados autorizados pueden acceder a Insight Track.</p>
        </div>`;
      return;
    }
  }
}

// Obtener sesión activa
function getActiveEmployee() {
  try {
    const empleado = JSON.parse(localStorage.getItem("empleadoActivo"));
    if (empleado && typeof empleado === "object") return empleado;
  } catch (err) {
    console.warn("Error leyendo localStorage:", err);
  }
  return null;
}

// Notificaciones visuales
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 4000);
}

window.navigateTo = navigateTo;
