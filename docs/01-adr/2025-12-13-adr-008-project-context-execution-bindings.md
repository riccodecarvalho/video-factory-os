# ADR-008: Project Context + Execution Bindings

> **Status:** Aceito  
> **Data:** 2025-12-13  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

O sistema precisa de governança operacional via UI Admin, não via código. Queremos:

1. **Visibilidade**: saber qual prompt/provider/preset é usado em cada step
2. **Configurabilidade**: trocar bindings via Admin sem alterar código
3. **Multi-projeto**: suportar Graciela e futuros canais
4. **Rastreabilidade**: "Used by" para cada entidade

---

## Decisão

Criar duas novas tabelas:

### 1. Projects

```sql
projects (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,  -- 'graciela'
  name TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_at TEXT
)
```

### 2. Execution Bindings

```sql
execution_bindings (
  id TEXT PRIMARY KEY,
  scope TEXT,         -- 'global' | 'project'
  project_id TEXT,    -- null for global
  recipe_id TEXT,
  step_key TEXT,
  slot TEXT,          -- 'prompt' | 'provider' | 'preset_voice' | 'preset_ssml' | 'validators' | 'kb'
  target_id TEXT,
  priority INTEGER,
  is_active BOOLEAN,
  created_at TEXT,
  updated_at TEXT
)
```

---

## Fluxo de Resolução

```
getEffectiveConfig(recipe_id, step_key, project_id?):
  1. Busca bindings global para recipe + step
  2. Busca bindings project para recipe + step + project
  3. Para cada slot: project override > global fallback
  4. Resolve target_id → entidade completa
```

---

## UI: Execution Map

**Rota:** `/admin/execution-map`

**Layout:**
- Filtros: Recipe selector + Scope selector (Global / Project)
- SplitView: Steps (left) + Slots detail (right)
- Slots:
  - Prompt (single)
  - Provider (single)
  - Voice Preset (single)
  - SSML Preset (single)
  - Validators (multi)
  - Knowledge Base (multi)

**Ações:**
- Change (dropdown)
- Save
- Reset to Global (para project overrides)

---

## "Used By" Sections

Em cada página de detail (Prompt, Provider, Preset, Validator, KB):

```
Used by:
- Recipe: Graciela YouTube Long
- Step: script
- Slot: prompt
- Scope: global
→ [Link to Execution Map]
```

---

## Integração Runner

```typescript
// Antes de executar step
const config = await getEffectiveConfig(recipeId, stepKey, projectId);
manifest.snapshots.step[stepKey] = {
  prompt: config.prompt,
  provider: config.provider,
  ...
};
```

---

## Consequências

### Positivas
- Governança completa via UI
- Zero hardcode de decisões de execução
- Rastreabilidade de impacto
- Suporte multi-projeto

### Negativas
- Mais complexidade no DB
- Seed inicial necessário

---

## Referências

- [ADR-007: Engine Execution Model](./2025-12-13-adr-007-engine-execution-model.md)
- [Schema: lib/db/schema.ts](../../lib/db/schema.ts)

---

**Última atualização:** 2025-12-13
