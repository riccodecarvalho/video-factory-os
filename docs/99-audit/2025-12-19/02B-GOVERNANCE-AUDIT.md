# Governance & Standards Audit - 2025-12-18

## 1. NOMENCLATURA

### 1.1 Arquivos e Diretórios

| Padrão Esperado | Padrão Encontrado | Aderência | Exemplos de Violação |
|-----------------|-------------------|-----------|----------------------|
| kebab-case para pastas docs | NN-kebab-case | ✅ Aderente | - |
| PascalCase para componentes | PascalCase.tsx | ✅ Aderente | - |
| kebab-case para utilities | Misto (camelCase/kebab) | ⚠️ Parcial | `utils.ts` |
| Sessions: NNN-titulo-YYYY-MM-DD | Não encontrado | ⚠️ Não usado | Sessions diretamente em README |

### 1.2 Código
| Elemento | Padrão Documentado | Aderência | Observação |
|----------|-------------------|-----------|------------|
| Funções | camelCase + verbo | ✅ | `getJobs`, `runStep` |
| Handlers | handle prefix | ✅ | `handleSubmit` |
| Constantes | UPPER_SNAKE | ⚠️ | Nem sempre seguido |

### 1.3 Banco de Dados
| Elemento | Padrão | Aderência |
|----------|--------|-----------|
| Tabelas | snake_case | ✅ `knowledge_base` |
| Colunas | snake_case | ⚠️ Misto (`maxTokens` vs `max_tokens`) |

---

## 2. HIERARQUIA DE DIRETÓRIOS

### 2.1 Avaliação de Organização

| Aspecto | Status | Observação |
|---------|--------|------------|
| Separação clara de camadas | ✅ | app/, lib/, components/ bem separados |
| Colocation | ✅ | features agrupadas logicamente |
| Profundidade de aninhamento | ✅ | Max 4 níveis |
| Arquivos na raiz | ⚠️ | Tem tsconfig, package.json (normal) |
| **z-tmp com 78 arquivos** | 🔴 | **Problema - precisa limpeza** |
| z-archive | ⚠️ | Código legado, avaliar necessidade |

### 2.2 Diretórios Problemáticos

| Diretório | Problema | Ação Sugerida |
|-----------|----------|---------------|
| `z- tmp/` (78 arquivos) | Acúmulo de temporários | 🧹 Limpar ou arquivar |
| `z- archive/` | Código de referência legado | Manter apenas se necessário |

---

## 3. DOCUMENTAÇÃO

### 3.1 Cobertura

| Área | Documentada? | Atualizada? | Onde? |
|------|-------------|-------------|-------|
| Setup/Onboarding | ✅ | ✅ | `docs/00-regras/workflow-inicio.md` |
| Arquitetura | ✅ | ⚠️ | `docs/04-produto/architecture.md` |
| Features | ✅ | ⚠️ | `docs/02-features/` |
| Pipeline/Jobs | ✅ | ✅ | `docs/FLUXO-JOBS-STEPS-TABS.md` |
| Nomenclatura | ✅ | ✅ | `docs/00-regras/nomenclatura.md` |
| Troubleshooting | ✅ | ⚠️ | `docs/00-regras/operacao/troubleshooting.md` |

### 3.2 Qualidade da Documentação

| Critério | Atende? | Observação |
|----------|---------|------------|
| Índice/navegação clara | ✅ | `docs/index.md` existe |
| Exemplos práticos | ✅ | workflow-inicio tem exemplos |
| Diagramas visuais | ⚠️ | Poucos diagramas Mermaid |
| Versionada com código | ✅ | Tudo no Git |
| Docs órfãos/obsoletos | ⚠️ | Verificar `06-archive/` |

---

## 4. WORKFLOWS & PROCESSOS

### 4.1 Processos Documentados

| Processo | Existe? | Onde? | Seguido? |
|----------|---------|-------|----------|
| Início de sessão | ✅ | `workflow-inicio.md` | ✅ |
| Fechamento de sessão | ✅ | `workflow-inicio.md` | ⚠️ |
| Git flow | ✅ | `workflow-inicio.md` | ✅ |
| Conventional Commits | ✅ | `workflow-inicio.md` | ⚠️ |
| Prompts governance | ✅ | `workflow-inicio.md` | ✅ |
| Timeline logs | ✅ | `workflow-inicio.md` | ⚠️ Parcial |

### 4.2 Automações

| Automação | Existe? | Funciona? |
|-----------|---------|-----------|
| CI/CD | ❌ | - |
| Lint automático | ❌ | ESLint não configurado |
| Testes automáticos | ❌ | Não existe `npm test` |
| Deploy automático | ❌ | - |

---

## 5. ADRs (Architecture Decision Records)

### 5.1 ADRs Existentes

| ADR | Data | Título | Status |
|-----|------|--------|--------|
| 001 | 2025-12-13 | Stage Directions | Aceito |
| 004 | 2025-12-13 | Design System | Aceito |
| 005 | 2025-12-13 | UI Baseline 4pice Reference | Aceito |
| 006 | 2025-12-13 | UI Patterns Parity 4pice | Aceito |
| 007 | 2025-12-13 | Engine Execution Model | Aceito |
| 008 | 2025-12-13 | Project Context Execution Bindings | Aceito |
| 009 | 2025-12-16 | Azure TTS Zip Extraction | Aceito |
| 010 | 2025-12-16 | Projects Hub | Aceito |

**Total: 8 ADRs** (002 e 003 não existem - numeração pulou)

---

## 6. SCORE DE GOVERNANÇA

| Área | Score (0-10) | Peso | Weighted |
|------|-------------|------|----------|
| Nomenclatura | 8 | 2 | 16 |
| Hierarquia | 6 | 2 | 12 |
| Documentação | 8 | 3 | 24 |
| Workflows | 7 | 2 | 14 |
| ADRs | 9 | 1 | 9 |
| **TOTAL** | | **10** | **75/100** |

### Classificação: **BOM** (75/100)

O projeto tem boa governança documentada, mas falta:
- Automações (CI/CD, lint, tests)
- Limpeza de diretórios temporários
- Consistência total de nomenclatura

---

## Top 5 Ações Prioritárias de Governança

1. 🧹 **Limpar `z- tmp/`** (78 arquivos temporários)
2. ⚙️ **Configurar ESLint** (.eslintrc)
3. 🧪 **Adicionar testes básicos** (npm test)
4. 🔢 **Corrigir numeração de ADRs** (002, 003 faltando)
5. 📊 **Adicionar mais diagramas Mermaid** na documentação
