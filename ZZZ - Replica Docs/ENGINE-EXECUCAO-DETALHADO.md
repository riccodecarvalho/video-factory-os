# Video Factory OS - Engine de Execução

> **Arquivos principais:** `lib/engine/runner.ts`, `lib/engine/providers.ts`
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [Arquitetura da Engine](#arquitetura-da-engine)
2. [Fluxo de Execução](#fluxo-de-execução)
3. [Executores por Tipo](#executores-por-tipo)
4. [Providers](#providers)
5. [Timeline DSL](#timeline-dsl)
6. [Tratamento de Erros](#tratamento-de-erros)

---

## ARQUITETURA DA ENGINE

### Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENGINE RUNNER                             │
│                     (lib/engine/runner.ts)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  runJob(jobId)                                                   │
│    │                                                             │
│    ├─► Carrega Job + Recipe do DB                               │
│    │                                                             │
│    ├─► Resolve configs para TODOS steps (snapshot)              │
│    │     └─► getEffectiveConfig() para cada step                │
│    │                                                             │
│    ├─► Cria job_steps se não existem                            │
│    │                                                             │
│    └─► Loop por cada step:                                       │
│          │                                                       │
│          ├─► Skip se já completo (resume)                       │
│          │                                                       │
│          ├─► Determina StepKind (llm, tts, render, etc)         │
│          │                                                       │
│          ├─► Executa via executeStep{Kind}()                    │
│          │     │                                                 │
│          │     ├─► executeStepLLM()                             │
│          │     ├─► executeStepTTS()                             │
│          │     ├─► executeStepTransform()                       │
│          │     ├─► executeStepRender()                          │
│          │     ├─► executeStepExport()                          │
│          │     ├─► executeStepScenePrompts()                    │
│          │     └─► executeStepGenerateImages()                  │
│          │                                                       │
│          ├─► Atualiza job_steps no DB                           │
│          │                                                       │
│          ├─► Coleta artifacts                                   │
│          │                                                       │
│          └─► [Wizard] Pausa para aprovação                      │
│                                                                  │
│    └─► Finaliza job (completed/failed)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes

| Arquivo | Função |
|---------|--------|
| `runner.ts` | Orquestrador principal, loop de execução |
| `providers.ts` | Implementação Claude + Azure TTS |
| `ffmpeg.ts` | Render de vídeo com FFmpeg |
| `executors/*.ts` | Executores específicos por tipo |
| `step-mapper.ts` | Mapeamento step key → executor |
| `capabilities.ts` | Definição de StepKind |
| `artifact-storage.ts` | Gestão de arquivos gerados |
| `export.ts` | Empacotamento final |

---

## FLUXO DE EXECUÇÃO

### 1. Criação do Job

```typescript
// app/jobs/actions.ts - createJob()

1. Carrega recipe do DB
2. Enriquece input com:
   - timestamp (anti-repetição)
   - duracao (default: 60 min)
   - nombre_protagonista (pré-calculado)
   - nombre_antagonista_masculino
   - nombre_antagonista_femenino
3. Insere job com status='pending'
4. Retorna job para UI
```

### 2. Início da Execução

```typescript
// app/jobs/actions.ts - startJob()

1. Chama engineRunJob(jobId) em background
2. Retorna imediatamente {success: true}
// A execução continua em background
```

### 3. Loop Principal (runJob)

```typescript
// lib/engine/runner.ts - runJob()

async function runJob(jobId: string) {
  // 1. Carrega job
  const job = await db.select().from(jobs).where(eq(jobs.id, jobId));
  if (job.status === "completed") return;
  
  // 2. Carrega recipe
  const recipe = await db.select().from(recipes).where(...);
  const pipeline = JSON.parse(recipe.pipeline);
  
  // 3. Atualiza status para running
  await db.update(jobs).set({status: "running", startedAt: now()});
  
  // 4. Cria manifest inicial
  const manifest = createInitialManifest(job, recipe);
  
  // 5. Resolve configs para TODOS steps (snapshot)
  for (const stepDef of pipeline) {
    const config = await getEffectiveConfig(recipeId, stepDef.key, projectId);
    manifest.snapshots.config_by_step[stepDef.key] = config;
  }
  
  // 6. Cria job_steps se não existem
  for (const stepDef of pipeline) {
    if (!existingSteps.has(stepDef.key)) {
      await db.insert(jobSteps).values({...});
    }
  }
  
  // 7. Loop de execução
  for (const stepDef of pipeline) {
    // Skip se completo (resume)
    if (step.status === "success") continue;
    
    // Check cancelamento
    if (currentJob.status === "cancelled") break;
    
    // Atualiza step para running
    await db.update(jobSteps).set({status: "running"});
    
    // Executa baseado no kind
    const kind = getStepKind(stepDef.key);
    let stepManifest;
    
    switch (kind) {
      case "llm": stepManifest = await executeStepLLM(...); break;
      case "tts": stepManifest = await executeStepTTS(...); break;
      case "transform": stepManifest = await executeStepTransform(...); break;
      case "render": stepManifest = await executeStepRender(...); break;
      case "export": stepManifest = await executeStepExport(...); break;
      // ...
    }
    
    // Atualiza step no DB
    if (stepManifest.status === "success") {
      previousOutputs[stepDef.key] = stepManifest.response?.output;
      await db.update(jobSteps).set({status: "success", outputRefs: ...});
      
      // WIZARD MODE: Pausa após cada step
      if (job.executionMode === "wizard") {
        await db.update(jobs).set({status: "pending"});
        return {success: true};
      }
    } else {
      jobFailed = true;
      await db.update(jobSteps).set({status: "failed", lastError: ...});
    }
  }
  
  // 8. Finaliza job
  await db.update(jobs).set({
    status: jobFailed ? "failed" : "completed",
    manifest: JSON.stringify(manifest),
    completedAt: now(),
  });
}
```

### 4. Manifest Structure

```typescript
interface Manifest {
  version: "3.0.0";
  job_id: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  
  input: Record<string, unknown>;
  
  snapshots: {
    recipe: { id, slug, version };
    config_by_step: Record<string, ResolvedConfig>;
  };
  
  steps: StepManifest[];
  
  artifacts: Array<{
    step_key: string;
    uri: string;
    content_type: string;
  }>;
  
  output: unknown;
  
  metrics: {
    total_duration_ms: number;
    step_count: number;
    llm_tokens_used: number;
    tts_duration_sec: number;
  };
}
```

---

## EXECUTORES POR TIPO

### LLM Executor

```typescript
// executeStepLLM()

Input:
- stepDef: {key, name, kind}
- stepConfig: {prompt, provider, kb, validators}
- input: Record<string, unknown>
- previousOutputs: Record<string, unknown>

Flow:
1. Carrega prompt do DB
2. Carrega provider do DB
3. Carrega KB context (se configurado)
4. Carrega validators
5. Build variables (input + previousOutputs + aliases)
6. Chama executeLLM()
7. Executa validators no output
8. Salva artifact (output.txt)
9. Retorna StepManifest

Output:
- response.output: string (texto gerado)
- artifacts: [{uri, content_type}]
- usage: {inputTokens, outputTokens}
```

### TTS Executor

```typescript
// executeStepTTS()

Input:
- stepConfig: {provider, preset_voice, preset_ssml}
- previousOutputs: {script ou parse_ssml}

Flow:
1. Extrai texto de previousOutputs
2. Carrega voice preset
3. Carrega SSML preset (se configurado)
4. Carrega provider
5. Chama executeTTS()
6. Salva artifact (audio.mp3)

Output:
- response.output: {audioPath, durationSec}
- artifacts: [{uri: "audio.mp3", content_type: "audio/mpeg"}]
```

### Transform Executor

```typescript
// executeStepTransform()

Input:
- previousOutputs: {roteiro ou script}

Flow:
1. Extrai script raw de previousOutputs
2. Limpa script:
   - Remove voice tags: (voz: NARRADORA)
   - Remove pause markers: [PAUSA]
   - Remove Markdown: # ** ```
   - Remove SSML tags
   - Limpa whitespace
3. Salva artifact (output.txt)

Output:
- response.output: string (script limpo)
```

### Render Executor

```typescript
// executeStepRender()

Input:
- previousOutputs: {tts: {audioPath}}
- input: {avatarPath?, recipeSlug?}
- stepConfig: {preset_video}

Flow:
1. Extrai audioPath de TTS output
2. Determina backgroundImage:
   - input.avatarPath (explicit)
   - public/assets/channels/{recipe}/avatar_720p.png
   - Fallback: cor sólida preta
3. Carrega video preset ou usa DEFAULT
4. Chama renderVideo() (FFmpeg)
5. Salva artifact (video.mp4)

Output:
- response.output: {videoPath, durationSec}
- artifacts: [{uri: "video.mp4", content_type: "video/mp4"}]
```

### Export Executor

```typescript
// executeStepExport()

Input:
- previousOutputs: todos os steps
- manifest: atual

Flow:
1. Coleta todos artifacts do job
2. Gera thumbnail do vídeo
3. Salva manifest.json
4. Calcula total size

Output:
- response.output: {exported: true, exportPath, thumbnailPath, manifestPath}
```

### Scene Prompts Executor

```typescript
// executeStepScenePrompts()

Input:
- previousOutputs: {script}
- input: {num_scenes?}

Flow:
1. Extrai script
2. Divide em cenas
3. Para cada cena, gera prompt de imagem
4. Salva prompts.json

Output:
- response.output: {scenes: [{number, prompt, timing}]}
```

### Generate Images Executor

```typescript
// executeStepGenerateImages()

Input:
- previousOutputs: {scene_prompts}
- stepConfig: {provider} (ImageFX)

Flow:
1. Carrega scene prompts
2. Para cada cena:
   - Sanitiza prompt
   - Chama ImageFX API
   - Salva imagem
3. Retorna lista de imagens

Output:
- response.output: {images: [{scene_number, image_path, timing}]}
```

---

## PROVIDERS

### Claude Provider (LLM)

```typescript
// lib/engine/providers.ts - executeLLM()

interface LLMRequest {
  provider: ProviderConfig;
  prompt: PromptConfig;
  variables: Record<string, unknown>;
  kbContext?: string;
}

interface LLMResponse {
  success: boolean;
  output?: string;
  usage?: { inputTokens, outputTokens };
  model: string;
  duration_ms: number;
  error?: { code, message, statusCode?, stack? };
}

// Implementação
async function executeLLM(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // Build system prompt + KB
  let systemPrompt = request.prompt.systemPrompt;
  if (request.kbContext) {
    systemPrompt += `\n\n<knowledge_base>\n${request.kbContext}\n</knowledge_base>`;
  }
  
  // Render user template
  let userMessage = request.prompt.userTemplate;
  for (const [key, value] of Object.entries(request.variables)) {
    userMessage = userMessage.replace(/\{\{\s*${key}\s*\}\}/g, String(value));
  }
  
  // Call Anthropic API
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: request.prompt.model,
      max_tokens: request.prompt.maxTokens,
      temperature: request.prompt.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    }),
  });
  
  const data = await response.json();
  return {
    success: true,
    output: data.content?.[0]?.text,
    usage: { inputTokens: data.usage?.input_tokens, outputTokens: data.usage?.output_tokens },
    model: request.prompt.model,
    duration_ms: Date.now() - startTime,
  };
}
```

### Azure TTS Provider

```typescript
// lib/engine/providers.ts - executeTTS()

interface TTSRequest {
  provider: ProviderConfig;
  input: string;  // text or SSML
  voicePreset: {
    voiceName: string;
    language: string;
    rate?: number;
    pitch?: string;
    style?: string;
    styleDegree?: number;
  };
  ssmlPreset?: {
    pauseMapping: Record<string, number>;
  };
  outputPath: string;
}

// Implementação (Batch Synthesis)
async function executeTTS(request: TTSRequest): Promise<TTSResponse> {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || "eastus2";
  
  // 1. Build SSML
  const ssml = buildSSML(request.input, request.voicePreset, request.ssmlPreset);
  
  // 2. Create batch job (PUT)
  const jobId = `vfos-${Date.now()}-${randomString()}`;
  await fetch(`https://${region}.api.cognitive.microsoft.com/texttospeech/batchsyntheses/${jobId}?api-version=2024-04-01`, {
    method: "PUT",
    headers: { "Ocp-Apim-Subscription-Key": subscriptionKey },
    body: JSON.stringify({
      inputKind: "SSML",
      inputs: [{ content: ssml }],
      properties: {
        outputFormat: "audio-48khz-192kbitrate-mono-mp3",
        concatenateResult: true,
      }
    }),
  });
  
  // 3. Poll for completion (max 30 polls, 60s interval)
  let resultUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(60000);
    const status = await fetch(`.../${jobId}`);
    if (status.status === "Succeeded") {
      resultUrl = status.outputs.result;
      break;
    }
  }
  
  // 4. Download ZIP and extract MP3
  const zipBuffer = await fetch(resultUrl).then(r => r.arrayBuffer());
  const zip = new AdmZip(Buffer.from(zipBuffer));
  const mp3Entry = zip.getEntries().find(e => e.entryName.endsWith('.mp3'));
  await fs.writeFile(request.outputPath, mp3Entry.getData());
  
  return {
    success: true,
    artifactUri: request.outputPath,
    durationSec: mp3Data.length / 24000,  // Estimate
  };
}

// Build SSML helper
function buildSSML(input, voicePreset, ssmlPreset) {
  if (input.startsWith("<speak")) return input;
  
  let content = input;
  
  // Apply style
  if (voicePreset.style) {
    content = `<mstts:express-as style="${voicePreset.style}">${content}</mstts:express-as>`;
  }
  
  // Apply prosody
  if (voicePreset.rate || voicePreset.pitch) {
    content = `<prosody rate="${voicePreset.rate}" pitch="${voicePreset.pitch}">${content}</prosody>`;
  }
  
  // Apply pause mappings
  if (ssmlPreset?.pauseMapping) {
    for (const [marker, ms] of Object.entries(ssmlPreset.pauseMapping)) {
      content = content.replace(new RegExp(marker, 'g'), `<break time="${ms}ms"/>`);
    }
  }
  
  return `<speak version="1.0" xmlns="..." xml:lang="${voicePreset.language}">
    <voice name="${voicePreset.voiceName}">${content}</voice>
  </speak>`;
}
```

---

## TIMELINE DSL

### Arquitetura

```
Timeline DSL (declarativo) → Compiler → RenderPlan (imperativo) → Executor → FFmpeg
```

### Schema (lib/timeline/schema.ts)

```typescript
interface Timeline {
  version: string;
  settings: TimelineSettings;
  scenes: Scene[];
}

interface TimelineSettings {
  width: number;   // 1920 (16:9) ou 1080 (9:16)
  height: number;  // 1080 (16:9) ou 1920 (9:16)
  fps: number;
  backgroundColor?: string;
}

interface Scene {
  id: string;
  start: number;    // Segundos desde início
  duration: number; // Duração em segundos
  elements: Element[];
}

interface Element {
  id: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'subtitle';
  layer: number;    // Z-index
  start: number;    // Relativo à cena
  duration: number;
  src?: string;
  props: ElementProps;
}
```

### Compiler (lib/timeline/compiler.ts)

```typescript
function compileTimeline(timeline: Timeline, options: CompilerOptions): CompilerResult {
  // 1. Validar timeline
  const validation = validateTimeline(timeline);
  if (!validation.valid) return { success: false, errors: validation.errors };
  
  // 2. Criar RenderPlan base
  const plan = createEmptyRenderPlan(options.jobId);
  
  // 3. Resolver preset de encode
  const encodePreset = resolveEncodePreset(options.encodePreset, timeline);
  
  // 4. Gerar steps por cena
  for (const scene of timeline.scenes) {
    const sceneSteps = compileScene(scene, timeline.settings, encodePreset);
    steps.push(...sceneSteps);
  }
  
  // 5. Adicionar step de concatenação (se múltiplas cenas)
  if (timeline.scenes.length > 1) {
    steps.push(createConcatStep(sceneOutputs));
  }
  
  // 6. Ordenar por dependências
  plan.steps = sortStepsByDependencies(steps);
  
  return { success: true, plan };
}
```

### Format Profiles

```typescript
// Predefinidos
const FORMAT_PRESETS = {
  longform: { width: 1920, height: 1080, fps: 30 },  // 16:9
  shorts: { width: 1080, height: 1920, fps: 30 },    // 9:16
};

// Safe areas (UI overlays)
const SAFE_AREAS = {
  'youtube-shorts': { top: 120, bottom: 150, left: 20, right: 20 },
  'tiktok': { top: 100, bottom: 180, left: 20, right: 20 },
};
```

---

## TRATAMENTO DE ERROS

### Códigos de Erro

| Código | Provider | Causa |
|--------|----------|-------|
| `MISSING_API_KEY` | Claude/Azure | Key não configurada no .env |
| `HTTP_401` | Claude | API key inválida |
| `HTTP_403` | Claude | Sem permissão |
| `HTTP_429` | Claude | Rate limit |
| `HTTP_5xx` | Claude | Erro do servidor |
| `NETWORK_ERROR` | Qualquer | Falha de conexão |
| `TIMEOUT` | Azure TTS | Batch não completou em 30 min |
| `BATCH_FAILED` | Azure TTS | Síntese falhou |
| `NO_MP3_IN_ZIP` | Azure TTS | ZIP não contém áudio |
| `AUDIO_NOT_FOUND` | FFmpeg | Arquivo de áudio não existe |
| `FFMPEG_ERROR` | FFmpeg | Erro no processamento |
| `VALIDATION_FAILED` | Validator | Output não passou validação |
| `NO_PROMPT` | Runner | Step sem prompt configurado |
| `NO_INPUT` | TTS | Nenhum texto para sintetizar |

### Retry Logic

```typescript
// Em job_steps
attempts: number;  // Incrementa a cada tentativa
lastError: string; // Última mensagem de erro

// Retry manual via UI
async function retryStep(jobId, stepKey) {
  await db.update(jobSteps).set({
    status: "pending",
    lastError: null,
  }).where(...);
  
  await db.update(jobs).set({
    status: "pending",
  }).where(...);
  
  await runJob(jobId);  // Resume from failed step
}

// Retry com instrução
async function retryWithInstruction(jobId, stepKey, instruction) {
  // Adiciona iterationHint ao input
  const updatedInput = { ...currentInput, iterationHint: instruction, iterationStep: stepKey };
  await db.update(jobs).set({ input: JSON.stringify(updatedInput) });
  return retryFromStep(jobId, stepKey);
}
```

### Fallback FFmpeg

```typescript
// Em ffmpeg.ts - renderVideo()

.on('error', (err) => {
  // Se VideoToolbox falha, tenta libx264
  if (preset.encoder === 'h264_videotoolbox') {
    console.log('[FFmpeg] Retrying with libx264...');
    return renderVideo({
      ...options,
      preset: { ...preset, encoder: 'libx264' },
    });
  }
  // Se libx264 também falha, retorna erro
  return { success: false, error: { code: 'FFMPEG_ERROR', message: err.message } };
});
```

---

*Documento gerado pela análise exaustiva do Video Factory OS.*
