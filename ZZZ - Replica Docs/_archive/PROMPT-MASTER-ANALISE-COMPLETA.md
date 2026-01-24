# 🎯 PROMPT MASTER - Análise Completa do Video Factory OS

> **Objetivo:** Prompt estruturado para extrair TODA informação necessária para replicação completa do sistema.
> 
> **Como usar:** Copie este prompt para o início de uma nova conversa com IA para fazer a análise exaustiva.

---

## 📋 PROMPT PARA COPIAR

```markdown
# MISSÃO: Análise Exaustiva do Video Factory OS para Replicação Completa

## CONTEXTO
Você é um arquiteto de software sênior com a missão de documentar COMPLETAMENTE o sistema Video Factory OS para que ele possa ser replicado em outro ambiente com 100% de fidelidade.

O repositório está em: /Users/riccodecarvalho/IDEs/video-factory-os

## OBJETIVO
Criar documentação COMPLETA e PRÁTICA que permita replicar o sistema sem depender de conhecimento prévio ou documentação desatualizada.

## REGRAS DE EXECUÇÃO
1. **Analise APENAS o código real** - Não confie em docs que podem estar desatualizados
2. **Documente TUDO que existe** - Inclusive o que está parcialmente implementado
3. **Seja EXAUSTIVO** - Melhor documentar demais do que de menos
4. **Use EXEMPLOS reais** - Extraia do código, não invente
5. **Identifique GAPS** - O que falta, o que está quebrado, o que precisa melhorar

---

## CHECKLIST DE ANÁLISE (Execute na ordem)

### FASE 1: MAPEAMENTO ESTRUTURAL

#### 1.1 Estrutura de Diretórios
- [ ] Listar TODOS os diretórios do projeto
- [ ] Explicar a função de cada pasta
- [ ] Identificar padrões de organização
- [ ] Mapear onde ficam configs, código, assets, docs

#### 1.2 Dependências
- [ ] Analisar package.json completo
- [ ] Listar TODAS as dependências (prod e dev)
- [ ] Identificar versões críticas
- [ ] Documentar dependências de sistema (FFmpeg, etc.)

#### 1.3 Variáveis de Ambiente
- [ ] Listar TODAS as variáveis de .env.example
- [ ] Documentar onde cada uma é usada
- [ ] Identificar quais são obrigatórias vs opcionais
- [ ] Explicar como obter cada API key

---

### FASE 2: BANCO DE DADOS

#### 2.1 Schema Completo
- [ ] Analisar lib/db/schema.ts
- [ ] Documentar TODAS as tabelas
- [ ] Documentar TODOS os campos de cada tabela
- [ ] Documentar tipos e constraints
- [ ] Identificar relacionamentos (FKs)

#### 2.2 Migrations
- [ ] Listar todas as migrations existentes
- [ ] Documentar ordem de execução
- [ ] Identificar breaking changes

#### 2.3 Seed Data
- [ ] Analisar lib/db/seed.ts
- [ ] Documentar dados iniciais necessários
- [ ] Identificar dados de exemplo vs dados obrigatórios

#### 2.4 Queries e Patterns
- [ ] Identificar padrões de query usados
- [ ] Documentar joins frequentes
- [ ] Listar indexes necessários

---

### FASE 3: BACKEND / ENGINE

#### 3.1 Engine Principal
- [ ] Analisar lib/engine/runner.ts COMPLETAMENTE
- [ ] Documentar fluxo de execução de jobs
- [ ] Identificar todos os estados possíveis
- [ ] Mapear tratamento de erros

#### 3.2 Executores
- [ ] Analisar CADA arquivo em lib/engine/executors/
- [ ] Documentar input/output de cada executor
- [ ] Mapear dependências entre executores
- [ ] Identificar pontos de falha

#### 3.3 Providers
- [ ] Analisar lib/engine/providers.ts
- [ ] Documentar integração com Claude
- [ ] Documentar integração com Azure TTS
- [ ] Documentar SSML generation
- [ ] Mapear retry logic e error handling

#### 3.4 FFmpeg Integration
- [ ] Analisar lib/engine/ffmpeg.ts
- [ ] Documentar comandos FFmpeg usados
- [ ] Listar presets de encoding
- [ ] Identificar fallbacks (VideoToolbox → libx264)

#### 3.5 Adapters
- [ ] Analisar lib/adapters/imagefx.ts
- [ ] Documentar integração com ImageFX
- [ ] Documentar sanitização de prompts
- [ ] Identificar limitações da API

#### 3.6 Timeline DSL
- [ ] Analisar lib/timeline/ COMPLETAMENTE
- [ ] Documentar schema de Timeline
- [ ] Documentar processo de compilação
- [ ] Documentar RenderPlan

---

### FASE 4: FRONTEND

#### 4.1 Páginas (App Router)
- [ ] Listar TODAS as rotas em app/
- [ ] Documentar função de cada página
- [ ] Identificar layouts e nested routes
- [ ] Mapear loading/error states

#### 4.2 Componentes
- [ ] Listar TODOS os componentes em components/
- [ ] Categorizar: layout, ui, vf
- [ ] Documentar props de cada componente
- [ ] Identificar componentes reutilizáveis

#### 4.3 Hooks Customizados
- [ ] Buscar todos os hooks customizados
- [ ] Documentar cada hook
- [ ] Identificar dependências

#### 4.4 Server Actions
- [ ] Analisar app/admin/actions.ts COMPLETAMENTE
- [ ] Analisar app/jobs/actions.ts COMPLETAMENTE
- [ ] Documentar TODAS as funções exportadas
- [ ] Mapear fluxos de dados

#### 4.5 Design System
- [ ] Documentar padrões visuais
- [ ] Listar cores, fontes, espaçamentos
- [ ] Identificar componentes shadcn usados
- [ ] Documentar customizações do Tailwind

---

### FASE 5: APIs E INTEGRAÇÕES

#### 5.1 API Routes
- [ ] Listar TODAS as rotas em app/api/
- [ ] Documentar endpoints, métodos, payloads
- [ ] Identificar autenticação/autorização
- [ ] Documentar respostas de erro

#### 5.2 Integrações Externas
- [ ] Claude (Anthropic): modelo, tokens, temperatura
- [ ] Azure Speech: vozes, SSML, batch vs realtime
- [ ] ImageFX: limitações, cookies, sanitização
- [ ] FFmpeg: comandos, presets, hardware accel

---

### FASE 6: FLUXOS E REGRAS DE NEGÓCIO

#### 6.1 Fluxo de Job
- [ ] Documentar ciclo de vida completo
- [ ] Estados: pending → running → completed/failed
- [ ] Retry logic e checkpoints
- [ ] Idempotência

#### 6.2 Sistema de Bindings
- [ ] Documentar execution_bindings
- [ ] Explicar resolução de config (project → global)
- [ ] Mapear slots disponíveis
- [ ] Documentar prioridades

#### 6.3 Sistema de Recipes
- [ ] Documentar estrutura de pipeline
- [ ] Listar steps disponíveis
- [ ] Mapear dependências entre steps
- [ ] Documentar validadores por step

#### 6.4 Knowledge Base
- [ ] Documentar sistema de tiers
- [ ] Explicar quando cada tier é usado
- [ ] Documentar como KB é injetado nos prompts

---

### FASE 7: SCRIPTS E FERRAMENTAS

#### 7.1 NPM Scripts
- [ ] Documentar TODOS os scripts do package.json
- [ ] Explicar uso de cada um
- [ ] Identificar scripts de desenvolvimento vs produção

#### 7.2 Scripts Utilitários
- [ ] Analisar scripts/ COMPLETAMENTE
- [ ] Documentar cada script
- [ ] Identificar scripts de migration, seed, backup

#### 7.3 Backup/Restore
- [ ] Documentar scripts/backup.sh
- [ ] Documentar scripts/restore.sh
- [ ] Identificar o que é incluído no backup

---

### FASE 8: CONFIGURAÇÕES

#### 8.1 Next.js Config
- [ ] Analisar next.config.js
- [ ] Documentar configurações customizadas
- [ ] Identificar otimizações

#### 8.2 Tailwind Config
- [ ] Analisar tailwind.config.ts
- [ ] Documentar customizações
- [ ] Listar cores e variáveis customizadas

#### 8.3 TypeScript Config
- [ ] Analisar tsconfig.json
- [ ] Documentar paths aliases
- [ ] Identificar strictness settings

#### 8.4 Drizzle Config
- [ ] Analisar drizzle.config.ts
- [ ] Documentar configuração do banco

---

### FASE 9: ERROS E TROUBLESHOOTING

#### 9.1 Tratamento de Erros
- [ ] Identificar padrões de error handling
- [ ] Documentar códigos de erro customizados
- [ ] Mapear mensagens de erro

#### 9.2 Logs
- [ ] Identificar sistema de logging
- [ ] Documentar níveis de log
- [ ] Explicar onde logs são salvos

#### 9.3 Erros Conhecidos
- [ ] Listar bugs conhecidos
- [ ] Documentar workarounds
- [ ] Identificar TODOs no código

---

### FASE 10: DOCUMENTAÇÃO EXISTENTE

#### 10.1 Docs Folder
- [ ] Analisar docs/ COMPLETAMENTE
- [ ] Identificar docs atualizados vs desatualizados
- [ ] Extrair informações úteis

#### 10.2 ADRs (Architecture Decision Records)
- [ ] Listar todas as ADRs
- [ ] Resumir decisões importantes
- [ ] Identificar trade-offs documentados

#### 10.3 Timeline/Histórico
- [ ] Analisar docs/05-timeline/
- [ ] Identificar evolução do sistema
- [ ] Extrair lições aprendidas

---

### FASE 11: GAPS E MELHORIAS

#### 11.1 O que está implementado
- [ ] Listar features 100% funcionais
- [ ] Identificar features parciais
- [ ] Documentar limitações atuais

#### 11.2 O que falta implementar
- [ ] Identificar TODOs no código
- [ ] Listar features planejadas mas não implementadas
- [ ] Documentar débito técnico

#### 11.3 Sugestões de Melhoria
- [ ] Identificar oportunidades de refactoring
- [ ] Sugerir otimizações
- [ ] Propor features faltantes

---

## FORMATO DE OUTPUT

Para CADA seção acima, produza documentação no formato:

### [Nome da Seção]

**Status:** ✅ Completo | ⚠️ Parcial | ❌ Não Implementado

**Arquivos Analisados:**
- `path/to/file.ts`
- `path/to/other.ts`

**Descobertas:**
[Documentação detalhada]

**Exemplos de Código:**
```typescript
// Código real extraído
```

**Conexões:**
- Depende de: [lista]
- Usado por: [lista]

**Gaps/TODOs:**
- [ ] Item 1
- [ ] Item 2

---

## DELIVERABLES ESPERADOS

Ao final da análise, produza os seguintes documentos:

1. **SISTEMA-COMPLETO.md** - Visão geral consolidada
2. **BANCO-DE-DADOS.md** - Schema completo com exemplos
3. **ENGINE-EXECUCAO.md** - Fluxos de execução detalhados
4. **FRONTEND-COMPONENTES.md** - Catálogo de componentes
5. **APIS-INTEGRACOES.md** - Documentação de APIs
6. **REGRAS-NEGOCIO.md** - Fluxos e regras
7. **SCRIPTS-FERRAMENTAS.md** - Utilitários e scripts
8. **TROUBLESHOOTING.md** - Erros e soluções
9. **GAPS-MELHORIAS.md** - O que falta e sugestões
10. **CHECKLIST-DEPLOY.md** - Passo a passo para deploy

---

## IMPORTANTE

- **NÃO INVENTE** - Documente apenas o que existe no código
- **CITE ARQUIVOS** - Sempre referencie de onde veio a informação
- **SEJA PRÁTICO** - Foque em informação útil para replicação
- **MANTENHA ORGANIZADO** - Use a estrutura proposta
- **SALVE NA PASTA** - Todos os docs em `ZZZ - Replica Docs/`
```

---

## 📊 ANÁLISE DE GAPS - O QUE FALTA DOCUMENTAR

### Já Documentado (ZZZ - Replica Docs/)
| Documento | Conteúdo | Status |
|-----------|----------|--------|
| REPLICATION-GUIDE.md | Stack, Schema, Engine, APIs | ✅ |
| ARCHITECTURE-DIAGRAM.md | Diagramas visuais | ✅ |
| API-REFERENCE.md | Funções e tipos | ✅ |

### Falta Documentar
| Categoria | O que falta | Prioridade |
|-----------|-------------|------------|
| **Telas/Páginas** | Screenshots, fluxo de navegação, estados | 🔴 Alta |
| **Design System** | Cores, fontes, espaçamentos, padrões | 🔴 Alta |
| **Componentes** | Props detalhadas, exemplos de uso | 🟡 Média |
| **Erros** | Códigos de erro, mensagens, soluções | 🔴 Alta |
| **Scripts** | Todos os scripts em /scripts | 🟡 Média |
| **Backup/Restore** | Procedimentos completos | 🔴 Alta |
| **Prompts** | Templates reais do banco | 🔴 Alta |
| **Knowledge Base** | Conteúdo dos tiers | 🟡 Média |
| **Troubleshooting** | Problemas comuns, soluções | 🔴 Alta |
| **Deploy** | Checklist de produção | 🔴 Alta |
| **Migrations** | Histórico e ordem | 🟡 Média |
| **Hooks** | Hooks customizados | 🟢 Baixa |
| **Jobs/States** | Máquina de estados | 🟡 Média |
| **Timeline** | Detalhes técnicos | 🟡 Média |
| **Edge Cases** | Comportamentos especiais | 🟢 Baixa |

---

## 🚀 COMO EXECUTAR A ANÁLISE

### Passo 1: Preparação
```bash
# Clone ou acesse o repositório
cd /Users/riccodecarvalho/IDEs/video-factory-os

# Verifique o status
git status
git log -5 --oneline
```

### Passo 2: Iniciar Nova Conversa
1. Abra uma nova conversa com IA
2. Copie o PROMPT acima
3. Cole como primeira mensagem
4. Aguarde a análise

### Passo 3: Execução por Fases
Peça para a IA executar fase por fase:
- "Execute a FASE 1: MAPEAMENTO ESTRUTURAL"
- "Execute a FASE 2: BANCO DE DADOS"
- E assim por diante...

### Passo 4: Consolidação
Após todas as fases:
- "Consolide todos os resultados em documentos finais"
- "Salve tudo na pasta ZZZ - Replica Docs/"

### Passo 5: Validação
- Revise cada documento gerado
- Verifique se o código citado existe
- Teste instruções de replicação

---

## 📁 ESTRUTURA FINAL ESPERADA

```
ZZZ - Replica Docs/
├── README.md                        ← Índice (já existe)
├── PROMPT-MASTER-ANALISE-COMPLETA.md ← Este arquivo
│
├── === DOCS EXISTENTES ===
├── REPLICATION-GUIDE.md             ← Guia master
├── ARCHITECTURE-DIAGRAM.md          ← Diagramas
├── API-REFERENCE.md                 ← APIs
│
├── === DOCS A CRIAR (pós análise) ===
├── SISTEMA-COMPLETO.md              ← Visão geral consolidada
├── BANCO-DE-DADOS-DETALHADO.md      ← Schema com exemplos
├── ENGINE-EXECUCAO-DETALHADO.md     ← Fluxos completos
├── FRONTEND-COMPONENTES.md          ← Catálogo UI
├── TELAS-E-NAVEGACAO.md             ← Screenshots, fluxos
├── DESIGN-SYSTEM.md                 ← Cores, fontes, padrões
├── PROMPTS-TEMPLATES.md             ← Prompts reais do banco
├── REGRAS-NEGOCIO.md                ← Fluxos e validações
├── SCRIPTS-E-FERRAMENTAS.md         ← NPM scripts, bash
├── BACKUP-RESTORE.md                ← Procedimentos
├── TROUBLESHOOTING.md               ← Erros e soluções
├── GAPS-E-MELHORIAS.md              ← O que falta
├── CHECKLIST-DEPLOY.md              ← Deploy production
└── HISTORICO-EVOLUCAO.md            ← Timeline do projeto
```

---

## ⚠️ AVISOS IMPORTANTES

1. **EXECUTE ESTE PROMPT EM UMA NOVA CONVERSA** - Para ter contexto limpo
2. **FAÇA POR FASES** - Evita sobrecarga e permite validação incremental
3. **VALIDE CADA OUTPUT** - Confira se os arquivos citados existem
4. **MANTENHA NESTA PASTA** - Toda documentação nova aqui
5. **VERSIONE** - Commite após cada fase significativa

---

## 🔄 QUANDO RE-EXECUTAR

Execute novamente esta análise quando:
- Houver mudanças significativas no sistema
- Novos módulos forem implementados
- Antes de migrar para outro ambiente
- Ao fazer onboarding de novos devs
- Periodicamente (mensal/trimestral)

---

**Criado em:** 2026-01-24
**Última atualização:** 2026-01-24
**Versão:** 1.0
