const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db, jwtSecret } = require("../database");

const criarToken = (usuario) => jwt.sign(
  { sub: String(usuario.id) },
  jwtSecret,
  { expiresIn: "7d" }
);

const dadosPublicos = (usuario) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email
});

exports.cadastrar = async (req, res) => {
  try {
    const corpo = req.body || {};
    const nome = corpo.nome?.trim();
    const email = corpo.email?.trim().toLowerCase();
    const senha = corpo.senha;

    if (!nome || !email || typeof senha !== "string" || senha.length < 8) {
      return res.status(400).json({ error: "Informe nome, e-mail e senha com pelo menos 8 caracteres." });
    }

    const existente = db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email);
    if (existente) return res.status(409).json({ error: "Este e-mail já está cadastrado." });

    const senhaHash = await bcrypt.hash(senha, 12);
    const resultado = db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)"
    ).run(nome, email, senhaHash);
    const usuario = { id: Number(resultado.lastInsertRowid), nome, email };

    res.status(201).json({ token: criarToken(usuario), usuario: dadosPublicos(usuario) });
  } catch (error) {
    const duplicado = error.message.includes("UNIQUE constraint failed");
    const status = duplicado ? 409 : 500;
    res.status(status).json({ error: status === 409 ? "Este e-mail já está cadastrado." : "Não foi possível criar a conta." });
  }
};

exports.entrar = async (req, res) => {
  try {
    const corpo = req.body || {};
    const email = corpo.email?.trim().toLowerCase();
    const senha = corpo.senha;
    const usuario = email ? db.prepare(
      "SELECT id, nome, email, senha_hash AS senhaHash FROM usuarios WHERE email = ?"
    ).get(email) : null;

    if (!usuario || typeof senha !== "string" || !await bcrypt.compare(senha, usuario.senhaHash)) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    res.json({ token: criarToken(usuario), usuario: dadosPublicos(usuario) });
  } catch (error) {
    res.status(500).json({ error: "Não foi possível entrar na conta." });
  }
};

exports.sessao = async (req, res) => {
  const usuario = db.prepare("SELECT id, nome, email FROM usuarios WHERE id = ?").get(req.usuarioId);
  if (!usuario) return res.status(404).json({ error: "Conta não encontrada." });
  res.json({ usuario: dadosPublicos(usuario) });
};