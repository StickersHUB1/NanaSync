console.log("Iniciando script.js");

const API_URL = "https://nanasyncbackend.onrender.com";
console.log("API_URL configurada como:", API_URL);

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM completamente cargado");

  const initialPage = "fichaje";
  loadPage(initialPage);
});

// Prevención de duplicados al recargar scripts
const loadedScripts = new Set();

// Función para cargar páginas dinámicamente
async function loadPage(pageName) {
  console.log("Cargando página:", pageName);

  const response = await fetch(`${pageName}.html`);
  const html = await response.text();
  document.querySelector("main").innerHTML = html;

  const scriptPath = `frontend/js/${pageName}.js`;
  if (!loadedScripts.has(scriptPath)) {
    try {
      const script = document.createElement("script");
      script.src = scriptPath;
      script.defer = true;
      document.body.appendChild(script);
      loadedScripts.add(scriptPath);
      console.log(`${scriptPath} cargado`);
    } catch (err) {
      console.error(`Error cargando script: ${scriptPath}`, err);
    }
  } else {
    console.log(`${scriptPath} ya estaba cargado`);
  }

  // Reglas de acceso
  if (pageName === "insight_track") {
    const empleado = getActiveEmployee();
    if (!empleado || empleado.rol !== "admin") {
      console.warn("Acceso denegado a Insight Track");
      showNotification("Acceso restringido: solo administradores");
      document.querySelector("main").innerHTML = `
        <div class="access-denied">
          <h2>🚫 Acceso Denegado</h2>
          <p>Solo los empleados autorizados pueden acceder a Insight Track.</p>
        </div>
      `;
      return;
    }
  }
}

// Función utilitaria para leer sesión
function getActiveEmployee() {
  try {
    const empleado = JSON.parse(localStorage.getItem("empleadoActivo"));
    if (empleado && typeof empleado === "object") {
      console.log("Empleado activo:", empleado);
      return empleado;
    }
  } catch (err) {
    console.warn("Error leyendo localStorage:", err);
  }
  return null;
}

// Sistema de notificaciones visuales global
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

// Exponer funciones globales
window.loadPage = loadPage;
window.getActiveEmployee = getActiveEmployee;
window.showNotification = showNotification;
