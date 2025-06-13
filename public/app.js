const servicios = ["Spa", "Billar", "Mesa de ping-pong", "Barbecue", "Caminadora del gimnasio"];

const servicioSelect = document.getElementById('servicio');
const filtroServicio = document.getElementById('filtro-servicio');
servicios.forEach(s => {
  const opt = document.createElement('option');
  opt.value = opt.textContent = s;
  servicioSelect.appendChild(opt.cloneNode(true));
  filtroServicio.appendChild(opt);
});

const estado = document.getElementById('estado');
const form = document.getElementById('reserva-form');
const lista = document.getElementById('lista').querySelector('tbody');
const filtroFecha = document.getElementById('filtro-fecha');
const filtroApto = document.getElementById('filtro-apto');

document.getElementById('aplicar-filtros').addEventListener('click', cargarReservas);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const reserva = {
    apartamento: parseInt(apartamento.value),
    nombre: nombre.value.trim(),
    correo: correo.value.trim(),
    servicio: servicio.value,
    fecha: fecha.value,
    hora: hora.value,
    duracion: parseInt(duracion.value)
  };
  if (!reserva.fecha || !reserva.hora) return;
  const disponible = await checkDisponibilidad(reserva);
  if (!disponible) return;
  const res = await fetch('/api/reservas', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(reserva)
  });
  if (res.ok) {
    estado.textContent = 'Reservado ✅';
    cargarReservas();
  }
});

async function checkDisponibilidad({servicio, fecha, hora, duracion}) {
  const reservas = await fetch('/api/reservas').then(r => r.json());
  const inicio = new Date(`${fecha}T${hora}`);
  const fin = new Date(inicio.getTime() + duracion * 3600000);
  const ocupado = reservas.some(r => {
    if (r.servicio !== servicio || r.fecha !== fecha) return false;
    const rInicio = new Date(`${r.fecha}T${r.hora}`);
    const rFin = new Date(rInicio.getTime() + r.duracion * 3600000);
    return (inicio < rFin && fin > rInicio);
  });
  estado.textContent = ocupado ? 'Reservado \uD83D\uDD34' : 'Disponible \uD83D\uDFE2';
  return !ocupado;
}

async function cargarReservas() {
  const reservas = await fetch('/api/reservas').then(r => r.json());
  const serv = filtroServicio.value;
  const fechaF = filtroFecha.value;
  const apto = parseInt(filtroApto.value);
  lista.innerHTML = '';
  reservas
    .filter(r => !serv || r.servicio === serv)
    .filter(r => !fechaF || r.fecha === fechaF)
    .filter(r => !apto || r.apartamento === apto)
    .forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.apartamento}</td><td>${r.nombre}</td><td>${r.servicio}</td><td>${r.fecha}</td><td>${r.hora}</td><td>${r.duracion}</td>`;
      const btn = document.createElement('button');
      btn.textContent = 'Cancelar';
      btn.addEventListener('click', async () => {
        if (confirm('¿Cancelar reserva?')) {
          const res = await fetch('/api/reservas/' + r.id, {method: 'DELETE'});
          if (res.status === 204) cargarReservas();
        }
      });
      const td = document.createElement('td');
      td.appendChild(btn);
      tr.appendChild(td);
      lista.appendChild(tr);
    });
}

cargarReservas();
