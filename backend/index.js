const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Mock DB temporal
const empleados = [];
const dispositivos = [];

/**
 * Crear nuevo empleado
 * Body: { nombre, puesto, horario }
 */
app.post('/api/empleados', (req, res) => {
  const { nombre, puesto, horario } = req.body;

  if (!nombre || !puesto || !horario) {
    return res.status(400).json({ error: 'Faltan datos del empleado' });
  }

  const nuevo = {
    id: Date.now(),
    nombre,
    puesto,
    horario,
    vinculado: false
  };

  empleados.push(nuevo);
  res.status(201).json(nuevo);
});

/**
 * Obtener lista de empleados
 */
app.get('/api/empleados', (req, res) => {
  res.json(empleados);
});

/**
 * Vincular un dispositivo a un empleado
 * Body: { idEmpleado, nombreDispositivo }
 */
app.post('/api/vincular', (req, res) => {
  const { idEmpleado, nombreDispositivo } = req.body;

  if (!idEmpleado || !nombreDispositivo) {
    return res.status(400).json({ error: 'Faltan datos para vincular' });
  }

  const emp = empleados.find(e => e.id === parseInt(idEmpleado));

  if (!emp) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  emp.vinculado = true;

  dispositivos.push({
    idEmpleado: emp.id,
    nombreDispositivo,
    activo: true,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, mensaje: 'Dispositivo vinculado correctamente' });
});

/**
 * Obtener dispositivos vinculados
 */
app.get('/api/dispositivos', (req, res) => {
  res.json(dispositivos);
});

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`🟢 NanaSync API corriendo en http://localhost:${PORT}`);
});
