# 🎨 UI Guidelines (4pice Reference)

**Baseado em:** ADR-005 e ADR-006

## 🎯 Princípio Visual
**"Inspirado no 4pice, não portado."**
Referência: Tela "Prompt Library" do 4pice Studio.

## 🚫 Glow Budget (Regra de Ouro)
- **ZERO Glow por padrão.**
- Nada de fundos com gradiente, glassmorphism excessivo ou bordas neon para hierarquia básica.
- **Permitido:**
  - `ring-offset` para foco (acessibilidade).
  - Animação sutil (pulse) apenas para status `running`.

## 🧩 Componentes Canônicos (Primitives)
Use sempre estes componentes em vez de construir layouts do zero:

1. **SplitView:**
   - Esquerda: Lista de itens (com ou sem busca).
   - Direita: Detalhe do item selecionado ou EmptyState.
2. **PageHeader:**
   - Breadcrumb + Título + Descrição + Ações (botões).
3. **SectionCards:**
   - Grid de cards com contadores no topo das páginas.
4. **FiltersBar:**
   - Input de busca + Chips de filtro.
5. **EmptyState:**
   - Ilustração/Ícone + Texto + Botão de ação (quando lista vazia).

## 🌞 Light/Dark Mode
- **Light First:** O design deve funcionar perfeitamente no light mode (como o 4pice).
- **Dark Mode:** Apenas inversão de cores sem adicionar "efeitos neon" desnecessários.

---

## 🆕 Guidelines para Novas Features (2025-12-22)

### Wizard de Criação (Backlog CRITICAL)
Referências visuais em `docs/04-produto/assets/`. Seguir estes padrões:

**Estrutura:**
- Stepper hierárquico (2 níveis): Fases > Steps
- Barra de progresso global (ex: "33% completo")
- Footer fixo: [← Anterior] [Status] [Salvar] [Próximo →]

**Feedback de IA:**
- Barra de progresso com percentual
- Texto descritivo: "Chamando IA Claude..."
- Tempo decorrido visível
- Toast para processos em background

**Cards de Resultado:**
- Header: Título + Badge (ex: [VIRAL])
- Body: Seções estruturadas (Protagonista, Conflito, Keywords)
- Footer: Campo "Iterar com IA" + Botão Regenerar

**Componentes a criar:**
- `WizardStepper.tsx`
- `StepExecutionProgress.tsx`
- `GeneratedResultCard.tsx`
- `IterateWithAI.tsx`

### Regras Gerais para Novas Features
1. Usar componentes canônicos sempre que possível
2. Seguir padrão SplitView para listas com detalhes
3. Manter Zero Glow (sem gradientes excessivos)
4. Light mode first, dark mode por inversão
5. Feedback visual para toda operação assíncrona
