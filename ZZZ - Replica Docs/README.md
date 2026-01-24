# 📚 Documentação de Replicação - Video Factory OS

> **Pasta dedicada à replicação completa do sistema**
> 
> Toda documentação necessária para replicar o Video Factory OS em outro ambiente está aqui.

---

## 📋 Índice de Documentos

### 1. 📖 [REPLICATION-GUIDE.md](./REPLICATION-GUIDE.md)
**Guia Completo de Replicação** (~800 linhas)

**O que é:**
Documentação master para replicar o sistema do zero. Contém tudo que você precisa saber sobre a arquitetura, tecnologias, configuração e deploy.

**Quando usar:**
- Ao iniciar uma nova instalação do sistema
- Para entender a estrutura completa do projeto
- Como referência durante o desenvolvimento
- Para onboarding de novos desenvolvedores

**O que contém:**
- ✅ Visão geral do sistema (Config-First, Manifest-driven)
- ✅ Stack tecnológico completo (Next.js, SQLite, Claude, Azure, FFmpeg)
- ✅ Estrutura de diretórios explicada
- ✅ **Schema completo do banco** (17 tabelas documentadas)
- ✅ Engine de execução (runner, providers, executors)
- ✅ Providers e integrações (Claude, Azure TTS, ImageFX, FFmpeg)
- ✅ APIs e Server Actions
- ✅ Componentes Frontend
- ✅ Fluxo de dados e conexões
- ✅ **Checklist prático de replicação passo-a-passo**

**Como usar:**
1. Leia a seção "Visão Geral" para entender o conceito
2. Siga o "Checklist de Replicação" na ordem
3. Use as seções específicas como referência durante a implementação

---

### 2. 🏗️ [ARCHITECTURE-DIAGRAM.md](./ARCHITECTURE-DIAGRAM.md)
**Diagramas Visuais da Arquitetura** (~600 linhas)

**O que é:**
Representação visual ASCII da arquitetura do sistema. Mostra como os componentes se conectam e como os dados fluem.

**Quando usar:**
- Para entender visualmente a arquitetura
- Ao explicar o sistema para outros
- Para debugar problemas de integração
- Como referência rápida de fluxos

**O que contém:**
- ✅ Arquitetura em camadas (Apresentação → Aplicação → Dados → Externos)
- ✅ **Fluxo de execução de um job** (sequence diagram completo)
- ✅ **Sistema de Execution Bindings** (resolução de configuração)
- ✅ Anatomia de uma Recipe (pipeline de steps)
- ✅ Estrutura de Artifacts (organização de arquivos)
- ✅ Painel Admin (CRUD de configurações)
- ✅ Timeline DSL (composição declarativa de vídeo)

**Como usar:**
1. Use os diagramas para visualizar o fluxo de dados
2. Consulte o "Fluxo de Execução" para entender o ciclo de vida de um job
3. Veja o "Sistema de Bindings" para entender como as configurações são resolvidas

---

### 3. 🔌 [API-REFERENCE.md](./API-REFERENCE.md)
**Referência Completa de APIs** (~700 linhas)

**O que é:**
Documentação técnica de todas as funções, Server Actions e APIs do sistema. Inclui assinaturas TypeScript e exemplos.

**Quando usar:**
- Ao desenvolver novas features
- Para integrar com o sistema
- Como referência durante o desenvolvimento
- Para entender parâmetros e retornos de funções

**O que contém:**
- ✅ **Server Actions - Admin** (CRUD de prompts, providers, recipes, presets, etc.)
- ✅ **Server Actions - Jobs** (criar, executar, retry, cancelar jobs)
- ✅ **Engine Functions** (runJob, executeLLM, executeTTS, renderVideo)
- ✅ **Provider Functions** (ImageFX, Claude, Azure)
- ✅ **Database Functions** (getDb, schema exports)
- ✅ **Utility Functions** (step mapper, loaders, audit)
- ✅ **Tipos TypeScript principais** (Job, Recipe, Prompt, etc.)

**Como usar:**
1. Busque a função que precisa usar
2. Veja a assinatura TypeScript
3. Entenda os parâmetros e retornos
4. Use os tipos para garantir type safety

---

## 🎯 Como Usar Esta Documentação

### Para Replicar o Sistema Completo

```
1. Leia REPLICATION-GUIDE.md (seção "Visão Geral")
   ↓
2. Consulte ARCHITECTURE-DIAGRAM.md para entender a arquitetura
   ↓
3. Siga o "Checklist de Replicação" em REPLICATION-GUIDE.md
   ↓
4. Use API-REFERENCE.md como referência durante a implementação
```

### Para Entender um Fluxo Específico

```
1. Veja o diagrama em ARCHITECTURE-DIAGRAM.md
   ↓
2. Leia a seção correspondente em REPLICATION-GUIDE.md
   ↓
3. Consulte as funções em API-REFERENCE.md
```

### Para Desenvolver uma Nova Feature

```
1. Entenda a arquitetura em ARCHITECTURE-DIAGRAM.md
   ↓
2. Veja o schema do banco em REPLICATION-GUIDE.md
   ↓
3. Use API-REFERENCE.md para as funções necessárias
```

---

## ⚠️ IMPORTANTE: Trabalhe Sempre Nesta Pasta

**TODOS os novos documentos de replicação devem ser criados aqui:**

```
ZZZ - Replica Docs/
├── README.md                    ← Você está aqui
├── REPLICATION-GUIDE.md         ← Guia master
├── ARCHITECTURE-DIAGRAM.md      ← Diagramas visuais
├── API-REFERENCE.md             ← Referência de APIs
└── [NOVOS DOCUMENTOS AQUI]      ← Adicione aqui
```

### Exemplos de Novos Documentos

Se você criar documentação adicional, adicione aqui:

- ✅ **Prompts de replicação** → `PROMPTS-REPLICATION.md`
- ✅ **Troubleshooting** → `TROUBLESHOOTING.md`
- ✅ **Migration guides** → `MIGRATION-GUIDE.md`
- ✅ **Performance tuning** → `PERFORMANCE.md`
- ✅ **Security checklist** → `SECURITY.md`

---

## 🚀 Quick Start

**Para replicar o sistema em 5 passos:**

1. **Pré-requisitos** (REPLICATION-GUIDE.md → Seção 11)
   - Node.js 18+, FFmpeg, API keys

2. **Setup** (REPLICATION-GUIDE.md → Seção 10)
   ```bash
   npm install
   cp .env.example .env.local
   # Edite .env.local com suas keys
   npm run db:seed
   ```

3. **Verificar** (REPLICATION-GUIDE.md → Seção 11)
   ```bash
   npm run dev
   # Acesse http://localhost:3000
   ```

4. **Customizar** (REPLICATION-GUIDE.md → Seção 11)
   - Criar projeto no Admin
   - Configurar prompts e presets
   - Criar recipe customizada

5. **Deploy** (REPLICATION-GUIDE.md → Seção 11)
   - Build de produção
   - Configurar variáveis de ambiente
   - Setup de backup

---

## 📊 Estatísticas da Documentação

| Documento | Linhas | Seções | Diagramas |
|-----------|--------|--------|-----------|
| REPLICATION-GUIDE.md | ~800 | 11 | 1 |
| ARCHITECTURE-DIAGRAM.md | ~600 | 8 | 7 |
| API-REFERENCE.md | ~700 | 6 | 0 |
| **TOTAL** | **~2100** | **25** | **8** |

---

## 🔄 Atualizações

Esta documentação foi gerada automaticamente a partir da análise do código fonte real em **2026-01-24**.

Para atualizar:
1. Re-execute a análise do código
2. Atualize os documentos nesta pasta
3. Commit com mensagem descritiva

---

## 💡 Dicas

- 📌 **Bookmark esta pasta** para acesso rápido
- 🔍 **Use Ctrl+F** para buscar termos específicos
- 📝 **Mantenha atualizado** conforme o sistema evolui
- 🤝 **Compartilhe** com novos membros da equipe

---

**Pronto para replicar?** Comece por `REPLICATION-GUIDE.md` → Seção 1 (Visão Geral)
