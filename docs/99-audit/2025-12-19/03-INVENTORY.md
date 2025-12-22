# Inventário Completo - 2025-12-18

## Páginas/Rotas (UI)

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `app/page.tsx` | Dashboard - Control Room |
| `/jobs` | `app/jobs/page.tsx` | Lista de jobs |
| `/jobs/new` | `app/jobs/new/page.tsx` | Criar novo job |
| `/jobs/[id]` | `app/jobs/[id]/page.tsx` | Detalhes do job |
| `/jobs/[id]/script` | `app/jobs/[id]/script/page.tsx` | Visualizar script |
| `/admin/execution-map` | `app/admin/execution-map/page.tsx` | Mapa de execução |
| `/admin/knowledge-base` | `app/admin/knowledge-base/page.tsx` | Base de conhecimento |
| `/admin/presets` | `app/admin/presets/page.tsx` | Presets gerais |
| `/admin/presets/video` | `app/admin/presets/video/page.tsx` | Presets de vídeo |
| `/admin/projects` | `app/admin/projects/page.tsx` | Projetos |
| `/admin/prompts` | `app/admin/prompts/page.tsx` | Gerenciar prompts |
| `/admin/providers` | `app/admin/providers/page.tsx` | Providers |
| `/admin/recipes` | `app/admin/recipes/page.tsx` | Recipes |
| `/admin/validators` | `app/admin/validators/page.tsx` | Validadores |

**Total**: 14 páginas

---

## APIs/Endpoints

| Endpoint | Arquivo | Descrição |
|----------|---------|-----------|
| `GET /api/health` | `app/api/health/route.ts` | Health check |
| `GET /api/artifacts/[...path]` | `app/api/artifacts/[...path]/route.ts` | Servir artifacts |
| `GET /api/jobs/[id]/artifacts/[step]` | `app/api/jobs/[id]/artifacts/[step]/route.ts` | Artifact de step |

**Total**: 3 endpoints

---

## Actions (Server Actions)

| Arquivo | Funções Principais |
|---------|-------------------|
| `app/admin/actions.ts` | CRUD admin geral |
| `app/jobs/actions.ts` | getJobs, getJob, startJob, retryStep |

---

## Engine (Core)

| Arquivo | Propósito |
|---------|-----------|
| `lib/engine/runner.ts` | Pipeline executor principal |
| `lib/engine/providers.ts` | Claude + Azure TTS integrations |
| `lib/engine/ffmpeg.ts` | Render de vídeo |
| `lib/engine/step-mapper.ts` | Mapeamento de steps |
| `lib/engine/capabilities.ts` | Classificação de step kinds |
| `lib/engine/export.ts` | Exportação de jobs |

---

## Recipes

| Recipe | Steps |
|--------|-------|
| `graciela` | title → brief → script → parse_ssml → tts → render → export |

---

## Tabelas DB

| Tabela | Status |
|--------|--------|
| jobs | ✅ Ativa |
| recipes | ✅ Ativa |
| prompts | ✅ Ativa |
| providers | ✅ Ativa |
| presets_voice | ✅ Ativa |
| presets_ssml | ✅ Ativa |
| presets_video | ✅ Ativa |
| validators | ✅ Ativa |
| knowledge_base | ✅ Ativa |
| projects | ✅ Ativa |
