# 📋 Backlog - Melhorias Futuras

Este documento registra melhorias identificadas durante o desenvolvimento para implementação futura.

---

## 🔧 UI/UX

### [CRITICAL] Redesign do Wizard - Referência Completa
**Data:** 2025-12-22  
**Origem:** Análise de referências de UX (5 prints)

**Problema Atual:**
- Wizard minimalista demais ("Executando Step... Step 3 de 11")
- Sem feedback visual de progresso real
- Experiência confusa e parece travado

**Referências Analisadas:**

![Wizard Reference 1](/Users/riccodecarvalho/.gemini/antigravity/brain/5d92b6ae-3349-46de-8920-d3f9e26d8a5d/uploaded_image_0_1766455046474.png)

**Elementos a Implementar:**

#### 1. Stepper Hierárquico (2 níveis)
- **Nível 1 (Fases):** Conceituação → Planejamento → Visual → Produção → Revisão → Finalização
- **Nível 2 (Steps):** Tabs secundárias (Tema Central, Títulos, Brief, Planejamento, Roteiro, etc.)
- Indicador de progresso visual (11% completo, 22% completo...)
- Badges de status em cada fase

#### 2. Feedback de Execução de IA
- Barra de progresso com percentual (40%, 0s)
- Texto descritivo ("Chamando IA Claude...")
- **Tempo decorrido** em tempo real
- Badge de "Geração iniciada em background" (toast notification)
- Texto de expectativa: "Este processo leva cerca de 30-60 segundos"

#### 3. Cards de Resultado Estruturado
- Header com título do resultado + badge "VIRAL" (opcional)
- Seções organizadas:
  - 👤 **Protagonista:** descrição
  - ⚔️ **Conflito:** descrição
  - 💖 **Emoção Alvo:** descrição
  - 🏷️ **Keywords:** tags clicáveis
- Botões: "Regenerar Conceito" / "Descartar"
- Campo de iteração: "Não gostei, tente algo mais dramático..."

#### 4. Contexto das Etapas Anteriores
- Resumo compacto do que foi gerado antes
- Ex: "Conceito: História de noiva abandonada no altar..."
- Visível em cada nova etapa

#### 5. Navegação e Ações
- Breadcrumb: Home > Criação > Wizard de Roteiro
- Footer fixo: [← Anterior] [Descrição do step] [Salvar] [Próximo →]
- Botão "Próximo" só ativo após step concluído

**Mockup Completo:**
```
╭──────────────────────────────────────────────────────────────╮
│ 🏠 > Criação > Wizard de Roteiro                             │
├──────────────────────────────────────────────────────────────┤
│  ✨ Wizard de Criação    PRJ-B8F56D         <> Tema Central  │
│  Novo Projeto 22/12 22:51                                    │
│  ━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░ 22% completo         │
│                                                              │
│  ① ───── ② ───── ③ ───── ④ ───── ⑤ ───── ⑥                  │
│  Conceituação  Planejamento  Visual  Produção  Revisão  Fim  │
│                                                              │
│  [Tema Central] [Títulos] [Brief] [Planejamento] [Roteiro]   │
├──────────────────────────────────────────────────────────────┤
│  💡 História de noiva abandonada no altar...                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📝 Tema Central                                             │
│  Defina a ideia central do seu vídeo                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Abandonada no altar... mas chefe Milionário chegou...  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ╭─────────────────────────────────────────────────────────╮ │
│  │        ✨  Gerar Conceito Central                       │ │
│  ╰─────────────────────────────────────────────────────────╯ │
│                                                              │
│  ╭─────────────────────────────────────────────────────────╮ │
│  │ ○ Chamando IA Claude...                           40%  │ │
│  │ ━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░            0s   │ │
│  ╰─────────────────────────────────────────────────────────╯ │
│                                                              │
│  ╭─────────────────────────────────────────────────────────╮ │
│  │ ✓ Conceito Central Gerado              [VIRAL] ⊗ Desc  │ │
│  │                                                         │ │
│  │ "História de noiva abandonada no altar que aceita      │ │
│  │  fingir casamento com bilionário misterioso..."         │ │
│  │                                                         │ │
│  │ 👤 Protagonista    │  ⚔️ Conflito                       │ │
│  │ Mulher traída...   │  Humilhação pública VS...          │ │
│  │                    │                                    │ │
│  │ 💖 Emoção Alvo     │  🏷️ Keywords                       │ │
│  │ Vingança + romance │  [altar] [bilionário] [romance]    │ │
│  │                                                         │ │
│  │ ✨ Iterar com IA:                                       │ │
│  │ ┌───────────────────────────────────────────────────┐   │ │
│  │ │ Não gostei, tente algo mais dramático...         │   │ │
│  │ └───────────────────────────────────────────────────┘   │ │
│  ╰─────────────────────────────────────────────────────────╯ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [← Anterior]  Defina a ideia central (opcional)  [💾] [➡️]   │
╰──────────────────────────────────────────────────────────────╯
```

**Arquivos Afetados:**
- `app/wizard/[jobId]/page.tsx` - Refatorar completamente
- `components/vf/WizardStepper.tsx` - Novo componente (2 níveis)
- `components/vf/StepExecutionProgress.tsx` - Novo componente
- `components/vf/GeneratedResultCard.tsx` - Novo componente
- `components/vf/IterateWithAI.tsx` - Novo componente

**Esforço Estimado:** 8-12h (implementação completa)
**Prioridade:** CRITICAL (impacta diretamente UX do produto)

---

### [CRITICAL] Referências Adicionais do Wizard (Parte 2)
**Data:** 2025-12-22  
**Origem:** 4 prints adicionais de referência

**Novos Elementos Identificados:**

#### 6. Brief com Personagens Estruturados
- **Protagonista** com nome completo: "Marta Regina dos Santos - Florista de bairro, 52 anos"
- **Vilão** com detalhes: "Alessandra Figueiredo Lima - Ex-noiva de Vicente, influencer de luxo"
- **Mentor** com contexto: "Vicente Almeida Salgado"
- **Humilhação** com cenário: "Igreja Matriz de São José, casamento para 200 convidados"
- Metadados: ⏱️ 75 min | 📝 ~9750 palavras | Badge [VIRAL]

#### 7. Sidebar de Ferramentas
- Menu lateral colapsável com acesso rápido:
  - 🏠 Painel de Roteiro
  - ✨ Wizard de Ideias (NOVO)
  - 🔖 Minhas Sessões
  - 📦 Desenvolver Ideia
  - 📜 Roteiro
  - 📱 Stories
  - 📍 Thumbnail
  - 💬 Comunidade Posts
  - 📊 Métricas de Vídeos (NOVO)
  - 🧬 DNA do Canal
  - 📚 Histórico
  - ⚙️ Ajustes
  - 🎬 MCP

#### 8. Planejamento com Estrutura Narrativa
- **Revelações Progressivas** (pontos de virada numerados)
  - 15% Consolação → 25% Escalada → 35% Virada → 75% Clímax
- **Espalhamentos** (plot points com cores)
  - Ativo | Setting | A-POV | ← VIT | ...
- **Objetos Simbólicos** (elementos narrativos)
  - Véu da noiva → esperando (dor)
  - Crisálida bronze em caixa → transitions
  - Aliança de Vicente → justiça?
- **Bordas Dramáticas** (falas impactantes)
  - M1h01m: "Por que ela está aqui?..."
  - P0h03min: "Marta volta com..."
- **Mini-roteiro** com timestamps
  - min 0 → abatição | min 11 → epifania | min 24 → quase desistência...

#### 9. Notificação de Processos em Background  
- Toast no canto inferior direito:
  - "✓ 1 processo finalizado"
  - "develop-idea: Concluído! ✓ 0 sucesso"
- Indicador de processos ativos/finalizados

#### 10. Step de Descrição para YouTube
- **Descrição formatada** com emojis e estrutura
- **TIMESTAMPS** automáticos:
  - 0:00 Introdução
  - 2:15 O casamento
  - 5:30 A sogra cruza todos os limites
  - 12:20 A virada de jogo
  - 18:10 O desfecho emocionante
- **LINKS ÚTEIS** com placeholders
- **SOBRE O CANAL** (boilerplate)
- **Hashtags** integradas no texto
- **Tags como chips clicáveis** (badges)
- **Primeiro Comentário** com botão "✨ Gerar"
- Campo inferior "Iterar com IA: Mais SEO / Adicione emojis / Mais curta..."

**Componentes Adicionais a Criar:**
- `components/vf/CharacterCard.tsx` - Protagonista/Vilão/Mentor
- `components/vf/NarrativeStructure.tsx` - Revelações progressivas
- `components/vf/TimestampGenerator.tsx` - Timestamps automáticos
- `components/vf/TagChips.tsx` - Tags como badges
- `components/vf/ProcessNotification.tsx` - Toast de processos

**Total de Referências:** 9 prints analisados
**Esforço Adicional:** +6-8h

---

### [HIGH] Gerenciamento de Providers - Mostrar Uso e Permitir Exclusão
**Data:** 2025-12-22  
**Origem:** Sessão de correção de bindings

**Problema:**
- Não é possível ver onde um provider está sendo usado
- Não é possível excluir providers sem uso (órfãos)
- Um provider "Novo Provider" ficou órfão e teve que ser excluído manualmente

**Solução Proposta:**
1. Na lista de providers, mostrar badge "X usos" para cada provider
2. Ao clicar em um provider, mostrar seção "Usado em":
   - Listar recipes e steps que usam esse provider
   - Ex: "Graciela (title, brief, script), Virando o Jogo (ideacao, titulo, roteiro...)"
3. Botão "Excluir" só aparece se usos = 0
4. Confirmação antes de excluir: "Este provider não está em uso. Deseja excluir?"

**Arquivos Afetados:**
- `app/admin/providers/page.tsx` - Lista de providers
- `app/api/admin/providers/[id]/route.ts` - Endpoint de delete
- `app/api/admin/providers/[id]/usage/route.ts` - Novo endpoint para listar uso

**Esforço Estimado:** 2-3h

---

### [HIGH] Wizard "Executando Step" - Melhorar Feedback Visual
**Data:** 2025-12-22  
**Origem:** Teste de UX do wizard

**Problema:**
- Tela "Executando Step... Step 3 de 11" é muito minimalista
- Parece travado, sem indicação de progresso real
- Usuário não sabe quanto tempo falta
- Experiência ruim durante execução de LLM

**Solução Proposta:**
1. Adicionar **barra de progresso animada** (indeterminada enquanto não sabemos duração)
2. Mostrar **nome do step atual** (ex: "Gerando Roteiro...")
3. Adicionar **tempo decorrido** (ex: "45s")
4. Mostrar **logs em tempo real** rolling (últimas 3 linhas)
5. Possibilidade de **cancelar** a execução

**Mockup:**
```
╭─────────────────────────────────────╮
│  ⏳ Gerando Roteiro...              │
│  ━━━━━━━━━━━░░░░░░░░░░ Step 3/11   │
│                                     │
│  ⏱️ 45s decorridos                  │
│                                     │
│  📋 Logs:                           │
│  > Chamando Claude: claude-sonnet   │
│  > Prompt: Graciela - Roteiro v1    │
│  > Aguardando resposta...           │
│                                     │
│  [ Cancelar ]                       │
╰─────────────────────────────────────╯
```

**Arquivos Afetados:**
- `app/wizard/[jobId]/page.tsx` - Componente principal
- `components/vf/StepExecutionProgress.tsx` - Novo componente

**Esforço Estimado:** 3-4h

---

## 🗄️ Database

### [DONE] Proteção Anti-Corrupção SQLite
**Data:** 2025-12-22  
**Status:** ✅ Implementado

Adicionados PRAGMAs de proteção em `lib/db/index.ts`:
- `journal_mode = WAL`
- `synchronous = NORMAL`
- `busy_timeout = 5000`
- `foreign_keys = ON`

---

## 📦 Backups

### [DONE] Sistema de Backup Automático
**Data:** 2025-12-22  
**Status:** ✅ Implementado

- Script `scripts/backup.sh` com verificação de integridade
- Rotação automática (20 últimos)
- Integrado ao workflow de governança (Passo 0)

---

## 🎬 Render Engine

### [DONE] Timeline DSL + RenderPlan
**Data:** 2025-12-22  
**Status:** ✅ Implementado

- Timeline DSL em `lib/timeline/`
- Presets VideoToolbox para Mac M1/M2
- Worker com queue e retry
- API de jobs em `/api/render/`

---

## 📝 Como Adicionar Item ao Backlog

```markdown
### [PRIORITY] Título da Melhoria
**Data:** YYYY-MM-DD  
**Origem:** Como foi identificado

**Problema:**
- Descrição do problema

**Solução Proposta:**
1. Passo 1
2. Passo 2

**Arquivos Afetados:**
- arquivo1.ts
- arquivo2.ts

**Esforço Estimado:** Xh
```

Prioridades: `[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`, `[DONE]`
