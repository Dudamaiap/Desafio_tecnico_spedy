const Database = require('better-sqlite3');
const db = new Database('reservas.db');

// tabela de salas 
db.exec(`
  CREATE TABLE IF NOT EXISTS salas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  )
`);

// tabela de reservas 
db.exec(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sala_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    inicio TEXT NOT NULL,
    fim TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativa',
    FOREIGN KEY (sala_id) REFERENCES salas(id)
  )
`);

module.exports = db;

// Verifica se já existem salas cadastradas
const totalSalas = db.prepare('SELECT COUNT(*) AS total FROM salas').get();

if (totalSalas.total === 0) {
  const inserirSala = db.prepare('INSERT INTO salas (nome) VALUES (?)');
  inserirSala.run('Sala 1');
  inserirSala.run('Sala 2');
  inserirSala.run('Sala 3');
  console.log('Salas inseridas com sucesso!');
}
