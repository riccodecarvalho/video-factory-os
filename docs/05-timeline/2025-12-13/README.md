# Timeline 2025-12-13

> **Timeline covers up to:** `6452042`

---

## Resumo do Dia

Dia focado em **foundational hardening** + **E2E real** do Video Factory OS, cobrindo desde a **Paridade de UI** (0.7) até a **Execução Real** (1.5).

Estabelecemos:
- **UI Architecture:** Paridade visual com 4pice (Zero Glow, SplitView, PageHeader).
- **Admin Governance:** Telas de configuração reais (Prompts, Providers, Recipes).
- **Engine Foundation:** Runner manifest-first com execução sequencial.
- **Providers Reais:** Integração de ponta a ponta com Claude (LLM) e Azure Batch (TTS).
- **Fixes de Produto:** Voz única, Audio Streaming, UI Error Visibility.

---

## Gates Completados

### Gate 0.7 — Layout AppShell
- **SHA:** `ec7d615`
- **O que:** Estrutura base com Sidebar, Header e Breadcrumb.
- **Por que:** Necessário para suportar a navegação entre contextos (Jobs vs Admin).

### Gate 0.75 — UI Patterns Parity (4pice Benchmark)
- **SHA:** `4a7b4d9`
- **O que:** Componentes canônicos (`SplitView`, `PageHeader`, `SectionCards`, `EmptyState`, `FiltersBar`).
- **Por que:** Evitar drift visual. Decisão de "Glow Budget Zero" para manter a hierarquia limpa.
- **ADR:** [ADR-006](../../01-adr/2025-12-13-adr-006-ui-patterns-parity-4pice.md)

### Gate 0.8 — Admin Baseline Completo (Config-First Real)
- **SHA:** `b09c9c8`
- **O que:** Páginas Admin (Prompts, Recipes, Providers, Validators) conectadas ao DB.
- **Por que:** Eliminar hardcode. Tudo que o engine usa deve ser configurável via UI.
- **Mudanças:** Server actions CRUD, Seed de dados Graciela.

### Gate 0.9 — Engine Integration (Manifest-First)
- **SHA:** `a2ba590`
- **O que:** `runner.ts` sequencial + UI de Jobs (PipelineView, LogsViewer).
- **Por que:** O runner precisa ser a fonte da verdade da execução, persistindo estado no Manifest JSON.
- **ADR:** [ADR-007](../../01-adr/2025-12-13-adr-007-engine-execution-model.md)

### Gate 1.0 — Admin Visibility + Execution Map
- **SHA:** `e28e857`
- **O que:** Tabelas `projects`, `execution_bindings`. UI `/admin/execution-map`.
- **Por que:** Governança sobre o wiring (quem usa qual prompt/provider).
- **ADR:** [ADR-008](../../01-adr/2025-12-13-adr-008-project-context-execution-bindings.md)

### Gate 1.1 — Hardening + Effective Config
- **SHA:** `41575e1`
- **O que:** `StepCapabilities`, resolução de `getEffectiveConfig` no runner.
- **Por que:** Garantir que o runner saiba exatamente qual configuração usar antes de executar.

### Gate 1.2 — Real Providers + Validators
- **SHA:** `3e803a4`
- **O que:** Implementação real de `executeLLM` (Claude) e `executeTTS` (Azure).
- **Por que:** Sair do modo stub. Validadores bloqueiam execução se inputs forem inválidos.

### Gate 1.25 — Governance + Traceability
- **SHA:** `eca083a`
- **O que:** `audit_events`, Timeline viva, `GitHub` resource.
- **Por que:** Rastreabilidade é pré-requisito para escalar.

### Gate 1.3 — UI Visibility
- **SHA:** `81754ae`
- **O que:** Tabs `Config` (snapshot) e `Artifacts` (files) no Job Detail.
- **Por que:** Admin precisa ver o input/output real sem acessar o servidor.

### Gate 1.4 — E2E Test Pack
- **SHA:** `8f7b404`
- **O que:** Script `npm run vf:e2e`, Artifacts API.
- **Por que:** Automação de testes de fluxo completo (criação -> execução -> validação).

### Gate 1.4.1 — Multi-Project UX Closure
- **SHA:** `2a41d91`
- **O que:** Dropdown de projetos na criação de jobs.
- **Por que:** Suporte a múltiplos canais (Graciela, etc) na mesma instância.

### Gate 1.4.2 — Project Filter + E2E Real Execution
- **SHA:** `1146b8e`
- **O que:** Filtro por projeto na lista de jobs. E2E real com providers.

### Gate 1.5 — Pipeline Bindings + TTS Fix
- **SHA:** `9b336b5`
- **O que:** Bindings completos para Graciela. Fix na extração de texto para TTS.

### Gate 1.5.1 — Azure Batch TTS + COMPLETED E2E ✅
- **SHA:** `73f4dbc`
- **O que:** Implementação Azure Batch Synthesis API (PUT -> poll -> download).
- **Por que:** Realtime API falha com textos longos (>10min). Batch é mandatório para narrativas.
- **Resultado:** E2E completo em ~7min, gerando 41MB de áudio.

### Gate 1.5.2 — 5 Fixes de Produto ✅
- **SHA:** `cbc62c5`
- **O que:**
  1. **Script Voz Única:** `parse_ssml` limpa tags de voz/pausa.
  2. **Audio Streaming:** Headers `Range` / `HTTP 206` na API.
  3. **UI Error Visibility:** `lastError` visível no PipelineStep.
  4. **Placeholders:** Fixture real e validação de `{{ }}` no outputs.
  5. **Docs:** `FLUXO-JOBS-STEPS-TABS.md`.

---

## ADRs Criados

| ID | Título | Link |
|----|--------|------|
| ADR-005 | UI Baseline (4pice Reference) | [Link](../../01-adr/2025-12-13-adr-005-ui-baseline-4pice-reference.md) |
| ADR-006 | UI Patterns Parity | [Link](../../01-adr/2025-12-13-adr-006-ui-patterns-parity-4pice.md) |
| ADR-007 | Engine Execution Model | [Link](../../01-adr/2025-12-13-adr-007-engine-execution-model.md) |
| ADR-008 | Project Context + Bindings | [Link](../../01-adr/2025-12-13-adr-008-project-context-execution-bindings.md) |

---

## Decisões Importantes

1.  **Config-First Enforced:** Nenhum hardcode de prompt, provider ou preset. Tudo vem do DB.
2.  **Manifest Source of Truth:** O estado do job é o JSON do manifest, não colunas soltas.
3.  **UI 4pice Baseline:** "Zero Glow". Hierarquia por layout (SplitView) e tipografia.
4.  **Batch TTS:** Para vídeos longos, usar apenas Azure Batch API (não Realtime).
5.  **Audit Trail:** Mudanças críticas geram logs de auditoria.

---

## Arquivos-Chave Criados/Modificados

| Arquivo | Gate | Descrição |
|---------|------|-----------|
| `components/layout/AppShell.tsx` | 0.7 | Layout base |
| `components/vf/JobDetail.tsx` | 0.9 | UI principal de Jobs |
| `lib/engine/runner.ts` | 0.9 / 1.5.2 | Engine de execução |
| `app/admin/execution-map/` | 1.0 | Governança de wiring |
| `lib/engine/providers.ts` | 1.2 / 1.5.1 | Integração Claude e Azure |
| `docs/FLUXO-JOBS-STEPS-TABS.md` | 1.5.2 | Documentação de fluxo |

---

## Próximo Gate

**Gate 1.6 — Render + Export (Stubs Reais)**
- Implementar `executeStepRender` (vídeo)
- Implementar `executeStepExport` (pacote final)
- Integração com FFmpeg local (próxima fase)

---

## Evidence Snapshot

### git log --oneline -n 20
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
```
