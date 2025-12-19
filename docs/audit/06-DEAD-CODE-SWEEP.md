# Dead Code Sweep - 2025-12-18

## 1. Erros de TS que Impedem Build

| Arquivo | Linha | Problema | Ação Sugerida |
|---------|-------|----------|---------------|
| `app/admin/prompts/page.tsx` | 239 | Type Element ≠ string | Corrigir prop subtitle |
| `scripts/fix-all-prompts-ssot.ts` | 17 | eq(is_active, 1) | Usar eq(is_active, true) |
| `scripts/fix-kb-bindings.ts` | 98 | Regex flag 's' | Alterar target ES2018+ |

---

## 2. Scripts Potencialmente Órfãos

| Arquivo | Último Uso | Ação Sugerida |
|---------|-----------|---------------|
| `scripts/fix-all-prompts-ssot.ts` | Migration one-time | ⚠️ Pode arquivar |
| `scripts/fix-kb-bindings.ts` | Migration one-time | ⚠️ Pode arquivar |

---

## 3. Diretórios Temporários (z-*)

| Diretório | Arquivos | Tamanho | Ação Sugerida |
|-----------|----------|---------|---------------|
| `z- tmp/` | **78 arquivos** | ? | 🧹 Limpar/arquivar |
| `z- archive/` | Legado n8n/4pice | ? | Manter como referência |

### Detalhes z- tmp/

Este diretório tem 78 arquivos que parecem ser:
- Expansões de prompts (vj_*.txt)
- Conteúdo de teste (graciela-*.txt)
- Arquivos temporários diversos

**Recomendação**: Revisar e limpar. Mover o que for necessário para `fixtures/` ou `docs/`.

---

## 4. Steps Stub (Não Implementados)

| Step | Status | Código |
|------|--------|--------|
| render | Stub parcial | `engine/ffmpeg.ts` existe mas incompleto |
| export | Stub | `engine/export.ts` básico |

---

## 5. Features Admin Potencialmente Incompletas

| Página | Suspeita | Verificar |
|--------|----------|-----------|
| `/admin/presets/video` | Página separada de `/admin/presets` | Consolidar? |
| `/admin/projects` | Hub de projetos novo (ADR-010) | Completar |

---

## 6. Código Duplicado / Patterns Repetidos

| Pattern | Onde | Sugestão |
|---------|------|----------|
| Loading states | Todas as páginas admin | Extrair hook `useAdminPage` |
| Error handling | JobActions, AdminActions | Padronizar wrapper |

---

## Resumo de Ações

| Prioridade | Ação | Esforço |
|------------|------|---------|
| 🔴 Alta | Corrigir 3 erros TS | 1h |
| 🟡 Média | Limpar z-tmp (78 arquivos) | 2h |
| 🟡 Média | Arquivar scripts de migration | 30min |
| 🟢 Baixa | Consolidar presets pages | 1h |
