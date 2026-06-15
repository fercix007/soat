
var modalSubirArchivoInstance = null;
var reembolsosFiltrosForm = document.getElementById('reembolsosFiltrosForm');
var tablaMedico = document.getElementById('tablaMedico');

function abrirModalSubirArchivo(e) {
    e.preventDefault();

    const modalElement = document.getElementById('modalSubirArchivo');

    if (!modalSubirArchivoInstance) {
        modalSubirArchivoInstance = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false,
            focus: false
        });
    }

    modalSubirArchivoInstance.show();
}

window.abrirModalSubirArchivo = abrirModalSubirArchivo;

if (window.__reembolsosModalStackHandler) {
    document.removeEventListener('show.bs.modal', window.__reembolsosModalStackHandler);
}

window.__reembolsosModalStackHandler = function (event) {
    const zIndexBase = 1050;
    const openModals = document.querySelectorAll('.modal.show').length;
    const currentModal = event.target;

    if (!currentModal || !currentModal.classList || !currentModal.classList.contains('modal')) {
        return;
    }

    if (openModals === 0) {
        currentModal.style.removeProperty('z-index');
        return;
    }

    const zIndex = zIndexBase + (10 * (openModals + 1));
    currentModal.style.zIndex = zIndex;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show modal-backdrop-stacked';
    backdrop.style.zIndex = zIndex - 1;
    document.body.appendChild(backdrop);

    currentModal.addEventListener('hidden.bs.modal', () => {
        backdrop.remove();
        if (!document.querySelector('.modal.show')) {
            currentModal.style.removeProperty('z-index');
        }
    }, { once: true });
};

document.addEventListener('show.bs.modal', window.__reembolsosModalStackHandler);

if (reembolsosFiltrosForm && tablaMedico && reembolsosFiltrosForm.dataset.reembolsosInitialized !== 'true') {
    reembolsosFiltrosForm.dataset.reembolsosInitialized = 'true';

    var filtroNroSiniestroMedico = document.getElementById('filtroNroSiniestroMedico');
    var filtroNroPeticionMedico = document.getElementById('filtroNroPeticionMedico');
    var filtroTipoCoberturaMedico = document.getElementById('filtroTipoCoberturaMedico');
    var filtroEstadoMedico = document.getElementById('filtroEstadoMedico');
    var filtroFechaDesdeMedico = document.getElementById('filtroFechaDesdeMedico');
    var filtroFechaHastaMedico = document.getElementById('filtroFechaHastaMedico');
    var filtroPacienteDniMedico = document.getElementById('filtroPacienteDniMedico');
    var medicoRows = Array.prototype.slice.call(tablaMedico.tBodies[0].rows);

    function normalizeFilterText(value) {
        return (value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function getMedicoCellText(row, index) {
        return row.cells[index] ? row.cells[index].textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function parseMedicoRowDate(value) {
        var match = (value || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!match) {
            return null;
        }

        return new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
    }

    function parseMedicoInputDate(value) {
        if (!value) {
            return null;
        }

        var parts = value.split('-');
        if (parts.length !== 3) {
            return null;
        }

        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }

    function populateMedicoCoverageOptions() {
        var seen = {};

        medicoRows.forEach(function (row) {
            var coverage = getMedicoCellText(row, 5);
            if (!coverage) {
                return;
            }

            var key = normalizeFilterText(coverage);
            if (seen[key]) {
                return;
            }

            seen[key] = true;
            var option = document.createElement('option');
            option.value = coverage;
            option.textContent = coverage;
            filtroTipoCoberturaMedico.appendChild(option);
        });
    }

    function medicoRowMatchesFilters(row) {
        var nroPeticion = normalizeFilterText(getMedicoCellText(row, 1));
        var nroSiniestro = normalizeFilterText(getMedicoCellText(row, 2));
        var registroDate = parseMedicoRowDate(getMedicoCellText(row, 3));
        var accidentado = normalizeFilterText(getMedicoCellText(row, 4));
        var cobertura = normalizeFilterText(getMedicoCellText(row, 5));
        var estado = normalizeFilterText(getMedicoCellText(row, 8));

        var filtroPeticion = normalizeFilterText(filtroNroPeticionMedico.value);
        var filtroSiniestro = normalizeFilterText(filtroNroSiniestroMedico.value);
        var filtroPaciente = normalizeFilterText(filtroPacienteDniMedico.value);
        var filtroCobertura = normalizeFilterText(filtroTipoCoberturaMedico.value);
        var filtroEstado = normalizeFilterText(filtroEstadoMedico.value);
        var fechaDesde = parseMedicoInputDate(filtroFechaDesdeMedico.value);
        var fechaHasta = parseMedicoInputDate(filtroFechaHastaMedico.value);

        if (filtroPeticion && nroPeticion.indexOf(filtroPeticion) === -1) {
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

        if (filtroEstado && estado !== filtroEstado) {
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

    function applyMedicoFilters() {
        medicoRows.forEach(function (row) {
            row.style.display = medicoRowMatchesFilters(row) ? '' : 'none';
        });
    }

    function clearMedicoFilters() {
        medicoRows.forEach(function (row) {
            row.style.display = '';
        });
    }

    reembolsosFiltrosForm.addEventListener('submit', function (event) {
        event.preventDefault();
        applyMedicoFilters();
    });

    reembolsosFiltrosForm.addEventListener('reset', function () {
        window.setTimeout(clearMedicoFilters, 0);
    });

    populateMedicoCoverageOptions();
}

var validarDerivacion = document.getElementById('validarDerivacion');
var validarDerivacionInvPer = document.getElementById('validarDerivacionInvPer');

if (validarDerivacion) {
  validarDerivacion.addEventListener('change', function () {

    if (this.checked) {
         document.getElementById('derivacionInr').style.display = 'block';
         document.getElementById('informe').style.display = 'block';
    } else {
        document.getElementById('derivacionInr').style.display = 'none';
        document.getElementById('informe').style.display = 'none';
    }
    });
}


if (validarDerivacionInvPer) {
    validarDerivacionInvPer.addEventListener('change', function () {

    if (this.checked) {
         document.getElementById('derivacionInrInvPer').style.display = 'block';
         document.getElementById('informeInvPer').style.display = 'block';
    } else {
        document.getElementById('derivacionInrInvPer').style.display = 'none';
        document.getElementById('informeInvPer').style.display = 'none';
    }
    });
}