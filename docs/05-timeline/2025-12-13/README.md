# Timeline 2025-12-13

> **SHA Âncora:** `9895db5` (Gate 1.25 - Governance + Traceability)

---

## Resumo do Dia

Dia focado em **foundational hardening** do Video Factory OS. Estabelecemos:
- Execution Map como fonte da verdade para wiring
- Runner com effective config resolution
- Providers reais (Claude + Azure TTS)
- Auditoria de mudanças críticas

---

## Gates Completados

### Gate 1.0 — Admin Visibility + Execution Map
- **SHA:** `e28e857`
- **O que:** Tabelas projects, execution_bindings. Página /admin/execution-map.
- **Por que:** Precisávamos de governança sobre wiring (qual prompt/provider/preset cada step usa).
- **ADR:** [ADR-008](../../01-adr/2025-12-13-adr-008-project-context-execution-bindings.md)

### Gate 1.1 — Hardening + Effective Config
- **SHA:** `41575e1`
- **O que:** StepCapabilities por kind. Runner resolve getEffectiveConfig. Manifest v2.0.
- **Por que:** Slots filtrados por kind eliminam drift. Config snapshot garante auditoria.
- **Mudanças:** lib/engine/capabilities.ts, runner phase 2, execution-map UI filtering.

### Gate 1.2 — Real Providers + Validators
- **SHA:** `3e803a4`
- **O que:** executeLLM (Claude), executeTTS (Azure), executeValidators. Manifest v3.0.
- **Por que:** Sair de stubs para produção real. Validators bloqueiam execução quando falham.
- **Mudanças:** lib/engine/providers.ts, runner phase 3, artifact storage.

### Gate 1.25 — Governance + Traceability (em andamento)
- **SHA:** TBD
- **O que:** audit_events, Timeline viva, GitHub oficial.
- **Por que:** Rastreabilidade é pré-requisito para escalar. Sem fonte de verdade, não há produto.
- **Mudanças:** lib/db/schema.ts (audit_events), lib/audit/index.ts, instrumented actions.

---

## ADRs Criados

| ID | Título | Link |
|----|--------|------|
| ADR-008 | Project Context + Execution Bindings | [Link](../../01-adr/2025-12-13-adr-008-project-context-execution-bindings.md) |

---

## Decisões Importantes

1. **Config-First enforced:** Nenhum hardcode de prompt, provider, preset ou validator.
2. **Manifest como fonte de verdade:** Cada job registra snapshot completo da config usada.
3. **StepCapabilities:** Slots são filtrados por kind para evitar bindings inválidos.
4. **Audit events:** Mudanças críticas no Admin são registradas para rastreabilidade.

---

## Arquivos-Chave Criados

| Arquivo | Gate | Descrição |
|---------|------|-----------|
| `lib/db/schema.ts` | 1.0 | +projects, +execution_bindings, +audit_events |
| `lib/engine/capabilities.ts` | 1.1 | StepCapabilities por kind |
| `lib/engine/providers.ts` | 1.2 | Claude LLM, Azure TTS, Validators |
| `lib/engine/runner.ts` | 1.2 | Phase 3 com real providers |
| `lib/audit/index.ts` | 1.25 | Audit service |
| `app/admin/execution-map/` | 1.0 | UI de governança de bindings |

---

## Próximo Gate

**Gate 1.3 — UI Visibility**
- Job Detail Tab "Config" com snapshot navegável
- Job Detail Tab "Artifacts" com links
- Admin "Used by" para entidades
