const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const empleados = [];
const dispositivos = [];

app.post('/api/empleados', (req, res) => {
  const nuevo = { id: Date.now(), ...req.body, vinculado: false };
  empleados.push(nuevo);
  res.json(nuevo);
});

app.get('/api/empleados', (req, res) => {
  res.json(empleados);
});

app.post('/api/vincular', (req, res) => {
  const { idEmpleado, nombreDispositivo } = req.body;
  const emp = empleados.find(e => e.id === idEmpleado);
  if (emp) {
    emp.vinculado = true;
    dispositivos.push({ idEmpleado, nombreDispositivo, activo: true });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Empleado no encontrado' });
  }
});

app.get('/api/dispositivos', (req, res) => {
  res.json(dispositivos);
});

app.listen(3000, () => console.log('Servidor NanaSync corriendo en http://localhost:3000'));
