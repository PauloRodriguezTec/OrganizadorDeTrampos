require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db } = require("./src/database");
const authRoutes = require("./src/routes/auth");
const trabalhoRoutes = require("./src/routes/trabalhos");
const autenticar = require("./src/middleware/autenticar");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend rodando com sucesso", banco: "SQLite local" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trabalhos", autenticar, trabalhoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Banco SQLite: ${db.location}`);
});
