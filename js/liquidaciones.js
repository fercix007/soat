(function () {
  var form = document.getElementById('liquidacionesFiltrosForm');
  var tabla = document.getElementById('tablaLiquidaciones');

  if (!form || !tabla || form.dataset.liquidacionesInitialized === 'true') {
    return;
  }

  form.dataset.liquidacionesInitialized = 'true';

  var filtroNroSiniestro = document.getElementById('filtroNroSiniestro');
  var filtroNroPeticion = document.getElementById('filtroNroPeticion');
  var filtroTipoCobertura = document.getElementById('filtroTipoCobertura');
  var filtroEstado = document.getElementById('filtroEstado');
  var filtroFechaDesde = document.getElementById('filtroFechaDesde');
  var filtroFechaHasta = document.getElementById('filtroFechaHasta');
  var filtroPacienteDni = document.getElementById('filtroPacienteDni');
  var rows = Array.prototype.slice.call(tabla.tBodies[0].rows);

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function getCellText(row, index) {
    return row.cells[index] ? row.cells[index].textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function parseRowDate(value) {
    var match = (value || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) {
      return null;
    }

    var day = parseInt(match[1], 10);
    var month = parseInt(match[2], 10) - 1;
    var year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  function parseInputDate(value) {
    if (!value) {
      return null;
    }

    var parts = value.split('-');
    if (parts.length !== 3) {
      return null;
    }

    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function populateCoverageOptions() {
    var seen = {};

    rows.forEach(function (row) {
      var coverage = getCellText(row, 5);
      if (!coverage) {
        return;
      }

      var key = normalizeText(coverage);
      if (seen[key]) {
        return;
      }

      seen[key] = true;
      var option = document.createElement('option');
      option.value = coverage;
      option.textContent = coverage;
      filtroTipoCobertura.appendChild(option);
    });
  }

  function rowMatchesFilters(row) {
    var nroSolicitud = normalizeText(getCellText(row, 1));
    var nroSiniestro = normalizeText(getCellText(row, 2));
    var registroDate = parseRowDate(getCellText(row, 3));
    var accidentado = normalizeText(getCellText(row, 4));
    var cobertura = normalizeText(getCellText(row, 5));
    var estado = normalizeText(getCellText(row, 8));

    var filtroPeticion = normalizeText(filtroNroPeticion.value);
    var filtroSiniestro = normalizeText(filtroNroSiniestro.value);
    var filtroPaciente = normalizeText(filtroPacienteDni.value);
    var filtroCobertura = normalizeText(filtroTipoCobertura.value);
    var filtroEstadoValue = normalizeText(filtroEstado.value);
    var fechaDesde = parseInputDate(filtroFechaDesde.value);
    var fechaHasta = parseInputDate(filtroFechaHasta.value);

    if (filtroPeticion && nroSolicitud.indexOf(filtroPeticion) === -1) {
      return false;
    }

    if (filtroSiniestro && nroSiniestro.indexOf(filtroSiniestro) === -1) {
      return false;
    }

    if (filtroPaciente && accidentado.indexOf(filtroPaciente) === -1) {
      return false;
    }

    if (filtroCobertura && cobertura !== filtroCobertura) {
      return false;
    }

    if (filtroEstadoValue && estado !== filtroEstadoValue) {
      return false;
    }

    if (fechaDesde && (!registroDate || registroDate < fechaDesde)) {
      return false;
    }

    if (fechaHasta && (!registroDate || registroDate > fechaHasta)) {
      return false;
    }

    return true;
  }

  function applyFilters() {
    rows.forEach(function (row) {
      row.style.display = rowMatchesFilters(row) ? '' : 'none';
    });
  }

  function clearFilters() {
    rows.forEach(function (row) {
      row.style.display = '';
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });

  form.addEventListener('reset', function () {
    window.setTimeout(clearFilters, 0);
  });

  populateCoverageOptions();
})();