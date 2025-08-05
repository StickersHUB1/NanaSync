(() => {
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

  const form = document.getElementById("checkin-form");
  const profile = document.getElementById("profile");
  const modal = document.getElementById("modal");

  function mostrarPerfil(empleado) {
    if (!form || !profile) return;

    form.style.display = "none";
    profile.style.display = "block";

    document.getElementById("emp-name").innerText = empleado.nombre;
    document.getElementById("emp-role").innerText = empleado.puesto;
    document.getElementById("emp-hours").innerText = `Horario: ${empleado.horario}`;
  }

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

  // Vincular funciones al DOM
  window.terminarTurno = terminarTurno;
  window.cerrarModal = cerrarModal;
  window.confirmarTerminar = confirmarTerminar;

  // Auto-login si ya está fichado
  document.addEventListener("DOMContentLoaded", () => {
    const sesion = localStorage.getItem("empleadoActivo");
    if (sesion) {
      const datos = JSON.parse(sesion);
      mostrarPerfil(datos);
    }
  });

  // Si el formulario existe (no perfil activo), activar login
  if (form) {
    form.addEventListener("submit", e => {
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
  }
})();
