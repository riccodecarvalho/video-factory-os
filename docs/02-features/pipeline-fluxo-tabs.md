# Video Factory OS — Fluxo Jobs/Steps/Tabs

## 📥 O que entra no Job (Inputs)

```json
{
  "title": "Título da história", 
  "brief": "Resumo expandido da história",
  "tema": "Tema central do vídeo"
}
```

O input é definido ao criar o job via `/jobs/new` ou pelo E2E.

---

## 🔄 O que cada Step consome / gera

| Step | Tipo | Consome | Gera |
|------|------|---------|------|
| **title** | `llm` | `input.tema`, `input.brief` | `title/output.txt` (opções de títulos) |
| **brief** | `llm` | `input.brief`, `previousOutputs.title` | `brief/output.txt` (brief expandido) |
| **script** | `llm` | `input`, `previousOutputs.title`, `previousOutputs.brief` | `script/output.txt` (roteiro completo ~6000 palavras) |
| **parse_ssml** | `transform` | `previousOutputs.script` | `parse_ssml/output.txt` (roteiro limpo, sem marcações de voz) |
| **tts** | `tts` | `previousOutputs.parse_ssml` ou `previousOutputs.script` | `tts/audio.mp3` (áudio sintetizado) |
| **render** | `render` | `previousOutputs.tts`, assets visuais | `render/video.mp4` *(stub)* |
| **export** | `export` | todos os artifacts anteriores | pacote final *(stub)* |

---

## 📂 Artifacts gerados por Job

```
artifacts/{jobId}/
├── title/output.txt      # Títulos gerados
├── brief/output.txt      # Brief expandido
├── script/output.txt     # Roteiro completo
├── parse_ssml/output.txt # Roteiro limpo (sem marcações de voz)
├── tts/audio.mp3         # Áudio narrado
└── render/video.mp4      # Vídeo final (stub)
```

---

## 🖥️ O que cada TAB mostra

### Tab: **Pipeline**
- Lista visual dos steps com status: `pending`, `running`, `success`, `failed`, `skipped`
- Duration por step (quando disponível)
- **Erro visível** quando step falha (lastError)
- Botão Retry para steps com erro

### Tab: **Config**
- Snapshot de configuração usado por cada step:
  - Prompt slug + preview (hash)
  - Provider usado (Claude, Azure TTS)
  - Presets: voice, SSML templates
  - Validators aplicados
  - Knowledge base usada
- Links clicáveis para cada item no Admin

### Tab: **Artifacts**
- Lista de arquivos gerados por step
- Links para visualizar/download
- Para áudio: streaming com `Range` headers (HTTP 206)

### Tab: **Logs**
- Logs por step (nível: info, warn, error)
- Timestamp de cada entrada
- Erros completos quando step falha

### Tab: **Manifest**
- JSON técnico completo do job:
  - `job_id`, `project_id`
  - `created_at`, `updated_at`, `completed_at`
  - `input` original (hash)
  - `snapshots` de config por step
  - `steps[]` com status, duration, artifacts, response
  - `artifacts[]` lista completa

---

## 🎯 Fluxo de Execução

```
┌──────────────────────────────────────────────────────┐
│  1. Job criado via /jobs/new                          │
│     └─> input: { title, brief, tema }                 │
├──────────────────────────────────────────────────────┤
│  2. Runner resolve configs (bindings → presets)       │
│     └─> Snapshot salvo no manifest                    │
├──────────────────────────────────────────────────────┤
│  3. Executa steps em ordem:                           │
│     title → brief → script → parse_ssml → tts → ...  │
│     └─> previousOutputs passa dados entre steps       │
├──────────────────────────────────────────────────────┤
│  4. Cada step gera:                                   │
│     - Artifact (arquivo em artifacts/{jobId}/{step}/) │
│     - Logs (persistidos no manifest)                  │
│     - stepManifest (status, duration, response)       │
├──────────────────────────────────────────────────────┤
│  5. Job finaliza com status:                          │
│     - completed (todos steps OK)                      │
│     - failed (algum step falhou)                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔊 TTS (Azure Batch Synthesis)

Conforme n8n source of truth:
- **Voice**: `es-ES-XimenaMultilingualNeural`
- **Prosody**: rate=0%, pitch=-8%
- **Format**: `audio-48khz-192kbitrate-mono-mp3`
- **Modo**: Azure Batch API (PUT → poll 60s → download)

---

## 📋 Regras

1. **Graciela**: prompts e outputs em **espanhol**
2. **Admin/Sistema**: pode ser em **português**
3. **Config-first**: nenhum valor hardcoded; tudo via DB presets
4. **n8n archive**: fonte de verdade para configs TTS/vozes/prompts
