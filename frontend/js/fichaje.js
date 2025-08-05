<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NanaSync - Fichar</title>
  <link rel="stylesheet" href="frontend/css/styles.css">
</head>
<body>
  <header>
    <h1>NanaSync - Fichar Entrada/Salida</h1>
  </header>
  <main>
    <form id="login-form">
      <label for="employeeId">ID del Empleado:</label>
      <input type="text" id="employeeId" required>
      <label for="password">Contraseña:</label>
      <input type="password" id="password" required>
      <button type="submit" id="checkin-btn">🕒 Fichar Entrada</button>
    </form>
    <div id="profile" class="profile">
      <h2>Perfil</h2>
      <p><strong>Nombre:</strong> <span id="emp-name"></span></p>
      <p><strong>Rol:</strong> <span id="emp-role"></span></p>
      <p><strong>Horario:</strong> <span id="emp-hours"></span></p>
      <button onclick="terminarTurno()">Terminar Turno</button>
    </div>
    <div id="modal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeModal('modal')">&times;</span>
        <h2>Confirmar salida</h2>
        <p>¿Estás seguro de que quieres terminar tu turno?</p>
        <button onclick="confirmarTerminar()">Sí</button>
        <button onclick="closeModal('modal')">No</button>
      </div>
    </div>
    <div id="notification" class="notification"></div>
  </main>
  <script src="frontend/js/fichaje.js"></script>
</body>
</html>
