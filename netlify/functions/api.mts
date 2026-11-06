import type { Config } from "@netlify/functions";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import { configuracoes, trabalhos, usuarios } from "../../db/schema.js";

type Trabalho = {
  id: number;
  data: string;
  local: string;
  tecnico: string;
  consumacao: number;
  cache: number;
};

const erro = (status: number, mensagem: string) => Response.json({ error: mensagem }, { status });

// Usa JWT_SECRET se definido; caso contrário gera uma chave e a guarda no banco.
let segredoCache: string | undefined;
const obterSegredo = async (): Promise<string> => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (segredoCache) return segredoCache;

  const gerado = randomBytes(48).toString("base64url");
  await db.insert(configuracoes).values({ chave: "jwt_secret", valor: gerado }).onConflictDoNothing();
  const [linha] = await db.select().from(configuracoes).where(eq(configuracoes.chave, "jwt_secret"));
  segredoCache = linha.valor;
  return segredoCache;
};

const criarToken = async (usuario: { id: number }) =>
  jwt.sign({ sub: String(usuario.id) }, await obterSegredo(), { expiresIn: "7d" });

const dadosPublicos = (u: { id: number; nome: string; email: string }) => ({ id: u.id, nome: u.nome, email: u.email });

const autenticar = async (req: Request): Promise<number | null> => {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const payload = jwt.verify(token, await obterSegredo()) as jwt.JwtPayload;
    const id = Number(payload.sub);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
};

const lerCorpo = async (req: Request): Promise<Record<string, unknown>> => {
  try {
    const corpo = await req.json();
    return corpo && typeof corpo === "object" ? corpo : {};
  } catch {
    return {};
  }
};

const validarTrabalho = (corpo: Record<string, unknown>) => {
  const data = String(corpo.data || "");
  const local = typeof corpo.local === "string" ? corpo.local.trim() : "";
  const tecnico = typeof corpo.tecnico === "string" ? corpo.tecnico.trim() : "";
  const consumacao = Number(corpo.consumacao);
  const cache = Number(corpo.cache);
  const dataValida =
    /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(Date.parse(`${data}T00:00:00.000Z`)) &&
    new Date(`${data}T00:00:00.000Z`).toISOString().slice(0, 10) === data;

  if (!dataValida || !local || !tecnico || corpo.consumacao === "" || corpo.cache === "" ||
    !Number.isFinite(consumacao) || consumacao < 0 || !Number.isFinite(cache) || cache < 0) {
    return null;
  }
  return { data, local, tecnico, consumacao, cache };
};

const colunas = {
  id: trabalhos.id,
  data: trabalhos.data,
  local: trabalhos.local,
  tecnico: trabalhos.tecnico,
  consumacao: trabalhos.consumacao,
  cache: trabalhos.cache,
};

const buscarTrabalhos = async (usuarioId: number, params: URLSearchParams): Promise<Trabalho[]> => {
  const condicoes: SQL[] = [eq(trabalhos.usuarioId, usuarioId)];
  const tecnico = params.get("tecnico");
  const local = params.get("local");
  const dataInicio = params.get("dataInicio");
  const dataFim = params.get("dataFim");
  if (tecnico) condicoes.push(eq(trabalhos.tecnico, tecnico));
  if (local) condicoes.push(eq(trabalhos.local, local));
  if (dataInicio && dataFim) condicoes.push(gte(trabalhos.data, dataInicio), lte(trabalhos.data, dataFim));

  return db.select(colunas).from(trabalhos).where(and(...condicoes)).orderBy(desc(trabalhos.data), desc(trabalhos.id));
};

const gerarPDF = (lista: Trabalho[]): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const partes: Buffer[] = [];
    doc.on("data", (p: Buffer) => partes.push(p));
    doc.on("end", () => resolve(Buffer.concat(partes)));
    doc.on("error", reject);

    doc.fontSize(18).text("Relatório de Trabalhos", { align: "center" });
    doc.moveDown();

    const geral = { consumacao: 0, cache: 0, total: 0 };
    const porTecnico: Record<string, { consumacao: number; cache: number; total: number }> = {};

    for (const t of lista) {
      doc.text(`Data: ${t.data}`);
      doc.text(`Local: ${t.local}`);
      doc.text(`Técnico: ${t.tecnico}`);
      doc.text(`Consumação: R$ ${t.consumacao.toFixed(2)}`);
      doc.text(`Cache: R$ ${t.cache.toFixed(2)}`);
      doc.moveDown();

      geral.consumacao += t.consumacao;
      geral.cache += t.cache;
      geral.total += t.consumacao + t.cache;
      const tec = (porTecnico[t.tecnico] ||= { consumacao: 0, cache: 0, total: 0 });
      tec.consumacao += t.consumacao;
      tec.cache += t.cache;
      tec.total += t.consumacao + t.cache;
    }

    doc.moveDown();
    doc.fontSize(14).text("Totais");
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Total geral de consumação: R$ ${geral.consumacao.toFixed(2)}`);
    doc.text(`Total geral de cachê: R$ ${geral.cache.toFixed(2)}`);
    doc.text(`Total geral (consumação + cachê): R$ ${geral.total.toFixed(2)}`);
    doc.moveDown(0.5);
    doc.fontSize(12).text("Totais por técnico");
    for (const [tecnico, v] of Object.entries(porTecnico)) {
      doc.fontSize(11).text(tecnico);
      doc.text(`  Consumação: R$ ${v.consumacao.toFixed(2)}`);
      doc.text(`  Cachê: R$ ${v.cache.toFixed(2)}`);
      doc.text(`  Total (consumação + cachê): R$ ${v.total.toFixed(2)}`);
    }
    doc.end();
  });

// ---------- Rotas de autenticação ----------

const cadastrar = async (req: Request) => {
  const corpo = await lerCorpo(req);
  const nome = typeof corpo.nome === "string" ? corpo.nome.trim() : "";
  const email = typeof corpo.email === "string" ? corpo.email.trim().toLowerCase() : "";
  const senha = corpo.senha;

  if (!nome || !email || typeof senha !== "string" || senha.length < 8) {
    return erro(400, "Informe nome, e-mail e senha com pelo menos 8 caracteres.");
  }

  const [existente] = await db.select({ id: usuarios.id }).from(usuarios).where(sql`lower(${usuarios.email}) = ${email}`);
  if (existente) return erro(409, "Este e-mail já está cadastrado.");

  try {
    const senhaHash = await bcrypt.hash(senha, 12);
    const [usuario] = await db.insert(usuarios).values({ nome, email, senhaHash })
      .returning({ id: usuarios.id, nome: usuarios.nome, email: usuarios.email });
    return Response.json({ token: await criarToken(usuario), usuario: dadosPublicos(usuario) }, { status: 201 });
  } catch (e) {
    const duplicado = (e as { code?: string; cause?: { code?: string } })?.code === "23505" ||
      (e as { cause?: { code?: string } })?.cause?.code === "23505";
    return duplicado ? erro(409, "Este e-mail já está cadastrado.") : erro(500, "Não foi possível criar a conta.");
  }
};

const entrar = async (req: Request) => {
  const corpo = await lerCorpo(req);
  const email = typeof corpo.email === "string" ? corpo.email.trim().toLowerCase() : "";
  const senha = corpo.senha;
  const [usuario] = email
    ? await db.select().from(usuarios).where(sql`lower(${usuarios.email}) = ${email}`)
    : [];

  if (!usuario || typeof senha !== "string" || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    return erro(401, "E-mail ou senha incorretos.");
  }
  return Response.json({ token: await criarToken(usuario), usuario: dadosPublicos(usuario) });
};

// ---------- Roteador ----------

export default async (req: Request) => {
  const url = new URL(req.url);
  const caminho = url.pathname.replace(/\/+$/, "");
  const metodo = req.method;

  try {
    if (caminho === "/api/health" && metodo === "GET") {
      return Response.json({ status: "Backend rodando com sucesso", banco: "Netlify Database" });
    }
    if (caminho === "/api/auth/cadastro" && metodo === "POST") return await cadastrar(req);
    if (caminho === "/api/auth/login" && metodo === "POST") return await entrar(req);

    const usuarioId = await autenticar(req);

    if (caminho === "/api/auth/me" && metodo === "GET") {
      if (!usuarioId) return erro(401, "Autenticação necessária.");
      const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, usuarioId));
      if (!usuario) return erro(404, "Conta não encontrada.");
      return Response.json({ usuario: dadosPublicos(usuario) });
    }

    const rota = caminho.match(/^\/api\/trabalhos(?:\/([^/]+))?$/);
    if (!rota) return erro(404, "Rota não encontrada.");
    if (!usuarioId) {
      return erro(401, req.headers.get("authorization") ? "Sessão inválida ou expirada." : "Autenticação necessária.");
    }
    const segmento = rota[1];

    if (segmento === "exportar" && metodo === "GET") {
      const pdf = await gerarPDF(await buscarTrabalhos(usuarioId, url.searchParams));
      return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf" } });
    }

    if (!segmento) {
      if (metodo === "GET") return Response.json(await buscarTrabalhos(usuarioId, url.searchParams));
      if (metodo === "POST") {
        const trabalho = validarTrabalho(await lerCorpo(req));
        if (!trabalho) return erro(400, "Informe data, local, técnico e valores válidos.");
        const [criado] = await db.insert(trabalhos).values({ usuarioId, ...trabalho }).returning(colunas);
        return Response.json(criado, { status: 201 });
      }
      return erro(405, "Método não permitido.");
    }

    const id = Number(segmento);
    if (!Number.isSafeInteger(id) || id < 1) return erro(404, "Trabalho não encontrado.");
    const filtro = and(eq(trabalhos.id, id), eq(trabalhos.usuarioId, usuarioId));

    if (metodo === "GET") {
      const [trabalho] = await db.select(colunas).from(trabalhos).where(filtro);
      return trabalho ? Response.json(trabalho) : erro(404, "Trabalho não encontrado.");
    }
    if (metodo === "PUT") {
      const trabalho = validarTrabalho(await lerCorpo(req));
      if (!trabalho) return erro(400, "Informe data, local, técnico e valores válidos.");
      const [atualizado] = await db.update(trabalhos).set(trabalho).where(filtro).returning(colunas);
      return atualizado ? Response.json(atualizado) : erro(404, "Trabalho não encontrado.");
    }
    if (metodo === "DELETE") {
      const [excluido] = await db.delete(trabalhos).where(filtro).returning({ id: trabalhos.id });
      return excluido ? new Response(null, { status: 204 }) : erro(404, "Trabalho não encontrado.");
    }
    return erro(405, "Método não permitido.");
  } catch (e) {
    console.error(e);
    return erro(500, "Erro interno do servidor.");
  }
};

export const config: Config = {
  path: "/api/*",
};
