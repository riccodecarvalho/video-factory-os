# 📐 REGRAS E ORGANIZAÇÃO — Template para Novos Projetos

**Origem:** 4pice Studio (`video-save-guardian`)  
**Data de Exportação:** 2025-12-13  
**Propósito:** Usar como base para o Video Factory e outros projetos

---

# PARTE 1: PRINCÍPIOS FUNDAMENTAIS

## 🎯 Princípio Mestre

**Docs + Código + Timeline = fonte da verdade.**

| Componente | Define |
|------------|--------|
| **Regras/Setup** | "Como trabalhar" |
| **Timeline** | "O que foi feito / estado real" |
| **Git/Código** | "O que existe de fato" |

---

## 🤖 Regras de Comportamento (Obrigatórias para Agentes)

1. **Autonomia total:** executar e decidir tecnicamente
   - ❌ Proibido pedir para o usuário rodar comandos
   - ❌ Proibido "quer que eu faça A/B/C?"
   - ❌ NUNCA esperar aprovação para tarefas técnicas

2. **Sem achismo:** se o dado existe no repo, **validar no código**

3. **Entrega completa:** não finalizar com "parcial"; fechar com evidência

4. **Documentação viva:** toda sessão gera **Session Log** + atualiza **README do dia**

5. **Prompts de IA vêm do banco:** NUNCA hardcodar prompts no código

6. **Dados reais, NUNCA estimativas:** calcular antes de enviar para IA

7. **Idioma Obrigatório:** Toda comunicação (mensagens, pensamentos, reflexões, documentação) deve ser em **Português (Brasil)**. 🇧🇷

---

# PARTE 2: ESTRUTURA DE DIRETÓRIOS

## 📁 Estrutura Oficial de Docs

```
docs/
├── INDEX.md                    # Índice master
├── 00-REGRAS/                  # Regras e convenções
│   ├── WORKFLOW-INICIO.md      # Prompt inicial de sessão
│   ├── macro/                  # Metodologia, organização
│   ├── operacao/               # Regras operacionais
│   ├── checklists/             # Checklists de qualidade
│   └── aprendizados/           # Lições aprendidas
├── 01-setup/                   # Setup inicial do projeto
├── 02-features/                # Features documentadas
├── 03-development/             # Desenvolvimento e agentes
├── 04-emergency/               # ⭐ CRÍTICO - Playbooks
├── 05-timeline/                # Timeline cronológica
│   └── YYYY-MM-DD/             # Pasta por dia
│       ├── README.md           # Resumo do dia
│       └── sessions/           # Logs de sessão
└── 06-archive/                 # Arquivos antigos
```

---

## 📅 Timeline (Fonte da Verdade)

### Estrutura por Dia

```
docs/05-timeline/
└── 2025-12-13/
    ├── README.md               # Resumo do dia (OBRIGATÓRIO)
    └── sessions/
        ├── 001-feature-x-2025-12-13.md
        ├── 002-bugfix-y-2025-12-13.md
        └── 003-refactor-z-2025-12-13.md
```

### README do Dia (Template)

```markdown
# Timeline YYYY-MM-DD

## Sessions

| # | Session | Status | Commits |
|---|---------|--------|---------|
| 001 | [Nome da Session](sessions/001-nome-2025-12-13.md) | ✅ Completa | X |

## Resumo do Dia

**Foco:** Descrição do foco principal

### Entregas Principais
- ✅ Feature A
- ✅ Feature B

### Migrations Aplicadas
- `20251213XXXXXX_nome.sql`

### Build Status
✅ Todos os builds passando

### Git Status
✅ Todos os commits pushed para main

---
**Timeline covers up to:** `<SHA>`
```

### Session Log (Template)

```markdown
# 📅 SESSÃO YYYY-MM-DD - <Título>

**Horário:** HH:MM - HH:MM
**Foco:** <descrição curta>

## 🎯 Objetivo
...

## 🐛 Problemas Encontrados
...

## ✅ O que foi Implementado
...

## 📚 Lições Aprendidas
...

## 🔗 Commits
```
commit1 message
commit2 message
```

## ⏭️ Próximos Passos
...

---
**Timeline covers up to:** `<SHA FINAL>`
```

---

## 🔢 Convenções de Nomenclatura

### Pastas
| Tipo | Formato | Exemplo |
|------|---------|---------|
| Seções de docs | `NN-kebab-case` | `00-REGRAS`, `02-features` |
| Timeline | `YYYY-MM-DD` | `2025-12-13` |
| Features | `NN-nome` | `04-velocity`, `12-prompts` |

### Arquivos
| Tipo | Formato | Exemplo |
|------|---------|---------|
| Críticos | `MAIUSCULAS-HIFENS.md` | `EMERGENCY-PLAYBOOK.md` |
| Sessions | `NNN-NOME-YYYY-MM-DD.md` | `001-feature-x-2025-12-13.md` |
| Normais | `PascalCase` ou `kebab-case` | `README.md`, `database-schema.md` |

### Código
| Tipo | Formato | Exemplo |
|------|---------|---------|
| Components | `PascalCase.tsx` | `VideoCard.tsx` |
| Utilities | `camelCase.ts` | `videoService.ts` |
| Types | `PascalCase.types.ts` | `Video.types.ts` |
| Constants | `UPPER_SNAKE_CASE.ts` | `API_CONSTANTS.ts` |
| Edge Functions | `kebab-case/` | `videos-save/` |
| Variáveis | `camelCase` | `videoId` |
| Funções | verbo descritivo | `extractCleanVideoId()` |
| Handlers | `handle/on` prefix | `handleClick`, `onSubmit` |
| Predicates | `is/has/can` prefix | `isValid`, `hasPermission` |

### Numeração
| Tipo | Formato | Exemplo |
|------|---------|---------|
| Sessions | 3 dígitos | `001`, `002`, `050` |
| Features | 2 dígitos | `01`, `02`, `19` |

---

# PARTE 3: REGRAS OPERACIONAIS

## 🚀 Background Jobs (Operações Longas)

### Quando Usar
- **Toda operação de IA > 10 segundos** → Background Job
- **Processos que podem falhar** → Checkpoint + Retry
- **Operações paralelas** → Fila de jobs

### Padrão de Implementação

```typescript
// 1. Criar job no banco
const { data: job } = await db.insert('jobs', {
  status: 'processing',
  progress: 5,
  progress_message: 'Iniciando...'
});

// 2. Processar em background
processInBackground(job.id);

// 3. Retornar imediatamente
return { job_id: job.id, status: 'processing' };

// 4. Frontend faz polling
useEffect(() => {
  const interval = setInterval(async () => {
    const job = await db.get('jobs', jobId);
    if (job.status === 'completed') {
      clearInterval(interval);
      // usar job.output
    }
  }, 2000);
}, [jobId]);
```

### Schema de Jobs

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | processing | completed | failed
  input JSONB NOT NULL,
  output JSONB,
  error TEXT,
  progress INTEGER DEFAULT 0,     -- 0-100
  progress_message TEXT,
  created_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

---

## 📝 Prompts de IA (Governança)

### Regras Principais

1. ✅ Prompts no banco de dados (editáveis sem deploy)
2. ✅ Usar `getPromptOrThrow()` (falhar explícito se não existir)
3. ✅ Variáveis com `{{placeholder}}`
4. ❌ NUNCA hardcodar prompts no código
5. ❌ NUNCA usar fallback silencioso

### Schema de Prompts

```sql
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  
  system_prompt TEXT,
  user_prompt_template TEXT NOT NULL,
  
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  max_tokens INT DEFAULT 4096,
  temperature REAL DEFAULT 0.7,
  
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Helper Obrigatório

```typescript
// getPromptOrThrow - LANÇA ERRO se não existir
const promptConfig = await getPromptOrThrow(db, 'slug-do-prompt');

// replaceVariables - substitui {{variáveis}}
const prompt = replaceVariables(promptConfig.user_prompt_template, {
  title: 'Meu Título',
  content: 'Meu Conteúdo'
});

// Chamar LLM com config do banco
const response = await callLLM({
  model: promptConfig.model,
  max_tokens: promptConfig.max_tokens,
  prompt: prompt
});
```

---

## ✅ Checklist de Qualidade

### Antes de Começar
```
[ ] Entendi o problema raiz? (Não apenas o sintoma)
[ ] Verifiquei logs/diagnósticos?
[ ] Li as regras em docs/00-REGRAS/?
```

### Durante a Execução
```
[ ] Segurança: Estou expondo secrets? Respeitando RLS?
[ ] Performance: Query vai escalar? Loop necessário?
[ ] Tipagem: Evitei `any`? Types sincronizados?
[ ] Build: Projeto compila sem erros?
```

### Definition of Done
```
[ ] Código funciona
[ ] Migration aplicada (se houver)
[ ] Types regenerados (se migration)
[ ] UI reflete a mudança
[ ] Session log criado
[ ] README do dia atualizado
[ ] Commitado
```

---

## 🚨 Red Flags (Alertar Automaticamente)

```
🚨 Função > 50 linhas → quebrar em funções menores
🚨 Componente > 200 linhas → extrair subcomponentes
🚨 Arquivo > 500 linhas → modularizar
🚨 Magic numbers → criar constantes
🚨 Tipos `any` → tipar corretamente
🚨 console.log em produção → remover
🚨 Código duplicado → extrair para shared
```

---

# PARTE 4: METODOLOGIA DE TRABALHO

## 📋 Análise ANTES de Implementação

```
❌ ERRADO: Criar do zero sem analisar
✅ CERTO: 
   1. Analisar Git (commits relacionados)
   2. Procurar componentes existentes
   3. Verificar migrations
   4. Verificar funções existentes
   5. DEPOIS decidir o que fazer
```

## 🔄 Implementação Faseada

```
✅ "1 a 1, sem se perder, tudo documentado"
✅ MVP primeiro, depois expandir
✅ Cada fase CONCLUÍDA antes da próxima
✅ Commits frequentes (Conventional Commits)
```

## 📝 Conventional Commits

```bash
feat(scope): nova funcionalidade
fix(scope): correção de bug
docs: documentação
chore: manutenção
refactor(scope): refatoração
```

Exemplos:
- `feat(pipeline): adicionar etapa de TTS`
- `fix(render): corrigir timeout de FFmpeg`
- `docs: atualizar timeline 13/12`

---

# PARTE 5: WORKFLOW DE SESSÃO

## 🚀 Início de Sessão

```bash
# 1. Sync com remote
git fetch origin
git status

# 2. Verificar último dia na timeline
LAST_DAY=$(ls -1 docs/05-timeline/ | grep -E "^\d{4}-\d{2}-\d{2}$" | sort -r | head -1)
cat "docs/05-timeline/$LAST_DAY/README.md"

# 3. Ver últimos commits
git log --oneline -10

# 4. Verificar anchor SHA
# Timeline deve ter: **Timeline covers up to:** `<SHA>`
```

## 📝 Durante a Sessão

1. Criar session log em `docs/05-timeline/YYYY-MM-DD/sessions/`
2. Commitar frequentemente
3. Atualizar progresso no session log

## ✅ Fechamento de Sessão (OBRIGATÓRIO)

```bash
# 1. Verificar git status
git status

# 2. Commitar mudanças pendentes
git add .
git commit -m "docs: atualizar timeline"

# 3. Push para origin
git push origin main

# 4. Atualizar README do dia com SHA final
# **Timeline covers up to:** `<SHA>`
```

---

# PARTE 6: ERROS COMUNS A EVITAR

## ❌ NÃO FAÇA

1. Criar do zero sem analisar existente
2. Deixar documentação para depois
3. Pedir para usuário executar comandos
4. Implementar pela metade
5. Hardcodar prompts de IA
6. Usar fallback silencioso em prompts
7. Esquecer de atualizar timeline

## ✅ SEMPRE FAÇA

1. Verificar Git e código existente
2. Criar session log imediato
3. Executar comandos autonomamente
4. Commit frequente (Conventional Commits)
5. Prompts do banco com `getPromptOrThrow`
6. Atualizar timeline com SHA âncora
7. Fechar sessão com evidência

---

# PARTE 7: ADAPTAÇÃO PARA VIDEO FACTORY

## Estrutura Sugerida

```
video-factory/
├── docs/
│   ├── 00-REGRAS/
│   │   ├── WORKFLOW-INICIO.md
│   │   └── operacao/
│   ├── 01-setup/
│   ├── 02-features/
│   ├── 03-development/
│   ├── 04-emergency/
│   ├── 05-timeline/
│   └── ADR/                    # Architecture Decision Records
│
├── app/                        # Next.js App Router
├── lib/
│   ├── engine/                 # Job engine + checkpoints
│   ├── adapters/               # Claude, Azure, FFmpeg
│   └── prompts/                # Prompt governance
│
├── recipes/                    # Receitas por canal
│   └── graciela/
│
├── jobs/                       # Outputs (gitignored)
└── archive/                    # Referência (n8n + 4pice)
```

## Ajustes Específicos

1. **Timeline:** Manter exatamente igual (funciona muito bem)
2. **Prompts:** Adaptar schema para SQLite/Drizzle
3. **Jobs:** Usar mesmo padrão de background jobs
4. **Checkpoints:** Implementar cascata idempotente

---

**Este documento é a base para manter consistência entre projetos.** 📚

---

# PARTE 8: SINCRONIZAÇÃO DE DECISÕES (GOVERNANÇA)

## 📋 Onde Cada Tipo de Informação Deve Estar

| Tipo de Informação | Documento Correto | Por quê |
|--------------------|-------------------|---------|
| **Decisões Fundacionais** | `04-produto/prd.md` | São "verdades" do produto |
| **Arquitetura Técnica** | `04-produto/architecture.md` | Diagramas e stack |
| **Decisões Arquiteturais** | `01-adr/*.md` | Histórico formal de decisões |
| **Histórico de Sessões** | `05-timeline/` | Cronológico, append-only |
| **Lições Aprendidas** | `00-regras/operacao/troubleshooting.md` | Operacionais |
| **Evidências Mapeadas** | `05-timeline/{data}/mapeamento-*.md` | Referência histórica |

## 🔄 Regras de Sincronização

### Ao tomar uma decisão fundacional:
1. ✅ Registrar em `prd.md` (seção apropriada)
2. ✅ Se for arquitetural, criar/atualizar ADR
3. ✅ Atualizar `architecture.md` se mudar stack/camadas

### Ao encontrar problema/lição:
1. ✅ Adicionar em `troubleshooting.md`
2. ✅ Se for recorrente, criar seção dedicada

### Ao mudar status de módulo/funcionalidade:
1. ✅ Atualizar tabela dos 5 Módulos em `prd.md` seção 1.5

### Ao processar evidência externa (chat logs, etc):
1. ✅ Criar mapeamento em `05-timeline/{data}/mapeamento-*.md`
2. ✅ Extrair decisões para docs canônicos
3. ✅ Manter mapeamento como referência histórica

## ✅ Checklist de Governança (usar em toda sessão)

```markdown
[ ] Decisões novas estão no PRD ou ADR?
[ ] Lições aprendidas estão no troubleshooting?
[ ] Status dos 5 Módulos está atualizado?
[ ] Timeline tem SHA âncora atualizado?
[ ] Handover está completo?
```

## 📚 Docs de Referência (ler no início de sessão)

| Doc | Contém |
|-----|--------|
| `04-produto/prd.md` | Seções 1.4, 1.5, 2.5 (decisões fundacionais) |
| `04-produto/architecture.md` | Stack, 4 camadas, adapters |
| `00-regras/operacao/troubleshooting.md` | Lições aprendidas |
| `05-timeline/2025-12-13/README.md` | Handover e estado atual |

---

**Última atualização:** 2025-12-14 | SHA: `f842fcf`

