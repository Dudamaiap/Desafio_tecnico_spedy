const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function converterParaData(valor) {
  return new Date(valor.includes('T') ? valor : valor.replace(' ', 'T'));
}

function formatarDataHoraCurta(valor) {
  return converterParaData(valor).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatarHorarioCurto(valor) {
  return converterParaData(valor).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarFaixaDaReserva(inicio, fim) {
  return `${formatarDataHoraCurta(inicio)} das ${formatarHorarioCurto(inicio)} às ${formatarHorarioCurto(fim)}`;
}

function formatarDataHoraComparavel(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

function criarNotificacao({ reservaId = null, eventoChave, tipo, titulo, descricao }) {
  db.prepare(`
    INSERT OR IGNORE INTO notificacoes (
      reserva_id,
      evento_chave,
      tipo,
      titulo,
      descricao
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(reservaId, eventoChave, tipo, titulo, descricao);
}

function garantirNotificacoesDeLembrete() {
  const agora = new Date();
  const limite24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

  const reservasProximas = db.prepare(`
    SELECT reservas.id,
           reservas.titulo,
           reservas.inicio,
           reservas.fim,
           salas.nome AS sala_nome
    FROM reservas
    JOIN salas ON reservas.sala_id = salas.id
    WHERE reservas.status = 'ativa'
      AND reservas.fim >= ?
      AND reservas.inicio <= ?
    ORDER BY reservas.inicio ASC
  `).all(formatarDataHoraComparavel(agora), formatarDataHoraComparavel(limite24h));

  reservasProximas.forEach((reserva) => {
    const inicioReserva = converterParaData(reserva.inicio);
    const diferencaMs = inicioReserva.getTime() - agora.getTime();

    if (diferencaMs <= 0) {
      return;
    }

    if (diferencaMs <= 60 * 60 * 1000) {
      criarNotificacao({
        reservaId: reserva.id,
        eventoChave: `reserva-${reserva.id}-lembrete-1h`,
        tipo: 'lembrete_1h',
        titulo: 'Sua reunião está próxima',
        descricao: `"${reserva.titulo}" começa às ${formatarHorarioCurto(reserva.inicio)} de ${formatarDataHoraCurta(reserva.inicio)} na ${reserva.sala_nome}.`,
      });
      return;
    }

    criarNotificacao({
      reservaId: reserva.id,
      eventoChave: `reserva-${reserva.id}-lembrete-24h`,
      tipo: 'lembrete_24h',
      titulo: 'Lembrete da sua próxima reserva',
      descricao: `"${reserva.titulo}" está agendada para ${formatarFaixaDaReserva(reserva.inicio, reserva.fim)} na ${reserva.sala_nome}.`,
    });
  });
}

function listarNotificacoes(limite = 12) {
  garantirNotificacoesDeLembrete();

  return db.prepare(`
    SELECT id,
           reserva_id,
           tipo,
           titulo,
           descricao,
           lida,
           criado_em,
           lida_em
    FROM notificacoes
    ORDER BY lida ASC, datetime(criado_em) DESC, id DESC
    LIMIT ?
  `).all(limite).map((notificacao) => ({
    ...notificacao,
    lida: Boolean(notificacao.lida),
  }));
}

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
 * GET /notificacoes
 * Retorna as notificações persistidas, incluindo itens não lidos, cancelamentos e lembretes.
 */
app.get('/notificacoes', (req, res) => {
  try {
    const limiteBruto = Number(req.query.limite);
    const limite = Number.isInteger(limiteBruto)
      ? Math.min(Math.max(limiteBruto, 1), 50)
      : 12;

    const notificacoes = listarNotificacoes(limite);
    res.json(notificacoes);
  } catch (erro) {
    console.error('Erro ao buscar notificações:', erro);
    res.status(500).json({ erro: 'Erro interno ao consultar notificações.' });
  }
});

/**
 * PATCH /notificacoes/marcar-lidas
 * Marca uma ou mais notificações como lidas. Se nenhum id for enviado, marca todas.
 */
app.patch('/notificacoes/marcar-lidas', (req, res) => {
  try {
    const idsEnviados = req.body && Array.isArray(req.body.ids) ? req.body.ids : null;

    if (idsEnviados && idsEnviados.length === 0) {
      return res.status(400).json({ erro: 'Informe ao menos um id de notificação.' });
    }

    if (idsEnviados) {
      const ids = idsEnviados
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (ids.length !== idsEnviados.length) {
        return res.status(400).json({ erro: 'A lista de ids enviada é inválida.' });
      }

      const placeholders = ids.map(() => '?').join(', ');
      const resultado = db.prepare(`
        UPDATE notificacoes
        SET lida = 1,
            lida_em = datetime('now', 'localtime')
        WHERE lida = 0
          AND id IN (${placeholders})
      `).run(...ids);

      return res.json({
        mensagem: 'Notificações selecionadas marcadas como lidas.',
        total_atualizadas: resultado.changes,
      });
    }

    const resultado = db.prepare(`
      UPDATE notificacoes
      SET lida = 1,
          lida_em = datetime('now', 'localtime')
      WHERE lida = 0
    `).run();

    return res.json({
      mensagem: 'Todas as notificações foram marcadas como lidas.',
      total_atualizadas: resultado.changes,
    });
  } catch (erro) {
    console.error('Erro ao marcar notificações como lidas:', erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar notificações.' });
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
    const criarReservaComNotificacao = db.transaction(() => {
      const resultado = inserir.run(sala_id, titulo.trim(), inicio, fim);
      const reservaId = Number(resultado.lastInsertRowid);

      criarNotificacao({
        reservaId,
        eventoChave: `reserva-${reservaId}-criada`,
        tipo: 'reserva_criada',
        titulo: 'Nova reserva confirmada',
        descricao: `"${titulo.trim()}" foi agendada na ${salaExistente.nome} para ${formatarFaixaDaReserva(inicio, fim)}.`,
      });

      return reservaId;
    });
    const reservaId = criarReservaComNotificacao();

    const novaReserva = {
      id: reservaId,
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

    const reserva = db.prepare(`
      SELECT reservas.*,
             salas.nome AS sala_nome
      FROM reservas
      JOIN salas ON reservas.sala_id = salas.id
      WHERE reservas.id = ?
    `).get(id);

    if (!reserva) {
      return res.status(404).json({ erro: 'Reserva não encontrada.' });
    }

    if (reserva.status === 'cancelada') {
      return res.status(400).json({ erro: 'Esta reserva já se encontra cancelada.' });
    }

    const cancelarReservaComNotificacao = db.transaction(() => {
      db.prepare(`UPDATE reservas SET status = 'cancelada' WHERE id = ?`).run(id);
      db.prepare(`
        UPDATE notificacoes
        SET lida = 1,
            lida_em = datetime('now', 'localtime')
        WHERE reserva_id = ?
          AND tipo IN ('lembrete_1h', 'lembrete_24h')
          AND lida = 0
      `).run(id);

      criarNotificacao({
        reservaId: Number(id),
        eventoChave: `reserva-${id}-cancelada`,
        tipo: 'cancelamento',
        titulo: 'Reserva cancelada',
        descricao: `"${reserva.titulo}" na ${reserva.sala_nome} foi cancelada. O horário de ${formatarFaixaDaReserva(reserva.inicio, reserva.fim)} ficou disponível novamente.`,
      });
    });

    cancelarReservaComNotificacao();

    return res.json({ 
      mensagem: 'Reserva cancelada com sucesso.',
      id: Number(id) 
    });

  } catch (erro) {
    console.error('Erro ao cancelar reserva:', erro);
    return res.status(500).json({ erro: 'Erro interno ao cancelar reserva.' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando com sucesso na porta ${PORT}`);
  });
}

module.exports = app;
