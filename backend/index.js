const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Mock DB persistente
const DB_FILE = './db.json';
async function loadDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { empleados: [], dispositivos: [] };
  }
}

async function saveDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Inicializar DB
let db = { empleados: [], dispositivos: [] };
loadDB().then(data => (db = data));

// Datos iniciales
const empleadosDefault = [
  {
    id: '1001',
    password: 'nata123',
    nombre: 'Lidia González',
    puesto: 'Atención al Cliente',
    horario: '09:00 – 17:00',
    rol: 'empleado',
    estado: 'inactivo'
  },
  {
    id: 'admin01',
    password: 'admin123',
    nombre: 'Sandra Morales',
    puesto: 'Jefe de Operaciones',
    horario: '08:00 – 16:00',
    rol: 'admin',
    estado: 'inactivo'
  }
];

if (!db.empleados.length) {
  db.empleados = empleadosDefault;
  saveDB(db);
}

app.post('/api/login', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const empleado = db.empleados.find(emp => emp.id === id && emp.password === password);
  if (!empleado) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  empleado.estado = 'activo';
  await saveDB(db);
  res.json(empleado);
});

app.post('/api/logout', async (req, res) => {
  const { id } = req.body;
  const empleado = db.empleados.find(emp => emp.id === id);
  if (empleado) {
    empleado.estado = 'inactivo';
    await saveDB(db);
  }
  res.json({ success: true });
});

app.post('/api/empleados', async (req, res) => {
  const { nombre, puesto, horario } = req.body;

  if (!nombre || !puesto || !horario) {
    return res.status(400).json({ error: 'Faltan datos del empleado' });
  }

  const nuevo = {
    id: String(Date.now()),
    nombre,
    puesto,
    horario,
    rol: 'empleado',
    estado: 'inactivo',
    vinculado: false
  };

  db.empleados.push(nuevo);
  await saveDB(db);
  res.status(201).json(nuevo);
});

app.get('/api/empleados', async (req, res) => {
  res.json(db.empleados);
});

app.post('/api/vincular', async (req, res) => {
  const { idEmpleado, nombreDispositivo } = req.body;

  if (!idEmpleado || !nombreDispositivo) {
    return res.status(400).json({ error: 'Faltan datos para vincular' });
  }

  const emp = db.empleados.find(e => e.id === idEmpleado);
  if (!emp) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  emp.vinculado = true;
  db.dispositivos.push({
    idEmpleado,
    nombreDispositivo,
    activo: true,
    timestamp: new Date().toISOString()
  });

  await saveDB(db);
  res.json({ success: true, mensaje: 'Dispositivo vinculado correctamente' });
});

app.get('/api/dispositivos', async (req, res) => {
  res.json(db.dispositivos);
});

app.listen(PORT, () => {
  console.log(`🟢 NanaSync API corriendo en http://localhost:${PORT}`);
});
