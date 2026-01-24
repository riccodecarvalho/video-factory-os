# Video Factory OS - Resumo dos ADRs

> **Objetivo:** Visão consolidada de todas as decisões arquiteturais
> **Fonte:** `docs/01-adr/`
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE DE ADRs

| # | Data | Título | Status | Impacto |
|---|------|--------|--------|---------|
| 001 | 13/12/25 | Stage Directions | ✅ Aceito | Alto |
| 004 | 13/12/25 | Design System | ✅ Aceito | Alto |
| 005 | 13/12/25 | UI Baseline 4pice | ✅ Aceito | Médio |
| 006 | 13/12/25 | UI Patterns Parity | ✅ Aceito | Médio |
| 007 | 13/12/25 | Engine Execution Model | ✅ Aceito | Alto |
| 008 | 13/12/25 | Project Context + Bindings | ✅ Aceito | Alto |
| 009 | 16/12/25 | Azure TTS ZIP Extraction | ✅ Aceito | Médio |
| 010 | 16/12/25 | Projects Hub | ✅ Aceito | Médio |
| 011 | 19/12/25 | Wizard Mode | ✅ Aceito | Alto |
| 012 | 19/12/25 | Backup SQLite | ✅ Aceito | Alto |
| 013 | 22/12/25 | Timeline DSL + RenderPlan | ✅ Aceito | Alto |
| 014 | 22/12/25 | Render Farm Strategy | ✅ Aceito | Médio |
| 015 | 22/12/25 | Short-form Profiles | ✅ Aceito | Médio |

---

## ADR-001: Stage Directions

### Contexto
Scripts de vídeo precisam de marcações para vozes e pausas, mas SSML inline ou Markdown tornam edição difícil.

### Decisão
Usar "Stage Directions" puro no script, conversão para SSML acontece em step separado.

### Formato
```
(voz: NARRADORA)
Texto narrado aqui.
[PAUSA CORTA]
Mais texto.

(voz: ANTAGONISTA)
Diálogo do antagonista.
[PAUSA LARGA]
```

### Consequências
- ✅ Scripts legíveis e editáveis
- ✅ Conversão SSML configurável (pauseMappings, voiceMappings)
- ❌ Requer step adicional de conversão

---

## ADR-004: Design System

### Contexto
Necessidade de consistência visual e componentes reutilizáveis.

### Decisão
Usar shadcn/ui como base, com customizações em Tailwind.

### Implementação
- Componentes em `components/ui/`
- Variáveis CSS em `globals.css`
- Cores semânticas (status-success, status-error, etc.)

### Fontes
```css
--font-sans: Inter, system-ui, sans-serif;
--font-mono: JetBrains Mono, Menlo, monospace;
```

---

## ADR-007: Engine Execution Model

### Contexto
Precisamos de um modelo de execução que seja:
- Configurável (recipes definem pipeline)
- Resumível (steps podem ser retomados)
- Auditável (manifest com snapshots)

### Decisão
Pipeline de steps com executor por tipo (kind).

### Modelo
```
Job
 └── Recipe (define pipeline)
      └── Steps[]
           └── Step {key, kind, config}
                └── Executor (llm, tts, render, etc.)
```

### Kinds Suportados
| Kind | Executor | Função |
|------|----------|--------|
| `llm` | executeStepLLM | Chamada Claude |
| `tts` | executeStepTTS | Síntese Azure |
| `transform` | executeStepTransform | Limpeza de texto |
| `render` | executeStepRender | FFmpeg |
| `export` | executeStepExport | Empacotamento |
| `scene_prompts` | executeStepScenePrompts | Prompts de imagem |
| `generate_images` | executeStepGenerateImages | ImageFX |

---

## ADR-008: Project Context + Execution Bindings

### Contexto
Diferentes canais (projetos) precisam de configurações diferentes:
- Vozes diferentes
- Prompts customizados
- Parâmetros LLM distintos

### Decisão
Sistema de "Execution Bindings" com resolução por prioridade.

### Tabela execution_bindings
```typescript
{
  scope: 'global' | 'project',
  projectId: string | null,
  recipeId: string,
  stepKey: string,
  slot: 'prompt' | 'provider' | 'preset_voice' | ...,
  targetId: string,
  priority: number,
}
```

### Resolução (maior prioridade primeiro)
1. Project + Step específico
2. Project + Step '*' (wildcard)
3. Global + Step específico
4. Global + Step '*'
5. Default da recipe

### Exemplo
```
// Graciela usa voz A para TTS
{scope: 'project', projectId: 'graciela', stepKey: 'tts', slot: 'preset_voice', targetId: 'voz-a'}

// Outro projeto usa voz B
{scope: 'project', projectId: 'outro', stepKey: 'tts', slot: 'preset_voice', targetId: 'voz-b'}
```

---

## ADR-009: Azure TTS ZIP Extraction

### Contexto
Azure Batch TTS retorna ZIP com áudio, não MP3 direto.

### Decisão
Extrair MP3 do ZIP automaticamente no provider.

### Implementação
```typescript
const zip = new AdmZip(Buffer.from(zipBuffer));
const mp3 = zip.getEntries().find(e => e.entryName.endsWith('.mp3'));
fs.writeFileSync(outputPath, mp3.getData());
```

---

## ADR-010: Projects Hub

### Contexto
Gestão de múltiplos canais/personas de vídeo.

### Decisão
Tabela `projects` com configurações por projeto.

### Campos
```typescript
{
  key: 'graciela',           // Identificador
  name: 'Verdades de Graciela',
  voiceRate: '+10%',         // Override de prosody
  voicePitch: '-5%',
  llmTemperature: 0.75,      // Override de LLM
  llmMaxTokens: 8000,
  imageStylePrefix: 'Mexican abuela style, ',
}
```

---

## ADR-011: Wizard Mode

### Contexto
Às vezes queremos controle humano no loop - aprovar cada step antes de continuar.

### Decisão
Modo "wizard" que pausa após cada step para aprovação.

### Implementação
```typescript
// Job com executionMode = 'wizard'
if (job.executionMode === 'wizard') {
  // Após step completar com sucesso
  await db.update(jobs).set({ status: 'pending' });
  return; // Pausa para aprovação
}
```

### UI
- Stepper visual com estado de cada step
- Botão "Aprovar e Continuar"
- Opção "Refazer com Instrução"

---

## ADR-012: Backup SQLite

### Contexto
SQLite pode corromper em dev mode (hot reload + crash).

### Decisão
Sistema de backup robusto com:
- WAL checkpoint antes do backup
- Verificação de integridade
- Rotação automática (20 backups)

### PRAGMAs de Proteção
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
```

### Uso
```bash
npm run db:backup   # Backup manual
npm run db:restore  # Restore interativo
```

---

## ADR-013: Timeline DSL + RenderPlan

### Contexto
Render atual é procedural (comandos FFmpeg inline). Precisamos de:
- Composição declarativa
- Abstração do backend de render
- Suporte a short-form

### Decisão
Duas estruturas: Timeline (declarativo) e RenderPlan (imperativo).

### Timeline DSL
```typescript
interface Timeline {
  version: string;
  settings: { width, height, fps };
  scenes: Scene[];
}

interface Scene {
  id: string;
  start: number;      // segundos
  duration: number;
  elements: Element[];
}

interface Element {
  type: 'video' | 'audio' | 'image' | 'text' | 'subtitle';
  layer: number;      // z-index
  start: number;      // relativo à cena
  duration: number;
  src?: string;
  props: {...};
}
```

### RenderPlan
```typescript
interface RenderPlan {
  jobId: string;
  steps: RenderStep[];
  finalOutput: string;
}

interface RenderStep {
  command: string;    // Comando FFmpeg
  inputs: string[];
  output: string;
  dependencies: string[];
}
```

### Fluxo
```
Timeline (O QUE) → Compiler → RenderPlan (COMO) → Worker → FFmpeg
```

---

## ADR-014: Render Farm Strategy

### Contexto
Um único Mac pode ser gargalo para múltiplos jobs.

### Decisão
Arquitetura para render farm com múltiplos workers.

### Modelo
```
┌─────────────┐
│   Queue     │  (Jobs aguardando)
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│      Coordinator         │  (Distribui trabalho)
└──────┬───────────────────┘
       │
   ┌───┴───┐
   ▼       ▼
┌──────┐ ┌──────┐
│Mac M1│ │Mac M2│  (Workers com VideoToolbox)
└──────┘ └──────┘
```

### Status
⚠️ Parcialmente implementado - Worker local funciona, coordenador pendente.

---

## ADR-015: Short-form Profiles

### Contexto
Além de longform (16:9), precisamos de shorts (9:16) para TikTok, Reels, YouTube Shorts.

### Decisão
Format profiles configuráveis.

### Profiles
```typescript
const FORMAT_PRESETS = {
  longform: { width: 1920, height: 1080, fps: 30 },
  shorts: { width: 1080, height: 1920, fps: 30 },
};

const SAFE_AREAS = {
  'youtube-shorts': { top: 120, bottom: 150, left: 20, right: 20 },
  'tiktok': { top: 100, bottom: 180, left: 20, right: 20 },
};
```

### Uso
```typescript
const timeline = {
  settings: FORMAT_PRESETS.shorts,
  scenes: [...],
};
```

---

## DEPENDÊNCIAS ENTRE ADRs

```
ADR-001 (Stage Directions)
    │
    └──► ADR-007 (Engine) ──► ADR-008 (Bindings)
              │                    │
              │                    └──► ADR-010 (Projects)
              │
              └──► ADR-011 (Wizard) ──► ADR-012 (Backup)
              │
              └──► ADR-013 (Timeline) ──► ADR-014 (Farm)
                         │                    │
                         └──► ADR-015 (Shorts)

ADR-004 (Design) ──► ADR-005 (UI Baseline)
              │
              └──► ADR-006 (UI Patterns)

ADR-009 (Azure ZIP) - Standalone
```

---

## COMO REPLICAR

1. **Leia os ADRs na ordem** - Eles contam a história das decisões
2. **Implemente ADR-007 primeiro** - Engine é a base de tudo
3. **ADR-008 habilita multi-projeto** - Importante para flexibilidade
4. **ADR-013 é o futuro** - Timeline DSL para composição avançada

---

*Resumo gerado a partir dos ADRs em docs/01-adr/*
