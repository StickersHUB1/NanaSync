const empleados = [
  {
    nombre: "Aitana Rodríguez Santos",
    puesto: "Atención al Cliente",
    horario: "06:00 – 14:00",
    estado: "activo"
  },
  {
    nombre: "Javier Torres Mejía",
    puesto: "Soporte Técnico",
    horario: "14:00 – 22:00",
    estado: "inactivo"
  },
  {
    nombre: "Lucía Moreno García",
    puesto: "Administración",
    horario: "09:00 – 17:00",
    estado: "activo"
  },
  {
    nombre: "Pedro Ruiz Cortés",
    puesto: "Ventas",
    horario: "10:00 – 18:00",
    estado: "inactivo"
  }
];

function horaDentroDeRango(rango) {
  const [start, end] = rango.split("–").map(h => parseInt(h.trim().split(":")[0]));
  const ahora = new Date().getHours();
  return ahora >= start && ahora < end;
}

let empleadoSeleccionado = null;

function crearTarjeta(empleado, esInteractivo = false) {
  const card = document.createElement("div");
  card.className = "card";

  const dot = document.createElement("div");
  dot.className = "status-dot " + (empleado.estado === "activo" ? "dot-green" : "dot-red");

  const dentroDeRango = horaDentroDeRango(empleado.horario);
  if (empleado.estado === "inactivo" && dentroDeRango) {
    dot.classList.add("parpadeo");
  }

  const photo = document.createElement("div");
  photo.className = "photo";

  const info = document.createElement("div");
  info.className = "info";
  info.innerHTML = `<strong>${empleado.nombre}</strong><br>${empleado.puesto}<br>${empleado.horario}`;

  card.appendChild(dot);
  card.appendChild(photo);
  card.appendChild(info);

  if (esInteractivo) {
    card.style.cursor = "pointer";
    card.title = "Haz clic para gestionar";
    card.onclick = () => {
      empleadoSeleccionado = empleado;
      mostrarModal(empleado);
    };
  }

  return card;
}

function cargarActividad() {
  const grid = document.getElementById("actividad-grid");
  if (!grid) return;
  grid.innerHTML = "";
  empleados.forEach(emp => {
    grid.appendChild(crearTarjeta(emp));
  });
}

function cargarMonitorizacion() {
  const grid = document.getElementById("monitorizacion-grid");
  if (!grid) return;
  grid.innerHTML = "";
  empleados
    .filter(emp => emp.estado === "activo")
    .forEach(emp => {
      grid.appendChild(crearTarjeta(emp, true));
    });
}

function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("visible"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  const panel = document.getElementById(`${tab}-panel`);
  if (panel) panel.classList.add("visible");

  const btn = [...document.querySelectorAll(".tab-btn")].find(b =>
    b.textContent.toLowerCase().includes(tab)
  );
  if (btn) btn.classList.add("active");

  if (tab === "actividad") cargarActividad();
  if (tab === "monitorizacion") cargarMonitorizacion();
}

function mostrarModal(emp) {
  document.getElementById("modal-title").textContent = emp.nombre;
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  empleadoSeleccionado = null;
}

function accionSolicitarMonitorizacion() {
  if (!empleadoSeleccionado) return;
  alert(`Solicitud de monitorización enviada a ${empleadoSeleccionado.nombre}.`);
  cerrarModal();
}

function verificarAccesoAdmin() {
  const activo = localStorage.getItem("empleadoActivo");
  if (!activo) return false;

  const user = JSON.parse(activo);
  return user.rol === "admin";
}

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
  if (!verificarAccesoAdmin()) {
    document.getElementById("main-content").innerHTML = `
      <div class="access-denied">
        <h2>🚫 Acceso restringido</h2>
        <p>Solo usuarios con permisos de administrador pueden acceder a Insight Track.</p>
      </div>`;
    return;
  }

  // Si es admin, iniciamos en la pestaña 'actividad'
  switchTab("actividad");
});
