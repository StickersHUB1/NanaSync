let empresaAutenticada = null;

function enviarLog(level, message, context = null) {
  console[level](`[${level.toUpperCase()}] ${message}`, context || "");
  fetch("https://nanasyncbackend.onrender.com/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message, context })
  }).catch(err => console.error("[LOG ERROR]", err));
}

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar-nav a");
  const main = document.getElementById("main-content");

  const activarNavegacion = () => {
    links.forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        let page = link.getAttribute("data-page");
        enviarLog("info", "Navegación solicitada", { page });

        if (link.hasAttribute("data-home")) {
          location.reload();
          return;
        }
        if (!page.endsWith(".html")) page += ".html";

        try {
          const response = await fetch(page);
          if (!response.ok) throw new Error("No se pudo cargar la página.");
          const html = await response.text();
          main.innerHTML = html;

          // 🔹 Siempre reinicializamos modales y formularios
          inicializarComponentes();

          if (page === "empresas.html" && empresaAutenticada) mostrarDashboard();
          main.scrollTo(0, 0);
        } catch (err) {
          enviarLog("error", "Error al cargar contenido SPA", { error: err.message });
          main.innerHTML = `<p>Error al cargar el contenido.</p>`;
        }
      });
    });
  };

  const inicializarComponentes = () => {
    initModalesAuth(); // 🔹 Esto ahora se llama siempre que cargamos HTML
    initDashboard();

    // Registro empresa
    const formRegistro = document.getElementById("form-registro-empresa");
    formRegistro?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      enviarLog("info", "Intentando registrar empresa", { nombre, email });

      try {
        const res = await fetch("https://nanasyncbackend.onrender.com/api/empresas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, password })
        });
        const data = await res.json();
        enviarLog("info", "Respuesta registro empresa", { status: res.status, data });

        if (!res.ok) {
          alert(`❌ Error: ${data.error}`);
        } else {
          empresaAutenticada = { id: data._id, nombre: data.nombre, email: data.email };
          alert("✅ Empresa registrada correctamente.");
          document.getElementById("modal-auth").style.display = "none";
          mostrarDashboard();
        }
      } catch (err) {
        enviarLog("error", "Error registrando empresa", { error: err.message });
        alert("❌ Error de red");
      }
    });

    // Login empresa
    const formLogin = document.getElementById("form-login-empresa");
    formLogin?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      enviarLog("info", "Intentando login empresa", { email });

      try {
        const res = await fetch("https://nanasyncbackend.onrender.com/api/login-empresa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        enviarLog("info", "Respuesta login empresa", { status: res.status, data });

        if (!res.ok) {
          alert(`❌ Error: ${data.error}`);
        } else {
          empresaAutenticada = { id: data._id, nombre: data.nombre, email: data.email };
          alert("✅ Sesión iniciada correctamente.");
          document.getElementById("modal-auth").style.display = "none";
          mostrarDashboard();
        }
      } catch (err) {
        enviarLog("error", "Error en login", { error: err.message });
        alert("❌ Error de red");
      }
    });

    // Alta empleado
    const formEmpleado = document.getElementById("form-nuevo-empleado");
    formEmpleado?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!empresaAutenticada?.id) {
        alert("⚠️ Debes estar logueado como empresa para añadir empleados.");
        enviarLog("warn", "Intento de añadir empleado sin login");
        return;
      }
      const form = e.target;
      const datos = {
        nombre: form.nombre.value,
        edad: Number(form.edad.value),
        puesto: form.puesto.value,
        rango: form.rango.value,
        horario: { entrada: form.entrada.value, salida: form.salida.value },
        rol: "empleado",
        estadoConexion: "inactivo",
        fichado: false,
        ultimoFichaje: new Date().toISOString(),
        empresaId: empresaAutenticada.id
      };
      enviarLog("info", "Añadiendo empleado", datos);

      try {
        const res = await fetch("https://nanasyncbackend.onrender.com/api/empleados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos)
        });
        const resultado = await res.json();
        enviarLog("info", "Respuesta alta empleado", { status: res.status, resultado });
        document.getElementById("respuesta-empleado").innerText =
          res.ok ? "✅ Empleado añadido correctamente" : "❌ Error: " + resultado.error;
      } catch (err) {
        enviarLog("error", "Error conectando al servidor en alta empleado", { error: err.message });
        document.getElementById("respuesta-empleado").innerText = "❌ Error al conectar con el servidor";
      }
    });
  };

  const mostrarDashboard = () => {
    enviarLog("info", "Mostrando dashboard");
    const dashboard = document.getElementById("empresa-dashboard");
    const sectionAuth = document.querySelector(".empresa-auth-cta");
    const sectionIntro = document.querySelector(".empresa-intro");
    const sectionSubscription = document.querySelector(".empresa-subscription");

    if (!dashboard) return;

    sectionAuth?.classList.add("hidden");
    sectionIntro?.classList.add("hidden");
    sectionSubscription?.classList.add("hidden");

    dashboard.classList.remove("hidden");
    dashboard.style.display = "block";
  };

  const initModalesAuth = () => {
    const modal = document.getElementById("modal-auth");
    const btnOpenRegistro = document.getElementById("btn-open-registro");
    const btnOpenLogin = document.getElementById("btn-open-login");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const formRegistro = document.getElementById("form-registro-empresa");
    const formLogin = document.getElementById("form-login-empresa");

    if (!modal) return;

    if (btnOpenRegistro) {
      btnOpenRegistro.onclick = () => {
        enviarLog("info", "Abriendo modal registro");
        modal.style.display = "flex";
        formRegistro.style.display = "flex";
        formLogin.style.display = "none";
      };
    }
    if (btnOpenLogin) {
      btnOpenLogin.onclick = () => {
        enviarLog("info", "Abriendo modal login");
        modal.style.display = "flex";
        formLogin.style.display = "flex";
        formRegistro.style.display = "none";
      };
    }
    if (btnCloseModal) {
      btnCloseModal.onclick = () => {
        enviarLog("info", "Cerrando modal auth");
        modal.style.display = "none";
        formLogin.style.display = "none";
        formRegistro.style.display = "none";
      };
    }
  };

  const initDashboard = () => {
    const dashboard = document.getElementById("empresa-dashboard");
    const dashboardContent = document.getElementById("dashboard-content");
    if (!dashboard) return;
    const tabButtons = dashboard.querySelectorAll(".dashboard-tabs button");

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const page = btn.getAttribute("data-page");
        enviarLog("info", "Dashboard tab click", { page });
        if (!page || !dashboardContent) return;

        try {
          const response = await fetch(page);
          if (!response.ok) throw new Error("No se pudo cargar la página.");
          const html = await response.text();
          dashboardContent.innerHTML = html;
          inicializarComponentes(); // 🔹 Esto recarga modales también
        } catch (err) {
          enviarLog("error", "Error al cargar contenido dashboard", { error: err.message });
          dashboardContent.innerHTML = "<p>Error al cargar el contenido.</p>";
        }
      });
    });
  };

  activarNavegacion();
  inicializarComponentes(); // 🔹 Llamada inicial para que modales funcionen desde el inicio
});
