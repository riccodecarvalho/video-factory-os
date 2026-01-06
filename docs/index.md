# 📚 Video Factory OS - Índice de Documentação

> **Última Atualização:** 2025-12-22 | **SHA:** `8f439a5`

---

## 📖 Documentação Principal

| Doc | Descrição | Status |
|-----|-----------|--------|
| [prd.md](./04-produto/prd.md) | Product Requirements Document | ✅ Atualizado |
| [architecture.md](./04-produto/architecture.md) | Arquitetura técnica e diagramas | ✅ Atualizado |
| [SYSTEM-MAP.md](./SYSTEM-MAP.md) | **Mapa completo do sistema** | 🆕 Novo |
| [milestones.md](./04-produto/milestones.md) | Checklist por fase | ✅ Atualizado |
| [qa-acceptance.md](./04-produto/qa-acceptance.md) | Testes e Definition of Done | ✅ |
| [backlog.md](./04-produto/backlog.md) | ⭐ Melhorias pendentes | 🆕 Novo |

---

## 📁 Estrutura de Documentação

```
docs/
├── index.md                    # ← Você está aqui
├── 00-regras/                  # Regras e convenções
│   ├── workflow-inicio.md      # Prompt inicial de sessão
│   ├── nomenclatura.md         # Convenções de nomes
│   └── operacao/               # Troubleshooting, manuais
├── 01-adr/                     # Architecture Decision Records
├── 02-features/                # Features documentadas
├── 03-development/             # UI Reference, Design System
├── 04-produto/                 # PRD, Architecture, Milestones
├── 05-timeline/                # Timeline cronológica por dia
│   └── YYYY-MM-DD/             # Pasta por dia
├── 06-archive/                 # Arquivos arquivados
└── 99-audit/                   # Auditorias e relatórios
```

---

## 🏛️ ADRs (Architecture Decision Records)

| Data | ADR | Título | Status |
|------|-----|--------|--------|
| 2025-12-13 | [ADR-001](./01-adr/2025-12-13-adr-001-stage-directions.md) | Stage Directions sem SSML/MD | ✅ Aceito |
| 2025-12-13 | [ADR-004](./01-adr/2025-12-13-adr-004-design-system.md) | Design System | ✅ Aceito |
| 2025-12-13 | [ADR-005](./01-adr/2025-12-13-adr-005-ui-baseline-4pice-reference.md) | UI Baseline 4pice | ✅ Aceito |
| 2025-12-13 | [ADR-006](./01-adr/2025-12-13-adr-006-ui-patterns-parity-4pice.md) | UI Patterns Parity | ✅ Aceito |
| 2025-12-13 | [ADR-007](./01-adr/2025-12-13-adr-007-engine-execution-model.md) | Engine Execution Model | ✅ Aceito |
| 2025-12-13 | [ADR-008](./01-adr/2025-12-13-adr-008-project-context-execution-bindings.md) | Project Context + Bindings | ✅ Aceito |
| 2025-12-16 | [ADR-009](./01-adr/2025-12-16-adr-009-azure-tts-zip-extraction.md) | Azure TTS ZIP Extraction | ✅ Aceito |
| 2025-12-16 | [ADR-010](./01-adr/2025-12-16-adr-010-projects-hub.md) | Projects Hub | ✅ Aceito |
| 2025-12-19 | [ADR-011](./01-adr/2025-12-19-adr-011-wizard-mode.md) | Wizard Mode | ✅ Aceito |
| 2025-12-19 | [ADR-012](./01-adr/2025-12-19-adr-012-backup-sqlite.md) | Backup SQLite | ✅ Aceito |
| 2025-12-22 | [ADR-013](./01-adr/2025-12-22-adr-013-timeline-dsl-renderplan.md) | Timeline DSL + RenderPlan | ✅ Aceito |
| 2025-12-22 | [ADR-014](./01-adr/2025-12-22-adr-014-render-farm-strategy.md) | Render Farm Strategy | ✅ Aceito |
| 2025-12-22 | [ADR-015](./01-adr/2025-12-22-adr-015-short-form-profiles.md) | Short-form Profiles | ✅ Aceito |

---

## 🎬 Status dos 5 Módulos

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Project Manager** | Projetos, episódios, presets, biblioteca | ✅ Parcial (Admin) |
| **Script Studio** | Editor de roteiro, segmentação | ⏳ Não implementado |
| **Voice Lab** | Editor SSML, preview, TTS | ⏳ Não implementado |
| **Video Factory** | Composição, render FFmpeg | ✅ Parcial (runner) |
| **Dashboard** | Lista de jobs, logs, re-run | ✅ Implementado |

---

## 🆕 Features Recentes

| Feature | Data | ADR |
|---------|------|-----|
| **Timeline DSL** | 2025-12-22 | [ADR-013](./01-adr/2025-12-22-adr-013-timeline-dsl-renderplan.md) |
| **Render Engine Evolution** | 2025-12-22 | [ADR-014](./01-adr/2025-12-22-adr-014-render-farm-strategy.md) |
| **Short-form Profiles** | 2025-12-22 | [ADR-015](./01-adr/2025-12-22-adr-015-short-form-profiles.md) |
| **Wizard Mode** | 2025-12-19 | [ADR-011](./01-adr/2025-12-19-adr-011-wizard-mode.md) |
| **Backup SQLite** | 2025-12-19 | [ADR-012](./01-adr/2025-12-19-adr-012-backup-sqlite.md) |

---

## 📊 Config-First: O que vive no DB

| Tabela | Contém |
|--------|--------|
| `prompts` | Templates com variáveis, model config |
| `knowledge_base` | Docs por tier (sempre/contexto/demanda) |
| `recipes` | Pipeline + refs para presets |
| `presets_voice` | Voz Azure + prosody + style + role |
| `presets_video` | Encoder, scale, fps, bitrate |
| `presets_effects` | Filtergraph FFmpeg |
| `validators` | Regex, thresholds, regras como dados |
| `providers` | Claude, Azure, etc. |

---

## 🔗 Links Rápidos

| Categoria | Link |
|-----------|------|
| **Workflow de Início** | [workflow-inicio.md](./00-regras/workflow-inicio.md) |
| **Troubleshooting** | [troubleshooting.md](./00-regras/operacao/troubleshooting.md) |
| **Timeline Atual** | [2025-12-22](./05-timeline/2025-12-22/README.md) |
| **Auditoria Big 4** | [99-audit](./99-audit/) |

---

## 🎯 Princípio Mestre

> **Nada hardcoded.** O código conhece schemas e chaves; executa configuração.
> Se falta config → falha explícita via `getPromptOrThrow()` ou similar.
