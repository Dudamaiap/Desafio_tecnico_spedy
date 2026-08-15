const express = require('express');
const db = require('./db');

const app = express();

app.use(express.json());

app.get('/', (req, res) => { //req =requisição, res = resposta
  res.send('Servidor rodando!');
});

app.get('/reservas', (req, res) => {
  const reservas = db.prepare(`
    SELECT reservas.id, 
           reservas.titulo, 
           reservas.inicio, 
           reservas.fim, 
           reservas.status,
           salas.nome AS sala_nome
    FROM reservas
    JOIN salas ON reservas.sala_id = salas.id
    WHERE reservas.status = 'ativa'
    ORDER BY reservas.inicio ASC
  `).all();

  res.json(reservas);
});

app.post('/reservas', (req, res) => {
  const { sala_id, titulo, inicio, fim } = req.body;

  if (!sala_id || !titulo || !inicio || !fim) {
    return res.status(400).json({ erro: 'Sala, título, início e fim são obrigatórios.' });
  }

  if (new Date(fim) <= new Date(inicio)) {
    return res.status(400).json({ erro: 'O horário de fim precisa ser depois do início.' });
  }

  // não pode sobrepor outra reserva na mesma sala
  const conflito = db.prepare(`
    SELECT * FROM reservas
    WHERE sala_id = ?
      AND status = 'ativa'
      AND fim > ?
      AND inicio < ?
  `).get(sala_id, inicio, fim);

  if (conflito) {
    return res.status(409).json({ erro: 'Já existe uma reserva nesse horário para essa sala.' });
  }

  const inserir = db.prepare(`
    INSERT INTO reservas (sala_id, titulo, inicio, fim, status)
    VALUES (?, ?, ?, ?, 'ativa')
  `);
  const resultado = inserir.run(sala_id, titulo, inicio, fim);

  res.status(201).json({ id: resultado.lastInsertRowid, sala_id, titulo, inicio, fim, status: 'ativa' });
});

app.patch('/reservas/:id/cancelar', (req, res) => {
  const { id } = req.params;

  const reserva = db.prepare('SELECT * FROM reservas WHERE id = ?').get(id);

  if (!reserva) {
    return res.status(404).json({ erro: 'Reserva não encontrada.' });
  }

  db.prepare(`UPDATE reservas SET status = 'cancelada' WHERE id = ?`).run(id);

  res.json({ mensagem: 'Reserva cancelada com sucesso.' });
});


const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
