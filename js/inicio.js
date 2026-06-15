(function () {
  const dashboardState = window.siniestroDashboardState || { charts: {} };
  window.siniestroDashboardState = dashboardState;

  const pageMap = {
    siniestros: 'listar_siniestros.html',
    accidentados: 'accidentados.html',
    cartas: 'consulta-cg.html',
    solicitudes: 'reembolsos.html'
  };

  function normalizeText(value) {
    return (value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cellText(cells, index) {
    return normalizeText(cells[index] ? cells[index].textContent : '');
  }

  function parseDate(value) {
    const match = normalizeText(value).match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) {
      return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    return new Date(year, month, day);
  }

  function formatMonthKey(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return 'Sin fecha';
    }

    return date.toLocaleDateString('es-PE', {
      month: 'short',
      year: 'numeric'
    });
  }

  function parseAmount(value) {
    const cleaned = String(value || '').replace(/[^\d.-]/g, '');
    return cleaned ? Number(cleaned) : 0;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  function stateBucket(rawState) {
    const state = normalizeText(rawState).toUpperCase();
    if (!state) {
      return 'SIN ESTADO';
    }
    if (state.includes('INVESTIG')) {
      return 'EN INVESTIGACION';
    }
    if (state.includes('PENDIENT')) {
      return 'PENDIENTE';
    }
    if (state.includes('APROBADA PARCIAL')) {
      return 'APROBADA PARCIAL';
    }
    if (state.includes('APROBADA')) {
      return 'APROBADA';
    }
    if (state.includes('RECHAZ')) {
      return 'RECHAZADA';
    }
    if (state.includes('ANUL')) {
      return 'ANULADO';
    }
    if (state.includes('CERR')) {
      return 'CERRADO';
    }
    return state;
  }

  function createMapCounter(items, extractor) {
    return items.reduce((accumulator, item) => {
      const key = extractor(item);
      if (!key) {
        return accumulator;
      }
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});
  }

  function parseTable(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo leer ' + url);
        }
        return response.text();
      })
      .then(html => new DOMParser().parseFromString(html, 'text/html'));
  }

  function parseSiniestros(doc) {
    const rows = Array.from(doc.querySelectorAll('tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      return {
        estado: stateBucket(cellText(cells, 1)),
        caso: cellText(cells, 2),
        certificado: cellText(cells, 3),
        placa: cellText(cells, 4),
        fechaOcurrencia: parseDate(cellText(cells, 5)),
        tipo: cellText(cells, 6),
        comisaria: cellText(cells, 9),
        recupero: cellText(cells, 11),
        accidentados: Number(cellText(cells, 12)) || 0,
        fechaRegistro: parseDate(cellText(cells, 13))
      };
    });
  }

  function parseAccidentados(doc) {
    const rows = Array.from(doc.querySelectorAll('tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      return {
        siniestro: cellText(cells, 2),
        fechaSiniestro: parseDate(cellText(cells, 3)),
        paciente: cellText(cells, 6),
        documento: cellText(cells, 7),
        estado: stateBucket(cellText(cells, 8))
      };
    });
  }

  function parseCartas(doc) {
    const rows = Array.from(doc.querySelectorAll('tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      return {
        numero: cellText(cells, 0),
        siniestro: cellText(cells, 2),
        registro: parseDate(cellText(cells, 3)),
        proveedor: cellText(cells, 4),
        atencion: cellText(cells, 5),
        paciente: cellText(cells, 6),
        iafa: cellText(cells, 7),
        montoAprobado: parseAmount(cellText(cells, 9)),
        montoSolicitado: parseAmount(cellText(cells, 10)),
        estado: stateBucket(cellText(cells, 11)),
        montoLiquidado: parseAmount(cellText(cells, 13)),
        fechaAprobacion: parseDate(cellText(cells, 15))
      };
    });
  }

  function parseSolicitudes(doc) {
    const rows = Array.from(doc.querySelectorAll('tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      return {
        peticion: cellText(cells, 1),
        siniestro: cellText(cells, 2),
        registro: parseDate(cellText(cells, 3)),
        accidentado: cellText(cells, 4),
        cobertura: cellText(cells, 5),
        montoSolicitado: parseAmount(cellText(cells, 6)),
        montoAprobado: parseAmount(cellText(cells, 7)),
        estado: stateBucket(cellText(cells, 8)),
        fechaAprobacion: parseDate(cellText(cells, 10)),
        fechaLiquidacion: parseDate(cellText(cells, 11)),
        montoLiquidado: parseAmount(cellText(cells, 12))
      };
    });
  }

  function topEntries(counter, limit) {
    return Object.entries(counter)
      .sort((left, right) => right[1] - left[1])
      .slice(0, limit);
  }

  function sum(items, extractor) {
    return items.reduce((total, item) => total + extractor(item), 0);
  }

  function destroyCharts() {
    Object.values(dashboardState.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    dashboardState.charts = {};
  }

  function renderChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === 'undefined') {
      return;
    }
    dashboardState.charts[id] = new Chart(canvas, config);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = value;
    }
  }

  function renderInsights(analysis) {
    const container = document.getElementById('dashboardInsights');
    if (!container) {
      return;
    }

    const insights = [
      {
        title: 'Pendientes inmediatos',
        copy: analysis.pendingTotal + ' registros siguen en pendiente o investigacion dentro de las bandejas analizadas.'
      },
      {
        title: 'Cobertura dominante',
        copy: analysis.topCoverage
          ? analysis.topCoverage[0] + ' concentra ' + analysis.topCoverage[1] + ' solicitudes en la bandeja de indemnizacion/reembolso.'
          : 'No se encontraron coberturas con datos suficientes.'
      },
      {
        title: 'Proveedor mas activo',
        copy: analysis.topProvider
          ? analysis.topProvider[0] + ' registra ' + analysis.topProvider[1] + ' cartas de garantia.'
          : 'No se encontraron proveedores con actividad.'
      }
    ];

    container.innerHTML = insights.map(item => {
      return '<div class="dashboard-insight">'
        + '<span class="dashboard-insight-title">' + item.title + '</span>'
        + '<p class="dashboard-insight-copy">' + item.copy + '</p>'
        + '</div>';
    }).join('');
  }

  function renderModules(analysis) {
    const container = document.getElementById('dashboardModules');
    if (!container) {
      return;
    }

    const modules = [
      {
        title: 'Siniestros',
        copy: analysis.siniestros.length + ' casos y ' + sum(analysis.siniestros, item => item.accidentados) + ' accidentados reportados.',
        metaLeft: analysis.modulePending.siniestros + ' en investigacion',
        metaRight: analysis.topSiniestroType ? analysis.topSiniestroType[0] : 'Sin tipologia'
      },
      {
        title: 'Accidentados',
        copy: analysis.accidentados.length + ' personas en seguimiento SOLBEN.',
        metaLeft: analysis.modulePending.accidentados + ' observados',
        metaRight: analysis.uniqueAccidentadoSiniestros + ' siniestros vinculados'
      },
      {
        title: 'Cartas de garantia',
        copy: analysis.cartas.length + ' registros y ' + formatCurrency(analysis.cartasAprobado) + ' aprobados.',
        metaLeft: analysis.modulePending.cartas + ' pendientes',
        metaRight: analysis.topProvider ? analysis.topProvider[0] : 'Sin proveedor'
      },
      {
        title: 'Indemnizacion / reembolso',
        copy: analysis.solicitudes.length + ' solicitudes y ' + formatCurrency(analysis.solicitudesAprobado) + ' aprobados.',
        metaLeft: analysis.modulePending.solicitudes + ' pendientes',
        metaRight: analysis.topCoverage ? analysis.topCoverage[0] : 'Sin cobertura'
      }
    ];

    container.innerHTML = modules.map(item => {
      return '<div class="dashboard-module-item">'
        + '<span class="dashboard-module-title">' + item.title + '</span>'
        + '<p class="dashboard-module-copy">' + item.copy + '</p>'
        + '<div class="dashboard-module-meta"><span>' + item.metaLeft + '</span><span>' + item.metaRight + '</span></div>'
        + '</div>';
    }).join('');
  }

  function buildAnalysis(data) {
    const siniestros = data.siniestros;
    const accidentados = data.accidentados;
    const cartas = data.cartas;
    const solicitudes = data.solicitudes;

    const modulePending = {
      siniestros: siniestros.filter(item => item.estado === 'EN INVESTIGACION').length,
      accidentados: accidentados.filter(item => item.estado === 'EN INVESTIGACION').length,
      cartas: cartas.filter(item => item.estado === 'PENDIENTE').length,
      solicitudes: solicitudes.filter(item => item.estado === 'PENDIENTE' || item.estado === 'EN INVESTIGACION').length
    };

    const globalStates = {};
    [siniestros, accidentados, cartas, solicitudes].forEach(group => {
      group.forEach(item => {
        const key = item.estado || 'SIN ESTADO';
        globalStates[key] = (globalStates[key] || 0) + 1;
      });
    });

    const timeline = {};
    [
      ...siniestros.map(item => item.fechaRegistro || item.fechaOcurrencia),
      ...accidentados.map(item => item.fechaSiniestro),
      ...cartas.map(item => item.registro),
      ...solicitudes.map(item => item.registro)
    ].forEach(date => {
      if (!date) {
        return;
      }
      const key = formatMonthKey(date);
      timeline[key] = (timeline[key] || 0) + 1;
    });

    const coverageCounter = createMapCounter(solicitudes, item => item.cobertura);
    const providerCounter = createMapCounter(cartas, item => item.proveedor);
    const siniestroTypeCounter = createMapCounter(siniestros, item => item.tipo);

    return {
      siniestros,
      accidentados,
      cartas,
      solicitudes,
      modulePending,
      globalStates,
      timeline,
      totalAccidentadosEnSiniestros: sum(siniestros, item => item.accidentados),
      solicitudesAprobado: sum(solicitudes, item => item.montoAprobado),
      cartasAprobado: sum(cartas, item => item.montoAprobado),
      solicitudesLiquidadas: sum(solicitudes, item => item.montoLiquidado),
      cartasLiquidadas: sum(cartas, item => item.montoLiquidado),
      pendingTotal: modulePending.siniestros + modulePending.accidentados + modulePending.cartas + modulePending.solicitudes,
      topCoverage: topEntries(coverageCounter, 1)[0],
      topProvider: topEntries(providerCounter, 1)[0],
      topSiniestroType: topEntries(siniestroTypeCounter, 1)[0],
      coverageCounter,
      providerCounter,
      uniqueAccidentadoSiniestros: new Set(accidentados.map(item => item.siniestro).filter(Boolean)).size
    };
  }

  function renderKpis(analysis) {
    setText('kpiSiniestros', String(analysis.siniestros.length));
    setText('kpiSiniestrosMeta', analysis.modulePending.siniestros + ' en investigacion');
    setText('kpiAccidentados', String(analysis.accidentados.length));
    setText('kpiAccidentadosMeta', analysis.uniqueAccidentadoSiniestros + ' siniestros asociados');
    setText('kpiSolicitudes', String(analysis.solicitudes.length));
    setText('kpiSolicitudesMeta', analysis.modulePending.solicitudes + ' pendientes');
    setText('kpiCartas', String(analysis.cartas.length));
    setText('kpiCartasMeta', analysis.modulePending.cartas + ' pendientes');
    setText('kpiPendientes', String(analysis.pendingTotal));
    setText('kpiPendientesMeta', 'Investigacion y solicitudes en espera');
    setText('kpiMontoAprobado', formatCurrency(analysis.solicitudesAprobado + analysis.cartasAprobado));
    setText('kpiMontoAprobadoMeta', 'Liquidados: ' + formatCurrency(analysis.solicitudesLiquidadas + analysis.cartasLiquidadas));
  }

  function renderCharts(analysis) {
    destroyCharts();

    const stateEntries = Object.entries(analysis.globalStates);
    renderChart('chartEstados', {
      type: 'doughnut',
      data: {
        labels: stateEntries.map(item => item[0]),
        datasets: [{
          data: stateEntries.map(item => item[1]),
          backgroundColor: ['#0f5fa6', '#2ab3b1', '#11a36a', '#eab036', '#d34946', '#5f6f84'],
          borderWidth: 0
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    const timelineEntries = Object.entries(analysis.timeline);
    renderChart('chartTendencia', {
      type: 'line',
      data: {
        labels: timelineEntries.map(item => item[0]),
        datasets: [{
          label: 'Registros',
          data: timelineEntries.map(item => item[1]),
          borderColor: '#0f5fa6',
          backgroundColor: 'rgba(15, 95, 166, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#12304a',
          pointRadius: 4
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    const coverageEntries = topEntries(analysis.coverageCounter, 6);
    renderChart('chartCoberturas', {
      type: 'bar',
      data: {
        labels: coverageEntries.map(item => item[0]),
        datasets: [{
          label: 'Solicitudes',
          data: coverageEntries.map(item => item[1]),
          backgroundColor: ['#0f5fa6', '#1a79b5', '#2ab3b1', '#11a36a', '#eab036', '#d34946'],
          borderRadius: 10,
          maxBarThickness: 44
        }]
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    const providerEntries = topEntries(analysis.providerCounter, 5);
    renderChart('chartProveedores', {
      type: 'bar',
      data: {
        labels: providerEntries.map(item => item[0]),
        datasets: [{
          label: 'Cartas',
          data: providerEntries.map(item => item[1]),
          backgroundColor: '#12304a',
          borderRadius: 10,
          maxBarThickness: 48
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  function renderAlert(message, type) {
    const alert = document.getElementById('dashboardAlert');
    if (!alert) {
      return;
    }

    alert.className = 'alert dashboard-alert mb-4 alert-' + type;
    alert.textContent = message;
  }

  function updateTimestamp() {
    setText(
      'dashboardLastUpdated',
      'Ultima actualizacion: ' + new Date().toLocaleString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );
  }

  function loadDashboard() {
    renderAlert('Se estan consolidando los datos de las bandejas para construir los indicadores.', 'info');

    Promise.all([
      parseTable(pageMap.siniestros).then(parseSiniestros),
      parseTable(pageMap.accidentados).then(parseAccidentados),
      parseTable(pageMap.cartas).then(parseCartas),
      parseTable(pageMap.solicitudes).then(parseSolicitudes)
    ])
      .then(([siniestros, accidentados, cartas, solicitudes]) => {
        const analysis = buildAnalysis({ siniestros, accidentados, cartas, solicitudes });
        renderKpis(analysis);
        renderCharts(analysis);
        renderInsights(analysis);
        renderModules(analysis);
        updateTimestamp();
        renderAlert(
          'Analisis completado: ' + analysis.pendingTotal + ' registros requieren seguimiento y el monto aprobado acumulado asciende a ' + formatCurrency(analysis.solicitudesAprobado + analysis.cartasAprobado) + '.',
          analysis.pendingTotal > 5 ? 'warning' : 'success'
        );
      })
      .catch(error => {
        destroyCharts();
        renderAlert('No fue posible consolidar la informacion del modulo: ' + error.message, 'danger');
      });
  }

  const refreshButton = document.getElementById('refreshDashboard');
  if (refreshButton) {
    refreshButton.addEventListener('click', loadDashboard);
  }

  loadDashboard();
})();