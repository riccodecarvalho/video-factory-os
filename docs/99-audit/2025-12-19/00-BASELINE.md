# 00-BASELINE (Estado Atual)

**Data:** 2025-12-19
**Branch/Commit:** `origin/main` (SHA: `5a25c55`)
**Auditor:** Antigravity (Agent)

## 1. Visão Geral
Sistema **Video Factory OS** construído sobre Next.js 14, focado em execução local (Local-First) para produção de vídeos.
- **Diferencial:** Renderização via FFmpeg local (VideoToolbox), uso de jobs sequenciais (Engine) e governança de prompts (DB-first).
- **Estado percebido:** Funcional, mas com necessidade de organização ("crescimento orgânico").

## 2. Tech Stack Detectada
- **Framework:** Next.js 14.2.18 (App Router)
- **Database:** SQLite (`video-factory.db`) via Better-SQLite3
- **ORM:** Drizzle ORM + Drizzle Kit
- **AI/LLM:** Anthropic SDK
- **TTS:** Azure Speech (inferred from docs/code references)
- **Video:** FFmpeg + FFprobe (via installers e fluent-ffmpeg)
- **UI:** TailwindCSS + Radix UI + Lucide React
- **Validation:** Zod

## 3. Entrypoints
### Web / API
- `app/api/health`: Healthcheck endpoint.
- `app/api/artifacts/[...path]`: Servidor de arquivos estáticos (outputs de jobs).
- Frontend: `app/page.tsx` (Dashboard principal) e rotas em `app/(dashboard)`.

### CLI / Scripts
- `npm run dev`: Servidor de desenvolvimento.
- `npm run db:studio`: Drizzle Studio para visualizar dados.
- `npm run db:seed`: Seed do banco (`lib/db/seed.ts`).
- `npm run vf:e2e`: Teste end-to-end customizado (`scripts/e2e.ts`).

## 4. Estrutura de Automação (`scripts/`)
- `e2e.ts`: Script principal de teste end-to-end?
- `migrate-prompts-content.ts`: Migração de conteúdo de prompts.
- `seed-graciela-prompts-v2.ts`: Seed específico de prompts (Persona Graciela).
- `seed-graciela-recipe-v2.ts`: Seed de receita.
- `seed-video-preset-binding.ts`: Configuração de presets de vídeo.
- `verify-normalizer.ts`: Script de verificação pontual.

## 5. Observações Iniciais
- **API Mínima:** Poucos endpoints de API explícitos (`app/api`). Sugere uso intenso de Server Actions ou renderização direta no Server Component.
- **Lib Organizada:** `lib/engine` parece conter o core da lógica ("Business Logic layer").
- **Governança:** Existência de `lib/prompts` e `lib/audit` (vazio?) sugere tentativas prévias de organização.
