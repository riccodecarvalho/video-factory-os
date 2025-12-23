# 🔧 Troubleshooting & Setup

**Status:** Vivo (atualizar sempre que encontrar problemas)

## 🌐 Serviços & Portas

| Serviço | Porta Padrão | Alternativa |
|---------|--------------|-------------|
| **Next.js App** | `3000` | `3001` (se 3000 em uso) |
| **Studio DB** | (externo) | - |

> **Nota:** Se `http://localhost:3000` der erro, tente `http://localhost:3001`. O console do `npm run dev` avisa qual porta foi usada.

## 🔑 Chaves de API (Secrets)

As chaves **NÃO** ficam no repositório.

### 1. Azure Speech Key (`AZURE_SPEECH_KEY`)
- **Onde encontrar:**
  1. **n8n:** Settings → Credentials → Azure TTS.
  2. **Portal Azure:** Speech Services → Keys and Endpoint.
- **Configuração:** Adicionar no `.env.local` na raiz do projeto.

### 2. Anthropic API Key (`ANTHROPIC_API_KEY`)
- **Onde encontrar:** 1Password ou Painel da Anthropic.
- **Configuração:** `.env.local`.

## 🚨 Problemas Comuns

### Erro "fetch failed" no Step Script
- **Sintoma:** Job falha no step `script`.
- **Causa:** Timeout na API do Claude ou falta de internet.
- **Solução:** Verificar logs na aba "Logs" do Job Detail. Se for timeout, tentar novamente (Retry).

### Áudio não toca no browser
- **Sintoma:** Player carrega mas não sai som.
- **Causa:** Falta de suporte a `Range` requests no servidor.
- **Solução:** (Corrigido no Gate 1.5.2) Garantir que `app/api/artifacts` tenha headers `Accept-Ranges`.

---

## 📚 Lições Aprendidas (do ChatGPT e n8n legado)

> Origem: [mapeamento-chatgpt-plano.md](../../05-timeline/2025-12-13/mapeamento-chatgpt-plano.md)

### 1. FFmpeg precisa de arquivo local
- **Problema:** FFmpeg não consegue ler diretamente do Drive/URL remota.
- **Solução:** Sempre seguir fluxo **Download → Render → Upload**.
- **Impacto:** O runner baixa o arquivo antes de processar.

### 2. Checkpoint por etapa
- **Problema:** Reprocessar tudo quando só uma etapa falhou.
- **Solução:** Não refazer o que já está pronto (input_hash).
- **Impacto:** Se input_hash igual, skip automático.

### 3. Filtros visuais pesados explodem tempo
- **Problema:** Render com efeitos pode levar 2-3h em CPU.
- **Solução:** Usar `VideoToolbox` (encoder acelerado) e filtros OFF por default.
- **Impacto:** Presets com filtros são opt-in, não padrão.

### 4. Governança "anti-cagada"
- **Problema:** Fallback silencioso mascara erros.
- **Solução:** `getPromptOrThrow` — se falta config, falha explícita.
- **Impacto:** Código NUNCA usa hardcode ou fallback. Sempre consulta DB.

---

## 📚 Lições Aprendidas (2025-12-16)

### 5. Azure TTS retorna ZIP, não MP3
- **Problema:** Batch TTS retorna `results.zip` contendo `0001.mp3`.
- **Solução:** Usar `adm-zip` para extrair MP3 antes de salvar.
- **Impacto:** `lib/engine/providers.ts` agora extrai ZIP automaticamente.

### 6. FFprobe precisa de instalação separada
- **Problema:** `@ffmpeg-installer/ffmpeg` não inclui ffprobe.
- **Solução:** Instalar `@ffprobe-installer/ffprobe` + configurar path.
- **Impacto:** `ffmpeg.ts` usa `setFfprobePath()` do installer.

### 7. Webpack bundling de módulos nativos
- **Problema:** Webpack tenta bundlear README.md de pacotes.
- **Solução:** `serverComponentsExternalPackages` + `webpack.externals`.
- **Impacto:** `next.config.js` marca ffmpeg/ffprobe como external.

### 8. Formatos de output_refs inconsistentes
- **Problema:** TTS retorna `{audioPath}`, runner esperava `{output: {audioPath}}`.
- **Solução:** Suportar ambos formatos no carregamento de previousOutputs.
- **Impacto:** Resume de jobs funciona com qualquer formato de output.

---

## 📚 Lições Aprendidas (2025-12-22)

### 9. Corrupção SQLite por concorrência/crash
- **Problema:** Banco SQLite pode corromper em dev mode (hot reload + crash).
- **Causa:** Múltiplos processos escrevendo + crash durante gravação.
- **Solução:** PRAGMAs de proteção em `lib/db/index.ts`:
  - `journal_mode = WAL`
  - `synchronous = NORMAL`
  - `busy_timeout = 5000`
  - `foreign_keys = ON`
- **Impacto:** Proteção contra corrupção + melhor concorrência.

### 10. Backup obrigatório no início de sessão
- **Problema:** Perda de dados ao recriar banco corrompido.
- **Solução:** `npm run db:backup` como Passo 0 do workflow de governança.
- **Impacto:** Restauração possível via `backups/`.

### 11. Singleton persistence em Next.js dev mode
- **Problema:** Hot reload destrói singletons (Worker, DB).
- **Solução:** Usar `globalThis` para persistir instâncias.
- **Impacto:** Jobs não "desaparecem" entre API calls.

### 12. Bindings órfãos após migração
- **Problema:** Execution bindings apontando para IDs inexistentes.
- **Solução:** Verificar/corrigir bindings após restaurar banco.
- **Impacto:** Providers e prompts sempre encontrados.
