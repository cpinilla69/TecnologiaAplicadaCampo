import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DATA_FILE = path.join(__dirname, 'reservas.txt');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

async function readReservas() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      return [];
    }
    throw err;
  }
}

async function writeReservas(reservas) {
  await fs.writeFile(DATA_FILE, JSON.stringify(reservas, null, 2));
}

app.get('/api/reservas', async (req, res) => {
  const reservas = await readReservas();
  res.json(reservas);
});

app.post('/api/reservas', async (req, res) => {
  const reserva = req.body;
  const reservas = await readReservas();
  const id = Date.now();
  reserva.id = id;
  reservas.push(reserva);
  await writeReservas(reservas);
  res.json(reserva);
});

app.delete('/api/reservas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const reservas = await readReservas();
  const index = reservas.findIndex(r => r.id === id);
  if (index !== -1) {
    reservas.splice(index, 1);
    await writeReservas(reservas);
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
