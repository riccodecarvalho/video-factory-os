# Video Factory OS (Local-First, Config-First)
## PRD + Plano de Implementação (Agent-Ready)

### 0) Resumo executivo
Construiremos um sistema **local-first** para produção de vídeos (orquestração + execução local, especialmente render com FFmpeg no Mac), substituindo o n8n e incorporando o melhor dos fluxos já validados:
- n8n: planilha → roteiro → TTS → vídeo
- 4pice Studio: ideia → título → brief → roteiro → prompts de imagem → imagens → sync table

Agora: **sem n8n**, com **UI** e um **Job Engine** com checkpoints idempotentes, mantendo chamadas externas (Claude/Azure/etc) quando necessário.

O produto é uma "fábrica" com:
- **Receitas** (por canal/persona; ex: Graciela)
- **Jobs rastreáveis** (1 job = 1 vídeo)
- **Etapas idempotentes** com checkpoints em cascata (retoma do ponto exato)
- **Artefatos versionados** (inputs/outputs por etapa + logs + manifest)
- **UI de acompanhamento + reexecução por etapa**
- **Config-First real**: nada hardcoded (prompts/vozes/efeitos/templates/providers/regras).

---

## 1) Objetivos, Métricas e Não-Objetivos

### 1.1 Objetivos do MVP
1) Criar e acompanhar Jobs (vídeos) com etapas claras.
2) Executar local (Mac) com render acelerado (VideoToolbox).
3) Garantir que nada se perca (artefatos + logs + manifest por etapa).
4) Implementar **Prompt Governance** (prompts e configs nunca hardcoded).
5) Implementar **Config-First** desde o dia 1:
   - receitas, prompts, vozes, presets de efeitos, providers de imagem, thresholds de validação,
     tudo em DB/config versionada e editável via UI.

### 1.2 Métricas de sucesso (MVP)
- Taxa de jobs concluídos (sem intervenção fora da UI) ≥ 80%
- Recuperação por checkpoint (retomar da etapa X) = 100% dos casos
- Render local "ordem de minutos", usando hardware encoder no Mac
- Reprodutibilidade: mesmo input + mesma receita/config snapshot ⇒ outputs equivalentes
- Meta de tempo (produto): vídeo pronto para postar em **< 30 min** (inclui revisão humana)

### 1.3 Não-objetivos (por enquanto)
- Editor avançado de vídeo (timeline/cuts/b-roll)
- Operação 24/7 em servidor (primeiro local; SaaS depois)
- "Efeitos pesados" ON por padrão (sempre via preset/feature flag)

### 1.4 Por que não n8n (racional explícito)

**Custos do n8n:**
- Fluxo "preso" em modelo de automação genérico
- Dificulta padronizar como "produto" (manifest, templates, versão, repetibilidade)
- UI boa para automação, mas não para criação de vídeo como produto
- Debugging, versionamento e reuso de blocos complexos

**Ganhos do sistema próprio:**
- Pipeline vira **produto** (não "automação")
- Tudo vira **config + manifest + execução reproduzível**
- Versionar templates/prompts/SSML
- Re-render rápido trocando 1 peça (ex: só voz, só legenda)
- Caminho natural para SaaS

> Decisão: sistema próprio, documentada em [mapeamento-chatgpt-plano.md](../05-timeline/2025-12-13/mapeamento-chatgpt-plano.md)

---

## 1.5) 5 Módulos do Produto (Visão de Alto Nível)

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Project Manager** | Projetos, episódios, presets, biblioteca de assets | ✅ Parcial (Admin) |
| **Script Studio** | Editor de roteiro, segmentação em cenas, versionamento | ⏳ Não implementado |
| **Voice Lab** | Editor de SSML, preview por cena, normalização, cache de TTS | ⏳ Não implementado |
| **Video Factory** | Composição (assets + áudio + legendas), render FFmpeg, artefatos | ✅ Parcial (runner) |
| **Dashboard** | Lista de jobs, logs por etapa, re-run, comparação de versões | ✅ Implementado (/jobs) |

---


## 2) Conceitos de domínio (Config-First)

### 2.1 Recipe (Receita)
Uma Receita define:
- pipeline (lista ordenada de etapas)
- parâmetros por etapa (referências a presets/configs)
- prompt slugs por etapa (Title/Brief/Script/etc)
- mapeamento de vozes e perfis (prosody/style/role)
- presets de render FFmpeg (encoder/scale/fps/bitrate + filtros)
- regras de validação (ex: min_words, proibidos, formatos)

Tudo configurável via UI e versionado.

### 2.2 Prompt Registry
Prompts são dados (DB) com:
- slug único, versão, system prompt, template com variáveis
- config do modelo: model, max_tokens, temperature
- is_active + histórico
Regra: runtime usa `getPromptOrThrow()` (sem fallback silencioso).

### 2.3 Presets configuráveis (Voz, SSML, Vídeo, Imagem)
- VoicePreset: voiceName + prosody (rate/pitch) + style + styledegree + role
- SSMLPreset: template base `<speak>` + namespaces + output format + regras
- VideoPreset: encoder, scale, fps, bitrate, pixel format, audio codec
- EffectsPreset: filtergraph template (com variáveis) + ordem de aplicação
- ImagePreset (futuro): provider + estilo + quantidade + prompt template

### 2.4 Manifest (auditabilidade e reprodução)
Cada job gera um `manifest.json` que contém:
- input inicial
- recipe_version e snapshots (prompts/configs)
- estado por etapa (status, hash, tentativas, duração)
- refs de outputs/artefatos
- custo estimado por etapa (tokens/tts/render)

### 2.5 Knowledge Base Governance (sistema de tiers)

A Knowledge Base é dividida em **tiers** para controle de tokens e contexto:

| Tier | Descrição | Quando carregar |
|------|-----------|-----------------|
| **tier1** | Sempre carrega (DNA do projeto, orchestrator) | Toda execução |
| **tier2** | Por fase do pipeline (ex: regras de roteiro, vozes) | Contexto específico |
| **tier3** | Sob demanda (schemas, exemplos, referências) | Apenas se necessário |

**Por que isso é importante:**
- Controle de tokens (evitar explodir limite de contexto)
- Performance (carregar apenas o necessário)
- Organização (cada fase sabe o que precisa)

> Documentado em: [mapeamento-chatgpt-plano.md](../05-timeline/2025-12-13/mapeamento-chatgpt-plano.md#6-sistema-de-tiers-knowledge-base)

---

## 3) "Não negociáveis" (Regras de ouro)

### 3.1 Stage Directions (contrato do roteiro)
A etapa de roteiro SEMPRE produz Stage Directions:
- Não pode conter SSML nem Markdown
- Começa com (voz: NARRADORA)
- Marcadores de voz: NARRADORA / ANTAGONISTA / OTRO
- Pausas: [PAUSA CORTA], [PAUSA], [PAUSA LARGA]
- Mínimo 6000 palavras

### 3.2 SSML Azure (parser)
- Converter Stage Directions → SSML respeitando:
  - `<voice>` sequencial (nunca aninhado)
  - `<break time="..."/>` para pausas
  - prosody/style/role vindo de VoicePreset

### 3.3 Performance de render (Mac)
- Preset default usa encoder acelerado (ex: h264_videotoolbox).
- Presets com filtros pesados existem, mas ficam OFF por default.

### 3.4 Nada hardcoded
- Nenhum prompt hardcoded
- Nenhuma voz hardcoded
- Nenhum filtro/ffmpeg args hardcoded (somente "placeholders"/chaves suportadas pelo engine)
- Se faltar config/prompt ⇒ falha explícita e rastreável na UI

---

## 4) Fluxos de usuário (UI)

### 4.1 Criar Job
1) Selecionar Receita
2) Inserir "Ideia base" (ou importar de planilha)
3) Revisar configs (presets selecionados) antes de rodar
4) Rodar pipeline (auto) ou etapa a etapa

### 4.2 Acompanhar Job
- Lista de etapas com status (not_started/running/success/failed/skipped)
- Preview de outputs (texto/SSML/áudio/vídeo)
- Logs por etapa
- Ações:
  - Reexecutar etapa
  - Reexecutar a partir da etapa X
  - Editar output (ex: roteiro) e continuar
  - Duplicar job (fork) com nova config

### 4.3 Admin Config (essencial para "nada hardcoded")
- CRUD de:
  - Recipes (e versões)
  - Prompts
  - VoicePresets / SSMLPresets
  - VideoPresets / EffectsPresets
  - Providers (Claude/Azure/Imagem)
  - Knowledge Base (tier1/2/3)

---

## 5) Pipeline MVP (etapas) — definido por Receita

Etapas típicas (a Receita define quais entram e em que ordem):
0) Setup Job (manifest + snapshot configs)
1) Title (LLM) — gera opções, selecionar 1
2) Brief (LLM)
3) Script Stage Directions (LLM + validators)
4) Parse Stage Directions → SSML (transform + validators)
5) TTS (Azure)
6) Render (FFmpeg local)
7) Export (gerar pacote final + metadados)

---

## 6) Checkpoints idempotentes (anti-perda)

### 6.1 Estado por etapa (mínimo)
Cada etapa grava:
- status
- input_hash (hash de inputs + config snapshot)
- output_refs (arquivos + DB)
- logs (resumo + detalhes)
- timestamps + attempts
- last_error (se houver)

### 6.2 Regras de idempotência
- Se status=success e input_hash igual ⇒ skip
- Se input_hash mudou ⇒ reexecuta, preserva versão anterior (não sobrescreve sem versionar)
- "Retry" granular por etapa

---

## 7) Arquitetura técnica (Next.js full-stack)

### 7.1 Stack
- Next.js 14 (App Router)
- UI: React + Tailwind + shadcn/ui
- DB: SQLite + Drizzle (local) (e migração futura para Postgres)
- LLM: Claude (Opus/Sonnet conforme config)
- TTS: Azure Speech
- Render: FFmpeg local (VideoToolbox no Mac)

### 7.2 Componentes
A) UI (Jobs + Admin Config)
B) API Routes (CRUD + execução)
C) Job Engine (sequencial + checkpoints)
D) Adapters (Claude/Azure/FFmpeg/Storage)
E) Observability (logs/métricas/custos)

### 7.3 Estrutura recomendada de pastas
```
/video-factory-os
  /app
    /(dashboard)
    /api
    /admin
  /lib
    /engine
    /adapters
    /prompts
    /db
    /validators
    /observability
  /recipes
    /graciela
      assets/
      seed.json
  /jobs (gitignored)
  /z- archive (referência)
/docs
  PRD.md
  MILESTONES.md
  QA-ACCEPTANCE.md
  ARCHITECTURE.md
  ADR/
```

---

## 8) Modelo de dados (mínimo MVP, expansível)

Tabelas recomendadas:
- prompts (slug, version, template, model params, is_active…)
- knowledge_base (tier, category, content…)
- recipes (id, version, pipeline json, defaults refs…)
- presets_voice / presets_ssml / presets_video / presets_effects
- providers (claude/azure/image) + cred refs
- jobs (id, recipe_id/version, input json, status…)
- job_steps (job_id, step_key, status, input_hash, output_refs, logs…)
- artifacts (job_id, step_key, type, path, checksum, metadata…)

---

## 9) QA e Critérios de aceite

### 9.1 Definition of Done (por PR)
- Migrações ok
- Logs por etapa + erro rastreável
- 1 teste "happy path"
- 1 teste de idempotência
- Docs atualizados (Milestones/ADR quando necessário)

### 9.2 Testes mínimos (MVP)
P0:
- checkpoint_resume (falha na etapa 3, retoma da 3)
- checkpoint_skip (etapa completa é pulada)
- prompt_not_found (erro explícito)
- stage_directions_valid (sem SSML/MD, min words, marcadores válidos)
- ssml_no_voice_nesting (parser nunca aninha)
P1:
- render_uses_videotoolbox (preset selecionado injeta encoder certo)
- preset_override_changes_hash (mudar config reexecuta)

---

## 10) Plano por fases (marcos e entregas)

### Fase 0 — Bootstrap + Doc Governance
Entregas:
- docs/ (PRD, MILESTONES, QA-ACCEPTANCE, ARCHITECTURE)
- ADR-001 (Stage Directions sem SSML/MD)
- Seed de DB (mínimo) para:
  - 1 recipe (Graciela)
  - prompts necessários
  - voice/video presets default
Aceite:
- repo "self-explanatory", roda local com seed

### Fase 1 — Core Engine + Checkpoints
Entregas:
- schema jobs/job_steps/artifacts
- executor sequencial + checkpoints
- logs por etapa
Aceite:
- pipeline dummy prova retomar do meio + versionar outputs

### Fase 2 — Prompt & Config Registry (nada hardcoded)
Entregas:
- Prompt registry + getPromptOrThrow
- Presets (voz/vídeo/efeitos) no DB + UI mínima para selecionar
Aceite:
- prompt faltando quebra explicitamente
- mudar preset muda hash e reexecuta

### Fase 3 — Script Stage Directions (Graciela)
Entregas:
- etapa LLM de roteiro + validadores
Aceite:
- 10 execuções → 10 roteiros válidos

### Fase 4 — Parse → SSML + Azure TTS
Entregas:
- parser configurável (voz/pause map vindo do DB)
- adapter Azure
Aceite:
- SSML válido + mp3 gerado; zero nesting

### Fase 5 — Render FFmpeg local
Entregas:
- render adapter parametrizado por preset
Aceite:
- mp4 final E2E

### Fase 6 — UI completa (Jobs + Reprocess)
Entregas:
- tela jobs, job detail, actions de retry, previews, logs
Aceite:
- 1 vídeo completo produzido 100% via UI

---

## 11) Protocolo de trabalho "modo agente"
Formato obrigatório de cada sessão:
1) Plano da sessão
2) Checklist de entrega
3) Implementação (arquivos/PR)
4) Evidências (logs/outputs)
5) Riscos + próximos passos

Gate:
- Ao final de cada fase: PR + checklist + evidências.

---

## 12) Referências (Archive)
- Prompt Stage Directions v7.0
- Prompt Roteiro Graciela e regras SSML Azure (voice nesting)
- MCP FFmpeg local (VideoToolbox + comando base)
- Helper de prompts e KB tiers do 4pice (getPromptOrThrow + replaceVariables)
