(function () {
const solicitudForm = document.getElementById('solicitudForm');

if (!solicitudForm) {
  return;
}

if (solicitudForm.dataset.addSiniestroInitialized === 'true') {
  return;
}

solicitudForm.dataset.addSiniestroInitialized = 'true';

// --- Drag & Drop archivos múltiples en NUEVA SOLICITUD ---
function initDragAndDropNuevaSolicitud() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('fileElem');
  const fileList = document.getElementById('fileList');
  if (!dropArea || !fileInput || !fileList) return;

  // Prevenir comportamiento por defecto
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => e.preventDefault(), false);
    dropArea.addEventListener(eventName, e => e.stopPropagation(), false);
  });

  dropArea.addEventListener('dragover', () => dropArea.classList.add('bg-primary','text-white'));
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('bg-primary','text-white'));
  dropArea.addEventListener('drop', handleDrop, false);
  dropArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFiles, false);

  function handleDrop(e) {
    dropArea.classList.remove('bg-primary','text-white');
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFiles();
    }
  }

  function handleFiles() {
    fileList.innerHTML = '';
    const files = fileInput.files;
    if (!files.length) return;
    const ul = document.createElement('ul');
    ul.className = 'list-unstyled';
    for (let i = 0; i < files.length; i++) {
      const li = document.createElement('li');
      li.textContent = files[i].name + ' (' + Math.round(files[i].size/1024) + ' KB)';
      ul.appendChild(li);
    }
    fileList.appendChild(ul);
  }
}

initDragAndDropNuevaSolicitud();

    // Obtener todos los checkboxes con clase "single-check"
    const checkboxes = document.querySelectorAll('.single-check');
    
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          // Si se marcó este checkbox, desmarcar todos los demás
          if (checkbox.checked) {
            checkboxes.forEach((cb) => {
              if (cb !== checkbox) cb.checked = false;
            });
          }
        });
      });

/*CORREO FORMATOS */

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function getInitials(email) {
  const name = email.split("@")[0];
  const parts = name.split(".");
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
}

function createEmailTag(email, container) {
  const input = container.querySelector('.email-input');

  const tag = document.createElement("div");
  tag.classList.add("email-tag");
  if (!isValidEmail(email)) tag.classList.add("invalid");

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  avatar.textContent = getInitials(email);

  const span = document.createElement("span");
  span.classList.add("email-text");
  span.textContent = email;

  span.ondblclick = () => {
    const inputEdit = document.createElement("input");
    inputEdit.type = "text";
    inputEdit.value = email;
    inputEdit.className = "email-input";
    tag.replaceChild(inputEdit, span);
    inputEdit.focus();

    inputEdit.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
      const newEmail = inputEdit.value.trim();
      if (newEmail !== "") {
        email = newEmail; // ACTUALIZA el valor de email original
        span.textContent = email;
        avatar.textContent = getInitials(email);
        tag.classList.toggle("invalid", !isValidEmail(email));
        tag.replaceChild(span, inputEdit);
      }
    }
    });

    inputEdit.addEventListener("blur", () => {
      tag.replaceChild(span, inputEdit);
    });
  };

  const remove = document.createElement("span");
  remove.classList.add("remove-btn");
  remove.textContent = "×";
  remove.onclick = () => tag.remove();

  tag.appendChild(avatar);
  tag.appendChild(span);
  tag.appendChild(remove);

  container.insertBefore(tag, input);
}

function setupInput(containerId, defaultEmail = null) {
  const container = document.getElementById(containerId);
  const input = container.querySelector('.email-input');

  input.addEventListener("keydown", (e) => {
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      const email = input.value.trim().replace(/,$/, '');
      if (email !== "") {
        createEmailTag(email, container);
        input.value = "";
      }
    }
  });

  if (defaultEmail) {
    createEmailTag(defaultEmail, container);
  }
}

function focusInput(containerId) {
  const container = document.getElementById(containerId);
  const input = container.querySelector('.email-input');
  input.focus();
}

window.focusInput = focusInput;

// Inicializar ambos campos
setupInput("correo_1", "clinica.inter@sanborja.com");
setupInput("correo_2", "clinica.inter@sanjuan.com");


// Comisarias: buscar, registrar y editar
var buscarComisariaInput = document.getElementById('buscarComisaria');
var registrarComisariaBtn = document.getElementById('registrar_comisaria');
var formularioComisaria = document.getElementById('formularioComisaria');
var tituloFormularioComisaria = document.getElementById('tituloFormularioComisaria');
var nombreComisariaInput = document.getElementById('nombreComisaria');
var guardarComisariaBtn = document.getElementById('guardarComisaria');
var cerrarFormularioBtn = document.getElementById('cerrarFormulario');
var cancelarComisariaBtn = document.getElementById('cancelarComisaria');
var tablaComisariasBody = document.getElementById('tablaComisariasBody');
var resultadoBusquedaComisaria = document.getElementById('resultadoBusquedaComisaria');
var selectComisaria = document.getElementById('comisaria');
var editingComisariaRow = null;
var comisariaElementsReady = buscarComisariaInput && registrarComisariaBtn && formularioComisaria &&
  tituloFormularioComisaria && nombreComisariaInput && guardarComisariaBtn &&
  cerrarFormularioBtn && cancelarComisariaBtn && tablaComisariasBody &&
  resultadoBusquedaComisaria && selectComisaria;

function normalizarTexto(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function actualizarTextoBotonComisaria() {
  if (!comisariaElementsReady) {
    return;
  }

  guardarComisariaBtn.textContent = editingComisariaRow ? 'EDITAR' : 'GUARDAR';
  tituloFormularioComisaria.textContent = editingComisariaRow
    ? 'EDITAR COMISARÍA'
    : 'REGISTRAR NUEVA COMISARÍA';
}

function limpiarFormularioComisaria() {
  if (!comisariaElementsReady) {
    return;
  }

  editingComisariaRow = null;
  nombreComisariaInput.value = '';
  actualizarTextoBotonComisaria();
}

function ocultarFormularioComisaria() {
  if (!comisariaElementsReady) {
    return;
  }

  formularioComisaria.style.display = 'none';
  limpiarFormularioComisaria();
}

function mostrarFormularioComisaria() {
  if (!comisariaElementsReady) {
    return;
  }

  formularioComisaria.style.display = 'block';
  actualizarTextoBotonComisaria();
  nombreComisariaInput.focus();
}

function crearBotonEditarComisaria() {
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-sm btn-warning';
  button.innerHTML = '<i class="bi bi-pencil"></i>';
  button.addEventListener('click', function () {
    var row = button.closest('tr');
    editingComisariaRow = row;
    nombreComisariaInput.value = row.cells[0].textContent.trim();
    mostrarFormularioComisaria();
  });
  return button;
}

function vincularBotonesEditarComisaria() {
  if (!comisariaElementsReady) {
    return;
  }

  Array.prototype.forEach.call(tablaComisariasBody.querySelectorAll('tr'), function (row) {
    var editCell = row.cells[1];
    if (!editCell) {
      return;
    }

    var existingButton = editCell.querySelector('button');
    if (existingButton && existingButton.dataset.comisariaBound === 'true') {
      return;
    }

    editCell.innerHTML = '';
    var button = crearBotonEditarComisaria();
    button.dataset.comisariaBound = 'true';
    editCell.appendChild(button);
    editCell.classList.add('text-center');
  });
}

function filtrarComisarias() {
  if (!comisariaElementsReady) {
    return;
  }

  var termino = normalizarTexto(buscarComisariaInput.value);
  var visibles = 0;

  Array.prototype.forEach.call(tablaComisariasBody.rows, function (row) {
    var nombre = normalizarTexto(row.cells[0] ? row.cells[0].textContent : '');
    var coincide = !termino || nombre.indexOf(termino) !== -1;
    row.style.display = coincide ? '' : 'none';
    if (coincide) {
      visibles += 1;
    }
  });

  resultadoBusquedaComisaria.textContent = termino
    ? 'Coincidencias encontradas: ' + visibles
    : 'Total de comisarías: ' + tablaComisariasBody.rows.length;
}

function upsertComisariaOption(nombreAnterior, nombreNuevo) {
  if (!comisariaElementsReady) {
    return;
  }

  var normalizedOld = normalizarTexto(nombreAnterior);
  var normalizedNew = normalizarTexto(nombreNuevo);
  var options = Array.prototype.slice.call(selectComisaria.options);
  var optionToUpdate = options.find(function (option) {
    return normalizarTexto(option.textContent) === normalizedOld || normalizarTexto(option.textContent) === normalizedNew;
  });

  if (optionToUpdate) {
    optionToUpdate.textContent = nombreNuevo;
    optionToUpdate.value = nombreNuevo;
  } else {
    var newOption = document.createElement('option');
    newOption.value = nombreNuevo;
    newOption.textContent = nombreNuevo;
    selectComisaria.appendChild(newOption);
  }

  selectComisaria.value = nombreNuevo;
}

if (comisariaElementsReady) {
  registrarComisariaBtn.addEventListener('click', function () {
    limpiarFormularioComisaria();
    mostrarFormularioComisaria();
  });

  cerrarFormularioBtn.addEventListener('click', ocultarFormularioComisaria);
  cancelarComisariaBtn.addEventListener('click', ocultarFormularioComisaria);
  buscarComisariaInput.addEventListener('input', filtrarComisarias);

  guardarComisariaBtn.addEventListener('click', function () {
    var nombreComisaria = nombreComisariaInput.value.trim();
    if (nombreComisaria === '') {
      alert('Por favor ingrese el nombre de la comisaría');
      return;
    }

    if (editingComisariaRow) {
      var nombreAnterior = editingComisariaRow.cells[0].textContent.trim();
      editingComisariaRow.cells[0].textContent = nombreComisaria;
      upsertComisariaOption(nombreAnterior, nombreComisaria);
      alert('Comisaría actualizada exitosamente');
    } else {
      var newRow = tablaComisariasBody.insertRow();
      var nameCell = newRow.insertCell(0);
      var editCell = newRow.insertCell(1);
      nameCell.textContent = nombreComisaria;
      editCell.className = 'text-center';
      editCell.appendChild(crearBotonEditarComisaria());
      upsertComisariaOption('', nombreComisaria);
      alert('Comisaría "' + nombreComisaria + '" registrada exitosamente');
    }

    ocultarFormularioComisaria();
    filtrarComisarias();
  });

  vincularBotonesEditarComisaria();
  filtrarComisarias();
}

//Agregar Solicitud
function ocultar(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function mostrar(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

// Manejo del cambio en tipo de solicitud
document.getElementById('tipoSolicitud').addEventListener('change', function () {
  const tipo = this.value;

  ocultar('camposIndemnizacion');
  ocultar('camposReembolso');
  ocultar('camposIncapacidad');
  ocultar('camposInvalidez');
  ocultar('camposMuerte');
  ocultar('camposGastosMedicos');
  ocultar('camposSepelio');

  if (tipo === 'indemnizacion') {
    mostrar('camposIndemnizacion');
  } else if (tipo === 'reembolso') {
    mostrar('camposReembolso');
  }
});


// Manejo del cambio en tipo de indemnización
document.getElementById('tipoIndemnizacion').addEventListener('change', function () {
  ocultar('camposIncapacidad');
  ocultar('camposInvalidez');
  ocultar('camposMuerte');

  if (this.value === 'incapacidad_temporal') {
    mostrar('camposIncapacidad');
  } else if (this.value === 'invalidez_permanente') {
    mostrar('camposInvalidez');
  } else if (this.value === 'muerte') {
    mostrar('camposMuerte');
  }
});


// Manejo del cambio en tipo de reembolso
document.getElementById('tipoReembolso').addEventListener('change', function () {
  ocultar('camposGastosMedicos');
  ocultar('camposSepelio');

  if (this.value === 'gastos_medicos') {
    mostrar('camposGastosMedicos');
  } else if (this.value === 'sepelio') {
    mostrar('camposSepelio');
  }
});


// Validar campos del tab 1
function validarTab1() {
    const tipoSolicitud = document.getElementById('tipoSolicitud').value;
    
    if (!tipoSolicitud) {
        alert('Por favor, seleccione el tipo de solicitud');
        return false;
    }
    
    if (tipoSolicitud === 'indemnizacion') {
        const tipoIndemnizacion = document.getElementById('tipoIndemnizacion').value;
        if (!tipoIndemnizacion) {
            alert('Por favor, seleccione el tipo de indemnización');
            return false;
        }
        
        if (tipoIndemnizacion === 'incapacidad_temporal') {
            const numeroDias = document.getElementById('numeroDias').value;
            const montoSolicitadoIncapacidad = document.getElementById('montoSolicitado1').value;
            if (!numeroDias || !montoSolicitadoIncapacidad) {
                alert('Por favor, complete todos los campos requeridos para Incapacidad Temporal');
                return false;
            }
        } else if (tipoIndemnizacion === 'invalidez_permanente') {
            const porcentajeMenoscabo = document.getElementById('porcentajeMenoscabo').value;
            const valorSolicitadoInvalidez = document.getElementById('montoSolicitado2').value;
            if (!porcentajeMenoscabo || !valorSolicitadoInvalidez) {
                alert('Por favor, complete todos los campos requeridos para Invalidez Permanente');
                return false;
            }
        } else if (tipoIndemnizacion === 'muerte') {
            const montoCarta = document.getElementById('montoSolicitado3').value;
            if (!montoCarta) {
                alert('Por favor, complete todos los campos requeridos para Muerte');
                return false;
            }
        }
    } else if (tipoSolicitud === 'reembolso') {
        const tipoReembolso = document.getElementById('tipoReembolso').value;
        if (!tipoReembolso) {
            alert('Por favor, seleccione el tipo de reembolso');
            return false;
        }
        
        if (tipoReembolso === 'gastos_medicos') {
            const descripcionGasto = document.getElementById('descripcionGasto').value;
            const montoSolicitud = document.getElementById('montoSolicitud').value;
            if (!descripcionGasto || !montoSolicitud) {
                alert('Por favor, complete todos los campos requeridos para Gastos Médicos');
                return false;
            }
        } else if (tipoReembolso === 'sepelio') {
            const tipoSepelio = document.getElementById('tipoSepelio').value;
            const valorGastoSepelio = document.getElementById('valorGastoSepelio').value;
            if (!tipoSepelio || !valorGastoSepelio) {
                alert('Por favor, complete todos los campos requeridos para Sepelio');
                return false;
            }
        }
    }
    
    return true;
}


function calcularDiasIncapacidad() {
    const rmv = 1130; // Remuneración Mínima Vital
    const fechaInicio = document.getElementById('fechaInicioIT1').value;
    const fechaFin = document.getElementById('fechaFinIT1').value;
    
    if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('numeroDias').value = dias;
        document.getElementById('montoSolicitado1').value = parseFloat((rmv/30)*dias).toFixed(2); // RMV=1130// Aquí puedes ajustar el cálculo del monto según tu lógica
    }
}

  window.calcularDiasIncapacidad = calcularDiasIncapacidad;

// Validar campos del tab 2
function validarTab2() {
    const nombreSolicitante = document.getElementById('nombre_solicitante').value;
    const cuenta = document.getElementById('nro_cuenta').value;
    const banco = document.getElementById('banco').value;
    
    if (!nombreSolicitante || !cuenta || !banco) {
        alert('Por favor, complete todos los campos requeridos del Solicitante y Beneficiario');
        return false;
    }
    
    return true;
}

// Botón Siguiente del Tab 1
document.getElementById('btnSiguiente1').addEventListener('click', function() {
    if (validarTab1()) {
        const tabSolicitante = new bootstrap.Tab(document.getElementById('solicitante-tab'));
        tabSolicitante.show();
    }
});

// Botón Siguiente del Tab 2
document.getElementById('btnSiguiente2').addEventListener('click', function() {
    if (validarTab2()) {
        const tabDocumentos = new bootstrap.Tab(document.getElementById('documentos-tab'));
        tabDocumentos.show();
    }
});

// Botón Anterior del Tab 2
document.getElementById('btnAnterior2').addEventListener('click', function() {
    const tabDatos = new bootstrap.Tab(document.getElementById('datos-tab'));
    tabDatos.show();
});

// Botón Anterior del Tab 3
document.getElementById('btnAnterior3').addEventListener('click', function() {
    const tabSolicitante = new bootstrap.Tab(document.getElementById('solicitante-tab'));
    tabSolicitante.show();
});

// Función para agregar documento
function agregarDocumento() {
    const tabla = document.getElementById('tablaDocumentos').getElementsByTagName('tbody')[0];
    const nuevaFila = tabla.insertRow();
    const totalFilas = tabla.rows.length;

    const celda1 = nuevaFila.insertCell(0);
    const celda2 = nuevaFila.insertCell(1);
    const celda3 = nuevaFila.insertCell(2);
    const celda4 = nuevaFila.insertCell(3);
    
    celda1.innerHTML = totalFilas; // Número de fila
    celda2.innerHTML = '<input type="text" class="form-control"  placeholder="Nombre del documento">';
    celda3.innerHTML = '<div class="checkbox text-center" ><label style="font-size: 1.5em"><input type="checkbox" value="">                                    <span class="cr"><i class="cr-icon fa fa-check"></i></span></label></div>'
    celda4.innerHTML = '<button type="button" class="btn btn-danger btn-sm" onclick="eliminarFila(this)">Eliminar</button>';
}

window.agregarDocumento = agregarDocumento;

// Función para eliminar fila
function eliminarFila(boton) {
    const fila = boton.parentNode.parentNode;
    fila.parentNode.removeChild(fila);
}

window.eliminarFila = eliminarFila;

// Manejo del envío del formulario
/*
document.getElementById('solicitudForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Solicitud guardada exitosamente');
    const modal = bootstrap.Modal.getInstance(document.getElementById('nuevaSolicitudModal'));
    modal.hide();
    
    // Resetear el formulario
    this.reset();
    
    // Ocultar todos los campos dinámicos
    document.getElementById('camposIndemnizacion').style.display = 'none';
    document.getElementById('camposReembolso').style.display = 'none';
    document.getElementById('camposIncapacidad').style.display = 'none';
    document.getElementById('camposInvalidez').style.display = 'none';
    document.getElementById('camposMuerte').style.display = 'none';
    document.getElementById('camposGastosMedicos').style.display = 'none';
    document.getElementById('camposSepelio').style.display = 'none';
    
    // Volver al primer tab
    const tabDatos = new bootstrap.Tab(document.getElementById('datos-tab'));
    tabDatos.show();
});*/

document.getElementById('solicitudForm').addEventListener('submit', function (e) {
  e.preventDefault();
  alert('Solicitud guardada');

  this.reset();

  [
    'camposIndemnizacion',
    'camposReembolso',
    'camposIncapacidad',
    'camposInvalidez',
    'camposMuerte',
    'camposGastosMedicos',
    'camposSepelio'
  ].forEach(ocultar);
  const tabDatos = new bootstrap.Tab(document.getElementById('datos-tab'));
  tabDatos.show();
  location.reload();
});

}());






