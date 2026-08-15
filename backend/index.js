const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Rota raiz para verificação de status do servidor
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Gerenciamento de Reservas Spedy rodando com sucesso!' });
});

/**
 * GET /salas
 * Retorna a lista de todas as salas disponíveis para reservas.
 */
app.get('/salas', (req, res) => {
  try {
    const salas = db.prepare('SELECT id, nome FROM salas ORDER BY id ASC').all();
    res.json(salas);
  } catch (erro) {
    console.error('Erro ao buscar salas:', erro);
    res.status(500).json({ erro: 'Erro interno ao consultar salas.' });
  }
});

/**
 * GET /reservas
 * Retorna todas as reservas ativas ordenadas por horário de início (cronológico).
 */
app.get('/reservas', (req, res) => {
  try {
    const reservas = db.prepare(`
      SELECT reservas.id, 
             reservas.sala_id,
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
  } catch (erro) {
    console.error('Erro ao buscar reservas:', erro);
    res.status(500).json({ erro: 'Erro interno ao consultar reservas.' });
  }
});

/**
 * POST /reservas
 * Cria uma nova reserva garantindo:
 * - Preenchimento obrigatório de sala_id, titulo, inicio, fim.
 * - Horário de término posterior ao de início.
 * - Não permissão de reservas em datas retroativas.
 * - Ausência de sobreposição na mesma sala para o mesmo período.
 */
app.post('/reservas', (req, res) => {
  try {
    const { sala_id, titulo, inicio, fim } = req.body;

    // 1. Validação de campos obrigatórios
    if (!sala_id || !titulo || !titulo.trim() || !inicio || !fim) {
      return res.status(400).json({ 
        erro: 'Sala, título, horário de início e término são obrigatórios.' 
      });
    }

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      return res.status(400).json({ erro: 'Formatos de data/hora inválidos.' });
    }

    // 2. Validação: fim deve ser estritamente maior que inicio
    if (dataFim <= dataInicio) {
      return res.status(400).json({ 
        erro: 'O horário de término precisa ser posterior ao horário de início.' 
      });
    }

    // 3. Validação: não permitir reservas retroativas (com tolerância de 5 min para sincronia)
    const agoraComTolerancia = new Date(Date.now() - 5 * 60 * 1000);
    if (dataInicio < agoraComTolerancia) {
      return res.status(400).json({ 
        erro: 'Não é possível agendar reuniões em horários retroativos/passados.' 
      });
    }

    // 4. Validação: verificar se a sala informada existe
    const salaExistente = db.prepare('SELECT id, nome FROM salas WHERE id = ?').get(sala_id);
    if (!salaExistente) {
      return res.status(404).json({ erro: 'A sala selecionada não foi encontrada.' });
    }

    // 5. Validação de sobreposição de reservas na mesma sala
    // Duas reservas se sobrepõem se: (novaReserva.inicio < reservaExistente.fim) E (novaReserva.fim > reservaExistente.inicio)
    const conflito = db.prepare(`
      SELECT id, titulo, inicio, fim FROM reservas
      WHERE sala_id = ?
        AND status = 'ativa'
        AND fim > ?
        AND inicio < ?
    `).get(sala_id, inicio, fim);

    if (conflito) {
      const extrairHora = (str) => str.includes('T') ? str.split('T')[1].substring(0, 5) : str.includes(' ') ? str.split(' ')[1].substring(0, 5) : str;
      const hInicio = extrairHora(conflito.inicio);
      const hFim = extrairHora(conflito.fim);

      return res.status(409).json({ 
        erro: `Conflito de horário! A ${salaExistente.nome} já está reservada das ${hInicio} às ${hFim} ("${conflito.titulo}").` 
      });
    }

    // 6. Inserção no banco de dados
    const inserir = db.prepare(`
      INSERT INTO reservas (sala_id, titulo, inicio, fim, status)
      VALUES (?, ?, ?, ?, 'ativa')
    `);
    const resultado = inserir.run(sala_id, titulo.trim(), inicio, fim);

    const novaReserva = {
      id: resultado.lastInsertRowid,
      sala_id,
      sala_nome: salaExistente.nome,
      titulo: titulo.trim(),
      inicio,
      fim,
      status: 'ativa'
    };

    return res.status(201).json(novaReserva);

  } catch (erro) {
    console.error('Erro ao criar reserva:', erro);
    return res.status(500).json({ erro: 'Erro interno ao salvar reserva.' });
  }
});

/**
 * PATCH /reservas/:id/cancelar
 * Marca o status da reserva como 'cancelada' (Soft Delete), preservando o histórico para auditoria.
 */
app.patch('/reservas/:id/cancelar', (req, res) => {
  try {
    const { id } = req.params;

    const reserva = db.prepare('SELECT * FROM reservas WHERE id = ?').get(id);

    if (!reserva) {
      return res.status(404).json({ erro: 'Reserva não encontrada.' });
    }

    if (reserva.status === 'cancelada') {
      return res.status(400).json({ erro: 'Esta reserva já se encontra cancelada.' });
    }

    db.prepare(`UPDATE reservas SET status = 'cancelada' WHERE id = ?`).run(id);

    return res.json({ 
      mensagem: 'Reserva cancelada com sucesso.',
      id: Number(id) 
    });

  } catch (erro) {
    console.error('Erro ao cancelar reserva:', erro);
    return res.status(500).json({ erro: 'Erro interno ao cancelar reserva.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando com sucesso na porta ${PORT}`);
});
