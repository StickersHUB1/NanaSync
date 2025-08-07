let empresaAutenticada = null;

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar-nav a");
  const main = document.getElementById("main-content");

  const activarNavegacion = () => {
    links.forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();

        if (link.hasAttribute("data-home")) {
          location.reload();
          return;
        }

        let page = link.getAttribute("data-page");
        if (!page.endsWith(".html")) page += ".html";

        try {
          const response = await fetch(page);
          if (!response.ok) throw new Error("No se pudo cargar la página.");
          const html = await response.text();
          main.innerHTML = html;

          inicializarComponentes();

          if (page === "empresas.html" && empresaAutenticada) {
            mostrarDashboard();
          }

          main.scrollTo(0, 0);
        } catch (err) {
          main.innerHTML = `<p>Error al cargar el contenido.</p>`;
          console.error(err);
        }
      });
    });
  };

  const inicializarComponentes = () => {
    initModalesAuth();
    initDashboard();

    const formRegistro = document.getElementById("form-registro-empresa");
    formRegistro?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("https://nanasync-backend.onrender.com/api/empresas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(`❌ Error: ${data.error}`);
        } else {
          empresaAutenticada = {
            id: data._id,
            nombre: data.nombre,
            email: data.email
          };
          alert("✅ Empresa registrada correctamente.");
          document.getElementById("modal-auth").style.display = "none";
          mostrarDashboard();
        }
      } catch (err) {
        console.error("Error registrando empresa:", err);
        alert("❌ Error de red");
      }
    });

    const formLogin = document.getElementById("form-login-empresa");
    formLogin?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const res = await fetch("https://nanasync-backend.onrender.com/api/login-empresa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(`❌ Error: ${data.error}`);
        } else {
          empresaAutenticada = {
            id: data._id,
            nombre: data.nombre,
            email: data.email
          };
          alert("✅ Sesión iniciada correctamente.");
          document.getElementById("modal-auth").style.display = "none";
          mostrarDashboard();
        }
      } catch (err) {
        console.error("Error en login:", err);
        alert("❌ Error de red");
      }
    });

    const formEmpleado = document.getElementById("form-nuevo-empleado");
    formEmpleado?.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!empresaAutenticada?.id) {
        alert("⚠️ Debes estar logueado como empresa para añadir empleados.");
        return;
      }

      const form = e.target;
      const datos = {
        nombre: form.nombre.value,
        edad: Number(form.edad.value),
        puesto: form.puesto.value,
        rango: form.rango.value,
        horario: {
          entrada: form.entrada.value,
          salida: form.salida.value
        },
        rol: "empleado",
        estadoConexion: "inactivo",
        fichado: false,
        ultimoFichaje: new Date().toISOString(),
        empresaId: empresaAutenticada.id
      };

      try {
        const res = await fetch("https://nanasync-backend.onrender.com/api/empleados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos)
        });

        const resultado = await res.json();
        document.getElementById("respuesta-empleado").innerText =
          res.ok ? "✅ Empleado añadido correctamente" : "❌ Error: " + resultado.error;
      } catch (err) {
        console.error(err);
        document.getElementById("respuesta-empleado").innerText = "❌ Error al conectar con el servidor";
      }
    });
  };

  const mostrarDashboard = () => {
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

    if (!document.getElementById("btn-logout")) {
      const header = dashboard.querySelector(".dashboard-header");
      const btnLogout = document.createElement("button");
      btnLogout.textContent = "Cerrar sesión";
      btnLogout.className = "btn btn-secondary";
      btnLogout.id = "btn-logout";
      btnLogout.addEventListener("click", () => {
        empresaAutenticada = null;
        sectionAuth?.classList.remove("hidden");
        sectionIntro?.classList.remove("hidden");
        sectionSubscription?.classList.remove("hidden");
        dashboard.classList.add("hidden");
        dashboard.style.display = "none";
        btnLogout.remove();
      });
      header?.appendChild(btnLogout);
    }
  };

  const initModalesAuth = () => {
    const modal = document.getElementById("modal-auth");
    const btnOpenRegistro = document.getElementById("btn-open-registro");
    const btnOpenLogin = document.getElementById("btn-open-login");
    const btnCloseModal = document.getElementById("btn-close-modal");

    const formRegistro = document.getElementById("form-registro-empresa");
    const formLogin = document.getElementById("form-login-empresa");

    if (
      modal &&
      btnOpenRegistro &&
      btnOpenLogin &&
      btnCloseModal &&
      formRegistro &&
      formLogin
    ) {
      btnOpenRegistro.addEventListener("click", () => {
        modal.style.display = "flex";
        formRegistro.style.display = "flex";
        formLogin.style.display = "none";
      });

      btnOpenLogin.addEventListener("click", () => {
        modal.style.display = "flex";
        formLogin.style.display = "flex";
        formRegistro.style.display = "none";
      });

      btnCloseModal.addEventListener("click", () => {
        modal.style.display = "none";
        formLogin.style.display = "none";
        formRegistro.style.display = "none";
      });
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
        if (!page || !dashboardContent) return;

        try {
          const response = await fetch(page);
          if (!response.ok) throw new Error("No se pudo cargar la página.");
          const html = await response.text();
          dashboardContent.innerHTML = html;
          inicializarComponentes();
        } catch (err) {
          dashboardContent.innerHTML = "<p>Error al cargar el contenido.</p>";
          console.error(err);
        }
      });
    });
  };

  activarNavegacion();
  inicializarComponentes();
});
