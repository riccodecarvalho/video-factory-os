# Timeline 2025-12-16

**SHA Âncora:** `5a25c55`

## 🎯 Eventos do Dia

### 🚀 MVP Pipeline Funcional + Admin UX Completo

**Status:** ✅ FUNCIONAL

---

## 📊 Commits do Dia

| Hora | Commit | Descrição |
|------|--------|-----------|
| 00:25 | `3a2407b` | Fix prompts: migração conteúdo real |
| 00:36 | `d465993` | Fix TTS: extração MP3 do ZIP Azure |
| 00:41 | `13900ef` | Fix FFprobe: instalação e config |
| 00:46 | `5ca582f` | Fix Webpack: externals ffmpeg |
| 00:49 | `d193469` | Fix previousOutputs: formatos diretos |
| 16:00 | `9e93d2e` | **Admin UX melhorias completas** |
| 16:30 | `db5d515` | Admin UX refinamentos feedback |
| 17:00 | `8621758` | Providers/Presets dados completos |
| 17:30 | `1fad1a7` | **Admin UX completo** - Providers/Presets |
| 18:00 | `88acda2` | **Projects como Hub Central** |
| 21:25 | `482a10f` | Fix SelectItem value vazio |
| 21:27 | `5a25c55` | **Sidebar reorganizada** PROJETOS/BIBLIOTECA |

---

## ✅ O Que Foi Cumprido

### Admin UX/UI (Plano Completo)
- [x] **Providers**: Claude 4.5 Opus, 70+ vozes Azure, max tokens dinâmico
- [x] **Presets**: Rate numérico (0.5-2.0), vozes Multilingual, valores visíveis
- [x] **Recipes**: Editor visual de pipeline com reordenação
- [x] **Validators**: Templates prontos, editor visual de patterns
- [x] **Prompts**: LineNumberedTextarea, ContextBanner
- [x] **Projects**: Hub central com tabs (Providers, Presets, Recipe)

### Arquitetura de Informação
- [x] **Sidebar reorganizada**: grupos PROJETOS e BIBLIOTECA
- [x] **ADR-010**: Projects como hub central documentado

### Bugs Corrigidos
- [x] SelectItem value vazio em VOICE_STYLES
- [x] Rate como número (não string %)
- [x] Cache webpack corrompido

---

## 📁 Sessions

- [001-mvp-funcional-2025-12-16.md](./sessions/001-mvp-funcional-2025-12-16.md)

---

## 🔜 Handover para Próxima Sessão

### O que foi feito:
1. **Admin UX completo** - Todas as páginas melhoradas
2. **Projects como Hub** - Configuração centralizada por projeto
3. **Sidebar clara** - PROJETOS vs BIBLIOTECA
4. **70+ vozes Azure** incluindo Multilingual
5. **Claude 4.5 Opus** adicionado

### Próximas prioridades:
1. **Testar pipeline completo** com novas configurações
2. **UI de Progresso** - % por step, tempo restante
3. **Steps restantes** - miniaturas, descricao, tags
4. **Exportação** - Verificar step export funciona

---

**Última atualização:** 2025-12-16 22:30
