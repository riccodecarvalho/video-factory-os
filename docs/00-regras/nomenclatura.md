# Padrões de Nomenclatura - Video Factory OS

> **Este documento é lei.** Seguir em 100% das sessões.

---

## Pastas

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Seções de docs | `NN-kebab-case` | `00-regras`, `04-produto` |
| Timeline | `YYYY-MM-DD` | `2025-12-13` |
| Componentes React | `pasta-feature/` | `components/vf/` |

---

## Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Documentos | `kebab-case.md` | `workflow-inicio.md` |
| Sessions | `NNN-titulo-YYYY-MM-DD.md` | `001-bootstrap-2025-12-13.md` |
| ADRs | `YYYY-MM-DD-adr-NNN-slug.md` | `2025-12-13-adr-001-stage-directions.md` |
| Componentes React | `PascalCase.tsx` | `JobCard.tsx` |
| Utilities | `camelCase.ts` | `jobRunner.ts` |
| Types | `kebab-case.types.ts` | `job.types.ts` |
| Constants | `UPPER_SNAKE.ts` | `JOB_STATUS.ts` |

---

## Código

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Variáveis | `camelCase` | `jobId`, `stepIndex` |
| Funções | `camelCase + verbo` | `getJobById()`, `runStep()` |
| Handlers | `handle` prefix | `handleSubmit`, `handleRetry` |
| Predicates | `is/has/can` prefix | `isRunning`, `hasError` |
| Constantes | `UPPER_SNAKE` | `MAX_RETRIES`, `API_URL` |

---

## Numeração

| Tipo | Dígitos | Exemplo |
|------|---------|---------|
| Sessions | 3 | `001`, `042`, `100` |
| ADRs | 3 | `001`, `015` |
| Features docs | 2 | `01`, `12` |
| Seções docs | 2 | `00`, `05` |

---

## Estrutura de Docs (Definitiva)

```
docs/
├── index.md                    # Índice master
├── 00-regras/                  # Regras e convenções
│   ├── workflow-inicio.md
│   └── nomenclatura.md         # Este arquivo
├── 01-adr/                     # Architecture Decision Records
├── 02-features/                # Features documentadas
├── 03-development/             # Dev docs, DS
├── 04-produto/                 # PRD, arquitetura, milestones
├── 05-timeline/                # Timeline cronológica
│   └── YYYY-MM-DD/
│       ├── README.md
│       └── sessions/
└── 06-archive/                 # Arquivos antigos
```

---

## Checklist de Validação (Início de Sessão)

```
[ ] Pastas em docs/ são NN-kebab-case (minúsculas)
[ ] Arquivos .md são kebab-case.md (minúsculas)
[ ] Componentes React são PascalCase.tsx
[ ] Sessions são NNN-titulo-YYYY-MM-DD.md
[ ] ADRs são YYYY-MM-DD-adr-NNN-slug.md
[ ] Nenhum arquivo solto na raiz de docs/
```

---

**Criado em:** 2025-12-13  
**Última atualização:** 2025-12-13
