# Design System Spec — Video Factory OS

> **Versão:** 2.0  
> **Data:** 2025-12-23  
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

| Scale | Size | Line Height | Uso |
|-------|------|-------------|-----|
| h1 | 24px | 32px | Títulos de página |
| h2 | 20px | 28px | Seções |
| h3 | 16px | 24px | Subtítulos |
| body | 14px | 20px | Texto padrão |
| small | 12px | 16px | Labels, meta |
| tiny | 10px | 12px | Badges, tags |

### Spacing (4px base)
- XS: 4px
- S: 8px
- M: 16px
- L: 24px
- XL: 32px

### Radius
- `--radius: 0.75rem` (12px)

---

## 3. Componentes VF Core

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

## 4. Componentes VF Wizard (v2.0)

### WizardStepper
Stepper hierárquico de 2 níveis para controle de fluxo.

```tsx
interface WizardStepperProps {
    phases: WizardPhase[];        // Fases (Conceituação, Planejamento, etc.)
    currentPhaseId: string;       // Fase atual
    currentStepKey: string;       // Step atual dentro da fase
    steps: WizardStep[];          // Todos os steps
    progress: number;             // 0-100
    projectId?: string;           // ID do projeto (truncado)
    projectName?: string;         // Nome para exibição
}
```

**Visual:**
- Nível 1: Círculos numerados conectados (fases)
- Nível 2: Pills/chips para steps dentro da fase
- Barra de progresso global
- Cores: completed (verde), active (primary), pending (muted)

### StepExecutionProgress
Feedback visual para execução de steps de IA.

```tsx
interface StepExecutionProgressProps {
    stepName: string;             // Nome do step
    stepKey: string;              // Chave técnica
    isExecuting: boolean;         // Estado de execução
    estimatedSeconds?: number;    // Tempo estimado
    logs?: string[];              // Últimos logs
    onCancel?: () => void;        // Callback para cancelar
}
```

**Visual:**
- Header: Ícone spinning + nome + tempo decorrido
- Barra de progresso animada (gradiente azul)
- Texto de status contextual (Preparando... → Processando... → Finalizando...)
- Área de logs rolling (últimas 3 linhas)
- Botão cancelar (ghost)

### GeneratedResultCard
Card estruturado para exibir conteúdo gerado por IA.

```tsx
interface GeneratedResultCardProps {
    title: string;                // Título do card
    content: string;              // Conteúdo principal
    metadata?: {
        protagonista?: string;
        conflito?: string;
        emocaoAlvo?: string;
        keywords?: string[];
    };
    isViral?: boolean;            // Badge [VIRAL]
    onRegenerate?: () => void;    // Regenerar
    onApprove?: () => void;       // Aprovar
}
```

**Visual:**
- Header: Check verde + título + badge viral (gradiente roxo/rosa)
- Body: Conteúdo em aspas + grid de metadata
- Metadata: Ícones (User, Swords, Heart, Tag) + labels muted
- Footer: Botões Regenerar (outline) e Aprovar (primary)

### IterateWithAI
Campo de entrada para solicitar mudanças no conteúdo.

```tsx
interface IterateWithAIProps {
    placeholder?: string;
    onIterate: (instruction: string) => void;
    suggestions?: string[];       // Sugestões rápidas
}
```

**Visual:**
- Header: Ícone Sparkles + "Iterar com IA"
- Textarea com botão Send integrado
- Quick suggestions como chips/buttons

### WizardFooter
Navegação fixa para o Wizard.

```tsx
interface WizardFooterProps {
    canGoBack: boolean;
    canGoNext: boolean;
    onBack: () => void;
    onNext: () => void;
    stepDescription?: string;
}
```

**Visual:**
- Fixo no bottom (z-40)
- Background blur + border-t
- Layout: [← Anterior] | [Status] | [Salvar] [Próximo →]

### PreviousStepsContext
Resumo de contexto dos steps anteriores.

```tsx
interface PreviousStepsContextProps {
    steps: { stepKey: string; stepName: string; summary: string }[];
    maxVisible?: number;          // Default: 2
}
```

**Visual:**
- Card com bg-muted/30
- Header: Ícone Lightbulb + "Contexto dos passos anteriores"
- Lista: stepName (bold) + summary (truncated)
- Botão expandir se houver mais

---

## 5. Componentes VF Content (v2.0)

### TagChips
Tags como badges clicáveis e editáveis.

```tsx
interface TagChipsProps {
    tags: string[];
    onRemove?: (tag: string) => void;
    onAdd?: (tag: string) => void;
    editable?: boolean;
    variant?: "default" | "ghost" | "outline";
}
```

**Visual:**
- Chips com espaçamento gap-1.5
- X para remover (se editable)
- Input inline para adicionar (se editable)

### CharacterCard
Card para personagens narrativos.

```tsx
interface CharacterCardProps {
    type: "protagonista" | "vilao" | "mentor" | "coadjuvante";
    nome: string;
    descricao: string;
    idade?: number;
    profissao?: string;
}
```

**Visual:**
- Ícone por tipo: User (protagonista), Skull (vilão), GraduationCap (mentor)
- Cores: Green (protagonista), Red (vilão), Blue (mentor)
- Avatar placeholder com inicial
- Layout: Avatar + Nome + Descrição + Meta (idade, profissão)

### ProcessNotification
Toast para notificar processos em background.

```tsx
interface ProcessNotificationProps {
    processes: {
        id: string;
        title: string;
        status: "running" | "completed" | "failed";
    }[];
    onDismiss: (id: string) => void;
}
```

**Visual:**
- Fixo no canto inferior direito (z-50)
- Card com shadow-lg
- Ícone de status + título + botão dismiss
- Auto-dismiss após 5s para completed

### UsageIndicator
Badge para mostrar contagem de uso.

```tsx
interface UsageIndicatorProps {
    count: number;
    label?: string;               // Default: "usos"
    onClick?: () => void;
}
```

**Visual:**
- Badge pequeno (text-xs)
- Cores: 0 = muted, 1+ = primary/10
- Clicável se onClick fornecido

---

## 6. UI Patterns

### PageHeader
- `breadcrumb` + `title` + `description` + `actions`
- Border-b, bg-card
- Tipografia: h1 text-2xl font-semibold

### SplitView
- Lista à esquerda (1/3), detalhe à direita (2/3)
- Estados: loading, empty, selected
- Active item: `border-l-4 border-l-primary bg-primary/5`

### SectionCards
- Grid de cards com contadores
- Active: `border-primary/50 bg-primary/5`
- Usado para categorias (Todos, Analysis, etc)

### EmptyState
- Variantes: empty, error, no-results
- Icon + title + description + action button

### FiltersBar
- Chips/tabs à esquerda + busca à direita
- Active chip: `bg-primary text-primary-foreground`

---

## 7. Layout Master

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

## 8. Guia de Uso Rápido

| Quando usar | Token/Componente |
|-------------|------------------|
| Superfícies | `bg-background`, `bg-card` |
| Labels/meta | `text-muted-foreground` |
| Divisores | `border-border` |
| Links/destaques | `text-primary` |
| Em processamento | `StatusBadge status="running"` |
| Sucesso | `StatusBadge status="success"` |
| Erro | `StatusBadge status="failed"` |
| Lista com detalhe | `SplitView` |
| Página admin | `PageHeader` + `SplitView` |
| Wizard | `WizardStepper` + `StepExecutionProgress` |
| Resultado IA | `GeneratedResultCard` |
| Tags editáveis | `TagChips editable` |

---

## 9. Regras de Ouro

### Zero Glow Budget
- **ZERO Glow por padrão**
- Sem gradientes, glassmorphism ou bordas neon
- **Exceções permitidas:**
  - `ring-offset` para foco (acessibilidade)
  - `animate-pulse` para status running
  - Gradiente sutil em badges especiais (VIRAL)

### Light/Dark Mode
- **Light First:** Design funciona perfeitamente no light mode
- **Dark Mode:** Inversão de cores sem efeitos neon

### Componentes Canônicos
Use sempre os componentes canônicos em vez de construir do zero:
1. `SplitView` para listas com detalhes
2. `PageHeader` para headers de página
3. `EmptyState` para estados vazios
4. `StatusBadge` para status
5. `PipelineView` para pipelines

---

**Arquivo CSS:** `app/globals.css`  
**Tailwind Config:** `tailwind.config.ts`  
**Componentes VF:** `components/vf/`
