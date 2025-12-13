# ADR-005: UI Baseline — 4pice Studio como Referência

> **Status:** Aceito  
> **Data:** 2025-12-13  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

O Gate 0.6 implementou o Design System com status colors e tokens, mas o resultado visual ficou com **glow excessivo** (`.glass`, `.animate-pulse-glow`, gradientes) que não reflete a qualidade premium e operacional esperada.

A referência correta é a tela **"Biblioteca de Prompts"** do 4pice Studio, que demonstra:
- Hierarquia visual limpa por **layout + tipografia + borda/sombra sutil**
- Sidebar clara com grupos e ícones
- Cards de categoria com contadores
- Split view (lista + detalhe)
- **Zero glow como padrão**

---

## Decisão

**A UI baseline do Video Factory OS passa a ser inspirada no 4pice Studio (tela Prompt Library).**

### Mudanças específicas

1. **Remover glow/blur como padrão**
   - `.glass` e `.animate-pulse-glow` viram **exceção**, não regra
   - "Glow budget": permitido APENAS para `running` e `focus`, muito sutil

2. **Hierarquia por estrutura, não por efeitos**
   - Layout (grid, spacing, alignment)
   - Tipografia (weights, sizes, hierarchy)
   - Bordas e sombras sutis (`shadow-sm`, não neon)

3. **Light-first como baseline visual**
   - Dark mode como variação equivalente (sem "neon mode")

4. **Padrões de layout do 4pice**
   - AppShell (Sidebar + Header + Content)
   - Split View (lista + detalhe)
   - PageHeader (título + breadcrumb + ações)
   - Cards com contadores

---

## Alternativas Consideradas

### 1. Manter o visual "glowy" atual
**Rejeitada porque:**
- Não reflete profissionalismo de ferramenta operacional
- Difícil manter consistência
- Distrai do conteúdo

### 2. Copiar 100% do 4pice
**Rejeitada porque:**
- Contextos diferentes (prompt library vs video pipeline)
- ADR-004 já decidiu "inspirar, não portar"

### 3. Contratar designer externo
**Rejeitada porque:**
- Atrasa o projeto
- Já temos referência clara (4pice)

---

## Consequências

### Positivas
- UI mais limpa e profissional
- Hierarquia clara sem depender de efeitos
- Mais fácil de manter consistência
- Alinhado com benchmark real

### Negativas
- Precisa refatorar alguns componentes
- Menos "impacto visual" inicial

### Riscos Mitigados
| Risco | Mitigação |
|-------|-----------|
| Ficar "genérico" | Manter cores de status e componentes VF únicos |
| Perder identidade | Azul primário + layouts de pipeline são distintivos |

---

## Ações Imediatas

1. Criar `UI-REFERENCE.md` com patterns e Do/Don't
2. Remover `.glass` e `.animate-pulse-glow` como classes default
3. Ajustar componentes para usar `shadow-sm` + `border` ao invés de glow
4. Manter glow sutil APENAS para:
   - Status `running` (animação muito discreta)
   - Focus rings (padrão de acessibilidade)

---

## Referências

- [4pice Studio - Prompt Library](screenshot anexo)
- [ADR-004 - DS Inspirar, Não Portar](./2025-12-13-adr-004-design-system.md)

---

**Última atualização:** 2025-12-13
