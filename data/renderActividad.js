// data/renderActividad.js
(function () {
  const ESTADOS = {
    verde:    { color: "limegreen",  on: true  },
    azul:     { color: "dodgerblue", on: true  },
    amarillo: { color: "#facc15",    on: false },
    rojo:     { color: "#ef4444",    on: false },
  };

  const grid = document.getElementById("actividad-grid");
  if (!grid) return;

  const empleados = (window.NS_EMPLEADOS && window.NS_EMPLEADOS.length)
    ? window.NS_EMPLEADOS
    : [
        { nombre: "Juan Molina Rodríguez", rango:"Empleado", area:"Atención al Cliente", horario:"16:00 - 00:00", estado: "verde" },
        { nombre: "Laura Sánchez",         rango:"Empleado", area:"Marketing",            horario:"09:00 - 17:00", estado: "amarillo" },
        { nombre: "Carlos Pérez",          rango:"Empleado", area:"Ventas",               horario:"14:00 - 22:00", estado: "azul" },
        { nombre: "Ana Ruiz",              rango:"Empleado", area:"RRHH",                 horario:"08:00 - 16:00", estado: "rojo" },
      ];

  grid.innerHTML = "";
  empleados.forEach((emp) => {
    const meta = ESTADOS[emp.estado] || ESTADOS.rojo;

    const card = document.createElement("div");
    card.className = "empleado-card";

    card.innerHTML = `
      <div class="estado-header">
        <div class="foto-placeholder" aria-hidden="true"></div>
        <div class="estado ${meta.on ? "" : "parpadeo"}" title="${meta.on ? "ON" : "OFF"}"></div>
      </div>
      <div class="info">
        <strong>${emp.nombre}</strong><br/>
        Rango: ${emp.rango || "Empleado"}<br/>
        ${emp.area || "—"}<br/>
        Horario: ${emp.horario || "—"}
      </div>
    `;

    // colorear el dot según estado
    const dot = card.querySelector(".estado");
    dot.style.backgroundColor = meta.color;

    grid.appendChild(card);
  });
})();
