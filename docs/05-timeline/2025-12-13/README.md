# Timeline 2025-12-13

> **Timeline covers up to:** `7eb9e1a` (Fechamento de Sessão 2025-12-14)

---

# 📋 HANDOVER / FECHAMENTO DE SESSÃO

> **Data do Handover:** 2025-12-14T08:27:00-03:00
> **SHA HEAD:** `7eb9e1a`
> **Branch:** `main` (up to date with `origin/main`)
> **Working tree:** clean

---

## 🚀 COMO RETOMAR (Primeiros 3 Passos)

```bash
# 1. Pull do repositório
git pull origin main
# Esperado: Already up to date (ou SHA 7eb9e1a+)

# 2. Instalar dependências
npm install

# 3. Subir servidor
npm run dev
# Esperado: http://localhost:3000 (ou 3001 se 3000 ocupada)
```

**Verificação:**
- Acessar http://localhost:3000/jobs
- Rodar E2E: `npm run vf:e2e`

---

## ✅ O QUE ESTÁ PRONTO

1. **UI Completa:** AppShell, SplitView, PageHeader, SectionCards, FiltersBar, EmptyState
2. **Admin:** Prompts, Providers, Presets, Validators, Recipes, Knowledge Base, Execution Map
3. **Engine:** Runner manifest-first com execução sequencial
4. **Providers Reais:** Claude (LLM), Azure Batch TTS
5. **Validators:** forbidden_patterns, required_patterns, min_words, max_words
6. **Job Detail:** Tabs Pipeline, Logs, Manifest, Config, Artifacts
7. **Artifacts API:** Streaming com Range headers
8. **Multi-Projeto:** Graciela + Virando o Jogo
9. **Audit:** audit_events com rastreamento de mudanças
10. **Documentação:** 6 ADRs, 17 Session Logs, Timeline completa

---

## ❌ O QUE FALTA

1. **Gate 1.6 — Render + Export**
   - `executeStepRender` (vídeo) — stub atual
   - `executeStepExport` (pacote final) — stub atual
   - Integração FFmpeg local

2. **Observability**
   - Métricas de execução
   - Dashboard de jobs

3. **UI de Audit**
   - Visualização de audit_events no Admin

---

## ⚠️ RISCOS / BLOQUEIOS

| Risco | Mitigação |
|-------|-----------|
| Azure Key expirada | Obter nova em Portal Azure → Speech Services → Keys |
| Anthropic Key expirada | Obter nova em console.anthropic.com |
| Porta 3000 ocupada | Next.js usa 3001 automaticamente |

---

## 🎯 PRÓXIMA AÇÃO RECOMENDADA

**Gate 1.6 — Render + Export**
- Implementar FFmpeg local para `executeStepRender`
- Gerar vídeo a partir de audio + imagens
- Implementar `executeStepExport` para pacote final

---

## 📊 Último E2E Completo

- **Job ID:** `18f8290b-ddf6-4491-bfbb-56f722ab4654`
- **Projeto:** Verdades de Graciela
- **Status:** `completed ✅`
- **Duração:** 419.2s
- **Audio:** 41MB (~28 min)

---


## Resumo do Dia

Dia focado em **foundational hardening** + **E2E real** do Video Factory OS, cobrindo desde a **Paridade de UI** (0.7) até a **Execução Real** (1.5.2).

Estabelecemos:
- **UI Architecture:** Paridade visual com 4pice (Zero Glow, SplitView, PageHeader).
- **Admin Governance:** Telas de configuração reais (Prompts, Providers, Recipes, Execution Map).
- **Engine Foundation:** Runner manifest-first com execução sequencial.
- **Providers Reais:** Integração de ponta a ponta com Claude (LLM) e Azure Batch (TTS).
- **Fixes de Produto:** Voz única, Audio Streaming, UI Error Visibility.
- **Consolidação:** Session logs detalhados e documentação operacional.

---

## 📋 Sessions (Fonte de Verdade Detalhada)

| # | Session | Gate | SHA | Foco |
|---|---------|------|-----|------|
| 001 | [Foundational Hardening](sessions/001-foundational-hardening-2025-12-13.md) | - | - | Config & Providers |
| 002 | [Gate 0.7-0.9 Consolidation](sessions/002-consolidation-gate-0-7-to-0-9.md) | 0.7-0.9 | - | UI & Engine (Retroativo) |
| 003 | [Gate 1.0-1.5 Consolidation](sessions/003-consolidation-gate-1-0-to-1-5.md) | 1.0-1.5 | - | Admin & E2E (Retroativo) |
| 004 | [Gate 0.7 AppShell](sessions/004-gate-0.7-appshell.md) | **0.7** | `ec7d615` | Layout base |
| 005 | [Gate 0.75 UI Patterns](sessions/005-gate-0.75-ui-patterns.md) | **0.75** | `4a7b4d9` | SplitView, PageHeader |
| 006 | [Gate 0.8 Admin Baseline](sessions/006-gate-0.8-admin-baseline.md) | **0.8** | `b09c9c8` | Config-First Real |
| 007 | [Gate 0.9 Engine](sessions/007-gate-0.9-engine.md) | **0.9** | `a2ba590` | Manifest-First Runner |
| 008 | [Gate 1.0 Execution Map](sessions/008-gate-1.0-execution-map.md) | **1.0** | `e28e857` | Project Context |
| 009 | [Gate 1.1 Hardening](sessions/009-gate-1.1-hardening.md) | **1.1** | `41575e1` | StepCapabilities |
| 010 | [Gate 1.2 Real Providers](sessions/010-gate-1.2-real-providers.md) | **1.2** | `3e803a4` | Claude + Azure |
| 011 | [Gate 1.25 Governance](sessions/011-gate-1.25-governance.md) | **1.25** | `eca083a` | Audit + GitHub |
| 012 | [Gate 1.3 UI Visibility](sessions/012-gate-1.3-ui-visibility.md) | **1.3** | `81754ae` | Config/Artifacts Tabs |
| 013 | [Gate 1.4 E2E Pack](sessions/013-gate-1.4-e2e-pack.md) | **1.4** | `8f7b404` | Test Automation |
| 014 | [Gate 1.5 Pipeline Bindings](sessions/014-gate-1.5-pipeline-bindings.md) | **1.5** | `9b336b5` | TTS Fix |
| 015 | [Gate 1.5.1 Batch TTS](sessions/015-gate-1.5.1-batch-tts.md) | **1.5.1** | `73f4dbc` | Azure Batch API |
| 016 | [Gate 1.5.2 Product Fixes](sessions/016-gate-1.5.2-product-fixes.md) | **1.5.2** | `cbc62c5` | 5 Fixes |

---

## Gates Completados

### Gate 0.7 — Layout AppShell
- **SHA:** `ec7d615`
- **O que:** Estrutura base com Sidebar, Header e Breadcrumb.
- **Por que:** Necessário para suportar a navegação entre contextos (Jobs vs Admin).
- **Detalhes:** [Session 004](sessions/004-gate-0.7-appshell.md)

### Gate 0.75 — UI Patterns Parity (4pice Benchmark)
- **SHA:** `4a7b4d9`
- **O que:** Componentes canônicos (`SplitView`, `PageHeader`, `SectionCards`, `EmptyState`, `FiltersBar`).
- **Por que:** Evitar drift visual. Decisão de "Glow Budget Zero" para manter a hierarquia limpa.
- **ADR:** [ADR-006](../../01-adr/2025-12-13-adr-006-ui-patterns-parity-4pice.md)
- **Detalhes:** [Session 005](sessions/005-gate-0.75-ui-patterns.md)

### Gate 0.8 — Admin Baseline Completo (Config-First Real)
- **SHA:** `b09c9c8`
- **O que:** Páginas Admin (Prompts, Recipes, Providers, Validators) conectadas ao DB.
- **Por que:** Eliminar hardcode. Tudo que o engine usa deve ser configurável via UI.
- **Detalhes:** [Session 006](sessions/006-gate-0.8-admin-baseline.md)

### Gate 0.9 — Engine Integration (Manifest-First)
- **SHA:** `a2ba590`
- **O que:** `runner.ts` sequencial + UI de Jobs (PipelineView, LogsViewer).
- **Por que:** O runner precisa ser a fonte da verdade da execução, persistindo estado no Manifest JSON.
- **ADR:** [ADR-007](../../01-adr/2025-12-13-adr-007-engine-execution-model.md)
- **Detalhes:** [Session 007](sessions/007-gate-0.9-engine.md)

### Gate 1.0 — Admin Visibility + Execution Map
- **SHA:** `e28e857`
- **O que:** Tabelas `projects`, `execution_bindings`. UI `/admin/execution-map`.
- **Por que:** Governança sobre o wiring (quem usa qual prompt/provider).
- **ADR:** [ADR-008](../../01-adr/2025-12-13-adr-008-project-context-execution-bindings.md)
- **Detalhes:** [Session 008](sessions/008-gate-1.0-execution-map.md)

### Gate 1.1 — Hardening + Effective Config
- **SHA:** `41575e1`
- **O que:** `StepCapabilities`, resolução de `getEffectiveConfig` no runner.
- **Por que:** Garantir que o runner saiba exatamente qual configuração usar antes de executar.
- **Detalhes:** [Session 009](sessions/009-gate-1.1-hardening.md)

### Gate 1.2 — Real Providers + Validators
- **SHA:** `3e803a4`
- **O que:** Implementação real de `executeLLM` (Claude) e `executeTTS` (Azure).
- **Por que:** Sair do modo stub. Validadores bloqueiam execução se inputs forem inválidos.
- **Detalhes:** [Session 010](sessions/010-gate-1.2-real-providers.md)

### Gate 1.25 — Governance + Traceability
- **SHA:** `eca083a`
- **O que:** `audit_events`, Timeline viva, `GitHub` resource.
- **Por que:** Rastreabilidade é pré-requisito para escalar.
- **Detalhes:** [Session 011](sessions/011-gate-1.25-governance.md)

### Gate 1.3 — UI Visibility
- **SHA:** `81754ae`
- **O que:** Tabs `Config` (snapshot) e `Artifacts` (files) no Job Detail.
- **Por que:** Admin precisa ver o input/output real sem acessar o servidor.
- **Detalhes:** [Session 012](sessions/012-gate-1.3-ui-visibility.md)

### Gate 1.4 — E2E Test Pack
- **SHA:** `8f7b404`
- **O que:** Script `npm run vf:e2e`, Artifacts API, Multi-Project.
- **Por que:** Automação de testes de fluxo completo (criação -> execução -> validação).
- **Detalhes:** [Session 013](sessions/013-gate-1.4-e2e-pack.md)

### Gate 1.4.1 — Multi-Project UX Closure
- **SHA:** `2a41d91`
- **O que:** Dropdown de projetos na criação de jobs.

### Gate 1.4.2 — Project Filter + E2E Real Execution
- **SHA:** `1146b8e`
- **O que:** Filtro por projeto na lista de jobs. E2E real com providers.

### Gate 1.5 — Pipeline Bindings + TTS Fix
- **SHA:** `9b336b5`
- **O que:** Bindings completos para Graciela. Fix na extração de texto para TTS.
- **Detalhes:** [Session 014](sessions/014-gate-1.5-pipeline-bindings.md)

### Gate 1.5.1 — Azure Batch TTS + COMPLETED E2E ✅
- **SHA:** `73f4dbc`
- **O que:** Implementação Azure Batch Synthesis API (PUT -> poll -> download).
- **Por que:** Realtime API falha com textos longos (>10min). Batch é mandatório para narrativas.
- **Resultado:** E2E completo em ~7min, gerando 41MB de áudio.
- **Detalhes:** [Session 015](sessions/015-gate-1.5.1-batch-tts.md)

### Gate 1.5.2 — 5 Fixes de Produto ✅
- **SHA:** `cbc62c5`
- **O que:**
  1. **Script Voz Única:** `parse_ssml` limpa tags de voz/pausa.
  2. **Audio Streaming:** Headers `Range` / `HTTP 206` na API.
  3. **UI Error Visibility:** `lastError` visível no PipelineStep.
  4. **Placeholders:** Fixture real e validação de `{{ }}` no outputs.
  5. **Docs:** `FLUXO-JOBS-STEPS-TABS.md`.
- **Detalhes:** [Session 016](sessions/016-gate-1.5.2-product-fixes.md)

---

## ADRs Criados

| ID | Título | Link |
|----|--------|------|
| ADR-005 | UI Baseline (4pice Reference) | [Link](../../01-adr/2025-12-13-adr-005-ui-baseline-4pice-reference.md) |
| ADR-006 | UI Patterns Parity | [Link](../../01-adr/2025-12-13-adr-006-ui-patterns-parity-4pice.md) |
| ADR-007 | Engine Execution Model | [Link](../../01-adr/2025-12-13-adr-007-engine-execution-model.md) |
| ADR-008 | Project Context + Bindings | [Link](../../01-adr/2025-12-13-adr-008-project-context-execution-bindings.md) |

---

## 📚 Documentação Operacional

| Documento | Caminho | O que contém |
|-----------|---------|--------------|
| **Manual IA** | [manual-modelos-ia.md](../../00-regras/operacao/manual-modelos-ia.md) | Regras de uso Claude vs Gemini |
| **Troubleshooting** | [troubleshooting.md](../../00-regras/operacao/troubleshooting.md) | Portas e Chaves (Azure) |
| **UI Guidelines** | [ui-guidelines.md](../../00-regras/design-system/ui-guidelines.md) | Regras de Glow e 4pice Benchmark |
| **Fluxo Jobs** | [FLUXO-JOBS-STEPS-TABS.md](../../FLUXO-JOBS-STEPS-TABS.md) | Documentação do pipeline |

---

## Decisões Importantes

1.  **Config-First Enforced:** Nenhum hardcode de prompt, provider ou preset. Tudo vem do DB.
2.  **Manifest Source of Truth:** O estado do job é o JSON do manifest, não colunas soltas.
3.  **UI 4pice Baseline:** "Zero Glow". Hierarquia por layout (SplitView) e tipografia.
4.  **Batch TTS:** Para vídeos longos, usar apenas Azure Batch API (não Realtime).
5.  **Audit Trail:** Mudanças críticas geram logs de auditoria.

---

## Próximo Gate

**Gate 1.6 — Render + Export (Stubs Reais)**
- Implementar `executeStepRender` (vídeo)
- Implementar `executeStepExport` (pacote final)
- Integração com FFmpeg local (próxima fase)

---

## Evidence Snapshot

### git log --oneline -n 25
```
6452042 docs: Consolidate session history and operational rules [SANITIZED]
790714a docs: Session closure - Timeline updated to cbc62c5
cbc62c5 fix: Gate 1.5.2 - 5 fixes de produto
73f4dbc feat: Gate 1.5.1 - Azure Batch TTS + COMPLETED E2E
9b336b5 feat: Gate 1.5 - Pipeline Bindings + TTS Fix (partial)
1146b8e feat: Gate 1.4.2 - Project Filter + E2E Real Execution
2a41d91 feat: Gate 1.4.1 - Multi-Project UX Closure
8f7b404 feat: Gate 1.4 - E2E Test Pack (Partial)
c12ba39 feat: Gate 1.35 - Traceability Closure
81754ae feat: Gate 1.3 - UI Visibility
b68973c chore: Gate 1.25 checkpoint
eca083a feat: Gate 1.25 - Governance + Traceability
3e803a4 feat: Gate 1.2 - Real Providers + Validators
41575e1 feat: Gate 1.1 - Hardening + Effective Config
e28e857 feat: Gate 1.0 - Admin Visibility + Project Context + Execution Map
a2ba590 feat: Gate 0.9 - Engine Integration (Manifest-First)
b09c9c8 feat: Gate 0.8 - Admin Baseline Completo (Config-First Real)
4a7b4d9 feat: Gate 0.75 - UI Patterns Parity (4pice Benchmark)
ec7d615 feat: Gate 0.7 - Layout AppShell
3788ba7 feat: Gate 0.65 - UI Baseline Alignment (ADR-005)
18b667e feat: Gate 0.6 - Design System implementation (light mode first)
0103ed5 docs: Gate 0.5 - Arquitetura de Informação + Contratos
b23afd1 feat: initial commit - Video Factory OS Fase 0
```
