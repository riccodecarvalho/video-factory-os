---
description: Workflow de governança para início de sessão
---

# 🔄 Workflow de Governança — Início de Sessão

Este workflow garante que todas as decisões e regras do projeto sejam respeitadas em cada sessão.

## Passo 1: Verificar Fonte da Verdade

// turbo
```bash
cat docs/05-timeline/2025-12-13/README.md | head -100
```

Verificar:
- SHA âncora está atualizado?
- Handover existe?
- Sessions estão listadas?

## Passo 2: Verificar Decisões Fundacionais

Ler e internalizar:
- `docs/04-produto/prd.md` → Seções 1.4 (Por que não n8n), 1.5 (5 Módulos), 2.5 (KB Tiers)
- `docs/04-produto/architecture.md` → Stack, 4 Camadas, Adapters
- `docs/01-adr/` → 6 ADRs ativos

## Passo 3: Verificar Regras Operacionais

Ler:
- `docs/00-regras/workflow-inicio.md` → Regras de comportamento
- `docs/00-regras/operacao/troubleshooting.md` → Lições aprendidas

## Passo 4: REGRAS NÃO NEGOCIÁVEIS

### Config-First (NUNCA violar)
- ❌ NUNCA hardcodar prompts, vozes, presets, providers
- ❌ NUNCA usar fallback silencioso
- ✅ SEMPRE usar `getPromptOrThrow()`, dados do DB
- ✅ Se falta config → FALHAR EXPLICITAMENTE

### Manifest-First
- ✅ Todo job gera manifest JSON
- ✅ Manifest = fonte da verdade da execução
- ✅ Re-render sem reprocessar tudo

### Prompt-as-Data
- ✅ Prompts vêm do DB (tabela `prompts`)
- ✅ Knowledge Base por tiers (tier1/2/3)
- ✅ Variáveis com `{{placeholder}}`

### UI de Receitas (não copiar n8n)
- ✅ UI orientada a Receitas, não flow builder
- ✅ Foco em produto, não automação genérica

## Passo 5: Verificar Status Git

// turbo
```bash
git status && git log --oneline -5
```

## Passo 6: Criar Session Log

Se for uma nova sessão, criar em:
`docs/05-timeline/YYYY-MM-DD/sessions/NNN-nome-YYYY-MM-DD.md`

## Passo 7: Durante a Sessão

### Ao tomar decisão arquitetural:
1. Registrar em ADR se for estrutural
2. Atualizar PRD/Architecture se mudar conceito
3. Adicionar à Timeline se for evento

### Ao encontrar problema:
1. Registrar em troubleshooting.md
2. Adicionar à seção "Lições Aprendidas"

### Ao finalizar funcionalidade:
1. Atualizar status nos 5 Módulos (PRD seção 1.5)
2. Commitar com Conventional Commits
3. Atualizar Timeline

## Passo 8: Fechamento de Sessão

// turbo
```bash
git status
```

1. Commitar pendências
2. Atualizar README do dia com SHA
3. Push para origin

---

## Checklist de Sincronização

```
[ ] PRD.md está atualizado com status dos 5 Módulos?
[ ] ADRs estão listados no Timeline?
[ ] Lições aprendidas estão em troubleshooting.md?
[ ] Handover está na Timeline Master?
[ ] SHA âncora está correto?
```
