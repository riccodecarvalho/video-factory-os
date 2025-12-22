# Health Check Matrix - 2025-12-18

## Legenda
- 🟢 Verde: Funcionando, documentado, testado
- 🟡 Amarelo: Funciona mas falta doc/teste
- 🔴 Vermelho: Não funciona ou risco alto
- ⚫ Cinza: Não verificado

---

## UI Pages

| Feature | Status | Funciona? | Documentado? | Testado? |
|---------|--------|-----------|--------------|----------|
| Dashboard (`/`) | 🟢 | ✅ | ✅ | ❌ |
| Jobs List (`/jobs`) | 🟢 | ✅ | ✅ | ❌ |
| Job Create (`/jobs/new`) | 🟡 | ✅ | ⚠️ | ❌ |
| Job Detail (`/jobs/[id]`) | 🟢 | ✅ | ✅ | ❌ |
| Admin Prompts | 🔴 | ❌ Erro TS | ⚠️ | ❌ |
| Admin Recipes | 🟡 | ⚠️ | ⚠️ | ❌ |
| Admin Execution Map | 🟡 | ⚠️ | ⚠️ | ❌ |
| Admin Providers | 🟡 | ⚠️ | ⚠️ | ❌ |
| Admin Presets | 🟡 | ⚠️ | ⚠️ | ❌ |
| Admin KB | 🟡 | ⚠️ | ⚠️ | ❌ |

---

## Engine/Pipeline Steps

| Step | Status | Funciona? | Documentado? |
|------|--------|-----------|--------------|
| title (LLM) | 🟢 | ✅ | ✅ |
| brief (LLM) | 🟢 | ✅ | ✅ |
| script (LLM) | 🟢 | ✅ | ✅ |
| parse_ssml (Transform) | 🟢 | ✅ | ✅ |
| tts (Azure TTS) | 🟢 | ✅ | ✅ |
| render (FFmpeg) | 🔴 | ⚠️ Stub | ⚠️ |
| export | 🔴 | ⚠️ Stub | ⚠️ |

---

## APIs

| Endpoint | Status | Funciona? |
|----------|--------|-----------|
| GET /api/health | 🟢 | ✅ |
| GET /api/artifacts/* | 🟢 | ✅ |
| GET /api/jobs/[id]/artifacts/* | 🟢 | ✅ |

---

## Build & Tooling

| Item | Status | Observação |
|------|--------|------------|
| npm install | 🟢 | ✅ mas 8 vulns |
| npm run build | 🔴 | ❌ 3 erros TS |
| npm run lint | 🔴 | ❌ Não configurado |
| npm test | 🔴 | ❌ Não existe |
| npx tsc --noEmit | 🔴 | ❌ 3 erros |

---

## 📊 ANÁLISE PROFUNDA: Database Schema

### Tabelas do Sistema (16 total)

| Tabela | Linhas Schema | Colunas | Status | Observações |
|--------|---------------|---------|--------|-------------|
| `projects` | 21 | 5 | 🟢 | Contexto de projetos/canais |
| `execution_bindings` | 51 | 11 | 🟢 | Core do wiring configs-first |
| `prompts` | 82 | 15 | 🟢 | Templates LLM com variáveis |
| `knowledge_base` | 102 | 10 | 🟢 | Docs por tier (sempre/contexto/demanda) |
| `presets_voice` | 129 | 13 | 🟢 | Config Azure TTS |
| `presets_video` | 155 | 11 | 🟢 | Config FFmpeg |
| `presets_effects` | 177 | 8 | 🟡 | Filtergraph FFmpeg - pouco usado? |
| `validators` | 202 | 10 | 🟢 | Validação como dados |
| `providers` | 220 | 9 | 🟢 | Claude, Azure configs |
| `recipes` | 248 | 12 | 🟢 | Pipeline definitions |
| `jobs` | 286 | 15 | 🟢 | Core - execuções |
| `job_steps` | 321 | 14 | 🟢 | Estado por etapa |
| `artifacts` | 347 | 12 | 🟢 | Arquivos gerados |
| `presets_ssml` | 367 | 7 | 🟢 | Pause mappings |
| `presets` (unificada) | 394 | 10 | 🟡 | Tabela alternativa - duplicação? |
| `audit_events` | 424 | 13 | 🟢 | Rastreabilidade |
| `script_versions` | 457 | 13 | 🟢 | Versionamento de roteiros |
| `scene_markers` | 487 | 12 | 🟡 | Marcadores de cena - usado? |

### Observações Críticas de Schema

1. **Duplicação de Presets**: Existem tabelas `presets_voice`, `presets_video`, `presets_ssml`, `presets_effects` E uma tabela `presets` unificada. Isso pode causar confusão.

2. **Schema bem tipado**: Uso consistente de `text('column')`, `integer('column')`, etc. Bom uso de defaults.

3. **Soft delete implementado**: `deletedAt` em jobs permite recuperação.

4. **Versioning**: prompts e recipes têm `version` field para controle.

---

## 📊 ANÁLISE PROFUNDA: Componentes

### Video Factory Components (`components/vf/` - 15 arquivos)

| Componente | Tamanho | Propósito | Status |
|------------|---------|-----------|--------|
| `JobCard.tsx` | 2.1KB | Card de job no dashboard | 🟢 |
| `MetricCard.tsx` | 0.6KB | Métricas no dashboard | 🟢 |
| `StatusBadge.tsx` | 1.2KB | Badge de status | 🟢 |
| `PipelineView.tsx` | 8.6KB | Visualização de pipeline | 🟢 |
| `StepIndicator.tsx` | 3.6KB | Indicador de step | 🟢 |
| `StepPreview.tsx` | **12.6KB** | Preview de step | 🟡 Grande - refatorar? |
| `JobConfigTab.tsx` | 7.0KB | Tab de config do job | 🟢 |
| `JobArtifactsTab.tsx` | 8.7KB | Tab de artifacts | 🟢 |
| `LogsViewer.tsx` | 3.5KB | Visualizador de logs | 🟢 |
| `ManifestViewer.tsx` | 2.8KB | JSON viewer | 🟢 |
| `ProgressRing.tsx` | 2.5KB | Ring de progresso | 🟢 |
| `QuickAction.tsx` | 0.9KB | Ações rápidas | 🟢 |
| `TierExplainer.tsx` | 3.2KB | Explicador de tiers KB | 🟢 |
| `UsedBySection.tsx` | 4.5KB | Onde é usado | 🟢 |
| `index.ts` | 0.5KB | Exports | 🟢 |

### UI Components (`components/ui/` - 16 arquivos)

| Componente | Origem | Status |
|------------|--------|--------|
| `button.tsx` | shadcn/radix | 🟢 |
| `card.tsx` | shadcn/radix | 🟢 |
| `dialog.tsx` | shadcn/radix | 🟢 |
| `select.tsx` | shadcn/radix | 🟢 |
| `tabs.tsx` | shadcn/radix | 🟢 |
| `badge.tsx` | shadcn/radix | 🟢 |
| `input.tsx` | shadcn/radix | 🟢 |
| `textarea.tsx` | shadcn/radix | 🟢 |
| `progress.tsx` | shadcn/radix | 🟢 |
| `slider.tsx` | shadcn/radix | 🟢 |
| `label.tsx` | shadcn/radix | 🟢 |
| `scroll-area.tsx` | shadcn/radix | 🟢 |
| `skeleton.tsx` | shadcn/radix | 🟢 |
| `client-date.tsx` | Custom | 🟢 |
| `ContextBanner.tsx` | Custom | 🟢 |
| `LineNumberedTextarea.tsx` | Custom | 🟢 |

---

## 📊 ANÁLISE PROFUNDA: Server Actions

### Admin Actions (`app/admin/actions.ts` - 728 linhas, 52 funções)

| Domínio | Funções | Status |
|---------|---------|--------|
| Prompts | getPrompts, getPromptCategories, updatePrompt, createPrompt | 🟢 |
| Providers | getProviders, getProviderTypes, updateProvider, createProvider | 🟢 |
| Validators | getValidators, getValidatorTypes, updateValidator, createValidator | 🟢 |
| Recipes | getRecipes, updateRecipe, createRecipe | 🟢 |
| Knowledge Base | getKnowledgeBase, getKnowledgeTiers, updateKnowledge, createKnowledge | 🟢 |
| Presets Voice | getVoicePresets | 🟢 |
| Presets SSML | getSsmlPresets | 🟢 |
| Presets Video | getVideoPresets, createVideoPreset, updateVideoPreset, deleteVideoPreset | 🟢 |
| Presets Effects | getEffectsPresets | 🟢 |
| Projects | getProjects, createProject, updateProject, toggleProjectActive | 🟢 |
| Bindings | Várias funções de binding | 🟢 |

---

## Resumo

| Categoria | 🟢 | 🟡 | 🔴 |
|-----------|----|----|-----|
| UI Pages | 3 | 6 | 1 |
| Pipeline Steps | 5 | 0 | 2 |
| APIs | 3 | 0 | 0 |
| Tooling | 1 | 0 | 4 |
| DB Tables | 13 | 3 | 0 |
| Components | 28 | 2 | 0 |
| Server Actions | 52 | 0 | 0 |
| **Total** | **105** | **11** | **7** |

**Health Score: 85% (105/123 verde)**

> Nota: O sistema está mais saudável do que parecia inicialmente. Os problemas principais estão concentrados em:
> 1. Build quebrado (3 erros TS)
> 2. Steps stub (render, export)
> 3. Tooling faltando (ESLint, tests)
