# 📋 MAPEAMENTO: Plano Video Factory Local (Chat ChatGPT)

> **Arquivo fonte:** `z- tmp/1/Plano Video Factory Local.md`
> **Total de linhas:** 15293
> **Data extração:** 2025-12-14
> **Status:** READ-ONLY (evidência)

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

Este arquivo é um chat longo com ChatGPT que documenta o **racional fundacional** do Video Factory OS. Contém decisões arquiteturais, trade-offs e princípios que foram usados como base para a implementação.

---

## 📊 DECISÕES FUNDACIONAIS EXTRAÍDAS

### 1. Stack: Node.js vs Python

**Decisão:** Node.js como stack principal

**Evidência:** Linhas 80-116

**Racional:**
- Reuso do ffmpeg-server já existente
- Orquestração I/O (filas, APIs, pipelines)
- Caminho natural para UI web (Next.js)
- Local-first com evolução para SaaS

**Alternativa considerada:** Python
- Faria sentido se: ML local pesado, equipe majoritariamente Python
- Trade-off: Criaria "duas ilhas" de código

**Status:** ✅ IMPLEMENTADO (Video Factory OS usa Next.js + Node)

---

### 2. Princípio "Manifest-First"

**Decisão:** Todo vídeo representado por Render Manifest JSON

**Evidência:** Linhas 119-153

**Campos do Manifest:**
- Texto final por cena
- SSML final por cena
- Voz escolhida e parâmetros
- Paths/IDs de assets
- Trilha, efeitos, transições
- Legendas (fonte, estilo, timing)
- Decisões do pipeline (ex: normalização)
- Versão dos templates/prompts usados

**Por que isso é crucial:**
- Reprodutibilidade (mesmo vídeo sempre)
- Re-render parcial (trocar só a voz)
- Debug e auditoria

**Status:** ✅ IMPLEMENTADO (manifest no DB + Job Detail UI)

---

### 3. Arquitetura em 4 Camadas

**Decisão:** Separar em Core, Services, Runner, Interfaces

**Evidência:** Linhas 156-194

| Camada | Responsabilidade |
|--------|------------------|
| **Core (Domínio)** | Regras do pipeline, geração de manifest, steps |
| **Services** | Azure TTS, ffmpeg-server, LLM, storage |
| **Runner (Job System)** | Fila, retries, estados, logs, cache |
| **Interfaces** | CLI, API, UI |

**Status:** ✅ IMPLEMENTADO (lib/engine, lib/db, app/)

---

### 4. 5 Módulos do Produto

**Decisão:** Estruturar em módulos focados

**Evidência:** Linhas 196-250

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Project Manager** | Projetos, episódios, presets, assets | ✅ Parcial (Admin) |
| **Script Studio** | Editor de roteiro, cenas, versionamento | ⏳ Não implementado |
| **Voice Lab** | SSML, preview, normalização, cache | ⏳ Não implementado |
| **Video Factory** | Composição, render, artefatos | ✅ Parcial (runner) |
| **Dashboard** | Jobs, logs, comparação, re-run | ✅ Implementado (/jobs) |

---

### 5. Prompt-as-Data (Governança)

**Decisão:** Prompts e KB não ficam hardcoded, viram dados

**Evidência:** Linhas 648-668, 729-790

**Princípios:**
- Edição sem deploy
- Versionamento automático (histórico)
- Knowledge base por tiers (tier1/tier2/tier3)
- Variáveis dinâmicas (`{{}}` e condicionais)
- **NUNCA** fallback silencioso
- `getPromptOrThrow` (falha explícita)

**Status:** ✅ IMPLEMENTADO (ai_prompts, knowledge_base, Execution Map)

---

### 6. Sistema de Tiers (Knowledge Base)

**Decisão:** KB dividida em tiers para controle de tokens

**Evidência:** Linhas 376-396, 751-761

| Tier | Descrição | Quando carregar |
|------|-----------|-----------------|
| **tier1** | Sempre carrega (DNA, orchestrator) | Toda execução |
| **tier2** | Por fase do pipeline | Contexto específico |
| **tier3** | Sob demanda (schemas, exemplos) | Apenas se necessário |

**Status:** ✅ IMPLEMENTADO (knowledge_base.tier no DB)

---

### 7. Pipeline de Execução

**Decisão:** Pipeline em steps sequenciais com checkpoints

**Evidência:** Linhas 253-315, 1274-1427

**Steps:**
1. **Script** → Gerar roteiro com LLM + DNA
2. **Stage Directions** → Parser de marcações
3. **SSML Builder** → Gerar SSML por cena
4. **Azure Batch TTS** → Gerar áudio (poll + download)
5. **Render** → FFmpeg (loop imagem + áudio)
6. **Storage + Status** → Upload e atualização

**Status:** ✅ IMPLEMENTADO (runner.ts com steps)

---

### 8. UI de Receitas (não copiar n8n)

**Decisão:** UI orientada a "Receitas", não flow builder

**Evidência:** Linhas 317-349, 845-873

**Por que:**
- Evita virar "mini-n8n"
- Mantém foco no produto
- Usuário escolhe receita e roda
- UI foca em: cenas, SSML, assets, preview, render

**Status:** ✅ IMPLEMENTADO (recipes, Execution Map)

---

### 9. Por que sem n8n

**Decisão:** Sistema próprio em vez de n8n

**Evidência:** Linhas 35-76, 590-607, 1130-1156

**Custos do n8n:**
- Fluxo "preso" em modelo de automação genérico
- Dificulta padronizar como "produto"
- UI boa para automação, não para criação de vídeo
- Debugging e versionamento complexos

**Ganhos do sistema próprio:**
- Pipeline vira "produto" (não automação)
- Config + manifest + execução reproduzível
- Versionar templates/prompts/SSML
- Re-render rápido trocando 1 peça
- Caminho natural para SaaS

**Status:** ✅ IMPLEMENTADO (n8n não é usado)

---

## 📚 DOCUMENTOS REFERENCIADOS NO CHAT

| Documento | Conteúdo | Status |
|-----------|----------|--------|
| `tmp-prompt.md` | Sistema de Prompts IA do 4pice | ✅ Absorvido |
| `licoes-aprendidas-n8n.md` | Lições do n8n | ✅ Absorvido |
| `arquitetura-workflow.md` | State machine + checkpoints | ✅ Absorvido |
| `mcp-ffmpeg-local.md` | FFmpeg server local | ⏳ Parcial |
| `0003-dna-graciela.md` | DNA do canal Graciela | ✅ Seed no DB |
| `azure-tts-vozes-configuracoes.md` | Vozes Azure | ✅ Presets no DB |
| `graciela-pipeline-v1.json` | Pipeline original | ✅ Recipe no DB |

---

## 🔗 COMO ISSO SE CONECTA AO CÓDIGO ATUAL

| Decisão | Implementação |
|---------|---------------|
| Stack Node.js | `package.json`, Next.js 15 |
| Manifest-first | `lib/engine/runner.ts`, `manifest` campo no jobs |
| 4 Camadas | `lib/db/`, `lib/engine/`, `app/` |
| 5 Módulos | `app/admin/`, `app/jobs/` |
| Prompt-as-data | `prompts`, `knowledge_base` tabelas |
| Tiers | `knowledge_base.tier` |
| Pipeline | `runner.ts`, `StepCapabilities` |
| UI Receitas | `/admin/execution-map`, `recipes` |

---

## ✅ ADRs RELACIONADOS

| ADR | Decisão | Origem no Chat |
|-----|---------|----------------|
| ADR-007 | Engine Execution Model | Linhas 119-153 (Manifest-first) |
| ADR-008 | Project Context + Bindings | Linhas 648-668 (Prompt-as-data) |

---

## 📝 LIÇÕES APRENDIDAS MENCIONADAS

1. **FFmpeg precisa de arquivo local** — Download → Render → Upload (linha 1423)
2. **Checkpoint por etapa** — Não refazer o que já está pronto (linha 1298)
3. **Filtros visuais pesados explodem tempo** (linha 1403-1405)
4. **Governança anti-cagada** — Proibido hardcode/fallback silencioso (linha 950)

---

## 🎯 PRÓXIMOS PASSOS DO ROADMAP (do chat)

| Fase | Status |
|------|--------|
| Fase 1 — Motor local CLI | ✅ Done (runner.ts) |
| Fase 2 — Job runner + Dashboard | ✅ Done (/jobs) |
| Fase 3 — UI de produção | ⏳ Parcial |
| Fase 4 — Preparar SaaS | ⏳ Não iniciado |

---

## 📊 RESUMO

Este chat com ChatGPT serviu como **blueprint fundacional** do Video Factory OS. As decisões principais foram:

1. **Node.js** (reuso ffmpeg-server)
2. **Manifest-first** (reprodutibilidade)
3. **Prompt-as-data** (governança)
4. **Tiers de KB** (controle de tokens)
5. **UI de Receitas** (não copiar n8n)

Todas essas decisões foram implementadas no código atual.
