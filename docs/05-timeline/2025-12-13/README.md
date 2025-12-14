# Timeline 2025-12-13

> **Timeline covers up to:** `cbc62c5`

---

## Resumo do Dia

Dia focado em **foundational hardening** + **E2E real** do Video Factory OS. Estabelecemos:
- Execution Map como fonte da verdade para wiring
- Runner com effective config resolution
- Providers reais (Claude + Azure TTS)
- Auditoria de mudanças críticas
- UI Visibility (tabs Config e Artifacts)
- **E2E real com Azure Batch TTS** (41MB audio gerado)
- **5 fixes de produto** (voz única, audio streaming, UI erros, fixtures, docs)

---

## Gates Completados

### Gate 1.0 — Admin Visibility + Execution Map
- **SHA:** `e28e857`
- **O que:** Tabelas projects, execution_bindings. Página /admin/execution-map.

### Gate 1.1 — Hardening + Effective Config
- **SHA:** `41575e1`
- **O que:** StepCapabilities por kind. Runner resolve getEffectiveConfig.

### Gate 1.2 — Real Providers + Validators
- **SHA:** `3e803a4`
- **O que:** executeLLM (Claude), executeTTS (Azure), executeValidators.

### Gate 1.25 — Governance + Traceability
- **SHA:** `eca083a`
- **O que:** audit_events, Timeline viva, GitHub oficial.

### Gate 1.3 — UI Visibility
- **SHA:** `81754ae`
- **O que:** Job Detail tabs (Config, Artifacts), UsedBySection component.

### Gate 1.4 — E2E Test Pack
- **SHA:** `8f7b404`
- **O que:** Script E2E, Artifacts API, Admin Projects, Audit expandido.

### Gate 1.4.1 — Multi-Project UX Closure
- **SHA:** `2a41d91`
- **O que:** Project dropdown em /jobs/new, projectId em createJob.

### Gate 1.4.2 — Project Filter + E2E Real Execution
- **SHA:** `1146b8e`
- **O que:** Project filter em /jobs, E2E real execution com Claude.

### Gate 1.5 — Pipeline Bindings + TTS Fix (partial)
- **SHA:** `9b336b5`
- **O que:** Bindings para todos steps Graciela, fix extração texto para TTS.

### Gate 1.5.1 — Azure Batch TTS + COMPLETED E2E ✅
- **SHA:** `73f4dbc`
- **O que:** Implementação Azure Batch Synthesis API (PUT+poll+download), voice preset Ximena.
- **Resultado:** E2E COMPLETED, 419.2s, audio 41MB (~28 min)

### Gate 1.5.2 — 5 Fixes de Produto ✅
- **SHA:** `cbc62c5`
- **O que:**
  - A) Script Voz Única: parse_ssml limpa (voz:X), [PAUSA], SSML
  - B) Audio Streaming: Range headers + HTTP 206 support
  - C) UI Error Visibility: PipelineView mostra lastError
  - D) Placeholders: Fixture real + validação E2E
  - E) Documentação: docs/FLUXO-JOBS-STEPS-TABS.md

---

## Arquivos-Chave Criados/Modificados Hoje

| Arquivo | Gate | Descrição |
|---------|------|-----------|
| `lib/engine/providers.ts` | 1.5.1 | Azure Batch Synthesis API |
| `lib/engine/runner.ts` | 1.5.2 | executeStepTransform real (limpeza voz) |
| `app/api/artifacts/[...path]/route.ts` | 1.5.2 | Range + 206 Partial Content |
| `components/vf/PipelineView.tsx` | 1.5.2 | lastError display |
| `fixtures/graciela.input.json` | 1.5.2 | Input real em espanhol |
| `docs/FLUXO-JOBS-STEPS-TABS.md` | 1.5.2 | Documentação completa do fluxo |

---

## Evidence Snapshot

### git log --oneline -n 15
```
cbc62c5 (HEAD -> main, origin/main) fix: Gate 1.5.2 - 5 fixes de produto
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
```

### E2E Real Mode Output (Gate 1.5.1)
```
========================================
   E2E TEST SUMMARY
========================================
Job ID:          18f8290b-ddf6-4491-bfbb-56f722ab4654
Project:         Verdades de Graciela
Status:          completed ✅
Manifest:        ✅
Steps:           7
Logs:            15
Artifacts:       9
Duration:        419.2s
Stub Mode:       No
----------------------------------------
RESULT: ✅ ALL CHECKS PASSED
```

### Artifacts Gerados
```
artifacts/18f8290b.../
├── title/output.txt      (1.4KB)
├── brief/output.txt      (1.7KB)
├── script/output.txt     (30KB)
└── tts/audio.mp3         (41MB, ~28 min)
```

---

## Próximo Gate

**Gate 1.6 — Render + Export**
- Implementar step render (video generation)
- Implementar step export (pacote final)
- Ambos são stubs atualmente

---

## Decisões Importantes

1. **Azure Batch API** é o modo correto para TTS longo (conforme n8n)
2. **Voz única** (Ximena) - parse_ssml normaliza texto
3. **Range headers** obrigatórios para streaming de áudio
4. **Fixture real** em espanhol para testes E2E
5. **Documentação viva** - FLUXO-JOBS-STEPS-TABS.md

RESULT:          ✅ ALL CHECKS PASSED
```

