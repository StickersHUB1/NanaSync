// data/renderActividad.js
(function () {
  const estados = {
    verde:   { color: "green",  texto: "ON"  },
    rojo:    { color: "red",    texto: "Off" },
    amarillo:{ color: "yellow", texto: "Off" },
    azul:    { color: "blue",   texto: "ON"  },
  };

  const grid = document.getElementById("actividad-grid");
  if (!grid) return;

  const empleados = (window.NS_EMPLEADOS || []).length
    ? window.NS_EMPLEADOS
    : [
        { nombre: "Juan Molina Rodríguez", estado: "verde" },
        { nombre: "Juan Molina Rodríguez", estado: "rojo" },
        { nombre: "Juan Molina Rodríguez", estado: "verde" },
        { nombre: "Juan Molina Rodríguez", estado: "azul" },
        { nombre: "Juan Molina Rodríguez", estado: "rojo" },
        { nombre: "Juan Molina Rodríguez", estado: "verde" },
        { nombre: "Juan Molina Rodríguez", estado: "amarillo" },
        { nombre: "Juan Molina Rodríguez", estado: "verde" },
      ];

  grid.innerHTML = "";
  empleados.forEach((emp) => {
    const estadoInfo = estados[emp.estado] || estados.rojo;
    const card = document.createElement("div");
    card.className = "card-empleado";
    card.innerHTML = `
      <div class="estado-dot" style="background-color:${estadoInfo.color};"></div>
      <div class="estado-texto">${estadoInfo.texto}</div>
      <div class="avatar"></div>
      <div class="info">
        <strong>${emp.nombre}</strong><br />
        Rango: Empleado<br />
        Atención al Cliente<br />
        Horario: 16:00 - 00:00
      </div>`;
    grid.appendChild(card);
  });
})();
