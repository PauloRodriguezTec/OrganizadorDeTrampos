const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../database");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Autenticação necessária." });

  try {
    const payload = jwt.verify(token, jwtSecret);
    const usuarioId = Number(payload.sub);
    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
      return res.status(401).json({ error: "Sessão inválida ou expirada." });
    }
    req.usuarioId = usuarioId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
};