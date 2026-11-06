CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY,
	"valor" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trabalhos" (
	"id" serial PRIMARY KEY,
	"usuario_id" integer NOT NULL,
	"data" text NOT NULL,
	"local" text NOT NULL,
	"tecnico" text NOT NULL,
	"consumacao" double precision NOT NULL,
	"cache" double precision NOT NULL,
	CONSTRAINT "trabalhos_consumacao_check" CHECK ("consumacao" >= 0),
	CONSTRAINT "trabalhos_cache_check" CHECK ("cache" >= 0)
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_trabalhos_usuario_data" ON "trabalhos" ("usuario_id","data");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_lower_idx" ON "usuarios" (lower("email"));--> statement-breakpoint
ALTER TABLE "trabalhos" ADD CONSTRAINT "trabalhos_usuario_id_usuarios_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE;