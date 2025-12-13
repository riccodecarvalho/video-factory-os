# Design System Spec — Video Factory OS

> **Versão:** 1.0  
> **Data:** 2025-12-13  
> **Modo:** Light Mode First (suporta dark mode)  
> **Benchmark:** 4pice Studio (inspiração, não port)

---

## 1. Paleta de Cores (HSL)

### Primary (4pice Blue)
- **Primary:** `217.2 91.2% 59.8%` (#3b82f6)
- **Primary Foreground:** Light: `0 0% 100%` | Dark: `222.2 47.4% 11.2%`

### Neutrals
| Token | Light | Dark |
|-------|-------|------|
| Background | `224 71% 98%` | `224 71% 4%` |
| Foreground | `224 71% 4%` | `210 40% 98%` |
| Card | `0 0% 100%` | `224 71% 7%` |
| Muted | `220 14% 96%` | `217 19% 15%` |
| Border | `220 13% 91%` | `220 13% 18%` |

### Pipeline Status (8 estados)
| Status | HSL | Significado |
|--------|-----|-------------|
| **Success** | `142.1 70.6% 45.3%` | Completed, ready |
| **Warning** | `47.9 95.8% 53.1%` | Needs attention |
| **Error** | `0 84.2% 60.2%` | Failed, critical |
| **Running** | `262.1 83.3% 57.8%` | Processing (violet) |
| **Retrying** | `24.6 95% 53.1%` | Auto-fixing (orange) |
| **Pending** | `215 20.2% 45%` | Waiting queue |
| **Skipped** | `240 5% 64%` | Intentionally bypassed |
| **Blocked** | `47.9 95.8% 53.1%` | Needs intervention |
| **Cancelled** | `0 0% 55%` | Stopped by user |
| **Info** | `217.2 91.2% 59.8%` | Informational |

---

## 2. Tokens

### Typography
- **Font Sans:** Inter
- **Font Mono:** JetBrains Mono (logs, IDs, JSON)

| Scale | Size | Line Height |
|-------|------|-------------|
| h1 | 24px | 32px |
| h2 | 20px | 28px |
| h3 | 16px | 24px |
| body | 14px | 20px |
| small | 12px | 16px |
| tiny | 10px | 12px |

### Spacing (4px base)
- XS: 4px
- S: 8px
- M: 16px
- L: 24px
- XL: 32px

### Radius
- `--radius: 0.75rem` (12px)

---

## 3. Componentes VF

### StatusBadge
- Props: `status` (8 tipos), `size` (sm/md/lg)
- Style: `bg-status/10 text-status border-status/20`
- Running: `animate-pulse` suave

### StepIndicator
- Props: `status`, `stepName`
- Ícones: Lucide (FileText, Code, Mic, Video, Image)
- Running: `Loader2` com animate-spin

### JobCard
- Layout: Grid (ID | Title | StatusBadge | MiniPipeline | Actions)
- Active: borda running com glow suave

### PipelineView
- Layout: Horizontal steps conectados por linha
- Step Node: Ícone + Nome + Duração
- Connector muda cor quando fluxo passa

### QuickAction
- Variantes: ghost, outline, destructive
- Tooltip obrigatório para icon-only

### ProgressRing
- SVG circle com stroke animado
- Props: `percent`, `size`, `color`

### MetricCard
- Label (muted) + Value (h2) + Trend
- Trend Up: success | Down: error

---

## 4. Layout

```
+----------------+---------------------------------------------------+
|  SIDEBAR (256) |  HEADER (h-14) Breadcrumbs / Actions              |
|  bg-card       +---------------------------------------------------+
|  border-r      |                                                   |
|                |  MAIN CONTENT (p-6)                               |
|  [Logo VF]     |  max-w-7xl mx-auto                                |
|                |                                                   |
|  - Dashboard   |  [Page Title + Actions]                           |
|  - Produção    |                                                   |
|  - Admin ▼     |  [Content: Table / Grid / Form]                   |
+----------------+---------------------------------------------------+
```

---

## 5. Guia de Uso

| Quando usar | Token |
|-------------|-------|
| Superfícies | `bg-background`, `bg-card` |
| Labels/meta | `text-muted-foreground` |
| Divisores | `border-border` |
| Links/destaques | `text-primary` |
| Em processamento | `text-status-running` |
| Sucesso | `text-status-success` |
| Erro | `text-status-error` |

---

**Arquivo CSS:** `app/globals.css`  
**Tailwind Config:** `tailwind.config.ts`
