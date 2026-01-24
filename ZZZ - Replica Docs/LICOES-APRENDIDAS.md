# Video Factory OS - Lições Aprendidas

> **Objetivo:** Compilação de problemas encontrados e soluções aplicadas
> **Fonte:** `docs/00-regras/operacao/troubleshooting.md`, git commits de fix
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [Lições do ChatGPT/n8n Legado](#lições-do-chatgptn8n-legado)
2. [Lições de Integração (Azure, FFmpeg)](#lições-de-integração)
3. [Lições de Infraestrutura (SQLite, Next.js)](#lições-de-infraestrutura)
4. [Lições de Arquitetura](#lições-de-arquitetura)
5. [Anti-Patterns a Evitar](#anti-patterns-a-evitar)
6. [Checklist de Prevenção](#checklist-de-prevenção)

---

## LIÇÕES DO CHATGPT/N8N LEGADO

### 1. FFmpeg Precisa de Arquivo Local
**Problema:** FFmpeg não consegue ler diretamente do Drive/URL remota.

**Sintoma:** Render falha com "file not found" ou "invalid input".

**Solução:**
```
ERRADO: ffmpeg -i "https://drive.google.com/..." output.mp4
CERTO:  Download → Local file → FFmpeg → Upload
```

**Impacto no código:**
```typescript
// O runner SEMPRE baixa o arquivo antes de processar
const localPath = await downloadToLocal(remoteUrl);
await renderVideo({ audioPath: localPath, ... });
```

---

### 2. Checkpoint por Etapa
**Problema:** Reprocessar tudo quando só uma etapa falhou.

**Sintoma:** Job de 30min falha no final, precisa rodar tudo de novo.

**Solução:** Input hash para idempotência
```typescript
// Se input_hash igual, skip automático
const inputHash = generateInputHash({ ...input, stepKey });
if (step.inputHash === inputHash && step.status === 'success') {
  console.log('Skipping completed step');
  continue;
}
```

**Impacto:** Resume de jobs funciona sem reprocessar steps completos.

---

### 3. Filtros Visuais Pesados
**Problema:** Render com efeitos pode levar 2-3h em CPU.

**Sintoma:** Jobs de render demoram eternamente.

**Solução:**
- Usar `VideoToolbox` (encoder acelerado) no Mac
- Filtros são opt-in, não padrão
- Presets separados para "rápido" vs "qualidade"

**Impacto:**
```typescript
// Preset padrão sem filtros
const DEFAULT_PRESET = {
  encoder: 'h264_videotoolbox', // HW accel
  // Sem filtros complexos
};
```

---

### 4. Governança "Anti-Cagada"
**Problema:** Fallback silencioso mascara erros.

**Sintoma:** Sistema usa config errada sem avisar.

**Solução:** `getPromptOrThrow` - se falta config, falha explícita
```typescript
// NUNCA fazer isso
const prompt = await getPrompt(slug) || DEFAULT_PROMPT;

// SEMPRE fazer isso
const prompt = await getPromptOrThrow(slug);
// Throws se não encontrar
```

**Impacto:** Zero hardcode, erros são detectados imediatamente.

---

## LIÇÕES DE INTEGRAÇÃO

### 5. Azure TTS Retorna ZIP
**Problema:** Batch TTS retorna `results.zip` contendo `0001.mp3`.

**Sintoma:** "File is not valid audio" ao tentar usar resultado.

**Solução:**
```typescript
import AdmZip from 'adm-zip';

const zipBuffer = await fetch(resultUrl).then(r => r.arrayBuffer());
const zip = new AdmZip(Buffer.from(zipBuffer));
const mp3Entry = zip.getEntries().find(e => e.entryName.endsWith('.mp3'));
await fs.writeFile(outputPath, mp3Entry.getData());
```

**Impacto:** `lib/engine/providers.ts` extrai ZIP automaticamente.

---

### 6. FFprobe Instalação Separada
**Problema:** `@ffmpeg-installer/ffmpeg` não inclui ffprobe.

**Sintoma:** "ffprobe not found" ao tentar obter duração de áudio.

**Solução:**
```json
// package.json
"dependencies": {
  "@ffmpeg-installer/ffmpeg": "^1.1.0",
  "@ffprobe-installer/ffprobe": "^2.1.2"  // <- ADICIONAR
}
```

```typescript
// ffmpeg.ts
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
ffmpeg.setFfprobePath(ffprobeInstaller.path);
```

---

### 7. Webpack Bundling de Módulos Nativos
**Problema:** Webpack tenta bundlear README.md de pacotes.

**Sintoma:** Build falha com "Cannot find module".

**Solução:**
```javascript
// next.config.js
{
  experimental: {
    serverComponentsExternalPackages: [
      'better-sqlite3',
      'fluent-ffmpeg',
      '@ffmpeg-installer/ffmpeg',
      '@ffprobe-installer/ffprobe',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
      });
    }
    return config;
  },
}
```

---

### 8. Formatos de output_refs Inconsistentes
**Problema:** TTS retorna `{audioPath}`, runner esperava `{output: {audioPath}}`.

**Sintoma:** Step seguinte não encontra output do anterior.

**Solução:** Suportar ambos formatos
```typescript
// Carregamento de previousOutputs
if (outputRefs.output) {
  previousOutputs[stepKey] = outputRefs.output;
} else if (outputRefs.audioPath || outputRefs.videoPath) {
  // Formato direto
  previousOutputs[stepKey] = outputRefs;
} else {
  previousOutputs[stepKey] = outputRefs;
}
```

---

## LIÇÕES DE INFRAESTRUTURA

### 9. Corrupção SQLite por Concorrência
**Problema:** Banco SQLite pode corromper em dev mode.

**Causa:** Múltiplos processos escrevendo + crash durante gravação.

**Sintoma:** "database disk image is malformed".

**Solução:**
```typescript
// lib/db/index.ts
db.pragma('journal_mode = WAL');      // Write-Ahead Log
db.pragma('synchronous = NORMAL');    // Balanceamento segurança/performance
db.pragma('busy_timeout = 5000');     // Espera 5s se locked
db.pragma('foreign_keys = ON');       // Integridade referencial
```

---

### 10. Backup Obrigatório
**Problema:** Perda de dados ao recriar banco corrompido.

**Sintoma:** Dias de configuração perdidos.

**Solução:** `npm run db:backup` como Passo 0 do workflow
```bash
# Antes de cada sessão de dev
npm run db:backup

# Backups ficam em backups/ com rotação automática (20 max)
```

---

### 11. Singleton Persistence em Dev Mode
**Problema:** Hot reload destrói singletons (Worker, DB connection).

**Sintoma:** Jobs "desaparecem" entre API calls.

**Solução:**
```typescript
// Usar globalThis para persistir
declare global {
  var db: BetterSqlite3.Database | undefined;
}

export function getDb() {
  if (!globalThis.db) {
    globalThis.db = new Database('./video-factory.db');
  }
  return globalThis.db;
}
```

---

### 12. Bindings Órfãos Após Migração
**Problema:** Execution bindings apontando para IDs inexistentes.

**Sintoma:** "Provider not found" ou "Prompt not found".

**Solução:** Script de verificação após restore
```typescript
// Verificar integridade de bindings
const bindings = await db.select().from(executionBindings);
for (const binding of bindings) {
  const target = await findTarget(binding.slot, binding.targetId);
  if (!target) {
    console.warn(`Orphan binding: ${binding.id} -> ${binding.targetId}`);
  }
}
```

---

## LIÇÕES DE ARQUITETURA

### 13. Stage Directions vs SSML
**Problema:** Scripts com SSML inline são difíceis de editar.

**Solução:** Stage Directions puro, conversão no step parse_ssml
```
// ERRADO (no script)
<voice name="es-MX-DaliaNeural">Olá</voice>

// CERTO (no script)
(voz: NARRADORA)
Olá.
[PAUSA]

// Conversão acontece no step parse_ssml
```

---

### 14. Config-First desde o Início
**Problema:** Começar com hardcode e migrar depois é doloroso.

**Solução:** Começar com Config-First desde dia 1
```typescript
// Estrutura de pensamento
// "Onde isso deve viver? No código ou no banco?"
// Resposta: SEMPRE no banco
```

---

### 15. Manifest como Fonte da Verdade
**Problema:** Estado do job espalhado em vários lugares.

**Solução:** Manifest JSON contém tudo
```typescript
manifest = {
  job_id,
  created_at,
  snapshots: {
    recipe,
    config_by_step,  // Snapshot de TODA config usada
  },
  steps: [...],
  artifacts: [...],
  metrics: {...},
};
```

---

## ANTI-PATTERNS A EVITAR

### ❌ 1. Fallback Silencioso
```typescript
// NUNCA
const prompt = config.prompt || "Default prompt...";

// SEMPRE
const prompt = await getPromptOrThrow(config.promptSlug);
```

### ❌ 2. Hardcode de Configuração
```typescript
// NUNCA
const voice = "es-MX-DaliaNeural";

// SEMPRE
const voicePreset = await getVoicePreset(config.voicePresetSlug);
```

### ❌ 3. Ignorar Erros de API
```typescript
// NUNCA
try { await callApi(); } catch { /* silencioso */ }

// SEMPRE
try {
  await callApi();
} catch (error) {
  await logError(error);
  throw error;  // Propagar
}
```

### ❌ 4. Processar Todo o Pipeline Novamente
```typescript
// NUNCA reprocessar steps completos

// SEMPRE verificar status
if (step.status === 'success') {
  continue;  // Skip
}
```

### ❌ 5. Assumir Formato de Output
```typescript
// NUNCA assumir formato específico

// SEMPRE suportar variações
const audioPath = output.audioPath || output.output?.audioPath;
```

---

## CHECKLIST DE PREVENÇÃO

### Antes de Cada Sessão
- [ ] `npm run db:backup`
- [ ] `git pull`
- [ ] Verificar `.env.local` tem todas as keys

### Antes de Deploy
- [ ] `npm run build` passa
- [ ] Todos os bindings são válidos
- [ ] FFmpeg disponível no ambiente
- [ ] API keys configuradas

### Após Restore de Banco
- [ ] Verificar integridade (`PRAGMA integrity_check`)
- [ ] Verificar bindings não órfãos
- [ ] Testar um job simples

### Ao Adicionar Nova Integração
- [ ] Documentar formato de input/output
- [ ] Adicionar fallback se aplicável
- [ ] Configurar em `next.config.js` se módulo nativo
- [ ] Adicionar variáveis de ambiente necessárias

---

## REFERÊNCIAS

- **Troubleshooting original:** `docs/00-regras/operacao/troubleshooting.md`
- **ADRs:** `docs/01-adr/`
- **Timeline:** `docs/05-timeline/`

---

*Documento compilado das lições aprendidas durante o desenvolvimento do Video Factory OS.*
