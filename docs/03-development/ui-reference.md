# UI Reference — Video Factory OS

> **Versão:** 1.0  
> **Data:** 2025-12-13  
> **Baseline:** 4pice Studio (Prompt Library)

---

## Layout Patterns

### 1. AppShell

```
+------------------+--------------------------------------------------+
|  SIDEBAR (256px) |  HEADER (h-14)                                   |
|  bg-card         |  border-b                                        |
|  border-r        +--------------------------------------------------+
|                  |                                                  |
|  Logo            |  MAIN CONTENT                                    |
|                  |  p-6 max-w-7xl mx-auto                           |
|  Navigation      |                                                  |
|  - Groups        |                                                  |
|  - Items         |                                                  |
|                  |                                                  |
+------------------+--------------------------------------------------+
```

### 2. PageHeader

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <Breadcrumb />
    <h1 className="text-2xl font-semibold">Page Title</h1>
    <p className="text-muted-foreground">Description</p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline">Secondary</Button>
    <Button>Primary Action</Button>
  </div>
</div>
```

### 3. Split View (Lista + Detalhe)

```
+---------------------------+----------------------------------+
|  LISTA (w-1/3)            |  DETALHE (w-2/3)                 |
|  border-r                 |                                  |
|                           |                                  |
|  [Item 1] ← active        |  [Content do item selecionado]   |
|  [Item 2]                 |                                  |
|  [Item 3]                 |                                  |
|                           |                                  |
+---------------------------+----------------------------------+
```

### 4. Category Cards (Métricas)

```tsx
<div className="grid grid-cols-5 gap-4 mb-6">
  <Card className="border-primary/50 bg-primary/5">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-muted-foreground">Todos</CardTitle>
    </CardHeader>
    <CardContent>
      <span className="text-3xl font-bold">39</span>
    </CardContent>
  </Card>
  {/* Repeat for other categories */}
</div>
```

---

## Densidade & Espaçamento

### Padding
| Contexto | Valor |
|----------|-------|
| Page | `p-6` |
| Card | `p-4` |
| Compact Card | `p-3` |
| Button | `px-4 py-2` |
| List Item | `px-3 py-2` |

### Gap
| Contexto | Valor |
|----------|-------|
| Grid de cards | `gap-4` |
| Form fields | `gap-5` |
| Buttons inline | `gap-2` |

### Tipografia
| Elemento | Classes |
|----------|---------|
| Page Title | `text-2xl font-semibold` |
| Section Title | `text-lg font-medium` |
| Card Title | `text-base font-medium` |
| Body | `text-sm` |
| Label | `text-sm text-muted-foreground` |
| Caption | `text-xs text-muted-foreground` |

---

## Regras de Efeitos (MINIMAL)

### Sombras
| Uso | Classe |
|-----|--------|
| Card elevado | `shadow-sm` |
| Dropdown/Modal | `shadow-md` |
| Hover card | `shadow-md` (transition) |

### Bordas
| Uso | Classe |
|-----|--------|
| Card default | `border` |
| Card active | `border-primary` |
| Divisor | `border-b` |

### Glow Budget (EXCEÇÃO, não regra)
| Permitido | Implementação |
|-----------|---------------|
| Status `running` | `animate-pulse` com opacity 0.5 |
| Focus ring | `ring-2 ring-primary/50` |
| **NÃO usar** | `.glass`, blur, gradientes |

---

## Do / Don't

### ✅ DO

```tsx
// Card limpo com borda
<Card className="border shadow-sm">

// Status com background sutil
<Badge className="bg-status-success/10 text-status-success">

// Hover com shadow
<Card className="hover:shadow-md transition-shadow">

// Active com borda colorida
<div className="border-l-4 border-primary bg-primary/5">
```

### ❌ DON'T

```tsx
// Glass effect como default
<Card className="glass">  // ❌

// Glow em tudo
<div className="animate-pulse-glow">  // ❌ (exceto running)

// Gradientes para hierarquia
<div className="bg-gradient-to-r from-primary/20">  // ❌

// Blur excessivo
<div className="backdrop-blur-lg">  // ❌
```

---

## Componentes-Chave

### Sidebar
- `w-64 bg-card border-r`
- Logo no topo
- Grupos colapsáveis
- Ícones + labels
- Active: `bg-primary/10 text-primary`

### Header
- `h-14 border-b bg-card`
- Breadcrumb à esquerda
- Ações à direita

### List Item (Split View)
- `px-4 py-3 border-b`
- Hover: `bg-muted/50`
- Active: `bg-primary/5 border-l-4 border-primary`

### Card (Métrica)
- `border rounded-lg p-4`
- Active/Selected: `border-primary/50 bg-primary/5`

---

## Cores de Status (Uso)

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Success | `bg-status-success/10` | `text-status-success` | `border-status-success/30` |
| Error | `bg-status-error/10` | `text-status-error` | `border-status-error/30` |
| Running | `bg-status-running/10` | `text-status-running` | + `animate-pulse` |
| Pending | `bg-muted` | `text-muted-foreground` | — |

---

**Arquivo referência:** Este documento é a fonte de verdade para decisões de UI.
