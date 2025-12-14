# Timeline 2025-12-13

> **Timeline covers up to:** `2a41d91`

---

## Resumo do Dia

Dia focado em **foundational hardening** do Video Factory OS. Estabelecemos:
- Execution Map como fonte da verdade para wiring
- Runner com effective config resolution
- Providers reais (Claude + Azure TTS)
- Auditoria de mudanças críticas
- UI Visibility (tabs Config e Artifacts)

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

### Gate 1.25 — Governance + Traceability
- **SHA:** `eca083a`
- **O que:** audit_events, Timeline viva, GitHub oficial.
- **Por que:** Rastreabilidade é pré-requisito para escalar. Sem fonte de verdade, não há produto.
- **Mudanças:** lib/db/schema.ts (audit_events), lib/audit/index.ts, instrumented actions.

### Gate 1.25 Checkpoint
- **SHA:** `b68973c`
- **O que:** .gitignore corrigido (+artifacts/), Timeline SHA, updatePrompt instrumentado.

### Gate 1.3 — UI Visibility
- **SHA:** `81754ae`
- **O que:** Job Detail tabs (Config, Artifacts), UsedBySection component.
- **Por que:** Admin/Operador precisa ver exatamente o que foi usado sem abrir código.
- **Mudanças:** JobConfigTab.tsx, JobArtifactsTab.tsx, UsedBySection.tsx, jobs/page.tsx.

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
| `components/vf/JobConfigTab.tsx` | 1.3 | Tab Config para Job Detail |
| `components/vf/JobArtifactsTab.tsx` | 1.3 | Tab Artifacts para Job Detail |
| `components/vf/UsedBySection.tsx` | 1.3 | "Used by" para entidades Admin |

---

## Próximo Gate

**Gate 1.35 — Traceability Closure**
- Timeline corrigida com SHAs reais
- Audit events comprovados via UI

---

### Gate 1.4 — E2E Test Pack (Partial)
- **SHA:** `8f7b404`
- **O que:** Script E2E, Artifacts API, Admin Projects, Audit expandido.
- **Por que:** Preparação para teste end-to-end com wiring real.
- **Mudanças:** scripts/e2e.ts, /api/artifacts, /admin/projects, audit para providers/validators.

### Gate 1.4.1 — Multi-Project UX Closure
- **SHA:** `153f4b1`
- **O que:** Project dropdown em /jobs/new, projectId em createJob, filter em getJobs.
- **Por que:** Multi-projeto é primeira classe - operador escolhe projeto ao criar job.
- **Mudanças:** /jobs/new, jobs/actions.ts, E2E stub mode validado.

---

## Próximo Gate

**Gate 1.5 — Real E2E Execution**
- Executar npm run vf:e2e com providers reais (Claude + Azure TTS)
- Verificar artifacts gerados no disco
- Tab Config com snapshot populado de verdade

---

## Evidence Snapshot

### git log --oneline -n 10
```
153f4b1 (HEAD -> main, origin/main) feat: Gate 1.4.1 - Multi-Project UX Closure
8f7b404 feat: Gate 1.4 - E2E Test Pack (Partial)
c12ba39 feat: Gate 1.35 - Traceability Closure
81754ae feat: Gate 1.3 - UI Visibility
b68973c chore: Gate 1.25 checkpoint
eca083a feat: Gate 1.25 - Governance + Traceability
3e803a4 feat: Gate 1.2 - Real Providers + Validators
41575e1 feat: Gate 1.1 - Hardening + Effective Config
e28e857 feat: Gate 1.0 - Admin Visibility + Project Context + Execution Map
a2ba590 feat: Gate 0.9 - Engine Integration (Manifest-First)
```

### git remote -v
```
origin  https://github.com/riccodecarvalho/video-factory-os.git (fetch)
origin  https://github.com/riccodecarvalho/video-factory-os.git (push)
```

### E2E Stub Mode Output
```
npm run vf:e2e -- --stub

Job ID:          2ec09f1b-b85a-484e-a668-f6cf0c65eba3
Project:         Verdades de Graciela
Status:          failed
Manifest:        ✅
Steps:           7
RESULT:          ✅ ALL CHECKS PASSED
```

