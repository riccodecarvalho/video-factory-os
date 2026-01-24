# Video Factory OS - Frontend e Componentes

> **Objetivo:** Documentar estrutura de UI, componentes e design system
> **Fonte:** `components/`, `app/`, `tailwind.config.ts`, `globals.css`
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [Stack Frontend](#stack-frontend)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Design System](#design-system)
4. [Componentes UI (shadcn)](#componentes-ui-shadcn)
5. [Componentes VF (Video Factory)](#componentes-vf)
6. [Componentes Layout](#componentes-layout)
7. [Rotas e Páginas](#rotas-e-páginas)
8. [Padrões de Implementação](#padrões-de-implementação)

---

## STACK FRONTEND

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Next.js** | 14.x | Framework React (App Router) |
| **React** | 18.x | UI Library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Styling |
| **shadcn/ui** | latest | Componentes base |
| **Lucide React** | latest | Ícones |
| **dnd-kit** | latest | Drag and drop (Kanban) |

---

## ESTRUTURA DE DIRETÓRIOS

```
components/
├── layout/              # Componentes de layout global
│   ├── AppShell.tsx     # Shell principal da aplicação
│   ├── Breadcrumb.tsx   # Navegação breadcrumb
│   ├── EmptyState.tsx   # Estado vazio padrão
│   ├── Header.tsx       # Header da aplicação
│   ├── MainNav.tsx      # Navegação principal
│   ├── PageHeader.tsx   # Header de página
│   ├── Sidebar.tsx      # Sidebar de navegação
│   └── StatusBadge.tsx  # Badge de status
│
├── ui/                  # Componentes shadcn/ui
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── skeleton.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── tooltip.tsx
│   ├── ContextBanner.tsx      # Banner de contexto
│   └── LineNumberedTextarea.tsx # Textarea com linhas
│
└── vf/                  # Componentes Video Factory
    ├── CharacterCard.tsx      # Card de personagem
    ├── ErrorDetail.tsx        # Detalhe de erro
    ├── GeneratedResultCard.tsx # Card de resultado
    ├── JobCard.tsx            # Card de job
    ├── JobProgress.tsx        # Progresso de job
    ├── JobStepper.tsx         # Stepper de steps
    ├── KanbanBoard.tsx        # Board Kanban
    ├── KanbanColumn.tsx       # Coluna do Kanban
    ├── MarkdownPreview.tsx    # Preview de markdown
    ├── PresetCard.tsx         # Card de preset
    ├── PromptEditor.tsx       # Editor de prompts
    ├── RecipeCard.tsx         # Card de recipe
    ├── ScriptPreview.tsx      # Preview de script
    ├── StepCard.tsx           # Card de step
    ├── StepOutput.tsx         # Output de step
    ├── TimestampGenerator.tsx # Gerador de timestamp
    └── ...
```

---

## DESIGN SYSTEM

### Cores (tailwind.config.ts)

```typescript
// Cores semânticas
colors: {
  // Status
  'status-success': '#22c55e',    // Verde
  'status-warning': '#f59e0b',    // Amarelo
  'status-error': '#ef4444',      // Vermelho
  'status-info': '#3b82f6',       // Azul
  
  // Superfícies
  'surface-0': '#ffffff',         // Fundo principal
  'surface-1': '#f8fafc',         // Fundo secundário
  'surface-2': '#f1f5f9',         // Fundo terciário
  
  // Texto
  'text-primary': '#0f172a',
  'text-secondary': '#64748b',
  'text-muted': '#94a3b8',
  
  // Bordas
  'border-default': '#e2e8f0',
  'border-focus': '#3b82f6',
}
```

### Tipografia

```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'monospace'],
}

// Tamanhos
fontSize: {
  'xs': '0.75rem',    // 12px
  'sm': '0.875rem',   // 14px
  'base': '1rem',     // 16px
  'lg': '1.125rem',   // 18px
  'xl': '1.25rem',    // 20px
  '2xl': '1.5rem',    // 24px
}
```

### Espaçamento

```typescript
// Padrão 4px base
spacing: {
  '0': '0',
  '1': '0.25rem',   // 4px
  '2': '0.5rem',    // 8px
  '3': '0.75rem',   // 12px
  '4': '1rem',      // 16px
  '6': '1.5rem',    // 24px
  '8': '2rem',      // 32px
}
```

### Border Radius

```typescript
borderRadius: {
  'none': '0',
  'sm': '0.25rem',    // 4px
  'md': '0.375rem',   // 6px
  'lg': '0.5rem',     // 8px
  'xl': '0.75rem',    // 12px
  'full': '9999px',
}
```

---

## COMPONENTES UI (SHADCN)

### Instalação

```bash
# shadcn/ui já está configurado
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# etc.
```

### Configuração (components.json)

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Componentes Disponíveis

| Componente | Arquivo | Uso |
|------------|---------|-----|
| Button | `ui/button.tsx` | Botões e ações |
| Card | `ui/card.tsx` | Containers de conteúdo |
| Dialog | `ui/dialog.tsx` | Modais |
| DropdownMenu | `ui/dropdown-menu.tsx` | Menus dropdown |
| Input | `ui/input.tsx` | Campos de texto |
| Label | `ui/label.tsx` | Labels de formulário |
| Select | `ui/select.tsx` | Selects |
| Separator | `ui/separator.tsx` | Separadores visuais |
| Sheet | `ui/sheet.tsx` | Painéis laterais |
| Skeleton | `ui/skeleton.tsx` | Loading states |
| Switch | `ui/switch.tsx` | Toggle switches |
| Table | `ui/table.tsx` | Tabelas |
| Tabs | `ui/tabs.tsx` | Abas |
| Textarea | `ui/textarea.tsx` | Áreas de texto |
| Toast | `ui/toast.tsx` | Notificações |
| Tooltip | `ui/tooltip.tsx` | Tooltips |

---

## COMPONENTES VF

### JobCard

```typescript
// components/vf/JobCard.tsx
interface JobCardProps {
  job: Job;
  onClick?: () => void;
  showProgress?: boolean;
}

// Uso
<JobCard 
  job={job} 
  onClick={() => router.push(`/jobs/${job.id}`)}
  showProgress 
/>
```

### JobStepper

```typescript
// components/vf/JobStepper.tsx
interface JobStepperProps {
  steps: JobStep[];
  currentStep?: string;
  onStepClick?: (step: JobStep) => void;
}

// Exibe steps do job com status visual
// pending → running → success/failed
```

### KanbanBoard

```typescript
// components/vf/KanbanBoard.tsx
interface KanbanBoardProps {
  jobs: Job[];
  onJobMove?: (jobId: string, newStatus: string) => void;
}

// Colunas: draft, queued, running, completed, failed
// Drag & drop com dnd-kit
```

### PromptEditor

```typescript
// components/vf/PromptEditor.tsx
interface PromptEditorProps {
  prompt: Prompt;
  onSave: (updated: Prompt) => void;
  readOnly?: boolean;
}

// Editor de system prompt e user template
// Syntax highlighting para {{variáveis}}
```

### ScriptPreview

```typescript
// components/vf/ScriptPreview.tsx
interface ScriptPreviewProps {
  content: string;
  highlightStageDirections?: boolean;
}

// Preview de roteiro com Stage Directions coloridos
// (voz: X) em azul, [PAUSA] em cinza
```

### TimestampGenerator

```typescript
// components/vf/TimestampGenerator.tsx
// Gera timestamps anti-repetição para prompts
// Formato: 2026-01-24T14:30:00-03:00
```

---

## COMPONENTES LAYOUT

### AppShell

```typescript
// components/layout/AppShell.tsx
interface AppShellProps {
  children: React.ReactNode;
  sidebar?: boolean;
  header?: boolean;
}

// Layout principal da aplicação
// Sidebar + Header + Content
```

### PageHeader

```typescript
// components/layout/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

// Header padrão de páginas
```

### EmptyState

```typescript
// components/layout/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Estado vazio padrão para listas
```

### StatusBadge

```typescript
// components/layout/StatusBadge.tsx
type Status = 'draft' | 'queued' | 'running' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

// Badge com cores semânticas por status
```

---

## ROTAS E PÁGINAS

### Estrutura App Router

```
app/
├── layout.tsx              # Layout raiz
├── page.tsx                # Home (/)
├── globals.css             # CSS global
│
├── admin/                  # Área administrativa
│   ├── layout.tsx
│   ├── actions.ts          # Server Actions
│   ├── execution-map/      # Mapa de execução
│   ├── imagefx-config/     # Config ImageFX
│   ├── knowledge-base/     # KB CRUD
│   ├── presets/            # Presets CRUD
│   ├── prompts/            # Prompts CRUD
│   ├── providers/          # Providers CRUD
│   ├── recipes/            # Recipes CRUD
│   └── validators/         # Validators CRUD
│
├── api/                    # API Routes
│   ├── artifacts/          # Download de artifacts
│   ├── board/              # Kanban endpoints
│   └── health/             # Health check
│
├── board/                  # Kanban Board
│   ├── components/
│   ├── actions.ts
│   ├── layout.tsx
│   └── page.tsx
│
├── jobs/                   # Gestão de Jobs
│   ├── [id]/               # Detalhe do job
│   │   └── page.tsx
│   ├── new/                # Criar job
│   │   └── page.tsx
│   ├── actions.ts
│   └── page.tsx            # Lista de jobs
│
└── wizard/                 # Modo Wizard
    └── [id]/
        └── page.tsx
```

### Rotas Principais

| Rota | Função |
|------|--------|
| `/` | Home / Dashboard |
| `/board` | Kanban Board |
| `/jobs` | Lista de jobs |
| `/jobs/new` | Criar novo job |
| `/jobs/[id]` | Detalhe do job |
| `/wizard/[id]` | Wizard mode |
| `/admin/prompts` | CRUD prompts |
| `/admin/recipes` | CRUD recipes |
| `/admin/providers` | CRUD providers |
| `/admin/knowledge-base` | CRUD KB |
| `/admin/presets` | CRUD presets |

---

## PADRÕES DE IMPLEMENTAÇÃO

### Server Actions

```typescript
// app/admin/actions.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPrompts() {
  return db.select().from(prompts).all();
}

export async function createPrompt(data: NewPrompt) {
  const result = await db.insert(prompts).values(data);
  revalidatePath('/admin/prompts');
  return result;
}
```

### Componente com Server Action

```typescript
// app/admin/prompts/page.tsx
import { getPrompts } from '../actions';

export default async function PromptsPage() {
  const prompts = await getPrompts();
  
  return (
    <PageHeader title="Prompts" />
    <PromptList prompts={prompts} />
  );
}
```

### Client Component com Mutation

```typescript
// components/vf/PromptForm.tsx
'use client';

import { createPrompt } from '@/app/admin/actions';
import { useTransition } from 'react';

export function PromptForm() {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (data: FormData) => {
    startTransition(async () => {
      await createPrompt(data);
    });
  };
  
  return (
    <form action={handleSubmit}>
      {/* ... */}
      <Button disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
```

### Loading States

```typescript
// app/admin/prompts/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

### Error Handling

```typescript
// app/admin/prompts/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 rounded-lg">
      <h2>Algo deu errado!</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
```

---

## DARK MODE

### Configuração

```typescript
// tailwind.config.ts
{
  darkMode: 'class',
  // ...
}
```

### CSS Variables

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Uso

```typescript
// Componente adapta automaticamente
<div className="bg-background text-foreground">
  {/* Conteúdo */}
</div>
```

---

## COMO ADICIONAR NOVO COMPONENTE

### 1. Componente shadcn

```bash
npx shadcn-ui@latest add [component]
# Será criado em components/ui/
```

### 2. Componente VF

```typescript
// components/vf/NovoComponente.tsx
interface NovoComponenteProps {
  // props
}

export function NovoComponente({ ...props }: NovoComponenteProps) {
  return (
    // JSX
  );
}
```

### 3. Exportar (se necessário)

```typescript
// components/vf/index.ts
export * from './NovoComponente';
```

---

*Documentação de frontend e componentes do Video Factory OS.*
