(function () {
  var form = document.getElementById('tramasForm');
  var tipoSelect = document.getElementById('tipoReporte');
  var fechaDesdeInput = document.getElementById('fechaDesde');
  var fechaHastaInput = document.getElementById('fechaHasta');
  var descargarBtn = document.getElementById('btnDescargar');
  var downloadStatus = document.getElementById('downloadStatus');
  var tableFeedback = document.getElementById('tableFeedback');

  if (!form || !tipoSelect || !fechaDesdeInput || !fechaHastaInput || !descargarBtn || !downloadStatus || !tableFeedback) {
    return;
  }

  if (form.dataset.tramasInitialized === 'true') {
    return;
  }

  form.dataset.tramasInitialized = 'true';

  var tableMap = {
    APERTURA: { id: 'tramaApertura', dateColumnIndex: 0, label: 'APERTURA' },
    RESERVA: { id: 'tramaReserva', dateColumnIndex: 1, label: 'RESERVA' },
    LIQUIDACION: { id: 'tramaLiquidacion', dateColumnIndex: 1, label: 'LIQUIDACION' }
  };
  var hasSearched = false;

  function parseDate(value) {
    if (!value) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      var partsIso = value.split('-');
      return new Date(Number(partsIso[0]), Number(partsIso[1]) - 1, Number(partsIso[2]));
    }

    var parts = value.split('/');
    if (parts.length !== 3) {
      return null;
    }

    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }

  function formatTodayForFile() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return now.getFullYear() + month + day;
  }

  function setStatus(message, isVisible) {
    downloadStatus.textContent = message || '';
    downloadStatus.classList.toggle('is-visible', Boolean(isVisible && message));
  }

  function resetRows(table) {
    Array.prototype.forEach.call(table.tBodies[0].rows, function (row) {
      row.style.display = '';
    });
  }

  function hideAllTables() {
    Object.keys(tableMap).forEach(function (key) {
      var table = document.getElementById(tableMap[key].id);
      if (!table) {
        return;
      }

      resetRows(table);
      var wrap = table.closest('[data-table-wrap]');
      if (wrap) {
        wrap.classList.add('trama-hidden');
      }
    });
  }

  function getSelectedTableConfig() {
    return tableMap[tipoSelect.value] || null;
  }

  function showSelectedTable() {
    hideAllTables();
    var config = getSelectedTableConfig();

    if (!config) {
      tableFeedback.textContent = '';
      return null;
    }

    var table = document.getElementById(config.id);
    var wrap = table ? table.closest('[data-table-wrap]') : null;
    if (wrap) {
      wrap.classList.remove('trama-hidden');
    }

    return table;
  }

  function filterTableRows() {
    var config = getSelectedTableConfig();
    if (!config) {
      tableFeedback.textContent = 'Selecciona un tipo de reporte para continuar.';
      descargarBtn.disabled = true;
      hasSearched = false;
      hideAllTables();
      return;
    }

    var table = showSelectedTable();
    if (!table) {
      tableFeedback.textContent = 'No se encontró la tabla del reporte seleccionado.';
      descargarBtn.disabled = true;
      hasSearched = false;
      return;
    }

    var fromDate = parseDate(fechaDesdeInput.value);
    var toDate = parseDate(fechaHastaInput.value);

    if (fromDate && toDate && fromDate > toDate) {
      tableFeedback.textContent = 'La fecha desde no puede ser mayor que la fecha hasta.';
      descargarBtn.disabled = true;
      hasSearched = false;
      resetRows(table);
      return;
    }

    var visibleRows = 0;
    Array.prototype.forEach.call(table.tBodies[0].rows, function (row) {
      var cell = row.cells[config.dateColumnIndex];
      var rowDate = cell ? parseDate(cell.textContent.trim()) : null;
      var isVisible = true;

      if (fromDate && rowDate && rowDate < fromDate) {
        isVisible = false;
      }

      if (toDate && rowDate && rowDate > toDate) {
        isVisible = false;
      }

      row.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visibleRows += 1;
      }
    });

    hasSearched = true;
    descargarBtn.disabled = visibleRows === 0;
    tableFeedback.textContent = visibleRows > 0
      ? 'Se encontraron ' + visibleRows + ' registros para ' + config.label + '.'
      : 'No se encontraron registros para el rango indicado.';
    setStatus('', false);
  }

  function buildExportTable(table) {
    var clone = table.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('tbody tr'), function (row) {
      if (row.style.display === 'none') {
        row.remove();
      }
    });
    return clone.outerHTML;
  }

  function downloadTableAsExcel() {
    var config = getSelectedTableConfig();
    if (!config || !hasSearched) {
      setStatus('Primero realiza la búsqueda por tipo.', true);
      descargarBtn.disabled = true;
      return;
    }

    var table = document.getElementById(config.id);
    if (!table) {
      setStatus('No se encontró la tabla para exportar.', true);
      return;
    }

    var hasVisibleRows = Array.prototype.some.call(table.tBodies[0].rows, function (row) {
      return row.style.display !== 'none';
    });

    if (!hasVisibleRows) {
      setStatus('No hay datos visibles para descargar.', true);
      descargarBtn.disabled = true;
      return;
    }

    var originalLabel = descargarBtn.textContent;
    descargarBtn.disabled = true;
    descargarBtn.innerHTML = '<span class="download-spinner"></span>DESCARGANDO';
    setStatus('Preparando archivo Excel...', true);

    window.setTimeout(function () {
      var html = '' +
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="UTF-8"></head><body>' + buildExportTable(table) + '</body></html>';
      var blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      var link = document.createElement('a');
      var objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = config.label.toLowerCase() + '_' + formatTodayForFile() + '.xls';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      descargarBtn.innerHTML = originalLabel;
      descargarBtn.disabled = false;
      setStatus('Archivo listo. La descarga comenzó correctamente.', true);
      window.setTimeout(function () {
        alert('La descarga del reporte ' + config.label + ' está lista.');
      }, 100);
    }, 900);
  }

  tipoSelect.addEventListener('change', function () {
    showSelectedTable();
    descargarBtn.disabled = true;
    hasSearched = false;
    setStatus('', false);
    tableFeedback.textContent = tipoSelect.value
      ? 'Presiona BUSCAR para filtrar el reporte ' + tipoSelect.value + ' por rango de fechas.'
      : '';
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    filterTableRows();
  });

  descargarBtn.addEventListener('click', function () {
    downloadTableAsExcel();
  });

  hideAllTables();
  descargarBtn.disabled = true;
}());