# Video Factory OS - Histórico de Evolução

> **Objetivo:** Documentar a evolução do sistema para entender decisões, padrões e evitar repetir erros
> **Fonte:** Git log, Timeline (docs/05-timeline), ADRs
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [Linha do Tempo](#linha-do-tempo)
2. [Fases de Desenvolvimento](#fases-de-desenvolvimento)
3. [Marcos Principais](#marcos-principais)
4. [Decisões Arquiteturais (ADRs)](#decisões-arquiteturais-adrs)
5. [Padrões que Emergiram](#padrões-que-emergiram)
6. [O que Deu Certo](#o-que-deu-certo)
7. [O que Deu Errado](#o-que-deu-errado)

---

## LINHA DO TEMPO

### Dezembro 2025

| Data | Milestone | Commits Relevantes |
|------|-----------|-------------------|
| **13/12** | Início do projeto | Setup inicial, ADRs 001-008 |
| **14-15/12** | Engine básica | Runner, providers, schema |
| **16/12** | Azure TTS | ADR-009 (ZIP extraction), ADR-010 (Projects Hub) |
| **17-18/12** | Refinamentos | Correções, melhorias de UX |
| **19/12** | Wizard Mode | ADR-011 (Wizard), ADR-012 (Backup SQLite) |
| **22/12** | Timeline DSL | ADR-013, 014, 015 (Render Evolution) |
| **23/12** | Design System v2 | Componentes, TimestampGenerator |

### Janeiro 2026

| Data | Milestone | Commits Relevantes |
|------|-----------|-------------------|
| **06/01** | Kanban Board | DarkFlow state machine, drag & drop |
| **24/01** | Documentação Replicação | Análise exaustiva, docs completos |

---

## FASES DE DESENVOLVIMENTO

### Fase 1: Foundation (13-15 Dez)
**Foco:** Estabelecer arquitetura Config-First

```
Entregas:
├── Schema Drizzle completo (17 tabelas)
├── Engine runner básico
├── ADRs fundamentais (001-008)
├── Stage Directions sem SSML/MD (ADR-001)
├── Design System base (ADR-004)
└── Execution Bindings (ADR-008)
```

**Decisões-chave:**
- Config-First: Zero hardcode, tudo no DB
- Manifest-First: Todo job gera manifest JSON
- Checkpoint idempotente: Steps podem ser retomados

### Fase 2: Integrações (16-18 Dez)
**Foco:** Conectar providers externos

```
Entregas:
├── Claude API (LLM)
├── Azure Speech (TTS com Batch API)
├── FFmpeg (render com VideoToolbox)
├── Extração de ZIP do Azure (ADR-009)
└── Projects Hub (ADR-010)
```

**Problemas resolvidos:**
- Azure TTS retorna ZIP, não MP3 direto
- FFprobe precisa instalação separada
- Webpack bundling de módulos nativos

### Fase 3: Wizard Mode (19 Dez)
**Foco:** Execução step-by-step com aprovação humana

```
Entregas:
├── ADR-011: Wizard Mode
├── Pause após cada step
├── Retry com instrução customizada
├── UI de aprovação
└── ADR-012: Backup SQLite robusto
```

**Aprendizado:**
- Hot reload do Next.js destrói singletons
- Usar `globalThis` para persistir instâncias

### Fase 4: Render Evolution (22 Dez)
**Foco:** Timeline DSL para composição declarativa

```
Entregas:
├── ADR-013: Timeline DSL + RenderPlan
├── ADR-014: Render Farm Strategy
├── ADR-015: Short-form Profiles
├── Schema Timeline (scenes, elements)
├── Compiler Timeline → FFmpeg
└── Format profiles (16:9, 9:16)
```

**Inspiração:** JSON2Video (video as code)

### Fase 5: Production UI (Jan 2026)
**Foco:** Kanban Board e DarkFlow

```
Entregas:
├── Kanban Board com drag & drop
├── DarkFlow state machine
├── Step-level locking
├── Job events (telemetria)
└── Toast com event mapping
```

---

## MARCOS PRINCIPAIS

### 1. Config-First Estabelecido
**Quando:** 13/12/2025
**O que:** Decisão de não usar hardcode

```typescript
// ANTES (rejeitado)
const prompt = "Você é Graciela...";

// DEPOIS (adotado)
const prompt = await getPromptOrThrow('graciela.script.v1');
// Se não encontrar, FALHA EXPLÍCITA
```

### 2. Azure TTS ZIP Fix
**Quando:** 16/12/2025
**Problema:** Batch TTS retorna `results.zip` contendo `0001.mp3`
**Solução:** Usar `adm-zip` para extrair

```typescript
const zip = new AdmZip(Buffer.from(zipBuffer));
const mp3Entry = zip.getEntries().find(e => e.entryName.endsWith('.mp3'));
```

### 3. SQLite Corruption Recovery
**Quando:** 22/12/2025
**Problema:** Banco corrompeu após crash durante hot reload
**Solução:** PRAGMAs de proteção + backup obrigatório

```typescript
// lib/db/index.ts
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');
```

### 4. Timeline DSL
**Quando:** 22/12/2025
**O que:** Abstração declarativa para vídeo

```
Timeline (O QUE) → Compiler → RenderPlan (COMO) → FFmpeg
```

### 5. DarkFlow State Machine
**Quando:** 06/01/2026
**O que:** Estado de jobs com locking e retry

```typescript
// Estados
DRAFT → QUEUED → RUNNING → COMPLETED
                        ↘ FAILED → RETRYING
```

---

## DECISÕES ARQUITETURAIS (ADRs)

### ADRs Aceitos (15 total)

| ADR | Data | Título | Impacto |
|-----|------|--------|---------|
| 001 | 13/12 | Stage Directions | Scripts sem SSML/Markdown |
| 004 | 13/12 | Design System | Padrões visuais shadcn |
| 005 | 13/12 | UI Baseline 4pice | Referência visual |
| 006 | 13/12 | UI Patterns Parity | Consistência |
| 007 | 13/12 | Engine Execution Model | Pipeline de steps |
| 008 | 13/12 | Project Context + Bindings | Config por projeto |
| 009 | 16/12 | Azure TTS ZIP Extraction | Extração de áudio |
| 010 | 16/12 | Projects Hub | Gestão de projetos |
| 011 | 19/12 | Wizard Mode | Execução step-by-step |
| 012 | 19/12 | Backup SQLite | Proteção de dados |
| 013 | 22/12 | Timeline DSL + RenderPlan | Composição declarativa |
| 014 | 22/12 | Render Farm Strategy | Workers distribuídos |
| 015 | 22/12 | Short-form Profiles | YouTube Shorts, TikTok |

### ADRs Mais Impactantes

**ADR-008: Execution Bindings**
```
Permite override de config por projeto:
- Global: recipe → prompt
- Project: recipe + project → prompt (override)

Resolução por prioridade:
1. Project + Step binding
2. Project + '*' binding  
3. Global + Step binding
4. Global + '*' binding
5. Default da recipe
```

**ADR-013: Timeline DSL**
```
Abstrai a definição de vídeo:
- Timeline = O QUE (declarativo)
- RenderPlan = COMO (imperativo)
- Permite trocar backend (FFmpeg hoje, outro amanhã)
```

---

## PADRÕES QUE EMERGIRAM

### 1. getXOrThrow Pattern
```typescript
// Falha explícita se não encontrar
const prompt = await getPromptOrThrow(slug);
const provider = await getProviderOrThrow(slug);

// NUNCA usar fallback silencioso
// NUNCA hardcodar default
```

### 2. Server Actions para CRUD
```typescript
// app/admin/actions.ts
export async function getPrompts() { ... }
export async function createPrompt() { ... }
export async function updatePrompt() { ... }

// Revalidate path após mutação
revalidatePath('/admin/prompts');
```

### 3. Audit Trail
```typescript
// Toda mudança é auditada
await auditCrud('updated', 'prompt', id, name, before, after);
```

### 4. Artifact Storage
```
artifacts/
└── {job-id}/
    └── {step-key}/
        └── output.txt | audio.mp3 | video.mp4
```

### 5. Manifest Snapshots
```typescript
// Todo job gera manifest com snapshots
manifest.snapshots.config_by_step[stepKey] = config;
// Permite auditoria e reprodução
```

---

## O QUE DEU CERTO

### ✅ Config-First
- Flexibilidade total para mudar prompts/presets
- Auditoria completa de configurações
- Multi-projeto funciona bem

### ✅ Server Actions do Next.js
- Simplicidade vs API Routes
- Type safety nativo
- Revalidation automático

### ✅ Drizzle ORM
- Type safety excelente
- Migrations simples
- Studio para debug

### ✅ Wizard Mode
- Controle humano no loop
- Retry com instrução funciona
- UX aprovada

### ✅ Backup System
- WAL mode evita corrupção
- Backup automático rotaciona
- Restore funciona

---

## O QUE DEU ERRADO

### ❌ Corrupção SQLite em Dev
**Causa:** Hot reload + crash durante write
**Fix:** PRAGMAs + backup obrigatório
**Lição:** Sempre fazer backup antes de sessão

### ❌ Azure TTS Timeout
**Causa:** Textos muito longos (>10 min de áudio)
**Fix:** Dividir em partes ou aumentar timeout
**Lição:** Monitorar tamanho do input

### ❌ FFmpeg VideoToolbox Fallback
**Causa:** Encoder HW não disponível em algumas máquinas
**Fix:** Fallback automático para libx264
**Lição:** Sempre ter fallback software

### ❌ Bindings Órfãos
**Causa:** Migração/restore deixou IDs apontando para nada
**Fix:** Script de verificação de integridade
**Lição:** Validar bindings após restore

### ❌ Singleton Perdido no Hot Reload
**Causa:** Next.js dev mode recria módulos
**Fix:** Usar `globalThis` para persistir
**Lição:** Singletons precisam de `globalThis` em dev

### ❌ Output Refs Inconsistentes
**Causa:** Formatos diferentes entre executores
**Fix:** Suportar ambos formatos no carregamento
**Lição:** Definir contrato claro de output

---

## COMMITS NOTÁVEIS

### Fixes Importantes
```
f25adad fix(runner): allow running status and add execution logs
c22b2e9 fix(board): prefix column droppable IDs + use collisions fallback
a968caa fix(darkflow): implement step-level locking and synchronous execution
c0b352b fix(tts): fallback para roteiro além de script
38664a2 fix(audit): correções críticas da auditoria - Fase 1
```

### Features Principais
```
7fb5a71 feat(darkflow): add state machine, job events, templates
b17eb7d feat: Gate 2.0 - Timeline DSL Integration with runner
0e5ce8e feat(backup): add SQLite backup/restore system
5fd6fd9 feat(wizard): implement wizard mode following ADR-011
def06d0 feat(adapters): add ImageFX adapter for AI image generation
```

### Refactors
```
b19a3de refactor(arch): simplificar Providers + migrar 53 vozes para banco
```

---

## RECOMENDAÇÕES PARA REPLICAÇÃO

1. **Siga a ordem dos ADRs** - Eles documentam decisões em sequência lógica

2. **Implemente Config-First desde o início** - Não caia na tentação de hardcodar

3. **Configure backup antes de desenvolver** - Evita perda de dados

4. **Use PRAGMAs SQLite** - Evita corrupção em dev mode

5. **Teste Azure TTS com textos curtos primeiro** - Batch API tem peculiaridades

6. **Tenha fallback para FFmpeg** - VideoToolbox não está em todo lugar

7. **Valide bindings após qualquer migração** - Evita erros silenciosos

---

*Documento gerado pela análise do git log e timeline do Video Factory OS.*
