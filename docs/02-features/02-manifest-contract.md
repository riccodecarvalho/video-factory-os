# Manifest Contract — Video Factory OS

> **Versão:** 0.1  
> **Data:** 2025-12-13  
> **Status:** Aprovado (Gate 0.5)

---

## O Que é o Manifest

O **Render Manifest** é o JSON canônico que descreve **tudo** que foi usado para produzir um vídeo. Ele é a **fonte da verdade** para:

- **Reprodutibilidade:** Re-render idêntico com mesmo manifest
- **Auditabilidade:** Saber exatamente qual prompt/voz/config gerou o vídeo
- **Debug:** Identificar onde falhou e com quais parâmetros
- **Re-render parcial:** Trocar só uma peça (voz, efeito) sem refazer tudo

---

## Schema (TypeScript + Zod)

```typescript
// lib/types/manifest.schema.ts
import { z } from 'zod';

export const ManifestVersion = '1.0.0';

export const StepStatusSchema = z.enum([
  'pending', 'running', 'completed', 'failed', 'skipped'
]);

export const ArtifactRefSchema = z.object({
  id: z.string(),
  type: z.string(), // 'script' | 'ssml' | 'audio' | 'video' | 'thumb'
  path: z.string(),
  hash: z.string(),
  size_bytes: z.number(),
  created_at: z.string().datetime(),
});

export const StepSnapshotSchema = z.object({
  step_name: z.string(),
  status: StepStatusSchema,
  attempts: z.number(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  duration_ms: z.number().optional(),
  error: z.string().optional(),
  artifacts: z.array(ArtifactRefSchema),
});

export const PromptSnapshotSchema = z.object({
  slug: z.string(),
  version: z.number(),
  hash: z.string(), // Hash do template usado
});

export const PresetSnapshotSchema = z.object({
  id: z.string(),
  type: z.enum(['voice', 'video', 'ssml', 'effects']),
  version: z.number(),
  config_hash: z.string(),
});

export const RecipeSnapshotSchema = z.object({
  slug: z.string(),
  version: z.number(),
  pipeline: z.array(z.string()), // ['script', 'ssml', 'tts', 'render', 'thumb']
});

export const CostSnapshotSchema = z.object({
  total_usd: z.number(),
  breakdown: z.record(z.string(), z.number()), // { llm: 0.05, tts: 0.02, ... }
});

export const ManifestSchema = z.object({
  // Meta
  version: z.literal(ManifestVersion),
  job_id: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  
  // Input
  input: z.object({
    title: z.string(),
    brief: z.string().optional(),
    themes: z.array(z.string()).optional(),
  }),
  
  // Snapshots (o que foi usado - imutável)
  snapshots: z.object({
    recipe: RecipeSnapshotSchema,
    prompts: z.record(z.string(), PromptSnapshotSchema), // { script: {...}, ssml: {...} }
    presets: z.record(z.string(), PresetSnapshotSchema), // { voice: {...}, video: {...} }
    providers: z.record(z.string(), z.string()), // { llm: 'anthropic', tts: 'azure' }
    validators: z.array(z.string()), // ['required_fields', 'max_chars']
  }),
  
  // Execution
  steps: z.array(StepSnapshotSchema),
  
  // Results
  output: z.object({
    final_video: ArtifactRefSchema.optional(),
    thumbnail: ArtifactRefSchema.optional(),
  }).optional(),
  
  // Metrics
  metrics: z.object({
    total_duration_ms: z.number(),
    costs: CostSnapshotSchema.optional(),
    retries_total: z.number(),
  }).optional(),
});

export type Manifest = z.infer<typeof ManifestSchema>;
export type StepSnapshot = z.infer<typeof StepSnapshotSchema>;
export type ArtifactRef = z.infer<typeof ArtifactRefSchema>;
```

---

## Exemplo 1: Manifest Mínimo (Job Pendente)

```json
{
  "version": "1.0.0",
  "job_id": "job_abc123",
  "created_at": "2025-12-13T10:00:00Z",
  "updated_at": "2025-12-13T10:00:00Z",
  
  "input": {
    "title": "Mi hijo me dijo que lo avergüenzo"
  },
  
  "snapshots": {
    "recipe": {
      "slug": "graciela-youtube-long",
      "version": 1,
      "pipeline": ["script", "ssml", "tts", "render", "thumb"]
    },
    "prompts": {
      "script": {
        "slug": "graciela-roteiro-v1",
        "version": 3,
        "hash": "sha256:abc123..."
      }
    },
    "presets": {
      "voice": {
        "id": "preset_dalia",
        "type": "voice",
        "version": 1,
        "config_hash": "sha256:def456..."
      }
    },
    "providers": {
      "llm": "anthropic",
      "tts": "azure"
    },
    "validators": ["required_fields"]
  },
  
  "steps": [
    { "step_name": "script", "status": "pending", "attempts": 0, "artifacts": [] },
    { "step_name": "ssml", "status": "pending", "attempts": 0, "artifacts": [] },
    { "step_name": "tts", "status": "pending", "attempts": 0, "artifacts": [] },
    { "step_name": "render", "status": "pending", "attempts": 0, "artifacts": [] },
    { "step_name": "thumb", "status": "pending", "attempts": 0, "artifacts": [] }
  ]
}
```

---

## Exemplo 2: Manifest Realista (Job Completo)

```json
{
  "version": "1.0.0",
  "job_id": "job_xyz789",
  "created_at": "2025-12-13T14:30:00Z",
  "updated_at": "2025-12-13T14:48:22Z",
  
  "input": {
    "title": "Mi hijo me dijo que lo avergüenzo",
    "brief": "Historia de una madre que descubre que su hijo se avergüenza de ella por su origen humilde. Al final, él se da cuenta del sacrificio que ella hizo.",
    "themes": ["familia", "sacrificio", "reconciliación"]
  },
  
  "snapshots": {
    "recipe": {
      "slug": "graciela-youtube-long",
      "version": 2,
      "pipeline": ["script", "ssml", "tts", "render", "thumb"]
    },
    "prompts": {
      "script": {
        "slug": "graciela-roteiro-v1",
        "version": 5,
        "hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
      },
      "ssml": {
        "slug": "graciela-ssml-template",
        "version": 2,
        "hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    },
    "presets": {
      "voice": {
        "id": "preset_dalia_intense",
        "type": "voice",
        "version": 3,
        "config_hash": "sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
      },
      "video": {
        "id": "preset_youtube_1080p",
        "type": "video",
        "version": 1,
        "config_hash": "sha256:2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3"
      },
      "effects": {
        "id": "preset_subtle_vignette",
        "type": "effects",
        "version": 1,
        "config_hash": "sha256:19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7"
      }
    },
    "providers": {
      "llm": "anthropic",
      "tts": "azure",
      "render": "local_ffmpeg"
    },
    "validators": ["required_fields", "max_chars", "duration_range"]
  },
  
  "steps": [
    {
      "step_name": "script",
      "status": "completed",
      "attempts": 1,
      "started_at": "2025-12-13T14:30:05Z",
      "completed_at": "2025-12-13T14:30:52Z",
      "duration_ms": 47000,
      "artifacts": [
        {
          "id": "art_script_001",
          "type": "script",
          "path": "jobs/job_xyz789/script.md",
          "hash": "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
          "size_bytes": 12450,
          "created_at": "2025-12-13T14:30:52Z"
        },
        {
          "id": "art_script_002",
          "type": "script_json",
          "path": "jobs/job_xyz789/script.json",
          "hash": "sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
          "size_bytes": 8320,
          "created_at": "2025-12-13T14:30:52Z"
        }
      ]
    },
    {
      "step_name": "ssml",
      "status": "completed",
      "attempts": 1,
      "started_at": "2025-12-13T14:30:53Z",
      "completed_at": "2025-12-13T14:30:55Z",
      "duration_ms": 2000,
      "artifacts": [
        {
          "id": "art_ssml_001",
          "type": "ssml",
          "path": "jobs/job_xyz789/ssml.xml",
          "hash": "sha256:e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683",
          "size_bytes": 15200,
          "created_at": "2025-12-13T14:30:55Z"
        }
      ]
    },
    {
      "step_name": "tts",
      "status": "completed",
      "attempts": 2,
      "started_at": "2025-12-13T14:30:56Z",
      "completed_at": "2025-12-13T14:35:20Z",
      "duration_ms": 264000,
      "error": null,
      "artifacts": [
        {
          "id": "art_audio_001",
          "type": "audio",
          "path": "jobs/job_xyz789/audio.mp3",
          "hash": "sha256:3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea",
          "size_bytes": 48500000,
          "created_at": "2025-12-13T14:35:20Z"
        },
        {
          "id": "art_timestamps_001",
          "type": "timestamps",
          "path": "jobs/job_xyz789/timestamps.json",
          "hash": "sha256:a2c4e8f4b3d6c1e7a9b0d2f5c8a1b3e6d9f2c5a8b1d4e7a0c3f6b9d2e5a8c1b4",
          "size_bytes": 4200,
          "created_at": "2025-12-13T14:35:20Z"
        }
      ]
    },
    {
      "step_name": "render",
      "status": "completed",
      "attempts": 1,
      "started_at": "2025-12-13T14:35:22Z",
      "completed_at": "2025-12-13T14:47:45Z",
      "duration_ms": 743000,
      "artifacts": [
        {
          "id": "art_video_001",
          "type": "video",
          "path": "jobs/job_xyz789/video.mp4",
          "hash": "sha256:d7a5d0c8b3e6f9a2c5d8b1e4a7c0f3d6e9b2a5c8d1e4f7a0b3c6d9e2f5a8b1c4",
          "size_bytes": 524288000,
          "created_at": "2025-12-13T14:47:45Z"
        }
      ]
    },
    {
      "step_name": "thumb",
      "status": "completed",
      "attempts": 1,
      "started_at": "2025-12-13T14:47:47Z",
      "completed_at": "2025-12-13T14:48:02Z",
      "duration_ms": 15000,
      "artifacts": [
        {
          "id": "art_thumb_001",
          "type": "thumbnail",
          "path": "jobs/job_xyz789/thumb.png",
          "hash": "sha256:f6e7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0f1d2c3b4a5e6f7",
          "size_bytes": 245000,
          "created_at": "2025-12-13T14:48:02Z"
        }
      ]
    }
  ],
  
  "output": {
    "final_video": {
      "id": "art_video_001",
      "type": "video",
      "path": "jobs/job_xyz789/video.mp4",
      "hash": "sha256:d7a5d0c8b3e6f9a2c5d8b1e4a7c0f3d6e9b2a5c8d1e4f7a0b3c6d9e2f5a8b1c4",
      "size_bytes": 524288000,
      "created_at": "2025-12-13T14:47:45Z"
    },
    "thumbnail": {
      "id": "art_thumb_001",
      "type": "thumbnail",
      "path": "jobs/job_xyz789/thumb.png",
      "hash": "sha256:f6e7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0f1d2c3b4a5e6f7",
      "size_bytes": 245000,
      "created_at": "2025-12-13T14:48:02Z"
    }
  },
  
  "metrics": {
    "total_duration_ms": 1102000,
    "costs": {
      "total_usd": 0.38,
      "breakdown": {
        "llm_script": 0.12,
        "tts_azure": 0.24,
        "render_local": 0.00,
        "storage": 0.02
      }
    },
    "retries_total": 1
  }
}
```

---

## Regras de Uso

### 1. Manifest é Imutável Após Snapshot

- Quando o job inicia, os snapshots são congelados
- Se prompt/preset mudar depois, o manifest não muda
- Isso garante reprodutibilidade

### 2. Steps São Atualizados Durante Execução

- `steps[].status` muda conforme executa
- `steps[].artifacts` cresce conforme gera
- `updated_at` reflete última mudança

### 3. Hash é SHA256 do Conteúdo

- Para templates: hash do texto final
- Para configs: hash do JSON.stringify(config)
- Para arquivos: hash do conteúdo binário

### 4. Paths São Relativos ao Job

- Base: `jobs/{job_id}/`
- Nunca paths absolutos no manifest

---

## Evidências

### Schema compila
```bash
npx tsc lib/types/manifest.schema.ts --noEmit
# Deve passar sem erros
```

### Zod parse funciona
```typescript
import { ManifestSchema } from './manifest.schema';

const result = ManifestSchema.safeParse(manifestMinimo);
console.log(result.success); // true
```

### Teste de validação
```bash
npm test -- manifest.test.ts
```

---

**Próximo:** Criar o schema TypeScript real e ADR-004
