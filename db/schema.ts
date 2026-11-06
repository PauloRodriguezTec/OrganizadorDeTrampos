import { sql } from "drizzle-orm";
import { check, doublePrecision, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const usuarios = pgTable(
  "usuarios",
  {
    id: serial().primaryKey(),
    nome: text().notNull(),
    email: text().notNull(),
    senhaHash: text("senha_hash").notNull(),
    criadoEm: timestamp("criado_em").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("usuarios_email_lower_idx").on(sql`lower(${t.email})`)]
);

export const trabalhos = pgTable(
  "trabalhos",
  {
    id: serial().primaryKey(),
    usuarioId: integer("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
    data: text().notNull(),
    local: text().notNull(),
    tecnico: text().notNull(),
    consumacao: doublePrecision().notNull(),
    cache: doublePrecision().notNull(),
  },
  (t) => [
    index("idx_trabalhos_usuario_data").on(t.usuarioId, t.data),
    check("trabalhos_consumacao_check", sql`${t.consumacao} >= 0`),
    check("trabalhos_cache_check", sql`${t.cache} >= 0`),
  ]
);

export const configuracoes = pgTable("configuracoes", {
  chave: text().primaryKey(),
  valor: text().notNull(),
});
