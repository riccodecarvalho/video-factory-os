# ADR-015: Short-form Format Profiles

> **Status:** Aceito  
> **Data:** 2025-12-22  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

O Video Factory OS precisa suportar formatos verticais (9:16) para plataformas de short-form:
- YouTube Shorts
- TikTok
- Instagram Reels

Cada plataforma tem requisitos específicos de resolução, bitrate, e safe areas.

---

## Decisão

### Format Profiles

Dois perfis base:

| Profile | Aspect Ratio | Resolução | Uso |
|---------|--------------|-----------|-----|
| `longform` | 16:9 | 1920x1080 | YouTube, Vimeo |
| `shorts` | 9:16 | 1080x1920 | Shorts, TikTok, Reels |

### Safe Areas

Cada plataforma tem UI overlays que ocupam espaço na tela. O conteúdo importante deve ficar na "safe area":

```
┌────────────────────────────────────┐
│  ████████████████████████████████  │ ← Área bloqueada (username, etc)
│                                    │
│    ┌──────────────────────────┐    │
│    │                          │    │
│    │      SAFE AREA           │    │
│    │   (conteúdo principal)   │    │
│    │                          │    │
│    └──────────────────────────┘    │
│                                    │
│  ████████████████████████████████  │ ← Área bloqueada (comentários, etc)
└────────────────────────────────────┘
```

| Plataforma | Top (px) | Bottom (px) | Left (px) | Right (px) |
|------------|----------|-------------|-----------|------------|
| YouTube Shorts | 120 | 150 | 20 | 20 |
| TikTok | 100 | 180 | 20 | 20 |
| Instagram Reels | 110 | 160 | 20 | 20 |

### Implementação

#### Schema (`lib/timeline/schema.ts`)

```typescript
export type FormatProfile = 'longform' | 'shorts';

export const FORMAT_PRESETS: Record<FormatProfile, TimelineSettings> = {
  longform: { width: 1920, height: 1080, fps: 30 },
  shorts: { width: 1080, height: 1920, fps: 30 },
};

export const SAFE_AREAS: Record<string, SafeArea> = {
  'youtube-shorts': { top: 120, bottom: 150, left: 20, right: 20 },
  'tiktok': { top: 100, bottom: 180, left: 20, right: 20 },
  'instagram-reels': { top: 110, bottom: 160, left: 20, right: 20 },
};
```

#### Presets (`lib/engine/preset-registry.ts`)

```typescript
'shorts-videotoolbox': {
    encoder: 'h264_videotoolbox',
    scale: '1080:1920',
    fps: 30,
    bitrate: '6M',
    // ...
},

'youtube-shorts': { /* optimized for YT */ },
'tiktok': { /* optimized for TikTok */ },
'instagram-reels': { /* optimized for IG */ },
```

---

## Uso

```typescript
// No input do job:
{
    "format": "shorts",
    "platform": "tiktok"
}

// No código:
import { FORMAT_PRESETS, SAFE_AREAS } from '@/lib/timeline';
import { getPresetForPlatform } from '@/lib/engine/preset-registry';

const settings = FORMAT_PRESETS['shorts'];
const safeArea = SAFE_AREAS['tiktok'];
const preset = getPresetForPlatform('tiktok');
```

---

## Alternativas Consideradas

### Suportar todas as resoluções arbitrárias
**Rejeitado**: Complexidade sem benefício. Plataformas têm padrões definidos.

### Usar aspect ratio ao invés de resolução fixa
**Parcialmente aceito**: Aspect ratio define o profile, resolução é configurável via preset.

---

## Consequências

### Positivas
- Suporte nativo a todas as plataformas de shorts
- Safe areas garantem conteúdo visível
- Presets otimizados por plataforma

### Negativas
- Precisa manter safe areas atualizadas se plataformas mudarem

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `lib/timeline/schema.ts` | `FormatProfile`, `FORMAT_PRESETS`, `SAFE_AREAS` |
| `lib/engine/preset-registry.ts` | Presets por plataforma |
| `lib/engine/recipe-to-timeline.ts` | Suporte a `format` no input |

---

**Última atualização:** 2025-12-22
