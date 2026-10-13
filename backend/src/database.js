const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const databasePath = path.resolve(
  process.env.SQLITE_PATH || path.join(__dirname, "..", "data", "organizador.sqlite")
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trabalhos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    local TEXT NOT NULL,
    tecnico TEXT NOT NULL,
    consumacao REAL NOT NULL CHECK (consumacao >= 0),
    cache REAL NOT NULL CHECK (cache >= 0)
  );

  CREATE INDEX IF NOT EXISTS idx_trabalhos_usuario_data
    ON trabalhos(usuario_id, data);

  CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`);

const jwtSecret = process.env.JWT_SECRET || (() => {
  const existente = db.prepare("SELECT valor FROM configuracoes WHERE chave = ?").get("jwt_secret");
  if (existente) return existente.valor;

  const gerado = crypto.randomBytes(48).toString("base64url");
  db.prepare("INSERT OR IGNORE INTO configuracoes (chave, valor) VALUES (?, ?)").run("jwt_secret", gerado);
  return db.prepare("SELECT valor FROM configuracoes WHERE chave = ?").get("jwt_secret").valor;
})();

Object.defineProperty(db, "location", { value: databasePath });

module.exports = { db, jwtSecret };