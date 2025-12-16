# Session 001: MVP Pipeline Funcional

**Data:** 2025-12-16
**Duração:** ~2 horas
**SHA Inicial:** `3a2407b`
**SHA Final:** `d193469`

---

## 🎯 Objetivo

Corrigir problemas residuais do pipeline de geração de vídeo e executar primeiro teste funcional completo.

---

## ✅ Realizações

### 1. Migração de Prompts (CRÍTICO)
- Script `scripts/migrate-prompts-content.ts` criado
- 8 prompts Graciela migrados de placeholders → conteúdo real
- System prompts de 7K-31K caracteres agora no DB

### 2. Fix Azure TTS
- **Problema:** Azure retorna ZIP, não MP3 direto
- **Solução:** AdmZip para extrair `0001.mp3` do ZIP
- Arquivo: `lib/engine/providers.ts`

### 3. Fix FFprobe
- **Problema:** `ffprobe` não encontrado no sistema
- **Solução:** Instalado `@ffprobe-installer/ffprobe`
- Configurado `setFfprobePath()` em `ffmpeg.ts`

### 4. Fix Webpack Bundling
- **Problema:** Webpack tentando bundlear README.md
- **Solução:** `serverComponentsExternalPackages` + `webpack.externals`
- Arquivo: `next.config.js`

### 5. Fix previousOutputs
- **Problema:** Runner esperava `{output: {...}}` mas TTS retorna `{audioPath, ...}`
- **Solução:** Suporta ambos formatos
- Arquivo: `lib/engine/runner.ts`

---

## 📊 Commits da Sessão

```
d193469 fix: Corrige carregamento de previousOutputs para formatos diretos
5ca582f fix: Configura webpack externals para ffmpeg/ffprobe
d465993 fix: Extrai MP3 real do ZIP retornado pelo Azure TTS
44bb6ad fix: Usa require para ffprobe-installer (evita bundling do README.md)
13900ef fix: Adiciona @ffprobe-installer para resolver erro de duração do áudio
239264e fix: Adiciona componente ClientDate para evitar hydration errors
```

---

## 🧠 Decisões Tomadas

1. **AdmZip para extração** - Mantém compatibilidade cross-platform
2. **Webpack externals** - Evita bundling de módulos nativos
3. **Formatos flexíveis** - previousOutputs aceita múltiplos formatos

---

## 🐛 Lições Aprendidas

| Problema | Causa Raiz | Solução |
|----------|-----------|---------|
| Prompts vazios | Placeholders no DB | Migrar conteúdo real |
| TTS corrompido | Azure retorna ZIP | Descompactar antes de salvar |
| ffprobe not found | Não vem com @ffmpeg-installer | Instalar @ffprobe-installer |
| Webpack error | README.md sendo bundleado | Marcar como external |
| Render sem áudio | previousOutputs formato errado | Suportar formato direto |

---

## 🔜 Próxima Sessão

### Prioridades Sugeridas:

1. **UI de Progresso Detalhado**
   - Mostrar % por step
   - Tempo estimado restante
   - Indicador do que está sendo executado

2. **Botão Resume na UI**
   - Action `resumeJob` já existe, falta UI
   - Permitir continuar jobs cancelados/failed

3. **Completar Steps LLM**
   - miniaturas, descricao, tags, comunidade
   - Verificar prompts existem no DB

4. **Testes Completos**
   - Rodar pipeline ponta-a-ponta
   - Verificar exportação funciona
   - Validar artefatos gerados
