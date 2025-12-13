# ADR-004: Design System — Inspirar, Não Portar

> **Status:** Aceito  
> **Data:** 2025-12-13  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

O projeto Video Factory OS precisa de um Design System (DS) para criar uma interface visual consistente e profissional. Existe um DS maduro no projeto 4pice Studio com componentes, tokens e patterns bem definidos.

A questão é: **devemos portar/copiar o DS do 4pice ou criar um novo inspirado nele?**

---

## Decisão

**Vamos nos INSPIRAR no 4pice Studio, mas NÃO vamos PORTAR/COPIAR o Design System.**

---

## Racional

### Por que não portar

1. **Contexto diferente:** 4pice é gestão de conteúdo/inteligência. Video Factory é produção de vídeo (pipeline, jobs, artifacts).

2. **Domínio específico:** VF precisa de componentes únicos (PipelineView, StepIndicator, JobCard) que não existem no 4pice.

3. **Liberdade de evolução:** Copiar criaria dependência; precisaríamos sincronizar mudanças.

4. **Oportunidade de otimizar:** Podemos aplicar lições aprendidas e criar algo melhor para este contexto.

### O que vamos inspirar

| Aspecto | Do 4pice | Para VF |
|---------|----------|---------|
| Hierarquia visual | Sidebar + área principal | Manter |
| Dark mode first | Sim | Sim |
| Tipografia | Inter + mono | Manter |
| Cores primárias | Azul vibrante | Adaptar HSL |
| Cards e superfícies | Layers bem definidos | Manter |
| Status colors | Sim | Adaptar para pipeline |

### O que vamos criar novo

1. **Componentes VF específicos:**
   - `PipelineView` (visualização de steps)
   - `JobCard` (card de job com mini-pipeline)
   - `StepIndicator` (status de step)
   - `StatusBadge` (pending/running/completed/failed)
   - `QuickAction` (ações contextuais)
   - `ProgressRing` (progresso circular)
   - `MetricCard` (métricas com trend)

2. **Tokens específicos:**
   - Status colors (success, running, error, pending)
   - Animações de pipeline (flow, pulse-glow)
   - Spacing para logs e artifacts

---

## Processo

### Quem faz o quê

| Modelo | Responsabilidade |
|--------|------------------|
| **Claude Opus 4.5** | Core, engine, DB, docs, implementação |
| **Gemini 3 Pro High** | UI/UX, DS tokens, mockups, specs visuais |

### Fluxo

1. Opus prepara brief (`docs/03-development/ds-spec.md`)
2. Usuário cola prompt no Gemini
3. Gemini retorna proposta de DS
4. Usuário traz resposta para Opus
5. Opus implementa

---

## Consequências

### Positivas

- DS otimizado para o domínio de produção de vídeo
- Liberdade para evoluir independentemente
- Componentes específicos para o contexto
- Processo claro de colaboração Opus ↔ Gemini

### Negativas

- Mais trabalho inicial (não é só copiar)
- Precisa de cuidado para não reinventar o que já funciona

### Riscos Mitigados

| Risco | Mitigação |
|-------|-----------|
| DS inconsistente | Usar 4pice como benchmark de qualidade |
| Perder boas práticas | Documentar o que inspirou cada decisão |
| Escopo crescer | Foco em componentes do Gate 0.5 primeiro |

---

## Alternativas Consideradas

### Alternativa 1: Portar 100% o DS do 4pice

**Rejeitada porque:**
- Contextos diferentes
- Criaria dependência
- Componentes VF não existem

### Alternativa 2: Usar apenas shadcn/ui sem customização

**Rejeitada porque:**
- Muito genérico
- Não tem componentes de pipeline/jobs
- Visual não diferenciado

### Alternativa 3: Usar Tailwind UI ou similar

**Rejeitada porque:**
- Custo
- Também genérico
- Não tem contexto de produção de vídeo

---

## Referências

- [4pice Studio](../../../z-%20archive/video-save-guardian/) — Benchmark de qualidade
- [shadcn/ui](https://ui.shadcn.com/) — Primitivos base
- [Radix UI](https://www.radix-ui.com/) — Acessibilidade

---

**Última atualização:** 2025-12-13
