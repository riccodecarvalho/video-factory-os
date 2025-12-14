# Pipeline Map — Video Factory OS

Este documento descreve o fluxo completo do pipeline de geração de vídeo, incluindo inputs, outputs, artifacts e bindings de cada step.

---

## Inputs do Job

| Campo | Tipo | Origem | Descrição | Onde aparece na UI |
|-------|------|--------|-----------|-------------------|
| `titulo` | string | Fixture/UI | Título do vídeo a ser gerado | Tab Manifest → `input.titulo` |
| `idea` | string | Fixture/UI | Brief/sinopse da história | Tab Manifest → `input.idea` |
| `tema` | string | Fixture/UI | Tema/categoria do conteúdo | Tab Manifest → `input.tema` |
| `duracao` | string | Fixture/UI | Duração alvo em minutos (default: "40") | Tab Manifest → `input.duracao` |

### Aliases Suportados (pt/es)

O runner aplica aliases automáticos para compatibilidade:
- `titulo` = `input.titulo || input.title`
- `idea` = `input.idea || input.brief`
- `duracao` = `input.duracao || input.duration || "40"`

---

## Pipeline Steps

### Step 1: `title`
**Tipo:** LLM

| Aspecto | Valor |
|---------|-------|
| **Consome** | `input.tema`, `input.idea` (via aliases) |
| **Template** | `{{tema}}`, `{{brief}}` |
| **Produz** | String com 5 opções de títulos |
| **Artifact** | `artifacts/{jobId}/title/output.txt` |
| **Prompt** | `graciela.title.v1` |
| **Provider** | `anthropic` (Claude) |

**Onde validar na UI:**
- Tab **Config** → `prompt.name`, `provider.name`
- Tab **Artifacts** → Link para `title/output.txt`
- Tab **Logs** → Messages do step

---

### Step 2: `brief`
**Tipo:** LLM

| Aspecto | Valor |
|---------|-------|
| **Consome** | `input.titulo`, `input.idea`, `input.duracao` |
| **Template** | `{{titulo}}`, `{{idea}}`, `{{duracao}}` |
| **Produz** | Brief expandido (premisa, personajes, conflicto, arco, resolución) |
| **Artifact** | `artifacts/{jobId}/brief/output.txt` |
| **Prompt** | `graciela.brief.v1` |
| **Provider** | `anthropic` (Claude) |

**Onde validar na UI:**
- Tab **Config** → Ver bindings
- Tab **Artifacts** → Link para `brief/output.txt`

---

### Step 3: `script`
**Tipo:** LLM

| Aspecto | Valor |
|---------|-------|
| **Consome** | `input.titulo`, `previousOutputs.brief` (output do step 2) |
| **Template** | `{{titulo}}`, `{{brief}}` |
| **Produz** | Roteiro narrativo completo (~6000+ palavras) |
| **Artifact** | `artifacts/{jobId}/script/output.txt` |
| **Prompt** | `graciela.script.v1` |
| **Provider** | `anthropic` (Claude) |
| **Knowledge Base** | Tier 2 (DNA do canal, se configurado) |

**Formato do output:**
- Texto puro narrativo (sem marcas de vozes)
- Diálogos entre comillas: "Texto", dijo él
- Pausas: `[PAUSA]`, `[PAUSA CORTA]`, `[PAUSA LARGA]`

**Onde validar na UI:**
- Tab **Artifacts** → Link para `script/output.txt`
- Tab **Logs** → Token usage, duration

---

### Step 4: `parse_ssml`
**Tipo:** Transform

| Aspecto | Valor |
|---------|-------|
| **Consome** | `previousOutputs.script` |
| **Produz** | Script limpo (sem marcações de voz, pausas normalizadas) |
| **Artifact** | `artifacts/{jobId}/parse_ssml/output.txt` |
| **Preset SSML** | (opcional) `graciela.ssml.v1` |

**Transformações aplicadas:**
1. Remove tags `(voz: XXX)` se presentes
2. Remove marcadores `[PAUSA...]`
3. Remove Markdown: `#`, `**`, `_`
4. Remove SSML tags: `<voice>`, `<break>`, etc.
5. Limpa whitespace excessivo

---

### Step 5: `tts`
**Tipo:** TTS

| Aspecto | Valor |
|---------|-------|
| **Consome** | `previousOutputs.parse_ssml` ou `previousOutputs.script` |
| **Produz** | Arquivo de áudio MP3 |
| **Artifact** | `artifacts/{jobId}/tts/audio.mp3` |
| **Voice Preset** | `ximena-graciela` (Azure: es-MX-DaliaNeural) |
| **Provider** | Azure Batch TTS |

**Onde validar na UI:**
- Tab **Config** → `preset_voice.voiceName`
- Tab **Artifacts** → Link para `tts/audio.mp3` (player inline)

---

### Step 6: `render` (Stub)
**Tipo:** Render

| Aspecto | Valor |
|---------|-------|
| **Consome** | `previousOutputs.tts` (path do áudio) |
| **Produz** | Arquivo de vídeo MP4 |
| **Artifact** | `artifacts/{jobId}/render/video.mp4` |
| **Status** | ⚠️ Stub (Gate 1.6) |

---

### Step 7: `export` (Stub)
**Tipo:** Export

| Aspecto | Valor |
|---------|-------|
| **Consome** | `previousOutputs.render` |
| **Produz** | Pacote final exportado |
| **Status** | ⚠️ Stub (Gate 1.6) |

---

## Bindings por Step

| Step | Prompt Slug | Provider | Voice Preset | SSML Preset | Validators |
|------|-------------|----------|--------------|-------------|------------|
| title | `graciela.title.v1` | `anthropic` | — | — | — |
| brief | `graciela.brief.v1` | `anthropic` | — | — | — |
| script | `graciela.script.v1` | `anthropic` | — | — | `min_words` |
| parse_ssml | — | — | — | (opcional) | — |
| tts | — | `azure` | `ximena-graciela` | — | — |
| render | — | — | — | — | — |
| export | — | — | — | — | — |

---

## Onde Verificar na UI (por Tab)

### Tab: **Pipeline**
- Status de cada step (pending, running, success, failed)
- Duração por step
- Link rápido para artifacts

### Tab: **Logs**
- Timeline de execução
- Mensagens de info/warn/error
- Token usage (LLM steps)
- Detalhes de erro se falhou

### Tab: **Manifest**
- JSON completo do job
- `snapshots.config_by_step` → configuração usada
- `steps[]` → resultado de cada step
- `artifacts[]` → lista de artifacts gerados

### Tab: **Config** (por step)
- Prompt usado (id, name, version)
- Provider usado
- Voice preset (TTS)
- Validators aplicados
- Knowledge Base items

### Tab: **Artifacts**
- Links para download/preview de cada artifact
- Player de áudio inline para MP3
- Preview de texto para TXT

---

## Rota de Artifacts

**Endpoint:** `/api/artifacts/{jobId}/{stepKey}/{filename}`

**Exemplos:**
- `/api/artifacts/abc123/title/output.txt`
- `/api/artifacts/abc123/tts/audio.mp3`

**Headers retornados:**
- `Content-Type`: MIME type correto (text/plain, audio/mpeg, etc.)
- `Accept-Ranges: bytes` (suporte a Range para streaming)
- `Content-Disposition: inline` (ou attachment com ?download=true)

**Parâmetros:**
- `?download=true` → força download em vez de inline

---

## Fluxo de Dados Simplificado

```
┌─────────────────────────────────────────────────────────────────┐
│ INPUT: titulo, idea, tema, duracao                              │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: title                                                    │
│ Consome: tema, idea → Produz: 5 opções de títulos                │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: brief                                                    │
│ Consome: titulo, idea, duracao → Produz: brief expandido         │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: script                                                   │
│ Consome: titulo, brief → Produz: roteiro completo (~6000 palavras)│
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: parse_ssml                                               │
│ Consome: script → Produz: script limpo (sem marcações)           │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: tts                                                      │
│ Consome: parse_ssml → Produz: audio.mp3                          │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: render (stub)                                            │
│ Consome: audio → Produz: video.mp4                               │
└──────────────────────────┬───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: export (stub)                                            │
│ Consome: video → Produz: pacote final                            │
└──────────────────────────────────────────────────────────────────┘
```
