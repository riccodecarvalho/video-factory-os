# Video Factory OS - Timeline DSL Guia

> **Objetivo:** Documentar o sistema declarativo de composição de vídeo
> **Fonte:** `lib/timeline/`, ADR-013, ADR-015
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [O Que é Timeline DSL](#o-que-é-timeline-dsl)
2. [Arquitetura](#arquitetura)
3. [Schema da Timeline](#schema-da-timeline)
4. [Elementos Suportados](#elementos-suportados)
5. [Format Profiles](#format-profiles)
6. [Compiler: Timeline → RenderPlan](#compiler)
7. [Executor: RenderPlan → FFmpeg](#executor)
8. [Exemplos Práticos](#exemplos-práticos)
9. [Como Estender](#como-estender)

---

## O QUE É TIMELINE DSL

### Problema Resolvido

Antes do Timeline DSL, a composição de vídeo era **imperativa**:
```typescript
// ANTES: Comandos FFmpeg inline
await runFFmpeg(`-i audio.mp3 -i bg.jpg -filter_complex "[1:v]scale=1920:1080..." output.mp4`);
```

Problemas:
- Difícil de manter e debugar
- Acoplado ao FFmpeg
- Não adaptável a diferentes formatos (16:9 vs 9:16)

### Solução: Declarativo

```typescript
// DEPOIS: Timeline DSL
const timeline: Timeline = {
  version: '1.0',
  settings: { width: 1920, height: 1080, fps: 30 },
  scenes: [
    {
      id: 'intro',
      start: 0,
      duration: 10,
      elements: [
        { type: 'video', src: 'bg.mp4', layer: 0 },
        { type: 'audio', src: 'narration.mp3', layer: 1 },
        { type: 'subtitle', text: 'Olá...', layer: 2 },
      ],
    },
  ],
};
```

Benefícios:
- **Declarativo**: Descreve O QUE, não COMO
- **Abstrato**: Pode trocar backend (FFmpeg → outro)
- **Flexível**: Adapta a diferentes formatos

---

## ARQUITETURA

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                     TIMELINE DSL FLOW                            │
└─────────────────────────────────────────────────────────────────┘

  Recipe          Timeline DSL         RenderPlan         Vídeo
  (Config)  ─────▶  (O QUE)  ─────────▶  (COMO)  ────────▶ (.mp4)
                      │                    │
                      │                    │
              ┌───────┴───────┐    ┌───────┴───────┐
              │   COMPILER    │    │   EXECUTOR    │
              │               │    │               │
              │ • Valida      │    │ • Gera cmds   │
              │ • Resolve     │    │ • Executa     │
              │ • Otimiza     │    │ • Monitora    │
              └───────────────┘    └───────────────┘
```

### Componentes

| Componente | Arquivo | Função |
|------------|---------|--------|
| **Schema** | `lib/timeline/schema.ts` | Tipos e interfaces |
| **Compiler** | `lib/timeline/compiler.ts` | Timeline → RenderPlan |
| **Executor** | `lib/engine/timeline-executor.ts` | RenderPlan → FFmpeg |
| **Helpers** | `lib/timeline/schema.ts` | Funções auxiliares |

---

## SCHEMA DA TIMELINE

### Timeline (Root)

```typescript
interface Timeline {
  version: string;              // '1.0'
  settings: TimelineSettings;   // Configurações globais
  scenes: Scene[];              // Lista de cenas
  metadata?: {                  // Metadados opcionais
    title?: string;
    description?: string;
    author?: string;
  };
}
```

### TimelineSettings

```typescript
interface TimelineSettings {
  width: number;      // 1920 (longform) ou 1080 (shorts)
  height: number;     // 1080 (longform) ou 1920 (shorts)
  fps: number;        // 30
  backgroundColor?: string;  // '#000000'
}
```

### Scene

```typescript
interface Scene {
  id: string;           // 'intro', 'scene-1', etc.
  start: number;        // Início em segundos
  duration: number;     // Duração em segundos
  elements: Element[];  // Elementos visuais/audio
  transition?: {        // Transição de entrada
    type: 'fade' | 'dissolve' | 'cut';
    duration: number;
  };
}
```

### Element

```typescript
interface Element {
  type: ElementType;    // 'video', 'audio', 'image', 'text', 'subtitle'
  layer: number;        // Z-index (0 = fundo)
  start: number;        // Início relativo à cena
  duration: number;     // Duração
  src?: string;         // Caminho do arquivo (se aplicável)
  props: ElementProps;  // Propriedades específicas do tipo
}

type ElementType = 'video' | 'audio' | 'image' | 'text' | 'subtitle';
```

### ElementProps

```typescript
interface ElementProps {
  // Posição
  x?: number;           // Posição X (pixels)
  y?: number;           // Posição Y (pixels)
  width?: number;       // Largura
  height?: number;      // Altura
  
  // Transformações
  scale?: number;       // Escala (1.0 = 100%)
  rotation?: number;    // Rotação (graus)
  opacity?: number;     // Opacidade (0-1)
  
  // Texto/Legenda
  text?: string;        // Conteúdo de texto
  fontFamily?: string;  // Fonte
  fontSize?: number;    // Tamanho
  fontColor?: string;   // Cor (#FFFFFF)
  
  // Áudio
  volume?: number;      // Volume (0-1)
  fadeIn?: number;      // Fade in (segundos)
  fadeOut?: number;     // Fade out (segundos)
  
  // Vídeo/Imagem
  fit?: 'cover' | 'contain' | 'stretch';
  loop?: boolean;
}
```

---

## ELEMENTOS SUPORTADOS

### 1. Video

```typescript
{
  type: 'video',
  layer: 0,
  start: 0,
  duration: 60,
  src: 'background.mp4',
  props: {
    fit: 'cover',
    loop: true,
    opacity: 0.8,
  },
}
```

### 2. Audio

```typescript
{
  type: 'audio',
  layer: 1,
  start: 0,
  duration: 120,
  src: 'narration.mp3',
  props: {
    volume: 1.0,
    fadeIn: 0.5,
    fadeOut: 1.0,
  },
}
```

### 3. Image

```typescript
{
  type: 'image',
  layer: 0,
  start: 0,
  duration: 10,
  src: 'background.jpg',
  props: {
    fit: 'cover',
  },
}
```

### 4. Text

```typescript
{
  type: 'text',
  layer: 2,
  start: 5,
  duration: 3,
  props: {
    text: 'Título do Vídeo',
    fontFamily: 'Inter',
    fontSize: 48,
    fontColor: '#FFFFFF',
    x: 960,  // Centralizado
    y: 540,
  },
}
```

### 5. Subtitle

```typescript
{
  type: 'subtitle',
  layer: 3,
  start: 0,
  duration: 5,
  props: {
    text: 'Olá, meus amores...',
    style: 'default',  // ou 'karaoke', 'outline'
    position: 'bottom',
  },
}
```

---

## FORMAT PROFILES

### Presets Disponíveis

```typescript
// lib/timeline/schema.ts

const FORMAT_PRESETS = {
  longform: {
    width: 1920,
    height: 1080,
    fps: 30,
  },
  shorts: {
    width: 1080,
    height: 1920,
    fps: 30,
  },
};
```

### Safe Areas por Plataforma

```typescript
const SAFE_AREAS = {
  'youtube-shorts': {
    top: 120,      // Espaço para UI do YouTube
    bottom: 150,   // Espaço para comentários
    left: 20,
    right: 20,
  },
  'tiktok': {
    top: 100,
    bottom: 180,   // Mais espaço para UI do TikTok
    left: 20,
    right: 20,
  },
  'instagram-reels': {
    top: 100,
    bottom: 200,
    left: 20,
    right: 20,
  },
};
```

### Uso

```typescript
// Criar timeline para shorts
const timeline: Timeline = {
  version: '1.0',
  settings: FORMAT_PRESETS.shorts,
  scenes: [/* ... */],
};

// Posicionar texto respeitando safe area
const safeArea = SAFE_AREAS['youtube-shorts'];
const textElement = {
  type: 'text',
  props: {
    y: 1920 - safeArea.bottom - 50,  // Acima da área de comentários
  },
};
```

---

## COMPILER

### Função Principal

```typescript
// lib/timeline/compiler.ts

interface CompilerOptions {
  jobId: string;
  outputDir: string;
  encodingPreset?: string;
}

interface CompilerResult {
  success: boolean;
  renderPlan?: RenderPlan;
  errors?: string[];
}

function compileTimeline(
  timeline: Timeline,
  options: CompilerOptions
): CompilerResult;
```

### RenderPlan Gerado

```typescript
interface RenderPlan {
  jobId: string;
  steps: RenderStep[];
  finalOutput: string;
}

interface RenderStep {
  id: string;
  command: string;         // Comando FFmpeg
  inputs: string[];        // Arquivos de entrada
  output: string;          // Arquivo de saída
  dependencies: string[];  // Steps que devem completar antes
}
```

### Exemplo de Compilação

```typescript
// Input: Timeline simples
const timeline: Timeline = {
  version: '1.0',
  settings: { width: 1920, height: 1080, fps: 30 },
  scenes: [{
    id: 'main',
    start: 0,
    duration: 60,
    elements: [
      { type: 'image', src: 'bg.jpg', layer: 0, ... },
      { type: 'audio', src: 'audio.mp3', layer: 1, ... },
    ],
  }],
};

// Output: RenderPlan
const plan: RenderPlan = {
  jobId: 'job-123',
  steps: [
    {
      id: 'step-1-bg',
      command: 'ffmpeg -loop 1 -i bg.jpg -t 60 -vf scale=1920:1080 bg-scaled.mp4',
      inputs: ['bg.jpg'],
      output: 'bg-scaled.mp4',
      dependencies: [],
    },
    {
      id: 'step-2-compose',
      command: 'ffmpeg -i bg-scaled.mp4 -i audio.mp3 -c:v copy -c:a aac output.mp4',
      inputs: ['bg-scaled.mp4', 'audio.mp3'],
      output: 'output.mp4',
      dependencies: ['step-1-bg'],
    },
  ],
  finalOutput: 'output.mp4',
};
```

---

## EXECUTOR

### Timeline Executor

```typescript
// lib/engine/timeline-executor.ts

interface ExecutorOptions {
  renderPlan: RenderPlan;
  workDir: string;
  onProgress?: (step: string, progress: number) => void;
}

interface ExecutorResult {
  success: boolean;
  outputPath: string;
  duration: number;
  errors?: string[];
}

async function executeRenderPlan(
  options: ExecutorOptions
): Promise<ExecutorResult>;
```

### Execução Paralela

O executor analisa dependências e executa steps em paralelo quando possível:

```
Step 1 (bg)     ────────────────────▶ ┐
                                      ├──▶ Step 3 (compose) ──▶ Output
Step 2 (audio)  ────────────────────▶ ┘
```

### Monitoramento de Progresso

```typescript
await executeRenderPlan({
  renderPlan: plan,
  workDir: '/tmp/render',
  onProgress: (step, progress) => {
    console.log(`${step}: ${progress}%`);
    // Atualiza UI/banco
  },
});
```

---

## EXEMPLOS PRÁTICOS

### 1. Vídeo Simples (Imagem + Áudio)

```typescript
const timeline: Timeline = {
  version: '1.0',
  settings: FORMAT_PRESETS.longform,
  scenes: [{
    id: 'main',
    start: 0,
    duration: 300,  // 5 minutos
    elements: [
      createImageElement('background.jpg', 0, 300, { fit: 'cover' }),
      createAudioElement('narration.mp3', 0, 300, { volume: 1.0 }),
    ],
  }],
};
```

### 2. Vídeo com Múltiplas Cenas

```typescript
const timeline: Timeline = {
  version: '1.0',
  settings: FORMAT_PRESETS.longform,
  scenes: [
    {
      id: 'intro',
      start: 0,
      duration: 30,
      elements: [
        createVideoElement('intro.mp4', 0, 30),
      ],
      transition: { type: 'fade', duration: 1 },
    },
    {
      id: 'main',
      start: 30,
      duration: 270,
      elements: [
        createImageElement('bg.jpg', 0, 270),
        createAudioElement('narration.mp3', 0, 270),
      ],
      transition: { type: 'dissolve', duration: 2 },
    },
    {
      id: 'outro',
      start: 300,
      duration: 15,
      elements: [
        createVideoElement('outro.mp4', 0, 15),
      ],
      transition: { type: 'fade', duration: 1 },
    },
  ],
};
```

### 3. YouTube Short (9:16)

```typescript
const timeline: Timeline = {
  version: '1.0',
  settings: FORMAT_PRESETS.shorts,
  scenes: [{
    id: 'short',
    start: 0,
    duration: 60,
    elements: [
      createVideoElement('clip.mp4', 0, 60, {
        fit: 'cover',
      }),
      createSubtitleElement('Olá!', 0, 3, {
        style: 'karaoke',
        position: 'bottom',
      }),
    ],
  }],
};
```

---

## COMO ESTENDER

### 1. Novo Tipo de Elemento

```typescript
// 1. Adicionar ao ElementType
type ElementType = 'video' | 'audio' | 'image' | 'text' | 'subtitle' | 'lottie';

// 2. Adicionar props específicas
interface LottieProps extends ElementProps {
  animationPath: string;
  loop?: boolean;
  speed?: number;
}

// 3. Implementar no Compiler
function compileLottieElement(element: Element, options: CompilerOptions): RenderStep {
  // Lógica de compilação para Lottie
}
```

### 2. Novo Format Profile

```typescript
// Adicionar ao FORMAT_PRESETS
const FORMAT_PRESETS = {
  // Existentes
  longform: { width: 1920, height: 1080, fps: 30 },
  shorts: { width: 1080, height: 1920, fps: 30 },
  
  // Novo
  square: { width: 1080, height: 1080, fps: 30 },  // Instagram
  cinema: { width: 2560, height: 1080, fps: 24 },  // 21:9
};
```

### 3. Nova Transição

```typescript
// Adicionar ao tipo de transição
type TransitionType = 'fade' | 'dissolve' | 'cut' | 'wipe' | 'zoom';

// Implementar no Compiler
function compileTransition(transition: Transition): string {
  switch (transition.type) {
    case 'wipe':
      return `xfade=transition=wipeleft:duration=${transition.duration}`;
    case 'zoom':
      return `zoompan=z='zoom+0.001':d=${transition.duration * fps}`;
    // ...
  }
}
```

---

## HELPERS DISPONÍVEIS

```typescript
// lib/timeline/schema.ts

// Calcular duração total
getTimelineDuration(timeline: Timeline): number;

// Criar timeline vazia
createEmptyTimeline(settings?: Partial<TimelineSettings>): Timeline;

// Criar cena
createScene(id: string, start: number, duration: number, elements?: Element[]): Scene;

// Criar elementos
createVideoElement(src: string, start: number, duration: number, props?: Partial<ElementProps>): Element;
createAudioElement(src: string, start: number, duration: number, props?: Partial<ElementProps>): Element;
createImageElement(src: string, start: number, duration: number, props?: Partial<ElementProps>): Element;
createTextElement(text: string, start: number, duration: number, props?: Partial<ElementProps>): Element;
createSubtitleElement(text: string, start: number, duration: number, props?: Partial<ElementProps>): Element;
```

---

## REFERÊNCIAS

- **ADR-013:** Timeline DSL + RenderPlan
- **ADR-014:** Render Farm Strategy
- **ADR-015:** Short-form Profiles
- **Inspiração:** JSON2Video (video as code)

---

*Guia do Timeline DSL para composição declarativa de vídeo.*
