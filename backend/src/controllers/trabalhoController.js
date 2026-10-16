const { db } = require("../database");
const PDFDocument = require("pdfkit");

const montarFiltro = (query, usuarioId) => {
  const condicoes = ["usuario_id = ?"];
  const valores = [usuarioId];

  if (query.tecnico) {
    condicoes.push("tecnico = ?");
    valores.push(query.tecnico);
  }
  if (query.local) {
    condicoes.push("local = ?");
    valores.push(query.local);
  }
  if (query.dataInicio && query.dataFim) {
    condicoes.push("data >= ? AND data <= ?");
    valores.push(query.dataInicio, query.dataFim);
  }

  return { sql: condicoes.join(" AND "), valores };
};

const formatarTrabalho = (trabalho) => ({
  id: trabalho.id,
  data: trabalho.data,
  local: trabalho.local,
  tecnico: trabalho.tecnico,
  consumacao: trabalho.consumacao,
  cache: trabalho.cache
});

const validarTrabalho = (corpo) => {
  const data = String(corpo.data || "");
  const local = typeof corpo.local === "string" ? corpo.local.trim() : "";
  const tecnico = typeof corpo.tecnico === "string" ? corpo.tecnico.trim() : "";
  const consumacao = Number(corpo.consumacao);
  const cache = Number(corpo.cache);
  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data)
    && new Date(`${data}T00:00:00.000Z`).toISOString().slice(0, 10) === data;

  if (!dataValida || !local || !tecnico || corpo.consumacao === "" || corpo.cache === ""
    || !Number.isFinite(consumacao) || consumacao < 0 || !Number.isFinite(cache) || cache < 0) {
    return null;
  }

  return { data, local, tecnico, consumacao, cache };
};

exports.cadastrar = (req, res) => {
  try {
    const trabalho = validarTrabalho(req.body || {});
    if (!trabalho) {
      return res.status(400).json({ error: "Informe data, local, técnico e valores válidos." });
    }
    const resultado = db.prepare(`
      INSERT INTO trabalhos (usuario_id, data, local, tecnico, consumacao, cache)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.usuarioId, trabalho.data, trabalho.local, trabalho.tecnico, trabalho.consumacao, trabalho.cache);

    res.status(201).json(formatarTrabalho({ id: Number(resultado.lastInsertRowid), ...trabalho }));
  } catch (err) {
    res.status(400).json({ error: "Não foi possível salvar o trabalho." });
  }
};

exports.buscarPorId = (req, res) => {
  try {
    const trabalho = db.prepare(`
      SELECT id, data, local, tecnico, consumacao, cache
      FROM trabalhos WHERE id = ? AND usuario_id = ?
    `).get(req.params.id, req.usuarioId);

    if (!trabalho) return res.status(404).json({ error: "Trabalho não encontrado." });
    res.json(formatarTrabalho(trabalho));
  } catch (err) {
    res.status(500).json({ error: "Não foi possível carregar o trabalho." });
  }
};

exports.atualizar = (req, res) => {
  try {
    const trabalho = validarTrabalho(req.body || {});
    if (!trabalho) {
      return res.status(400).json({ error: "Informe data, local, técnico e valores válidos." });
    }

    const resultado = db.prepare(`
      UPDATE trabalhos
      SET data = ?, local = ?, tecnico = ?, consumacao = ?, cache = ?
      WHERE id = ? AND usuario_id = ?
    `).run(
      trabalho.data,
      trabalho.local,
      trabalho.tecnico,
      trabalho.consumacao,
      trabalho.cache,
      req.params.id,
      req.usuarioId
    );

    if (resultado.changes === 0) return res.status(404).json({ error: "Trabalho não encontrado." });
    res.json(formatarTrabalho({ id: Number(req.params.id), ...trabalho }));
  } catch (err) {
    res.status(400).json({ error: "Não foi possível atualizar o trabalho." });
  }
};

exports.excluir = (req, res) => {
  try {
    const resultado = db.prepare(`
      DELETE FROM trabalhos WHERE id = ? AND usuario_id = ?
    `).run(req.params.id, req.usuarioId);

    if (resultado.changes === 0) return res.status(404).json({ error: "Trabalho não encontrado." });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Não foi possível excluir o trabalho." });
  }
};

exports.buscar = (req, res) => {
  try {
    const filtro = montarFiltro(req.query, req.usuarioId);
    const trabalhos = db.prepare(`
      SELECT id, data, local, tecnico, consumacao, cache
      FROM trabalhos WHERE ${filtro.sql} ORDER BY data DESC, id DESC
    `).all(...filtro.valores);
    res.json(trabalhos.map(formatarTrabalho));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportarPDF = (req, res) => {
  try {
    const filtro = montarFiltro(req.query, req.usuarioId);
    const trabalhos = db.prepare(`
      SELECT id, data, local, tecnico, consumacao, cache
      FROM trabalhos WHERE ${filtro.sql} ORDER BY data DESC, id DESC
    `).all(...filtro.valores);
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Relatório de Trabalhos", { align: "center" });
    doc.moveDown();

    trabalhos.forEach(t => {
      doc.text(`Data: ${t.data}`);
      doc.text(`Local: ${t.local}`);
      doc.text(`Técnico: ${t.tecnico}`);
      doc.text(`Consumação: R$ ${Number(t.consumacao).toFixed(2)}`);
      doc.text(`Cache: R$ ${Number(t.cache).toFixed(2)}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
