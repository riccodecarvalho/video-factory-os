# 🗺️ Video Factory OS — System Map

> **Documento de Referência Completa para Compartilhamento com IAs**  
> **Versão:** 1.0 | **Data:** 2026-01-06 | **SHA:** `51e2ef9`

---

## 📚 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Modelo de Dados](#3-modelo-de-dados)
4. [Rotas e Páginas](#4-rotas-e-páginas)
5. [Componentes](#5-componentes)
6. [Engine de Execução](#6-engine-de-execução)
7. [Fluxos Principais](#7-fluxos-principais)
8. [Configurações Config-First](#8-configurações-config-first)

---

## 1. Visão Geral

### O que é?
**Video Factory OS** é um sistema local-first para produção de vídeos, substituindo o n8n. Produz vídeos narrativos de longa duração para YouTube de forma automatizada.

### Princípios Fundamentais
- **Config-First**: Nada hardcoded. Prompts, vozes, presets, tudo vem do banco.
- **Manifest-First**: Todo job gera um manifest JSON como fonte da verdade.
- **Checkpoint Idempotente**: Cada step pode ser retomado sem reprocessar anteriores.
- **Local Render**: FFmpeg com VideoToolbox (Mac GPU) para render rápido.

### 5 Módulos do Produto

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Project Manager** | Projetos, episódios, presets, biblioteca | ✅ Parcial |
| **Script Studio** | Editor de roteiro, timestamps | ⏳ Parcial |
| **Voice Lab** | Editor SSML, preview, TTS | ⏳ Não implementado |
| **Video Factory** | Pipeline de jobs, render FFmpeg | ✅ Implementado |
| **Dashboard** | Lista de jobs, logs, re-run | ✅ Implementado |

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                    │
├─────────────────────────────────────────────────────────────────┤
│  /admin/*          │  /wizard/*       │  /jobs/*               │
│  (Config Pages)    │  (Wizard Flow)   │  (Job Management)      │
├─────────────────────────────────────────────────────────────────┤
│                     COMPONENTS                                   │
│  /layout/*  │  /ui/*  │  /vf/*                                  │
│  (AppShell) │ (shadcn)│ (Video Factory Components)              │
├─────────────────────────────────────────────────────────────────┤
│                       API ROUTES                                 │
│  /api/jobs  │  /api/artifacts  │  /api/render  │  /api/health  │
├─────────────────────────────────────────────────────────────────┤
│                         ENGINE                                   │
│  runner.ts → executors/* → providers.ts → adapters/*            │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                  │
│  SQLite + Drizzle ORM │ File Artifacts in /jobs/*               │
├─────────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES                             │
│       Claude (LLM)    │    Azure (TTS)    │   ImageFX           │
└─────────────────────────────────────────────────────────────────┘
```

### Stack Técnico
- **Frontend**: Next.js 14 App Router + React + Tailwind + shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Database**: SQLite + Drizzle ORM
- **LLM**: Claude (Anthropic)
- **TTS**: Azure Speech Services
- **Images**: Google ImageFX (via adapter)
- **Render**: FFmpeg local (VideoToolbox no Mac)

---

## 3. Modelo de Dados

### Tabelas Principais

#### Config (Governança)
| Tabela | Descrição |
|--------|-----------|
| `prompts` | Templates de prompt com variáveis, model config |
| `providers` | Claude, Azure, ImageFX - configs de API |
| `recipes` | Pipeline JSON por canal (ex: Graciela) |
| `knowledge_base` | Docs de contexto por tier (tier1/tier2/tier3) |
| `validators` | Regras de validação (regex, min_words, etc) |
| `execution_bindings` | Wiring: step → prompt → provider → preset |

#### Presets
| Tabela | Descrição |
|--------|-----------|
| `presets_voice` | Azure voice config: voice, rate, pitch, style |
| `presets_video` | FFmpeg: encoder, scale, fps, bitrate |
| `presets_effects` | Filtergraph FFmpeg |
| `presets_ssml` | SSML templates + pause mapping |

#### Execução
| Tabela | Descrição |
|--------|-----------|
| `projects` | Projetos de vídeo (canal/persona) |
| `jobs` | Execuções de vídeo |
| `job_steps` | Estado de cada step (status, output_refs, logs) |
| `artifacts` | Arquivos gerados (audio, video, text) |

---

## 4. Rotas e Páginas

### Admin Pages (`/admin/*`)
| Rota | Função |
|------|--------|
| `/admin/projects` | CRUD de projetos |
| `/admin/recipes` | Gerenciar recipes/pipelines |
| `/admin/prompts` | Gerenciar prompts |
| `/admin/providers` | Gerenciar providers (Claude/Azure) |
| `/admin/presets` | Voice & Video presets |
| `/admin/presets/video` | Video presets específico |
| `/admin/validators` | Regras de validação |
| `/admin/knowledge-base` | Docs de contexto (tier1/2/3) |
| `/admin/execution-map` | Wiring: step → configs |
| `/admin/imagefx-config` | Config ImageFX |
| `/admin/script-studio` | Editor de roteiro |
| `/admin/timeline-test` | Testes de Timeline DSL |

### Wizard (`/wizard/*`)
| Rota | Função |
|------|--------|
| `/wizard` | Lista de jobs em modo wizard |
| `/wizard/[jobId]` | Execução passo-a-passo do job |

### Jobs (`/jobs/*`)
| Rota | Função |
|------|--------|
| `/jobs` | Lista de jobs (dashboard) |
| `/jobs/new` | Criar novo job |
| `/jobs/[id]` | Detalhes do job |
| `/jobs/[id]/script` | Versões do roteiro |

### API Routes (`/api/*`)
| Rota | Função |
|------|--------|
| `/api/jobs/*` | CRUD de jobs |
| `/api/jobs/[id]/artifacts/[step]` | Servir artefatos |
| `/api/render/*` | API do render worker |
| `/api/health` | Health check |
| `/api/artifacts/*` | Servir arquivos |

---

## 5. Componentes

### Layout (`/components/layout/`)
| Componente | Função |
|------------|--------|
| `AppShell` | Layout principal com sidebar |
| `PageHeader` | Cabeçalho de páginas |
| `Sidebar` | Menu lateral |
| `SplitView` | Lista + Detalhe |
| `FiltersBar` | Filtros e busca |
| `SectionCards` | Cards de seções/tabs |

### VF Components (`/components/vf/`)
| Componente | Função |
|------------|--------|
| **Wizard** | |
| `WizardStepper` | Stepper hierárquico 2 níveis |
| `StepExecutionProgress` | Feedback de execução com timer |
| `GeneratedResultCard` | Card de resultado estruturado |
| `IterateWithAI` | Campo de iteração com IA |
| `WizardFooter` | Navegação footer |
| `WizardApprovalActions` | Ações de aprovação |
| `StepConfigurator` | Config de cenas (modo 7x1, etc) |
| `PreviousStepsContext` | Contexto de steps anteriores |
| **Jobs** | |
| `JobCard` | Card resumido de job |
| `PipelineView` | Visualização do pipeline |
| `StepIndicator` | Indicador de status do step |
| `StepPreview` | Preview de artefatos |
| `LogsViewer` | Visualizador de logs |
| `ManifestViewer` | Visualizador de manifest |
| `JobArtifactsTab` | Tab de artefatos |
| `JobConfigTab` | Tab de configuração |
| **Design System** | |
| `CharacterCard` | Cards de personagens narrativos |
| `NarrativeStructure` | Estrutura narrativa com plot points |
| `TimestampGenerator` | Gerador de timestamps YouTube |
| `TagChips` | Tags editáveis |
| `TierExplainer` | Explicação dos tiers KB |
| `UsageIndicator` | Badge de uso |
| `UsedBySection` | Seção "usado por" |
| `ProcessNotification` | Toast de processos |
| `ErrorDetail` | Detalhes de erro |
| `StatusBadge` | Badge de status |
| `ProgressRing` | Anel de progresso |
| `MetricCard` | Card de métrica |
| `QuickAction` | Ação rápida |

---

## 6. Engine de Execução

### Runner (`lib/engine/runner.ts`)
Orquestra a execução de jobs:
1. Carrega job e recipe do DB
2. Para cada step do pipeline:
   - Carrega config (bindings → prompt + provider + kb + validators)
   - Executa executor apropriado
   - Salva artefatos e atualiza status
3. Gera manifest final

### Executores (`lib/engine/executors/`)
| Executor | Função |
|----------|--------|
| `llm.ts` | Chama Claude com prompt + KB |
| `tts.ts` | Gera áudio via Azure TTS |
| `transform.ts` | Limpa/transforma texto |
| `render.ts` | Renderiza vídeo com FFmpeg |
| `scene-prompts.ts` | Gera prompts de imagem por cena |
| `generate-images.ts` | Gera imagens via ImageFX |

### Providers (`lib/engine/providers.ts`)
Abstração para APIs externas:
- `executeLLM()` → Claude
- `executeTTS()` → Azure Speech
- `executeImageGeneration()` → ImageFX

### Adapters (`lib/adapters/`)
| Adapter | Função |
|---------|--------|
| `imagefx.ts` | Integração com Google ImageFX |

### Timeline Engine (`lib/timeline/`)
Sistema declarativo para composição de vídeo:
- `schema.ts` — Types: Timeline, Scene, Element
- `validator.ts` — Validação Zod
- `render-plan.ts` — RenderPlan + presets
- `compiler.ts` — Timeline → comandos FFmpeg

---

## 7. Fluxos Principais

### Fluxo 1: Criar Job via Wizard

```
1. /wizard → Selecionar recipe
2. /wizard/[jobId] → Executar steps:
   ├─ ideacao (LLM)
   ├─ titulo (LLM)
   ├─ brief (LLM)
   ├─ planejamento (LLM)
   ├─ roteiro (LLM + validators)
   ├─ prompts_cenas (LLM) → StepConfigurator (modo 7x1)
   ├─ gerar_imagens (ImageFX)
   ├─ tts (Azure)
   ├─ render (FFmpeg)
   └─ export
3. Artefatos salvos em /jobs/{jobId}/*
```

### Fluxo 2: Pipeline Automático

```
1. /jobs/new → Input inicial + selecionar recipe
2. POST /api/jobs → Cria job
3. Runner executa todos steps automaticamente
4. /jobs/[id] → Ver resultado, retry steps
```

### Fluxo 3: Admin Config

```
1. /admin/prompts → Criar/editar prompts
2. /admin/providers → Configurar Claude/Azure
3. /admin/presets → Voice/Video presets
4. /admin/execution-map → Wiring: step → configs
5. /admin/recipes → Definir pipeline
```

---

## 8. Configurações Config-First

### O que vive no DB (nunca hardcoded)

| Tipo | Tabela | Exemplo |
|------|--------|---------|
| Prompts | `prompts` | "Roteiro Graciela v7" |
| Vozes | `presets_voice` | "Ximena Multilingual" |
| Encoders | `presets_video` | "1080p VideoToolbox" |
| Pipelines | `recipes` | "Graciela YouTube Long" |
| Contextos | `knowledge_base` | "DNA do Canal (tier1)" |
| Validações | `validators` | "min_6000_words" |
| Wiring | `execution_bindings` | step → prompt + provider |

### Regras de Ouro
1. **Prompt-as-Data**: `getPromptOrThrow()` — falha se não encontrar
2. **Config-First**: Nenhum prompt/voice/preset hardcoded
3. **Manifest-First**: Todo job gera `manifest.json`
4. **Checkpoint**: Re-run de step sem reprocessar anteriores

---

## 📊 Estatísticas do Sistema

| Métrica | Valor |
|---------|-------|
| Tabelas no DB | 15+ |
| Páginas Admin | 11 |
| Componentes VF | 31 |
| Arquivos Engine | 27 |
| Executores | 6 |
| Adapters | 1 |
| Lines of Code (estimado) | ~15k |

---

## 🔗 Arquivos de Referência Importantes

- **PRD**: `docs/04-produto/prd.md`
- **Architecture**: `docs/04-produto/architecture.md`
- **Troubleshooting**: `docs/00-regras/operacao/troubleshooting.md`
- **Creation Engine Blueprint**: `docs/tm.md`
- **Workflow de Início**: `docs/00-regras/workflow-inicio.md`

---

**Última atualização:** 2026-01-06  
**Mantido por:** Sistema de Governança Video Factory OS
