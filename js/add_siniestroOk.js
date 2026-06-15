
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

// Inicializar ambos campos
setupInput("correo_1", "clinica.inter@sanborja.com");
setupInput("correo_2", "clinica.inter@sanjuan.com");


// Mostrar formulario de registro de comisaría
            document.getElementById('registrar_comisaria').addEventListener('click', function() {
                document.getElementById('formularioComisaria').style.display = 'block';
                document.getElementById('nombreComisaria').focus();
            });

            // Cerrar formulario con la X
            document.getElementById('cerrarFormulario').addEventListener('click', function() {
                document.getElementById('formularioComisaria').style.display = 'none';
                document.getElementById('nombreComisaria').value = '';
            });

            // Cerrar formulario con botón cancelar
            document.getElementById('cancelarComisaria').addEventListener('click', function() {
                document.getElementById('formularioComisaria').style.display = 'none';
                document.getElementById('nombreComisaria').value = '';
            });

            // Guardar comisaría
            document.getElementById('guardarComisaria').addEventListener('click', function() {
                var nombreComisaria = document.getElementById('nombreComisaria').value.trim();
                if (nombreComisaria === '') {
                    alert('Por favor ingrese el nombre de la comisaría');
                    return;
                }
                
                alert('Comisaría "' + nombreComisaria + '" registrada exitosamente');
                document.getElementById('nombreComisaria').value = '';
                document.getElementById('formularioComisaria').style.display = 'none';
            });

//Agregar Solicitud

// Manejo del cambio en tipo de solicitud
document.getElementById('tipoSolicitud').addEventListener('change', function() {
    const tipoSolicitud = this.value;
    
    // Ocultar todos los campos dinámicos
    document.getElementById('camposIndemnizacion').style.display = 'none';
    document.getElementById('camposReembolso').style.display = 'none';
    document.getElementById('camposIncapacidad').style.display = 'none';
    document.getElementById('camposInvalidez').style.display = 'none';
    document.getElementById('camposMuerte').style.display = 'none';
    document.getElementById('camposGastosMedicos').style.display = 'none';
    document.getElementById('camposSepelio').style.display = 'none';
    
    // Resetear selects
    document.getElementById('tipoIndemnizacion').value = '';
    document.getElementById('tipoReembolso').value = '';
    
    if (tipoSolicitud === 'indemnizacion') {
        document.getElementById('camposIndemnizacion').style.display = 'block';
    } else if (tipoSolicitud === 'reembolso') {
        document.getElementById('camposReembolso').style.display = 'block';
    }
});

// Manejo del cambio en tipo de indemnización
document.getElementById('tipoIndemnizacion').addEventListener('change', function() {
    const tipoIndemnizacion = this.value;
    
    // Ocultar todos los campos de indemnización
    document.getElementById('camposIncapacidad').style.display = 'none';
    document.getElementById('camposInvalidez').style.display = 'none';
    document.getElementById('camposMuerte').style.display = 'none';
    
    if (tipoIndemnizacion === 'incapacidad_temporal') {
        document.getElementById('camposIncapacidad').style.display = 'block';
    } else if (tipoIndemnizacion === 'invalidez_permanente') {
        document.getElementById('camposInvalidez').style.display = 'block';
    } else if (tipoIndemnizacion === 'muerte') {
        document.getElementById('camposMuerte').style.display = 'block';
    }
});

// Manejo del cambio en tipo de reembolso
document.getElementById('tipoReembolso').addEventListener('change', function() {
    const tipoReembolso = this.value;
    
    // Ocultar todos los campos de reembolso
    document.getElementById('camposGastosMedicos').style.display = 'none';
    document.getElementById('camposSepelio').style.display = 'none';
    
    if (tipoReembolso === 'gastos_medicos') {
        document.getElementById('camposGastosMedicos').style.display = 'block';
    } else if (tipoReembolso === 'sepelio') {
        document.getElementById('camposSepelio').style.display = 'block';
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
            const montoSolicitadoIncapacidad = document.getElementById('montoSolicitadoIncapacidad').value;
            if (!numeroDias || !montoSolicitadoIncapacidad) {
                alert('Por favor, complete todos los campos requeridos para Incapacidad Temporal');
                return false;
            }
        } else if (tipoIndemnizacion === 'invalidez_permanente') {
            const porcentajeMenoscabo = document.getElementById('porcentajeMenoscabo').value;
            const valorSolicitadoInvalidez = document.getElementById('valorSolicitadoInvalidez').value;
            if (!porcentajeMenoscabo || !valorSolicitadoInvalidez) {
                alert('Por favor, complete todos los campos requeridos para Invalidez Permanente');
                return false;
            }
        } else if (tipoIndemnizacion === 'muerte') {
            const descripcionMuerte = document.getElementById('descripcionMuerte').value;
            const montoCarta = document.getElementById('montoCarta').value;
            if (!descripcionMuerte || !montoCarta) {
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

// Validar campos del tab 2
function validarTab2() {
    const nombreSolicitante = document.getElementById('nombreSolicitante').value;
    const apellidoSolicitante = document.getElementById('apellidoSolicitante').value;
    const cuenta = document.getElementById('cuenta').value;
    const banco = document.getElementById('banco').value;
    
    if (!nombreSolicitante || !apellidoSolicitante || !cuenta || !banco) {
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
    
    const celda1 = nuevaFila.insertCell(0);
    const celda2 = nuevaFila.insertCell(1);
    const celda3 = nuevaFila.insertCell(2);
    
    celda1.innerHTML = '<input type="text" class="form-control" placeholder="Nombre del documento">';
    celda2.innerHTML = '<input type="file" class="form-control">';
    celda3.innerHTML = '<button type="button" class="btn btn-danger btn-sm" onclick="eliminarFila(this)">Eliminar</button>';
}

// Función para eliminar fila
function eliminarFila(boton) {
    const fila = boton.parentNode.parentNode;
    fila.parentNode.removeChild(fila);
}

// Manejo del envío del formulario
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
});





