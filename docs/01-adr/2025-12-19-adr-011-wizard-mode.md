# ADR-011: Wizard Mode (Step-by-Step Video Creation)

> **Status:** Aceito  
> **Data:** 2025-12-19  
> **Decisores:** Ricco (owner), Antigravity (implementador)

---

## Contexto

O Video Factory tem um modo **automático** (`/jobs/new`) que executa todos os steps sequencialmente. Para maior controle criativo, queremos um modo **wizard** onde o usuário aprova cada step antes de continuar.

O wizard foi tentado anteriormente mas **ignorou o design system**, criando dívida técnica. Esta é a decisão de como implementar corretamente.

---

## Decisão

Implementar wizard **reutilizando componentes VF existentes**:

### Componentes a Reusar

| Componente | Uso no Wizard |
|------------|---------------|
| `PipelineView` | Stepper/progresso visual |
| `StepPreview` | Preview de outputs por step |
| `StatusBadge` | Status do step atual |
| `ProgressRing` | Loading indicator |
| `QuickAction` | Botões de ação |

### Arquitetura

```
app/wizard/
├── page.tsx                    # Entry: seleção de projeto/recipe
└── [jobId]/
    └── page.tsx                # Single page com PipelineView + StepPreview
```

**Uma página única** que mostra:
1. `PipelineView` (sidebar ou header) com steps
2. Área central com `StepPreview` do step atual
3. Ações: Aprovar / Regenerar / Feedback

### Engine Changes

Adicionar ao schema `jobs`:
```sql
executionMode TEXT DEFAULT 'auto'  -- 'auto' | 'wizard'
```

Na execução:
- `auto`: executa todos steps automaticamente
- `wizard`: para após cada step, aguarda aprovação

---

## Fluxo do Wizard

```
1. User seleciona Projeto + Recipe
   └─> Cria job com executionMode = 'wizard'

2. Para cada step:
   ├─ Executar step (LLM/TTS/etc)
   ├─ Mostrar output em StepPreview
   └─ Aguardar ação:
       ├─ "Aprovar" → avança para próximo
       └─ "Regenerar" → re-executa com feedback

3. Ao final:
   └─ Job completed, todos outputs disponíveis
```

---

## O que NÃO Fazer

❌ Criar novos componentes de step (usar StepPreview)  
❌ CSS inline (usar design tokens de globals.css)  
❌ Ignorar PipelineView (já tem stepper)  
❌ Criar estrutura paralela (integrar com /jobs)

---

## Consequências

### Positivas
- Reutiliza componentes maduros
- Consistência visual com resto do sistema
- Menos código a manter

### Negativas
- Pode precisar adaptar StepPreview para contexto wizard
- PipelineView pode precisar modo compacto

---

## Alternativas Consideradas

### Criar UI separada do zero
**Rejeitada:** Foi tentado e gerou dívida técnica.

### Apenas adicionar aprovação ao modo automático
**Considerada:** Viável, mas wizard dá mais flexibilidade.

---

## Referências

- [ADR-004 Design System](./2025-12-13-adr-004-design-system.md)
- [ADR-007 Engine Execution Model](./2025-12-13-adr-007-engine-execution-model.md)
- [PipelineView](../../components/vf/PipelineView.tsx)
- [StepPreview](../../components/vf/StepPreview.tsx)

---

**Última atualização:** 2025-12-19
