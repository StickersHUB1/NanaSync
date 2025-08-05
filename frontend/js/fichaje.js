const empleados = [
  {
    id: "1001",
    password: "nata123",
    nombre: "Lidia González",
    puesto: "Atención al Cliente",
    horario: "09:00 – 17:00",
    rol: "empleado"
  },
  {
    id: "admin01",
    password: "admin123",
    nombre: "Sandra Morales",
    puesto: "Jefe de Operaciones",
    horario: "08:00 – 16:00",
    rol: "admin"
  }
];

const form = document.getElementById("checkin-form");
const profile = document.getElementById("profile");
const modal = document.getElementById("modal");

// Validación de formulario
form?.addEventListener("submit", e => {
  e.preventDefault();

  const id = document.getElementById("employeeId").value.trim();
  const password = document.getElementById("password").value.trim();

  const empleado = empleados.find(emp => emp.id === id && emp.password === password);

  if (empleado) {
    localStorage.setItem("empleadoActivo", JSON.stringify(empleado));
    mostrarPerfil(empleado);
  } else {
    alert("Credenciales incorrectas");
  }
});

// Mostrar perfil tras login
function mostrarPerfil(empleado) {
  if (!profile || !form) return;
  form.style.display = "none";
  profile.style.display = "block";

  document.getElementById("emp-name").innerText = empleado.nombre;
  document.getElementById("emp-role").innerText = `${empleado.puesto} (${empleado.rol})`;
  document.getElementById("emp-hours").innerText = `Horario: ${empleado.horario}`;
}

// Cierre de sesión
function terminarTurno() {
  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
}

function confirmarTerminar() {
  localStorage.removeItem("empleadoActivo");
  location.reload();
}

// Restaurar sesión si ya está fichado
window.addEventListener("DOMContentLoaded", () => {
  const activo = localStorage.getItem("empleadoActivo");
  if (activo) {
    const empleado = JSON.parse(activo);
    mostrarPerfil(empleado);
  }
});
