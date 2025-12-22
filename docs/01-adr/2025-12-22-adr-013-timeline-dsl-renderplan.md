# ADR-013: Timeline DSL + RenderPlan Architecture

> **Status:** Aceito  
> **Data:** 2025-12-22  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

O Video Factory OS precisa evoluir para suportar:

1. **Composição declarativa de vídeos** (cenas, layers, timing)
2. **Abstração entre definição e execução** (não acoplar manifest a FFmpeg)
3. **Render farm** com múltiplos workers (Macs)
4. **Short-form** (9:16) além de longform (16:9)

O modelo atual em `runner.ts` executa steps sequencialmente com comandos FFmpeg inline, sem abstração de timeline ou plano de execução.

### Referência: JSON2Video

Inspiração vem do JSON2Video, que resolve "video as code":
- `movie → scenes → elements`
- Templates com variáveis
- Render assíncrono

**Objetivo**: internalizar esse conceito no VFOs, mantendo config-first e manifest-first.

---

## Decisão

Criar três novas estruturas:

### 1. Timeline DSL

Define **O QUE** é o vídeo (declarativo).

```typescript
interface Timeline {
  version: string;            // "1.0.0"
  settings: TimelineSettings;
  scenes: Scene[];
}

interface TimelineSettings {
  width: number;              // 1920
  height: number;             // 1080
  fps: number;                // 30
  backgroundColor?: string;   // "#000000"
}

interface Scene {
  id: string;
  start: number;              // segundos desde início do vídeo
  duration: number;           // segundos
  elements: Element[];
}

interface Element {
  id: string;
  type: ElementType;
  layer: number;              // z-index (0 = fundo)
  start: number;              // relativo à cena
  duration: number;
  src?: string;               // path ou URL
  props: ElementProps;
}

type ElementType = 'video' | 'audio' | 'image' | 'text' | 'subtitle';

interface ElementProps {
  // Video/Image
  position?: { x: number; y: number };
  scale?: number;
  opacity?: number;
  
  // Audio
  volume?: number;            // 0-1
  fadeIn?: number;            // segundos
  fadeOut?: number;
  
  // Text
  content?: string;
  font?: string;
  fontSize?: number;
  color?: string;
  
  // Subtitle
  srtPath?: string;
  style?: 'default' | 'shorts' | 'custom';
}
```

### 2. RenderPlan

Define **COMO** executar (imperativo).

```typescript
interface RenderPlan {
  version: string;
  jobId: string;
  createdAt: string;
  steps: RenderStep[];
  finalOutput: string;
}

interface RenderStep {
  id: string;
  type: StepType;
  command: string;            // comando FFmpeg completo
  inputs: string[];           // paths de entrada
  output: string;             // path de saída
  dependencies: string[];     // IDs de steps anteriores
  metadata: {
    description: string;
    estimatedDurationMs?: number;
  };
}

type StepType = 
  | 'prepare'    // baixar/converter assets
  | 'process'    // aplicar filtros
  | 'compose'    // juntar layers
  | 'encode';    // encode final
```

### 3. Compiler

Transforma Timeline → RenderPlan.

```
┌──────────────────────────────────────────────────────────┐
│ FLUXO                                                    │
│                                                          │
│  Recipe + Input                                          │
│       ↓                                                  │
│  ┌─────────────┐                                         │
│  │  Manifest   │  (alto nível, "o que")                  │
│  └──────┬──────┘                                         │
│         ↓                                                │
│  ┌──────────────┐                                        │
│  │   Timeline   │  ← DSL declarativa                     │
│  └──────┬───────┘                                        │
│         ↓                                                │
│  ┌──────────────┐                                        │
│  │   Compiler   │  ← resolve variáveis, valida, otimiza  │
│  └──────┬───────┘                                        │
│         ↓                                                │
│  ┌──────────────┐                                        │
│  │  RenderPlan  │  ← comandos FFmpeg concretos           │
│  └──────┬───────┘                                        │
│         ↓                                                │
│  ┌──────────────┐                                        │
│  │   Worker     │  ← executa steps, reporta progresso    │
│  └──────────────┘                                        │
└──────────────────────────────────────────────────────────┘
```

---

## Exemplo de Timeline (Longform Graciela)

```json
{
  "version": "1.0.0",
  "settings": {
    "width": 1920,
    "height": 1080,
    "fps": 30
  },
  "scenes": [
    {
      "id": "scene-001",
      "start": 0,
      "duration": 300,
      "elements": [
        {
          "id": "bg-video",
          "type": "video",
          "layer": 0,
          "start": 0,
          "duration": 300,
          "src": "/recipes/graciela/assets/background.mp4",
          "props": { "scale": 1, "opacity": 1 }
        },
        {
          "id": "tts-audio",
          "type": "audio",
          "layer": 1,
          "start": 0,
          "duration": 300,
          "src": "/jobs/job-123/tts_output.mp3",
          "props": { "volume": 1 }
        },
        {
          "id": "subtitles",
          "type": "subtitle",
          "layer": 2,
          "start": 0,
          "duration": 300,
          "props": { 
            "srtPath": "/jobs/job-123/subtitles.srt",
            "style": "default"
          }
        }
      ]
    }
  ]
}
```

---

## Exemplo de RenderPlan Gerado

```json
{
  "version": "1.0.0",
  "jobId": "job-123",
  "createdAt": "2025-12-22T12:00:00Z",
  "steps": [
    {
      "id": "step-1",
      "type": "compose",
      "command": "ffmpeg -i /recipes/graciela/assets/background.mp4 -i /jobs/job-123/tts_output.mp3 -vf subtitles=/jobs/job-123/subtitles.srt -c:v h264_videotoolbox -b:v 4M -c:a aac -b:a 192k /jobs/job-123/output.mp4",
      "inputs": [
        "/recipes/graciela/assets/background.mp4",
        "/jobs/job-123/tts_output.mp3"
      ],
      "output": "/jobs/job-123/output.mp4",
      "dependencies": [],
      "metadata": {
        "description": "Compose scene-001 with video + audio + subtitles"
      }
    }
  ],
  "finalOutput": "/jobs/job-123/output.mp4"
}
```

---

## Integração com Código Existente

| Componente Atual | Mudança |
|------------------|---------|
| `runner.ts` | Chamar compiler antes de executeStepRender |
| `ffmpeg.ts` | Reutilizar `renderVideo()`, adicionar suporte a RenderPlan |
| `types.ts` | Adicionar tipos Timeline e RenderPlan |
| Nova pasta `lib/timeline/` | Schema, validator, compiler |

---

## Alternativas Consideradas

### Usar JSON2Video como SaaS
**Rejeitado**: custo alto para longform, sem controle local, sem VideoToolbox.

### Gerar comandos FFmpeg diretamente no runner
**Atual, sendo substituído**: sem abstração, difícil de testar e escalar.

---

## Consequências

### Positivas
- Vídeo vira "código" (versionável, testável)
- Abstração permite trocar backend (FFmpeg hoje, outro amanhã)
- Facilita short-form (só mudar settings)
- Habilita render farm (workers pegam RenderPlan)

### Negativas
- Mais complexidade inicial
- Dois schemas para manter (Timeline + RenderPlan)

---

## Próximos Passos

1. Implementar types em `lib/timeline/schema.ts`
2. Implementar validator Zod em `lib/timeline/validator.ts`
3. Implementar RenderPlan em `lib/timeline/render-plan.ts`
4. Implementar Compiler em `lib/timeline/compiler.ts`
5. Criar ADR-014 (Render Farm Strategy)
6. Criar ADR-015 (Short-form Format Profiles)

---

## Referências

- [Render Engine Evolution Context Pack](../04-produto/render-engine-evolution.md)
- [ADR-007 Engine Execution Model](./2025-12-13-adr-007-engine-execution-model.md)
- [JSON2Video Docs](https://json2video.com/docs/)

---

**Última atualização:** 2025-12-22
