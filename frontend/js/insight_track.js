<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NanaSync - Insight Track</title>
  <link rel="stylesheet" href="frontend/css/styles.css">
</head>
<body>
  <header>
    <h1>NanaSync - Insight Track</h1>
  </header>
  <main id="main-content">
    <div class="tabs">
      <button class="tab-btn active" data-tab="actividad">Actividad</button>
      <button class="tab-btn" data-tab="monitorizacion">Monitorización</button>
      <button class="tab-btn" data-tab="vincular">Vincular</button>
    </div>
    <div id="actividad-panel" class="tab-panel visible">
      <h2>Actividad</h2>
      <div id="actividad-grid"></div>
    </div>
    <div id="monitorizacion-panel" class="tab-panel">
      <h2>Monitorización</h2>
      <div id="monitorizacion-grid"></div>
    </div>
    <div id="vincular-panel" class="tab-panel">
      <h2>Vincular Dispositivo</h2>
      <form id="vincular-form">
        <label for="employeeId">ID del Empleado:</label>
        <input type="text" id="employeeId" required>
        <label for="deviceName">Nombre del Dispositivo:</label>
        <input type="text" id="deviceName" required>
        <button type="submit">Vincular</button>
      </form>
    </div>
    <div id="modal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeModal('modal')">&times;</span>
        <h2 id="modal-title"></h2>
        <p>¿Solicitar monitorización?</p>
        <button onclick="accionSolicitarMonitorizacion()">Sí</button>
        <button onclick="closeModal('modal')">No</button>
      </div>
    </div>
    <div id="notification" class="notification"></div>
  </main>
  <script src="frontend/js/insight_track.js"></script>
</body>
</html>
