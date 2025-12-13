# 📚 Video Factory OS - Índice de Documentação

## Documentação Principal

| Doc | Descrição |
|-----|-----------|
| [PRD.md](./PRD.md) | Product Requirements Document completo |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura técnica e diagramas |
| [MILESTONES.md](./MILESTONES.md) | Checklist por fase |
| [QA-ACCEPTANCE.md](./QA-ACCEPTANCE.md) | Testes e Definition of Done |

## Regras e Decisões

| Doc | Descrição |
|-----|-----------|
| [00-REGRAS/](./00-REGRAS/) | Regras operacionais e workflows |
| [ADR/](./ADR/) | Architecture Decision Records |

### ADRs

| ADR | Título | Status |
|-----|--------|--------|
| [2025-12-13-ADR-001](./ADR/2025-12-13-ADR-001-stage-directions.md) | Stage Directions sem SSML/MD | Aceito |

## Estrutura do Repositório

```
video-factory-os/
├── docs/                    # ← Você está aqui
├── app/                     # Next.js App Router (UI + API)
├── lib/
│   ├── db/                  # Schema + migrations + seed
│   ├── engine/              # Job Engine + checkpoints
│   ├── adapters/            # Claude, Azure TTS, FFmpeg
│   ├── prompts/             # getPromptOrThrow, replaceVariables
│   └── validators/          # Validadores configuráveis
├── recipes/
│   └── graciela/            # Receita Graciela (assets + seed)
├── jobs/                    # Execuções (gitignored)
└── z- archive/              # Referência (n8n, 4pice legado)
```

## Config-First: O que vive no DB

| Tabela | Contém |
|--------|--------|
| `prompts` | Templates com variáveis, model config |
| `knowledge_base` | Docs por tier (sempre/contexto/demanda) |
| `recipes` | Pipeline + refs para presets |
| `presets_voice` | Voz Azure + prosody + style + role |
| `presets_video` | Encoder, scale, fps, bitrate |
| `presets_effects` | Filtergraph FFmpeg |
| `validators` | Regex, thresholds, regras como dados |
| `providers` | Claude, Azure, etc. (sem secrets) |

## Princípio Mestre

> **Nada hardcoded.** O código conhece schemas e chaves; executa configuração.
> Se falta config → falha explícita via `getPromptOrThrow()` ou similar.

## Timeline

Logs de sessão ficam em `docs/05-timeline/YYYY-MM-DD/`.
