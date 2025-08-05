console.log("Iniciando fichaje.js");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const loginBtn = document.getElementById("login-btn");

  if (form && loginBtn) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginBtn.disabled = true;
      loginBtn.textContent = "Cargando...";

      const id = document.getElementById("employeeId").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await fetch(`${API_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, password })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("empleadoActivo", JSON.stringify(data));
          mostrarPerfil(data);
        } else {
          showNotification(data.error || "Credenciales incorrectas", "error");
        }
      } catch (err) {
        console.error("Error durante login:", err);
        showNotification("Error de conexión con el servidor", "error");
      }

      loginBtn.disabled = false;
      loginBtn.textContent = "Iniciar Sesión";
    });
  }

  const empleado = getActiveEmployee();
  if (empleado) {
    mostrarPerfil(empleado);
  }
});

function mostrarPerfil(empleado) {
  console.log("Mostrando perfil de:", empleado);

  const profile = document.getElementById("profile");
  const form = document.getElementById("login-form");

  if (!profile || !form) {
    console.error("Elementos no encontrados en el DOM");
    return;
  }

  form.style.display = "none";
  profile.style.display = "block";

  const photo = profile.querySelector(".photo");
  if (photo) {
    photo.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  document.getElementById("emp-name").textContent = empleado.nombre;
  document.getElementById("emp-role").textContent = empleado.rol;
  document.getElementById("emp-specialty").textContent = empleado.puesto;
}

function terminarTurno() {
  openModal("modal");
}

async function confirmarTerminar() {
  const empleado = getActiveEmployee();

  if (empleado) {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: empleado.id })
      });

      localStorage.removeItem("empleadoActivo");
      const profile = document.getElementById("profile");
      const form = document.getElementById("login-form");

      if (profile && form) {
        profile.style.display = "none";
        form.style.display = "block";
      }

      showNotification("Sesión cerrada correctamente", "success");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      showNotification("Error al cerrar sesión", "error");
    }
  }

  closeModal("modal");
}

// Modal helpers (vienen del script.js global)
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}
