const empleados = [
  { nombre: "Juan Molina Rodríguez", estado: "verde" },
  { nombre: "Juan Molina Rodríguez", estado: "rojo" },
  { nombre: "Juan Molina Rodríguez", estado: "verde" },
  { nombre: "Juan Molina Rodríguez", estado: "azul" },
  { nombre: "Juan Molina Rodríguez", estado: "rojo" },
  { nombre: "Juan Molina Rodríguez", estado: "verde" },
  { nombre: "Juan Molina Rodríguez", estado: "amarillo" },
  { nombre: "Juan Molina Rodríguez", estado: "verde" },
];

const estados = {
  verde: { color: "green", texto: "ON" },
  rojo: { color: "red", texto: "Off" },
  amarillo: { color: "yellow", texto: "Off" },
  azul: { color: "blue", texto: "ON" },
};

const grid = document.getElementById("actividad-grid");

empleados.forEach((emp) => {
  const { nombre, estado } = emp;
  const estadoInfo = estados[estado] || estados.rojo;

  const card = document.createElement("div");
  card.className = "card-empleado";
  card.innerHTML = `
    <div class="estado-dot" style="background-color:${estadoInfo.color};"></div>
    <div class="estado-texto">${estadoInfo.texto}</div>
    <div class="avatar"></div>
    <div class="info">
      <strong>${nombre}</strong><br />
      Rango: Empleado<br />
      Atención al Cliente<br />
      Horario: 16:00 - 00:00
    </div>
  `;

  grid.appendChild(card);
});
