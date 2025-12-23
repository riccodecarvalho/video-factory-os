# 🎨 UI Guidelines (Video Factory OS)

**Baseado em:** ADR-005, ADR-006, Design System Spec v2.0

---

## 🎯 Princípio Visual
**"Inspirado no 4pice, não portado."**  
Referência: Tela "Prompt Library" do 4pice Studio.

---

## 🚫 Glow Budget (Regra de Ouro)

- **ZERO Glow por padrão.**
- Nada de fundos com gradiente, glassmorphism excessivo ou bordas neon para hierarquia básica.
- **Permitido:**
  - `ring-offset` para foco (acessibilidade).
  - Animação sutil (pulse) apenas para status `running`.
  - Gradiente sutil para badges especiais (ex: VIRAL).

---

## 🧩 Componentes Canônicos (Primitives)

Use sempre estes componentes em vez de construir layouts do zero:

### Layout
| Componente | Uso | Localização |
|------------|-----|-------------|
| **SplitView** | Lista à esquerda, detalhe à direita | `components/layout/` |
| **PageHeader** | Breadcrumb + Título + Descrição + Ações | `components/layout/` |
| **SectionCards** | Grid de cards com contadores | `components/layout/` |
| **FiltersBar** | Input de busca + Chips de filtro | `components/layout/` |
| **EmptyState** | Ilustração + Texto + Botão (quando vazio) | `components/layout/` |

### Status e Feedback
| Componente | Uso | Localização |
|------------|-----|-------------|
| **StatusBadge** | Exibir status (8 estados) | `components/vf/` |
| **StepExecutionProgress** | Feedback de execução de IA | `components/vf/` |
| **ProcessNotification** | Toast para processos background | `components/vf/` |

### Pipeline e Jobs
| Componente | Uso | Localização |
|------------|-----|-------------|
| **PipelineView** | Visualização de steps | `components/vf/` |
| **JobCard** | Card de job na lista | `components/vf/` |
| **MetricCard** | Card com métrica | `components/vf/` |

### Wizard
| Componente | Uso | Localização |
|------------|-----|-------------|
| **WizardStepper** | Navegação hierárquica 2 níveis | `components/vf/` |
| **GeneratedResultCard** | Card de resultado de IA | `components/vf/` |
| **IterateWithAI** | Campo para iterar com IA | `components/vf/` |
| **WizardFooter** | Footer fixo de navegação | `components/vf/` |
| **PreviousStepsContext** | Contexto de steps anteriores | `components/vf/` |

### Conteúdo
| Componente | Uso | Localização |
|------------|-----|-------------|
| **TagChips** | Tags editáveis como badges | `components/vf/` |
| **CharacterCard** | Card de personagem narrativo | `components/vf/` |
| **UsageIndicator** | Badge de contagem de uso | `components/vf/` |
| **UsedBySection** | Seção "Usado em" | `components/vf/` |

---

## 🌞 Light/Dark Mode

- **Light First:** O design deve funcionar perfeitamente no light mode (como o 4pice).
- **Dark Mode:** Apenas inversão de cores sem adicionar "efeitos neon" desnecessários.

---

## 📐 Padrões de Layout

### Página Admin Típica
```
┌─────────────────────────────────────────────────────┐
│ PageHeader: Breadcrumb • Título • Actions          │
├─────────────────────────────────────────────────────┤
│ FiltersBar: [Pesquisar...] [Filtro1] [Filtro2]     │
├───────────────────┬─────────────────────────────────┤
│ SplitView.List    │ SplitView.Detail               │
│ ─────────────     │ ─────────────────               │
│ □ Item 1 (active) │ Título + Badge                 │
│ □ Item 2          │                                 │
│ □ Item 3          │ Tabs: [ Config ] [ Uso ] ...   │
│                   │                                 │
│                   │ Conteúdo do detalhe            │
└───────────────────┴─────────────────────────────────┘
```

### Wizard Típico
```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Home / Produção / Wizard               │
├─────────────────────────────────────────────────────┤
│ WizardStepper: [1]──[2]──[3]──[4]──[5]──[6]        │
│ ━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░ 45% completo     │
├───────────────────┬─────────────────────────────────┤
│ PreviousContext   │ StepExecutionProgress          │
│ Pipeline          │ ou                              │
│                   │ GeneratedResultCard            │
│                   │                                 │
│                   │ IterateWithAI                  │
├───────────────────┴─────────────────────────────────┤
│ WizardFooter: [← Anterior] [Status] [Próximo →]    │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Guidelines para Novas Features

### Checklist Antes de Criar UI

1. ✅ Existe um componente canônico que atende?
2. ✅ Segue padrão SplitView para listas com detalhes?
3. ✅ Zero Glow (sem gradientes excessivos)?
4. ✅ Light mode first, dark mode por inversão?
5. ✅ Feedback visual para toda operação assíncrona?
6. ✅ Estados tratados: loading, empty, error, success?

### Feedback de Operações Assíncronas

| Operação | Componente | Descrição |
|----------|------------|-----------|
| Chamada LLM | StepExecutionProgress | Timer + barra animada |
| Processo background | ProcessNotification | Toast no canto |
| Submit form | Button (loading) | Ícone Loader2 spinning |
| Carregamento | Skeleton | Placeholder animado |

### Cards de Resultado de IA

Sempre estruturar com:
- **Header:** Título + Badge de status
- **Body:** Conteúdo principal + Metadata (se houver)
- **Footer:** Ações (Regenerar, Aprovar, Iterar)

---

## 🏷️ Status Visuais

| Status | Cor | Uso |
|--------|-----|-----|
| Success | Verde | Completado, pronto |
| Warning | Âmbar | Atenção necessária |
| Error | Vermelho | Falha crítica |
| Running | Violeta | Processando (animate) |
| Pending | Slate | Aguardando na fila |
| Skipped | Cinza | Pulado intencionalmente |

---

## 📁 Estrutura de Componentes

```
components/
├── layout/           # Componentes de layout
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── SuspenseSidebar.tsx
│   ├── PageHeader.tsx
│   ├── SplitView.tsx
│   ├── EmptyState.tsx
│   └── FiltersBar.tsx
│
├── ui/               # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── ...
│
└── vf/               # Video Factory específicos
    ├── StatusBadge.tsx
    ├── PipelineView.tsx
    ├── JobCard.tsx
    ├── MetricCard.tsx
    ├── WizardStepper.tsx
    ├── StepExecutionProgress.tsx
    ├── GeneratedResultCard.tsx
    ├── IterateWithAI.tsx
    ├── WizardFooter.tsx
    ├── PreviousStepsContext.tsx
    ├── TagChips.tsx
    ├── CharacterCard.tsx
    ├── ProcessNotification.tsx
    ├── UsageIndicator.tsx
    └── UsedBySection.tsx
```

---

**Documentação relacionada:**
- Design System Spec: `docs/03-development/ds-spec.md`
- Tailwind Config: `tailwind.config.ts`
- CSS Global: `app/globals.css`
