# Video Factory OS - Diagrama de Arquitetura

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VIDEO FACTORY OS                                │
│                        Sistema Config-First de Produção                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            CAMADA DE APRESENTAÇÃO                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Dashboard   │  │  Jobs List   │  │   Wizard     │  │ Admin Panel  │    │
│  │  (Control    │  │  (Kanban)    │  │ (Step-by-    │  │ (Config)     │    │
│  │   Room)      │  │              │  │  Step)       │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │             │
│         └────────────────┬┴─────────────────┴─────────────────┘             │
│                          │                                                   │
│                          ▼                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      COMPONENTES REACT (components/)                   │  │
│  │  ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────┐  │  │
│  │  │ AppShell│ │ JobCard │ │StepPreview│ │LogsViewer│ │WizardStepper│  │  │
│  │  └─────────┘ └─────────┘ └───────────┘ └──────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE APLICAÇÃO                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    SERVER ACTIONS (Next.js 14)                        │  │
│  │                                                                        │  │
│  │  ┌─────────────────┐        ┌─────────────────┐                       │  │
│  │  │ app/admin/      │        │ app/jobs/       │                       │  │
│  │  │ actions.ts      │        │ actions.ts      │                       │  │
│  │  │                 │        │                 │                       │  │
│  │  │ • getPrompts    │        │ • createJob     │                       │  │
│  │  │ • updatePrompt  │        │ • startJob      │                       │  │
│  │  │ • getRecipes    │        │ • retryStep     │                       │  │
│  │  │ • getProviders  │        │ • cancelJob     │                       │  │
│  │  │ • getPresets    │        │ • getArtifacts  │                       │  │
│  │  │ • getProjects   │        │                 │                       │  │
│  │  └─────────────────┘        └─────────────────┘                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                       │                                      │
│                                       ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         ENGINE (lib/engine/)                          │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        runner.ts                                 │  │  │
│  │  │                    (Orquestrador Principal)                      │  │  │
│  │  │                                                                  │  │  │
│  │  │  1. Carrega Job + Recipe                                         │  │  │
│  │  │  2. Resolve configs via executionBindings                        │  │  │
│  │  │  3. Executa pipeline de steps sequencialmente                    │  │  │
│  │  │  4. Gera manifest completo                                       │  │  │
│  │  └───────────────────────────┬─────────────────────────────────────┘  │  │
│  │                              │                                         │  │
│  │              ┌───────────────┼───────────────┐                        │  │
│  │              ▼               ▼               ▼                        │  │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐               │  │
│  │  │  executors/   │ │  providers.ts │ │   ffmpeg.ts   │               │  │
│  │  │               │ │               │ │               │               │  │
│  │  │ • llm.ts      │ │ • executeLLM  │ │ • renderVideo │               │  │
│  │  │ • tts.ts      │ │ • executeTTS  │ │ • getAudio    │               │  │
│  │  │ • render.ts   │ │ • validators  │ │   Duration    │               │  │
│  │  │ • scene-      │ │               │ │               │               │  │
│  │  │   prompts.ts  │ │               │ │               │               │  │
│  │  └───────────────┘ └───────────────┘ └───────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE DADOS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      DATABASE (lib/db/)                               │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐   │  │
│  │  │  index.ts   │  │  schema.ts  │  │         seed.ts             │   │  │
│  │  │  (Conexão)  │  │  (Schema)   │  │     (Dados Iniciais)        │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘   │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    SQLite (video-factory.db)                     │  │  │
│  │  │                                                                  │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │
│  │  │  │projects │ │ recipes │ │ prompts │ │providers│ │  jobs   │   │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │
│  │  │  │job_steps│ │artifacts│ │knowledge│ │execution│ │ presets │   │  │  │
│  │  │  │         │ │         │ │  _base  │ │_bindings│ │  _*     │   │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     ARTIFACTS (./artifacts/)                          │  │
│  │                                                                        │  │
│  │  ./artifacts/{job-id}/                                                │  │
│  │      ├── titulo/output.txt                                            │  │
│  │      ├── roteiro/output.txt                                           │  │
│  │      ├── parse_script/output.txt                                      │  │
│  │      ├── tts/audio.mp3                                                │  │
│  │      └── render/video.mp4                                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVIÇOS EXTERNOS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   ANTHROPIC      │  │   AZURE SPEECH   │  │    IMAGEFX       │          │
│  │   (Claude)       │  │   (TTS)          │  │    (Google)      │          │
│  │                  │  │                  │  │                  │          │
│  │  • claude-sonnet │  │  • Batch API     │  │  • Imagen 3.5    │          │
│  │  • 4-20250514    │  │  • es-MX voices  │  │  • Via cookies   │          │
│  │                  │  │  • SSML support  │  │                  │          │
│  │  ENV:            │  │  ENV:            │  │  ENV:            │          │
│  │  ANTHROPIC_      │  │  AZURE_SPEECH_   │  │  IMAGEFX_        │          │
│  │  API_KEY         │  │  KEY/REGION      │  │  COOKIES         │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                            FFMPEG (Local)                            │   │
│  │                                                                       │   │
│  │  • h264_videotoolbox (Mac HW accel) / libx264 (fallback)             │   │
│  │  • fluent-ffmpeg wrapper                                              │   │
│  │  • Video encoding, audio muxing                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Execução de um Job

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            FLUXO DE EXECUÇÃO                                  │
└──────────────────────────────────────────────────────────────────────────────┘

     USER                  FRONTEND                ENGINE                 EXTERNAL
       │                      │                      │                       │
       │  1. Submits form     │                      │                       │
       │─────────────────────>│                      │                       │
       │                      │                      │                       │
       │                      │  2. createJob()      │                       │
       │                      │─────────────────────>│                       │
       │                      │                      │                       │
       │                      │  3. startJob()       │                       │
       │                      │─────────────────────>│                       │
       │                      │                      │                       │
       │                      │                      │  4. Load Recipe       │
       │                      │                      │──────┐                │
       │                      │                      │<─────┘                │
       │                      │                      │                       │
       │                      │                      │  5. For each step:    │
       │                      │                      │                       │
       │                      │                      │  ┌─────────────────┐  │
       │                      │                      │  │  STEP: titulo   │  │
       │                      │                      │  │  kind: llm      │  │
       │                      │                      │  └────────┬────────┘  │
       │                      │                      │           │           │
       │                      │                      │           ▼           │
       │                      │                      │──────────────────────>│
       │                      │                      │     Claude API        │
       │                      │                      │<──────────────────────│
       │                      │                      │                       │
       │                      │                      │  ┌─────────────────┐  │
       │                      │                      │  │  STEP: roteiro  │  │
       │                      │                      │  │  kind: llm      │  │
       │                      │                      │  └────────┬────────┘  │
       │                      │                      │           │           │
       │                      │                      │           ▼           │
       │                      │                      │──────────────────────>│
       │                      │                      │     Claude API        │
       │                      │                      │<──────────────────────│
       │                      │                      │                       │
       │                      │                      │  ┌─────────────────┐  │
       │                      │                      │  │ STEP: tts       │  │
       │                      │                      │  │ kind: tts       │  │
       │                      │                      │  └────────┬────────┘  │
       │                      │                      │           │           │
       │                      │                      │           ▼           │
       │                      │                      │──────────────────────>│
       │                      │                      │   Azure Batch TTS     │
       │                      │                      │   (polling ~1-5min)   │
       │                      │                      │<──────────────────────│
       │                      │                      │                       │
       │                      │                      │  ┌─────────────────┐  │
       │                      │                      │  │ STEP: render    │  │
       │                      │                      │  │ kind: render    │  │
       │                      │                      │  └────────┬────────┘  │
       │                      │                      │           │           │
       │                      │                      │           ▼           │
       │                      │                      │      FFmpeg Local     │
       │                      │                      │                       │
       │                      │                      │                       │
       │                      │  6. Job completed    │                       │
       │                      │<─────────────────────│                       │
       │                      │                      │                       │
       │  7. Video ready      │                      │                       │
       │<─────────────────────│                      │                       │
       │                      │                      │                       │
```

---

## Sistema de Bindings (Config Resolution)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        SISTEMA DE EXECUTION BINDINGS                          │
│                       (Resolução de Configuração)                             │
└──────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │           executionBindings         │
                    │              (tabela)               │
                    └───────────────────┬─────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            │                           │                           │
            ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │ scope: global │           │scope: project │           │scope: project │
    │ projectId:null│           │projectId: X   │           │projectId: Y   │
    │               │           │               │           │               │
    │ Fallback para │           │ Override para │           │ Override para │
    │ todos projetos│           │ projeto X     │           │ projeto Y     │
    └───────────────┘           └───────────────┘           └───────────────┘

PRIORIDADE DE RESOLUÇÃO:
═══════════════════════

1. Busca binding com scope='project' E projectId=atual
   │
   ├── SE ENCONTRAR → usa esse binding
   │
   └── SE NÃO ENCONTRAR ↓

2. Busca binding com scope='global'
   │
   ├── SE ENCONTRAR → usa esse binding (fallback)
   │
   └── SE NÃO ENCONTRAR → step falha com erro de config


EXEMPLO DE BINDING:
═══════════════════

┌────────────────────────────────────────────────────────────────┐
│ id: "bind-001"                                                 │
│ scope: "project"                                               │
│ projectId: "proj-graciela"                                     │
│ recipeId: "rec-storytelling"                                   │
│ stepKey: "roteiro"                                             │
│ slot: "prompt"                                                 │
│ targetId: "prompt-graciela-script-v3"  ←── Liga ao prompt      │
│ priority: 0                                                    │
│ isActive: true                                                 │
└────────────────────────────────────────────────────────────────┘

SLOTS DISPONÍVEIS:
═════════════════

  • prompt        → prompts table
  • provider      → providers table
  • preset_voice  → presets_voice table
  • preset_video  → presets_video table
  • preset_ssml   → presets_ssml table
  • validators    → validators table (multi-value)
  • kb            → knowledge_base table (multi-value)
```

---

## Estrutura de uma Recipe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            ANATOMIA DE UMA RECIPE                             │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ RECIPE: graciela-storytelling-v3                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  {                                                                           │
│    "id": "rec-001",                                                          │
│    "slug": "graciela-storytelling-v3",                                       │
│    "name": "Graciela Storytelling v3",                                       │
│    "description": "Pipeline completo para vídeos de storytime",             │
│    "version": 3,                                                             │
│                                                                              │
│    "pipeline": [                                                             │
│      ┌────────────────────────────────────────────────────────────────┐     │
│      │ STEP 1: titulo                                                 │     │
│      │ kind: llm                                                       │     │
│      │                                                                 │     │
│      │ Gera título engajante via Claude                                │     │
│      │ Input: {idea}                                                   │     │
│      │ Output: título em espanhol                                      │     │
│      └────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│                              ▼                                               │
│      ┌────────────────────────────────────────────────────────────────┐     │
│      │ STEP 2: roteiro                                                │     │
│      │ kind: llm                                                       │     │
│      │                                                                 │     │
│      │ Gera roteiro completo via Claude                                │     │
│      │ Input: {titulo, idea, duracao}                                  │     │
│      │ Output: roteiro em espanhol com stage directions               │     │
│      └────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│                              ▼                                               │
│      ┌────────────────────────────────────────────────────────────────┐     │
│      │ STEP 3: parse_script                                           │     │
│      │ kind: transform                                                 │     │
│      │                                                                 │     │
│      │ Limpa roteiro para TTS                                          │     │
│      │ Remove: [PAUSA], (voz: X), markdown                             │     │
│      │ Output: texto limpo                                             │     │
│      └────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│                              ▼                                               │
│      ┌────────────────────────────────────────────────────────────────┐     │
│      │ STEP 4: tts                                                    │     │
│      │ kind: tts                                                       │     │
│      │                                                                 │     │
│      │ Sintetiza áudio via Azure Speech                                │     │
│      │ Input: texto limpo                                              │     │
│      │ Output: audio.mp3 (~5-10min)                                    │     │
│      └────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│                              ▼                                               │
│      ┌────────────────────────────────────────────────────────────────┐     │
│      │ STEP 5: render                                                 │     │
│      │ kind: render                                                    │     │
│      │                                                                 │     │
│      │ Renderiza vídeo final via FFmpeg                                │     │
│      │ Input: audio.mp3 + background.jpg                               │     │
│      │ Output: video.mp4                                               │     │
│      └────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│    ],                                                                        │
│                                                                              │
│    "defaultVoicePresetSlug": "es-mx-dalia-narradora",                       │
│    "defaultVideoPresetSlug": "mac-videotoolbox-720p"                        │
│  }                                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Artifacts

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          ESTRUTURA DE ARTIFACTS                               │
└──────────────────────────────────────────────────────────────────────────────┘

./artifacts/
    │
    └── {job-id}/                           # Pasta por job
        │
        ├── titulo/                         # Step: titulo
        │   └── output.txt                  # Título gerado
        │
        ├── roteiro/                        # Step: roteiro
        │   └── output.txt                  # Roteiro completo
        │
        ├── parse_script/                   # Step: parse_script
        │   └── output.txt                  # Script limpo para TTS
        │
        ├── prompts_cenas/                  # Step: prompts_cenas (opcional)
        │   └── scenes.json                 # Cenas com prompts de imagem
        │
        ├── gerar_imagens/                  # Step: gerar_imagens (opcional)
        │   ├── generated-images.json       # Manifest de imagens
        │   └── images/
        │       ├── scene-01.png
        │       ├── scene-02.png
        │       └── ...
        │
        ├── tts/                            # Step: tts
        │   └── audio.mp3                   # Áudio narrado
        │
        └── render/                         # Step: render
            └── video.mp4                   # Vídeo final


TABELA artifacts (banco):
═════════════════════════

┌────────────────────────────────────────────────────────────────────┐
│ id          │ jobId       │ stepKey     │ type    │ path           │
├─────────────┼─────────────┼─────────────┼─────────┼────────────────┤
│ art-001     │ job-123     │ titulo      │ script  │ ./artifacts/...│
│ art-002     │ job-123     │ roteiro     │ script  │ ./artifacts/...│
│ art-003     │ job-123     │ tts         │ audio   │ ./artifacts/...│
│ art-004     │ job-123     │ render      │ video   │ ./artifacts/...│
└─────────────┴─────────────┴─────────────┴─────────┴────────────────┘
```

---

## Painel Admin

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN PANEL                                      │
│                          (/admin/*)                                           │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    SIDEBAR      │
├─────────────────┤
│                 │     ┌──────────────────────────────────────────────────┐
│ • Prompts       │────>│ CRUD de prompts LLM                              │
│                 │     │ - system prompt                                   │
│                 │     │ - user template ({{variáveis}})                   │
│                 │     │ - model, maxTokens, temperature                   │
│                 │     └──────────────────────────────────────────────────┘
│                 │
│ • Providers     │────>│ CRUD de providers (Claude, Azure)                │
│                 │
│ • Presets       │────>│ Voice presets (Azure voices)                     │
│   ├─ Voice      │     │ Video presets (FFmpeg config)                    │
│   ├─ Video      │     │ SSML presets (pause mappings)                    │
│   └─ SSML       │
│                 │
│ • Recipes       │────>│ CRUD de recipes (pipelines)                      │
│                 │
│ • Knowledge     │────>│ CRUD de knowledge base docs                      │
│   Base          │     │ - tier1 (sempre incluído)                        │
│                 │     │ - tier2 (contexto)                               │
│                 │     │ - tier3 (sob demanda)                            │
│                 │
│ • Validators    │────>│ CRUD de validators                               │
│                 │     │ - forbidden_patterns                             │
│                 │     │ - min_words, max_words                           │
│                 │
│ • Projects      │────>│ CRUD de projetos/canais                          │
│                 │     │ - config por projeto                             │
│                 │     │ - bindings (wiring)                              │
│                 │
│ • Execution     │────>│ Mapa de bindings                                 │
│   Map           │     │ - Qual prompt para qual step                     │
│                 │     │ - Qual provider para qual projeto                │
│                 │
└─────────────────┘
```

---

## Timeline DSL (Sistema Avançado)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            TIMELINE DSL                                       │
│                    (Composição Declarativa de Vídeo)                         │
└──────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │         Timeline JSON           │
                    │                                 │
                    │  {                              │
                    │    version: "1.0.0",            │
                    │    settings: {                  │
                    │      width: 1920,               │
                    │      height: 1080,              │
                    │      fps: 30                    │
                    │    },                           │
                    │    scenes: [...]                │
                    │  }                              │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │      compiler.ts                │
                    │   compileTimeline()             │
                    │                                 │
                    │  Converte Timeline → RenderPlan │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │        RenderPlan               │
                    │                                 │
                    │  {                              │
                    │    steps: [                     │
                    │      {type: 'prepare_audio'},   │
                    │      {type: 'prepare_video'},   │
                    │      {type: 'composite'},       │
                    │      {type: 'encode'}           │
                    │    ],                           │
                    │    outputPath: "..."            │
                    │  }                              │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │     timeline-executor.ts        │
                    │   executeRenderPlan()           │
                    │                                 │
                    │  Executa cada step via FFmpeg   │
                    └─────────────────────────────────┘


SCENE STRUCTURE:
════════════════

┌────────────────────────────────────────────────────────────────────┐
│ Scene {                                                            │
│   id: "scene-01",                                                  │
│   start: 0,           // segundos desde início                     │
│   duration: 30,       // duração em segundos                       │
│   elements: [                                                      │
│     {                                                              │
│       id: "bg-video",                                              │
│       type: "video",                                               │
│       layer: 0,       // z-index (0 = fundo)                       │
│       start: 0,                                                    │
│       duration: 30,                                                │
│       src: "./assets/background.mp4",                              │
│       props: { scale: 1.0 }                                        │
│     },                                                             │
│     {                                                              │
│       id: "narration",                                             │
│       type: "audio",                                               │
│       layer: 1,                                                    │
│       start: 0,                                                    │
│       duration: 30,                                                │
│       src: "./artifacts/job/tts/audio.mp3",                        │
│       props: { volume: 1.0 }                                       │
│     },                                                             │
│     {                                                              │
│       id: "subtitles",                                             │
│       type: "subtitle",                                            │
│       layer: 10,      // sempre no topo                            │
│       start: 0,                                                    │
│       duration: 30,                                                │
│       props: { srtPath: "./captions.srt" }                         │
│     }                                                              │
│   ]                                                                │
│ }                                                                  │
└────────────────────────────────────────────────────────────────────┘
```

---

Este diagrama representa a arquitetura real do Video Factory OS baseada na análise do código fonte.
