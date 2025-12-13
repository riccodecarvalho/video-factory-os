# ADR-006: UI Patterns Parity — 4pice Prompt Library Benchmark

> **Status:** Aceito  
> **Data:** 2025-12-13  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

Com os Gates 0.5-0.7 implementados, o projeto tem:
- Design System base (cores, tokens, status)
- AppShell (Sidebar + Header)
- Componentes VF iniciais

Porém, faltavam **patterns de produto reutilizáveis** para garantir paridade visual com o benchmark 4pice Studio (tela "Biblioteca de Prompts").

---

## Decisão

**Criar UI Primitives de produto que refletem os patterns do 4pice:**

### Componentes Criados

| Componente | Propósito | Pattern 4pice |
|------------|-----------|---------------|
| `PageHeader` | Breadcrumb + título + ações | Header da página de prompts |
| `SplitView` | Lista esquerda + detalhe direita | Split view prompts |
| `SectionCards` | Grid de cards com contadores | Cards de categorias |
| `EmptyState` | Estado vazio padrão | Quando não há resultados |
| `FiltersBar` | Chips + busca | Barra de filtros |

### Regras Visuais Reforçadas

1. **Glow Budget: ZERO por padrão**
   - Permitido apenas: `running` (opacity pulse sutil), `focus` (ring)
   - Proibido: `.glass`, blur, gradientes como hierarquia

2. **Hierarquia por estrutura:**
   - Layout (grid, spacing)
   - Tipografia (weights, sizes)
   - Bordas (`border`) e sombras (`shadow-sm`)

3. **Active states:**
   - Lista: `border-l-4 border-l-primary bg-primary/5`
   - Cards: `border-primary/50 bg-primary/5`
   - Tabs: `bg-primary text-primary-foreground`

---

## Alternativas Consideradas

### 1. Usar apenas componentes shadcn
**Rejeitada porque:**
- shadcn são primitivos, não patterns de produto
- Causaria drift visual entre páginas

### 2. Copiar componentes do 4pice
**Rejeitada porque:**
- ADR-004/005 definem "inspirar, não portar"
- Contextos diferentes

---

## Consequências

### Positivas
- Paridade visual com benchmark
- Componentes reutilizáveis para Admin
- Consistência garantida

### Negativas
- Mais componentes para manter
- Curva de aprendizado

---

## Aplicação

### Página Canônica: Admin/Prompts
Implementada como referência de uso dos patterns:
- `PageHeader` com breadcrumb e ações
- `SectionCards` com categorias (Todos, Analysis, Generation, Scripts, Tools)
- `SplitView` com lista de prompts e detalhe
- `FiltersBar` com busca
- `EmptyState` para resultados vazios

### Próximos Módulos (Gate 0.8)
Aplicar mesmos patterns em:
- Admin/Presets
- Admin/Recipes
- Admin/Providers
- Admin/Validators
- Admin/Knowledge Base

---

## Referências

- [4pice Studio - Prompt Library](screenshot)
- [ADR-005 - UI Baseline](./2025-12-13-adr-005-ui-baseline-4pice-reference.md)
- [UI-REFERENCE.md](../../03-development/ui-reference.md)

---

**Última atualização:** 2025-12-13
