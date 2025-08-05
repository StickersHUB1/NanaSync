const empleados = [
  {
    id: "1001",
    password: "nata123",
    nombre: "Lidia González",
    puesto: "Atención al Cliente",
    horario: "09:00 – 17:00"
  },
  {
    id: "1002",
    password: "juan456",
    nombre: "Juan Martínez",
    puesto: "Ventas",
    horario: "10:00 – 18:00"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkin-form");
  const profile = document.getElementById("profile");
  const modal = document.getElementById("modal");

  const empName = document.getElementById("emp-name");
  const empRole = document.getElementById("emp-role");
  const empHours = document.getElementById("emp-hours");

  const mostrarPerfil = (empleado) => {
    if (!empleado) return;
    form.style.display = "none";
    profile.style.display = "block";
    empName.textContent = empleado.nombre;
    empRole.textContent = empleado.puesto;
    empHours.textContent = `Horario: ${empleado.horario}`;
  };

  const cerrarModal = () => {
    modal.style.display = "none";
  };

  const terminarTurno = () => {
    modal.style.display = "flex";
  };

  const confirmarTerminar = () => {
    localStorage.removeItem("empleadoActivo");
    location.reload();
  };

  // Si ya fichó antes
  const activo = localStorage.getItem("empleadoActivo");
  if (activo) {
    const empleado = JSON.parse(activo);
    mostrarPerfil(empleado);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = document.getElementById("employeeId").value.trim();
    const password = document.getElementById("password").value.trim();

    const empleado = empleados.find(emp => emp.id === id && emp.password === password);

    if (empleado) {
      localStorage.setItem("empleadoActivo", JSON.stringify(empleado));
      mostrarPerfil(empleado);
    } else {
      alert("❌ Credenciales incorrectas");
    }
  });

  // Exponer funciones globalmente
  window.terminarTurno = terminarTurno;
  window.cerrarModal = cerrarModal;
  window.confirmarTerminar = confirmarTerminar;
});
