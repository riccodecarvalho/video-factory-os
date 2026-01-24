# Video Factory OS - Documentação Completa para Replicação

> **Gerado em:** 2026-01-24
> **Versão do Sistema:** 0.1.0
> **Objetivo:** Documentação exaustiva para replicação 100% fiel do sistema

---

## 📋 ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Banco de Dados](#4-banco-de-dados)
5. [Engine de Execução](#5-engine-de-execução)
6. [Frontend](#6-frontend)
7. [APIs e Integrações](#7-apis-e-integrações)
8. [Configurações](#8-configurações)
9. [Scripts e Ferramentas](#9-scripts-e-ferramentas)
10. [Deploy e Operação](#10-deploy-e-operação)

---

## 1. VISÃO GERAL

### O que é o Video Factory OS?

Sistema de produção automatizada de vídeos com pipeline configurável:
- **Input:** Ideia/brief textual
- **Output:** Vídeo completo com narração, imagens e legendas
- **Diferencial:** Config-first (tudo no banco), zero hardcode

### Arquitetura Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  /jobs   │  │  /admin  │  │  /board  │  │     /wizard      │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
└───────┼─────────────┼───────────┼──────────────────┼────────────┘
        │             │           │                  │
        ▼             ▼           ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER ACTIONS (app/**/actions.ts)           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ENGINE (lib/engine/)                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      runner.ts (Orchestrador)                ││
│  │  • Carrega Job + Recipe                                      ││
│  │  • Resolve configs via execution_bindings                    ││
│  │  • Executa steps sequencialmente                             ││
│  │  • Gera manifest com snapshots                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │    LLM     │ │    TTS     │ │   Render   │ │    Export    │  │
│  │ (Claude)   │ │ (Azure)    │ │  (FFmpeg)  │ │   (Pacote)   │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite + Drizzle)                   │
│  • jobs, job_steps, artifacts (execução)                        │
│  • prompts, recipes, providers (configuração)                    │
│  • execution_bindings (wiring config-first)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICO

### Core

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Next.js** | 14.2.35 | Framework full-stack (App Router) |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.7.2 | Tipagem estática |
| **Drizzle ORM** | 0.38.3 | ORM para SQLite |
| **better-sqlite3** | 11.7.0 | Driver SQLite |

### UI

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Tailwind CSS** | 3.4.17 | Estilização utility-first |
| **Radix UI** | Várias | Primitivas de componentes |
| **Lucide React** | 0.468.0 | Ícones |
| **class-variance-authority** | 0.7.1 | Variantes de componentes |
| **tailwind-merge** | 2.6.0 | Merge de classes |

### Backend/Processing

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **@anthropic-ai/sdk** | 0.39.0 | Claude API |
| **fluent-ffmpeg** | 2.1.3 | FFmpeg wrapper |
| **adm-zip** | 0.5.16 | Extração de ZIPs (Azure TTS) |
| **uuid** | 11.0.3 | Geração de IDs |
| **zod** | 3.25.76 | Validação de schemas |

### Dependências de Sistema

```bash
# FFmpeg (obrigatório para render)
brew install ffmpeg  # macOS
# ou via @ffmpeg-installer/ffmpeg (incluído no package.json)

# SQLite (incluído no Node.js)
```

---

## 3. ESTRUTURA DE DIRETÓRIOS

```
video-factory-os/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin pages (CRUD)
│   │   ├── actions.ts            # Server actions admin
│   │   ├── prompts/              # Gestão de prompts
│   │   ├── providers/            # Gestão de providers
│   │   ├── presets/              # Gestão de presets
│   │   ├── recipes/              # Gestão de recipes
│   │   ├── validators/           # Gestão de validators
│   │   ├── knowledge-base/       # Gestão de KB
│   │   ├── projects/             # Gestão de projetos
│   │   └── execution-map/        # Visualização de bindings
│   ├── api/                      # API Routes
│   │   ├── artifacts/            # Serve arquivos gerados
│   │   ├── health/               # Health check
│   │   ├── jobs/                 # Job operations
│   │   └── render/               # Render operations
│   ├── board/                    # Kanban de jobs
│   ├── jobs/                     # Lista e detalhes de jobs
│   │   ├── [id]/                 # Detalhes do job
│   │   ├── new/                  # Criar novo job
│   │   └── actions.ts            # Server actions jobs
│   ├── wizard/                   # Modo wizard step-by-step
│   ├── globals.css               # CSS global + variáveis
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Home/Dashboard
│
├── components/                   # Componentes React
│   ├── layout/                   # AppShell, Sidebar, etc
│   ├── ui/                       # shadcn/ui components
│   └── vf/                       # Video Factory específicos
│
├── lib/                          # Lógica de negócio
│   ├── db/                       # Database
│   │   ├── schema.ts             # Definição de tabelas
│   │   ├── index.ts              # Conexão DB
│   │   ├── seed.ts               # Dados iniciais
│   │   └── migrations/           # Migrações Drizzle
│   ├── engine/                   # Motor de execução
│   │   ├── runner.ts             # Orquestrador principal
│   │   ├── providers.ts          # Claude + Azure TTS
│   │   ├── ffmpeg.ts             # Render de vídeo
│   │   ├── executors/            # Executores por tipo
│   │   └── ...
│   ├── timeline/                 # Timeline DSL
│   │   ├── schema.ts             # Tipos da Timeline
│   │   ├── compiler.ts           # Compila para RenderPlan
│   │   └── ...
│   ├── adapters/                 # Integrações externas
│   │   └── imagefx.ts            # Google ImageFX
│   └── utils.ts                  # Utilitários
│
├── config/                       # Configurações estáticas
│   ├── kb/                       # Knowledge base JSONs
│   ├── presets/                  # Presets estáticos
│   ├── prompts/                  # Prompts estáticos
│   └── recipes/                  # Recipes estáticas
│
├── scripts/                      # Scripts utilitários
│   ├── backup.sh                 # Backup do banco
│   ├── restore.sh                # Restore do banco
│   ├── e2e.ts                    # Testes e2e
│   └── ...                       # Vários scripts de seed/fix
│
├── docs/                         # Documentação
│   ├── 00-regras/                # Regras do projeto
│   ├── 01-adr/                   # Architecture Decision Records
│   ├── 02-features/              # Specs de features
│   └── ...
│
├── artifacts/                    # Output dos jobs (gitignored)
├── backups/                      # Backups do banco (gitignored)
├── public/                       # Assets públicos
│   └── assets/channels/          # Avatares dos canais
│
├── video-factory.db              # Banco SQLite
├── .env.local                    # Variáveis de ambiente
└── package.json                  # Dependências
```

---

## 4. BANCO DE DADOS

### Schema Completo

O banco usa SQLite com Drizzle ORM. Schema em `lib/db/schema.ts`.

#### Tabelas Principais

| Tabela | Função | Campos-Chave |
|--------|--------|--------------|
| `projects` | Contexto de canal | id, key, name, voiceRate, llmTemperature |
| `recipes` | Pipeline de steps | id, slug, pipeline (JSON), validatorsConfig |
| `prompts` | Templates LLM | id, slug, systemPrompt, userTemplate, model, maxTokens |
| `providers` | Config de APIs | id, slug, type (llm/tts), defaultModel |
| `presets_voice` | Vozes Azure | id, slug, voiceName, language, style |
| `presets_video` | Config FFmpeg | id, slug, encoder, scale, fps, bitrate |
| `presets_ssml` | Mapeamento pausas | id, slug, pauseMappings, voiceMappings |
| `validators` | Regras de validação | id, slug, type, config, errorMessage |
| `knowledge_base` | Docs por tier | id, slug, tier, category, content |
| `execution_bindings` | Wiring config-first | scope, recipeId, stepKey, slot, targetId |

#### Tabelas de Execução

| Tabela | Função | Campos-Chave |
|--------|--------|--------------|
| `jobs` | Execuções de vídeo | id, projectId, recipeId, input, status, manifest |
| `job_steps` | Estado por etapa | id, jobId, stepKey, status, outputRefs |
| `artifacts` | Arquivos gerados | id, jobId, stepKey, type, path |
| `job_events` | Telemetria | id, jobId, eventType, payload |
| `audit_events` | Histórico de mudanças | id, action, entityType, beforeJson, afterJson |

### Relacionamentos

```
projects 1──N execution_bindings
recipes  1──N execution_bindings
recipes  1──N jobs
jobs     1──N job_steps
jobs     1──N artifacts
jobs     1──N job_events
```

### Execution Bindings (Config-First)

Sistema central de configuração. Permite override por projeto:

```typescript
// Resolução de config (prioridade)
1. Project-level binding (scope='project', projectId=X)
2. Global binding (scope='global', projectId=null)
3. Default da recipe

// Slots disponíveis
'prompt' | 'provider' | 'preset_voice' | 'preset_video' | 'preset_ssml' | 'validators' | 'kb'
```

---

## 5. ENGINE DE EXECUÇÃO

### Fluxo de Job

```
1. createJob(recipeId, projectId, input)
   ├── Carrega recipe
   ├── Enriquece input (timestamp, nomes)
   └── Insere job com status='pending'

2. startJob(jobId)
   └── Chama runJob() em background

3. runJob(jobId) [lib/engine/runner.ts]
   ├── Carrega job + recipe
   ├── Resolve configs para TODOS steps (snapshot)
   ├── Cria job_steps se não existem
   └── Para cada step:
       ├── Verifica se já completo (resume)
       ├── Executa via executeStep{Kind}()
       ├── Atualiza job_steps
       ├── Coleta artifacts
       └── [Wizard mode] Pausa para aprovação
   └── Finaliza com status completed/failed
```

### Tipos de Step (StepKind)

| Kind | Executor | Input | Output |
|------|----------|-------|--------|
| `llm` | executeStepLLM | prompt + variables | texto gerado |
| `tts` | executeStepTTS | texto/SSML | arquivo .mp3 |
| `transform` | executeStepTransform | script raw | script limpo |
| `render` | executeStepRender | áudio + imagem | vídeo .mp4 |
| `export` | executeStepExport | todos artifacts | pacote final |
| `scene_prompts` | executeStepScenePrompts | script | prompts de imagem |
| `generate_images` | executeStepGenerateImages | prompts | imagens |

### Provider Claude (LLM)

```typescript
// lib/engine/providers.ts - executeLLM()

1. Carrega ANTHROPIC_API_KEY do .env
2. Monta systemPrompt + kbContext
3. Renderiza userTemplate com variables
4. Chama https://api.anthropic.com/v1/messages
5. Retorna {success, output, usage, duration_ms}

// Modelos suportados
- claude-sonnet-4-20250514 (default)
- Qualquer modelo da API Anthropic
```

### Provider Azure TTS

```typescript
// lib/engine/providers.ts - executeTTS()

1. Carrega AZURE_SPEECH_KEY e AZURE_SPEECH_REGION
2. Constrói SSML com voice, prosody, style
3. Cria batch synthesis job (PUT)
4. Poll para completion (60s interval, max 30 polls)
5. Download ZIP → extrai MP3
6. Retorna {success, artifactUri, durationSec}

// Vozes configuradas (presets_voice)
- es-MX-DaliaNeural (narradora)
- es-MX-JorgeNeural (antagonista)
- es-MX-CandelaNeural (outros)
```

### FFmpeg Render

```typescript
// lib/engine/ffmpeg.ts - renderVideo()

1. Valida áudio existe
2. Obtém duração do áudio
3. Configura ffmpeg:
   - Com imagem: loop image + audio
   - Sem imagem: color=black + audio
4. Encoder: h264_videotoolbox (Mac) → fallback libx264
5. Output: video.mp4

// Preset padrão
{
  encoder: 'h264_videotoolbox',
  scale: '1280:720',
  fps: 30,
  bitrate: '4M',
  pixelFormat: 'yuv420p',
  audioCodec: 'aac',
  audioBitrate: '192k'
}
```

---

## 6. FRONTEND

### Rotas (App Router)

| Rota | Função |
|------|--------|
| `/` | Dashboard/Home |
| `/jobs` | Lista de jobs |
| `/jobs/[id]` | Detalhes do job |
| `/jobs/new` | Criar novo job |
| `/board` | Kanban de jobs |
| `/wizard/[id]` | Modo wizard |
| `/admin/prompts` | CRUD prompts |
| `/admin/providers` | CRUD providers |
| `/admin/presets/*` | CRUD presets |
| `/admin/recipes` | CRUD recipes |
| `/admin/validators` | CRUD validators |
| `/admin/knowledge-base` | CRUD KB |
| `/admin/projects` | CRUD projetos |
| `/admin/execution-map` | Visualização bindings |

### Componentes Principais

#### Layout (`components/layout/`)
- `AppShell.tsx` - Shell da aplicação
- `Sidebar.tsx` - Navegação lateral
- `PageHeader.tsx` - Cabeçalho de página
- `EmptyState.tsx` - Estado vazio

#### UI (`components/ui/`)
- Componentes shadcn/ui: Button, Card, Dialog, Input, Select, Tabs, etc.
- `badge.tsx` - Badges coloridos
- `progress.tsx` - Barra de progresso

#### VF (`components/vf/`)
- `JobCard.tsx` - Card de job
- `PipelineView.tsx` - Visualização de pipeline
- `StepPreview.tsx` - Preview de step
- `WizardStepper.tsx` - Stepper do wizard
- `ManifestViewer.tsx` - Visualizador de manifest
- `LogsViewer.tsx` - Visualizador de logs
- `StatusBadge.tsx` - Badge de status

### Design System

```css
/* globals.css - Variáveis CSS */

/* Cores de status */
--status-success: 142 71% 45%;   /* verde */
--status-warning: 38 92% 50%;    /* amarelo */
--status-error: 0 84% 60%;       /* vermelho */
--status-running: 217 91% 60%;   /* azul */
--status-pending: 220 9% 46%;    /* cinza */

/* Fontes */
font-family: Inter, system-ui, sans-serif;
font-mono: JetBrains Mono, Menlo, monospace;
```

---

## 7. APIS E INTEGRAÇÕES

### API Routes Internas

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/health` | GET | Health check |
| `/api/artifacts/[...path]` | GET | Serve arquivos de artifacts/ |
| `/api/jobs/[id]/run` | POST | Inicia execução do job |
| `/api/render/*` | POST | Operações de render |

### Integrações Externas

#### Claude (Anthropic)

```typescript
// Endpoint
https://api.anthropic.com/v1/messages

// Headers
Content-Type: application/json
x-api-key: ${ANTHROPIC_API_KEY}
anthropic-version: 2023-06-01

// Modelo padrão
claude-sonnet-4-20250514

// Limites
maxTokens: 4096-16000 (por prompt)
temperature: 0.7-0.8
```

#### Azure Speech (TTS)

```typescript
// Endpoint (Batch Synthesis)
https://${region}.api.cognitive.microsoft.com/texttospeech/batchsyntheses/${jobId}

// Headers
Content-Type: application/json
Ocp-Apim-Subscription-Key: ${AZURE_SPEECH_KEY}

// Output format
audio-48khz-192kbitrate-mono-mp3

// Polling
Interval: 60s
Max polls: 30 (~30 min timeout)
```

#### ImageFX (Google)

```typescript
// lib/adapters/imagefx.ts

// ATENÇÃO: Não tem API pública!
// Requer cookies de sessão do Google

// Endpoint
https://aisandbox-pa.googleapis.com/v1:runImageFx

// Modelo
IMAGEN_3_5

// Sanitização de prompts
- Remove menores de idade
- Remove nomes brasileiros
- Remove violência gráfica
- Remove uniformes escolares
```

---

## 8. CONFIGURAÇÕES

### Variáveis de Ambiente (.env.local)

```bash
# OBRIGATÓRIAS
ANTHROPIC_API_KEY=sk-ant-...      # Claude API
AZURE_SPEECH_KEY=...               # Azure TTS
AZURE_SPEECH_REGION=eastus2        # Região Azure

# OPCIONAIS
DATABASE_URL=file:./video-factory.db  # SQLite path
IMAGEFX_COOKIES=...                # Para geração de imagens
```

### Next.js Config

```javascript
// next.config.js
{
  experimental: {
    serverComponentsExternalPackages: [
      'better-sqlite3',
      'fluent-ffmpeg',
      '@ffmpeg-installer/ffmpeg',
      '@ffprobe-installer/ffprobe',
      'adm-zip',
    ],
  },
  webpack: (config, { isServer }) => {
    // Marca pacotes nativos como externals
  }
}
```

### Tailwind Config

```typescript
// tailwind.config.ts
{
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        status: {
          success: 'hsl(var(--status-success))',
          // ...
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        mono: ['JetBrains Mono', 'Menlo'],
      }
    }
  }
}
```

### Drizzle Config

```typescript
// drizzle.config.ts
{
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './video-factory.db',
  },
}
```

---

## 9. SCRIPTS E FERRAMENTAS

### NPM Scripts

```bash
# Desenvolvimento
npm run dev          # Next.js dev server
npm run build        # Build produção
npm run start        # Start produção
npm run lint         # ESLint

# Banco de Dados
npm run db:generate  # Gera migrations
npm run db:migrate   # Aplica migrations
npm run db:push      # Push schema (dev)
npm run db:studio    # Drizzle Studio (GUI)
npm run db:seed      # Seed dados iniciais
npm run db:backup    # Backup banco
npm run db:restore   # Restore banco

# Video Factory
npm run vf:e2e       # Testes e2e

# Manutenção
npm run clean        # Remove .next
npm run reboot       # Clean + dev
```

### Scripts Utilitários

| Script | Função |
|--------|--------|
| `backup.sh` | Backup SQLite com WAL checkpoint |
| `restore.sh` | Restore de backup |
| `e2e.ts` | Testes end-to-end |
| `seed-prompts-v3.ts` | Seed de prompts Graciela |
| `enrich-knowledge-base.ts` | Enriquece KB |
| `export-claude-project.ts` | Exporta para Claude |

### Backup System

```bash
# scripts/backup.sh

1. WAL checkpoint (PRAGMA wal_checkpoint)
2. Integrity check antes do backup
3. .backup comando SQLite (mais seguro)
4. Integrity check do backup
5. Rotação automática (20 backups max)
6. Estatísticas do banco
```

---

## 10. DEPLOY E OPERAÇÃO

### Requisitos de Sistema

- **Node.js:** 18+ (LTS recomendado)
- **FFmpeg:** Instalado e no PATH
- **Disk:** 10GB+ para artifacts
- **RAM:** 4GB+ (FFmpeg usa bastante)

### Checklist de Deploy

```bash
# 1. Clone e instale
git clone <repo>
cd video-factory-os
npm install

# 2. Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas keys

# 3. Inicialize banco
npm run db:push
npm run db:seed

# 4. Teste
npm run dev
# Acesse http://localhost:3000

# 5. Build produção
npm run build
npm run start
```

### Operação Diária

```bash
# Antes de cada sessão
npm run db:backup

# Monitoramento
# - Verificar /api/health
# - Checar jobs pendentes/falhados
# - Monitorar disk space (artifacts/)

# Manutenção
# - Limpar artifacts antigos periodicamente
# - Rotacionar logs
# - Atualizar dependências
```

---

## APÊNDICES

### A. Códigos de Erro

| Código | Causa | Solução |
|--------|-------|---------|
| `MISSING_API_KEY` | Key não configurada | Verificar .env.local |
| `HTTP_401/403` | Auth falhou | Verificar/renovar key |
| `HTTP_429` | Rate limit | Aguardar/retry |
| `TIMEOUT` | TTS demorou demais | Aumentar timeout ou retry |
| `FFMPEG_ERROR` | Render falhou | Ver stderr, verificar FFmpeg |
| `VALIDATION_FAILED` | Output inválido | Ajustar prompt |

### B. Troubleshooting

**Job travado em "running":**
```sql
-- Resetar job
UPDATE jobs SET status='pending', last_error=NULL WHERE id='...';
UPDATE job_steps SET status='pending' WHERE job_id='...';
```

**FFmpeg VideoToolbox falha:**
```bash
# Usar encoder software
# Editar preset para encoder: 'libx264'
```

**Azure TTS timeout:**
```
# Textos muito longos podem demorar
# Considerar dividir em partes
```

### C. Referências

- ADRs: `docs/01-adr/`
- Features: `docs/02-features/`
- System Map: `docs/SYSTEM-MAP.md`
- Regras: `docs/00-regras/`

---

*Documento gerado automaticamente pela análise exaustiva do Video Factory OS.*
