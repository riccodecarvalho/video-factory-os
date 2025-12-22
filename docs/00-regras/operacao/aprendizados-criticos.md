# 🔒 Aprendizados Críticos — Garantia de Alinhamento

> **Extraído de:** Conversas anteriores (Gates 0.8 - 1.8)  
> **Data:** 2025-12-22  
> **Objetivo:** Evitar repetição de erros e manter governança

---

## 1) Problemas Recorrentes Identificados

### 1.1 Bindings com Slugs ao invés de IDs
**O que aconteceu:** Bindings de execution_bindings usavam `graciela.ideacao.v2` (slug) quando deveriam usar o ID real do banco.

**Lição:** Sempre usar IDs de entidades, nunca slugs, em relacionamentos FK.

**Prevenção:**
```typescript
// ❌ ERRADO
target_id: 'graciela.ideacao.v2'

// ✅ CORRETO  
target_id: prompt.id // Ex: 'f0agBepe2vxQWFVMTwqfr'
```

---

### 1.2 Steps Duplicados no Runner
**O que aconteceu:** Ao reexecutar jobs, os steps eram criados novamente sem verificar se já existiam, causando duplicação.

**Lição:** Sempre verificar existência ANTES de criar, não confiar em `onConflictDoNothing` sem constraint no schema.

**Prevenção:**
```typescript
// ✅ Verificar antes de criar
const existingSteps = await db.query.jobSteps.findMany({
  where: eq(schema.jobSteps.jobId, jobId)
});
if (existingSteps.length === 0) {
  await db.insert(schema.jobSteps).values(...);
}
```

---

### 1.3 Prompts com Placeholders
**O que aconteceu:** Prompts foram seedados com `Ver arquivo: docs/.../ideacao-v2.md` ao invés do conteúdo real.

**Lição:** NUNCA usar referências a arquivos em dados de banco. O conteúdo precisa estar no banco ou o sistema falha silenciosamente.

**Prevenção:**
- Ao criar scripts de seed, ler o conteúdo do arquivo markdown
- Validar que `system_prompt` e `user_template` têm conteúdo real (>100 chars)

---

### 1.4 FFmpeg/Módulos Nativos no Browser
**O que aconteceu:** Next.js tentou bundlear `@ffmpeg-installer` no browser, causando erro.

**Lição:** Módulos que usam paths do sistema (ffmpeg, node:crypto, etc) precisam ficar isolados em server actions.

**Prevenção:**
- Usar `"use server"` no topo de arquivos com módulos nativos
- Configurar `serverComponentsExternalPackages` no next.config.js
- Usar imports dinâmicos `await import()` quando necessário

---

### 1.5 .gitignore Genérico Quebrando App
**O que aconteceu:** Regra `jobs/` ignorou tanto `/jobs/` (artifacts) quanto `/app/jobs/` (código).

**Lição:** Sempre usar paths absolutos no .gitignore para evitar matches indesejados.

**Prevenção:**
```gitignore
# ❌ ERRADO
jobs/

# ✅ CORRETO
/jobs/
```

---

## 2) Padrões de Governança Validados

### 2.1 Config-First Funciona
- Tudo configurável via UI (prompts, presets, providers, validators)
- `getPromptOrThrow()` impede hardcode silencioso
- Bindings permitem trocar configuração sem código

### 2.2 Manifest-First Funciona
- Jobs geram manifest completo com snapshots
- Permite reprodutibilidade total
- Logs estruturados por step

### 2.3 Step Keys em PT-BR
- Todos os steps usam nomenclatura PT-BR (ideacao, titulo, planejamento, roteiro, etc)
- Step mapper faz alias entre keys antigas e novas

---

## 3) Checklist Anti-Regressão (usar antes de PR)

```
[ ] Bindings usam IDs, não slugs
[ ] Runner verifica steps existentes antes de criar
[ ] Prompts têm conteúdo real (não referências a arquivos)
[ ] Módulos nativos isolados em server actions
[ ] .gitignore usa paths absolutos
[ ] Build passa (`npm run build`)
[ ] Push realizado
[ ] SHA âncora atualizada
```

---

## 4) Aplicação na Fase 2.0 (Render Engine Evolution)

Para a evolução atual do render engine, estes cuidados se aplicam:

| Item | Como Aplicar |
|------|--------------|
| IDs vs Slugs | Se Timeline DSL referenciar presets, usar IDs |
| Verificação pré-execução | RenderPlan deve validar inputs existem |
| Conteúdo não placeholder | Templates no banco, não referências a arquivos |
| Módulos nativos | FFmpeg commands no server-only |

---

**Este documento é vivo. Atualizar sempre que identificar novo padrão de erro.**
