# 01-REPO-MAP (Mapa do Repositório)

**Data:** 2025-12-19

## Estrutura de Diretórios
```
/
├── app/                        # Next.js App Router
│   ├── api/                    # API Endpoints
│   │   ├── artifacts/          # Serving output files
│   │   └── health/             # Healthcheck
│   └── (dashboard)/            # Frontend Pages (estimado)
├── components/                 # React Components (UI Library)
├── docs/                       # Documentação (Fonte da Verdade)
│   ├── 00-regras/              # Workflows e Governança
│   ├── 04-produto/             # PRD, Architecture
│   ├── 05-timeline/            # Histórico de Sessões
│   └── 99-audit/               # [NOVO] Auditoria Big 4
├── lib/                        # Core Logic
│   ├── audit/                  # ?
│   ├── db/                     # Drizzle Schema/Migrations/Seed
│   ├── engine/                 # Job Execution Engine (Sequencer, Runners)
│   ├── prompts/                # Prompt Management
│   ├── transformers/           # Data transformation (Normalizers)
│   ├── types/                  # TypeScript definitions
│   └── utils.ts                # Shared utilities
├── recipes/                    # JSON Configuration files for Pipelines
├── scripts/                    # Automation & Maintenance scripts
└── [Config Files]              # package.json, next.config.js, tsconfig.json, etc.
```

## Arquivos Críticos Detectados
- `package.json`: Definição de scripts e dependências.
- `lib/db/schema.ts`: Definição do modelo de dados.
- `lib/engine/runner.ts`: Executor principal de jobs.
- `scripts/e2e.ts`: Script de validação geral.
- `docs/00-regras/workflow-inicio.md`: Regra suprema de operação.
- `docs/04-produto/prd.md`: Especificação do Produto.

## Análise de Cobertura
- **Testes:** Não há pasta `test/` ou `__tests__` na raiz. A validação parece depender de `scripts/e2e.ts`.
- **Server Actions:** Não localizados explicitamente na varredura inicial (provavelmente dentro de `app/` ou `lib/actions.ts` se existir - a verificar).
