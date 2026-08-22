const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'reservas.db');
const db = new Database(dbPath);

// Ativa foreign keys no SQLite
db.pragma('foreign_keys = ON');

// Criar tabela de salas
db.exec(`
  CREATE TABLE IF NOT EXISTS salas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  )
`);

// Criar tabela de reservas
db.exec(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sala_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    inicio TEXT NOT NULL,
    fim TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativa',
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE
  )
`);

// Criar tabela de notificações
db.exec(`
  CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_id INTEGER,
    evento_chave TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0, 1)),
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    lida_em TEXT,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL
  )
`);

// Migração: verificar se a coluna criado_em já existe na tabela reservas
const colunasReservas = db.prepare("PRAGMA table_info(reservas)").all();
const possuiCriadoEm = colunasReservas.some((col) => col.name === 'criado_em');

if (!possuiCriadoEm) {
  try {
    db.exec("ALTER TABLE reservas ADD COLUMN criado_em TEXT DEFAULT CURRENT_TIMESTAMP");
  } catch (err) {
    // Ignorar erro caso a coluna já exista em concorrência
  }
}

// Seed de salas padrão caso o banco esteja vazio
const totalSalas = db.prepare('SELECT COUNT(*) AS total FROM salas').get();

if (totalSalas.total === 0) {
  const inserirSala = db.prepare('INSERT INTO salas (nome) VALUES (?)');
  const salasPadrao = [
    'Sala Inovação (Capacidade: 6p)',
    'Sala Foco (Capacidade: 4p)',
    'Sala Diretoria (Capacidade: 12p)',
    'Auditório Principal (Capacidade: 30p)'
  ];

  salasPadrao.forEach((nome) => inserirSala.run(nome));
  console.log('Salas padrão cadastradas com sucesso!');
}

module.exports = db;
