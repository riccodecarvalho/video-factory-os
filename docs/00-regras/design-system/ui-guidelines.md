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
