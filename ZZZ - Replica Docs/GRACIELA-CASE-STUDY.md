# Video Factory OS - Case Study: Canal Graciela

> **Objetivo:** Documentar implementação completa do canal Graciela como referência
> **Fonte:** `lib/db/seed.ts`, `config/`, `recipes/graciela/`
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [Visão Geral do Canal](#visão-geral-do-canal)
2. [Configuração Completa](#configuração-completa)
3. [Pipeline de Produção](#pipeline-de-produção)
4. [Prompts Detalhados](#prompts-detalhados)
5. [Presets de Voz](#presets-de-voz)
6. [Knowledge Base](#knowledge-base)
7. [Como Replicar para Outro Canal](#como-replicar-para-outro-canal)

---

## VISÃO GERAL DO CANAL

### O Canal "Verdades de Graciela"

**Persona:** Graciela, avó mexicana de 62 anos
**Formato:** Storytime narrado (voz + imagem estática)
**Duração típica:** 5-15 minutos
**Plataforma:** YouTube
**Audiência:** Mulheres 45-65 anos, México e LATAM

### Características do Conteúdo

| Aspecto | Especificação |
|---------|---------------|
| **Idioma** | Espanhol mexicano |
| **Tom** | Caloroso, sábio, dramático |
| **Temas** | Drama familiar, conflitos geracionais |
| **Estrutura** | Hook → Contexto → Conflito → Clímax → Moraleja |
| **Narração** | Primeira pessoa (Graciela conta) |
| **Personagens** | Narradora + antagonistas com vozes distintas |

---

## CONFIGURAÇÃO COMPLETA

### 1. Projeto (projects)

```typescript
{
  id: 'uuid-graciela',
  key: 'graciela',
  name: 'Verdades de Graciela',
  description: 'Canal de storytime em espanhol mexicano',
  
  // Configurações de voz
  voiceRate: '0%',           // Velocidade normal
  voicePitch: '0%',          // Tom normal
  
  // Configurações de LLM
  llmTemperature: 0.75,      // Criativo mas consistente
  llmMaxTokens: 8000,        // Roteiros longos
  
  // Estilo de imagem
  imageStylePrefix: 'Mexican abuela style, warm colors, ',
  imageStyleSuffix: ', photorealistic, emotional',
  
  isActive: true,
}
```

### 2. Recipe (recipes)

```typescript
{
  id: 'uuid-recipe',
  slug: 'graciela-youtube-long',
  name: 'Graciela YouTube Long',
  description: 'Pipeline completo para vídeos longos do canal Graciela',
  
  pipeline: JSON.stringify([
    {
      key: 'title',
      name: 'Gerar Títulos',
      kind: 'llm',
      promptSlug: 'graciela.title.v1',
      required: true,
    },
    {
      key: 'brief',
      name: 'Expandir Brief',
      kind: 'llm',
      promptSlug: 'graciela.brief.v1',
      required: true,
    },
    {
      key: 'script',
      name: 'Gerar Roteiro',
      kind: 'llm',
      promptSlug: 'graciela.script.v1',
      required: true,
    },
    {
      key: 'parse_ssml',
      name: 'Converter para SSML',
      kind: 'transform',
      ssmlPresetSlug: 'graciela-default',
      required: true,
    },
    {
      key: 'tts',
      name: 'Gerar Áudio',
      kind: 'tts',
      providerSlug: 'azure-tts',
      voicePresetSlug: 'es-mx-dalia-narradora',
      required: true,
    },
    {
      key: 'render',
      name: 'Renderizar Vídeo',
      kind: 'render',
      videoPresetSlug: 'mac-videotoolbox-720p',
      required: true,
    },
    {
      key: 'export',
      name: 'Exportar Pacote',
      kind: 'export',
      required: true,
    },
  ]),
  
  defaultVoicePresetSlug: 'es-mx-dalia-narradora',
  defaultVideoPresetSlug: 'mac-videotoolbox-720p',
  
  version: 1,
  isActive: true,
}
```

### 3. Provider Claude (providers)

```typescript
{
  id: 'uuid-claude',
  slug: 'claude',
  name: 'Claude (Anthropic)',
  type: 'llm',
  defaultModel: 'claude-sonnet-4-20250514',
  config: JSON.stringify({
    maxTokens: 8192,
    temperature: 0.7,
  }),
  isActive: true,
}
```

### 4. Provider Azure TTS (providers)

```typescript
{
  id: 'uuid-azure',
  slug: 'azure-tts',
  name: 'Azure Speech Services',
  type: 'tts',
  baseUrl: 'https://eastus2.api.cognitive.microsoft.com',
  config: JSON.stringify({
    outputFormat: 'audio-48khz-192kbitrate-mono-mp3',
    batchSynthesis: true,
  }),
  isActive: true,
}
```

---

## PIPELINE DE PRODUÇÃO

### Fluxo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                     PIPELINE GRACIELA                            │
└─────────────────────────────────────────────────────────────────┘

    INPUT                                                    OUTPUT
  ┌─────────┐                                              ┌─────────┐
  │ Título  │                                              │ Vídeo   │
  │ Brief   │                                              │ .mp4    │
  └────┬────┘                                              └────▲────┘
       │                                                        │
       ▼                                                        │
  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
  │  TITLE  │────▶│  BRIEF  │────▶│ SCRIPT  │────▶│PARSE_SSML│  │
  │  (LLM)  │     │  (LLM)  │     │  (LLM)  │     │(Transform)│  │
  └─────────┘     └─────────┘     └─────────┘     └────┬────┘  │
                                                       │       │
                                                       ▼       │
                                                  ┌─────────┐  │
                                                  │   TTS   │  │
                                                  │ (Azure) │  │
                                                  └────┬────┘  │
                                                       │       │
                                                       ▼       │
                                                  ┌─────────┐  │
                                                  │ RENDER  │  │
                                                  │(FFmpeg) │  │
                                                  └────┬────┘  │
                                                       │       │
                                                       ▼       │
                                                  ┌─────────┐  │
                                                  │ EXPORT  │──┘
                                                  │(Package)│
                                                  └─────────┘
```

### Detalhes por Step

| Step | Kind | Duração | Input | Output |
|------|------|---------|-------|--------|
| title | llm | ~5s | brief | 5 títulos |
| brief | llm | ~10s | título + brief | brief expandido |
| script | llm | ~30s | brief | roteiro Stage Directions |
| parse_ssml | transform | <1s | roteiro | SSML formatado |
| tts | tts | 5-15min | SSML | audio.mp3 |
| render | render | 1-5min | áudio + imagem | video.mp4 |
| export | export | <1s | todos artifacts | pacote final |

---

## PROMPTS DETALHADOS

### graciela.title.v1

```typescript
{
  slug: 'graciela.title.v1',
  name: 'Gerar Títulos Graciela',
  category: 'title',
  
  systemPrompt: `Eres un experto en títulos virales para YouTube en español mexicano.

TU AUDIENCIA:
- Mujeres de 45-65 años
- México y América Latina  
- Interesadas en dramas familiares reales

REGLAS PARA TÍTULOS:
1. Entre 50-70 caracteres
2. Usa curiosidad y emoción
3. Menciona relaciones familiares (nuera, suegra, hija, etc.)
4. NO uses clickbait engañoso
5. NO uses ALL CAPS excesivo

ESTRUCTURA EFECTIVA:
- "Mi [relación] [acción dramática] y [consecuencia]"
- "¿Por qué [pregunta emocional]?"
- "[Evento] que [cambió/reveló] [algo importante]"`,

  userTemplate: `Tema del video:
{{brief}}

Duración aproximada: {{duracao}} minutos

GENERA 5 TÍTULOS DIFERENTES.
Ordénalos del más al menos viral.
Explica brevemente por qué cada uno funciona.`,

  model: 'claude-sonnet-4-20250514',
  maxTokens: 2000,
  temperature: 0.8,
  kbTiers: JSON.stringify(['tier1']),
}
```

### graciela.brief.v1

```typescript
{
  slug: 'graciela.brief.v1',
  name: 'Expandir Brief Graciela',
  category: 'brief',
  
  systemPrompt: `Expande una idea de video en un brief de producción estructurado.

INCLUYE SIEMPRE:
1. PREMISA: Resumen en 2-3 oraciones
2. CONFLICTO CENTRAL: ¿Cuál es el problema/drama?
3. PERSONAJES: Lista con descripción breve
4. ARCO EMOCIONAL: Inicio → Desarrollo → Clímax → Resolución
5. GANCHOS DE RETENCIÓN: 3-5 momentos para mantener al espectador
6. MORALEJA: Lección o reflexión final

TONO: Como si estuvieras planificando con el equipo de producción.`,

  userTemplate: `TÍTULO SELECCIONADO:
{{previousSteps.title}}

IDEA ORIGINAL:
{{brief}}

DURACIÓN: {{duracao}} minutos

Expande en un brief de 400-600 palabras.`,

  model: 'claude-sonnet-4-20250514',
  maxTokens: 3000,
  temperature: 0.7,
  kbTiers: JSON.stringify(['tier1', 'tier2']),
}
```

### graciela.script.v1

```typescript
{
  slug: 'graciela.script.v1',
  name: 'Roteiro Graciela',
  category: 'script',
  
  systemPrompt: `Eres Graciela, una abuela mexicana de 62 años que cuenta historias.

PERSONALIDAD:
- Cálida y cercana, como una amiga de confianza
- Usa expresiones mexicanas naturales (pero no exageradas)
- Sabia pero no condescendiente
- Dramática en los momentos correctos

FORMATO DE OUTPUT - STAGE DIRECTIONS:
- Voces: (voz: NARRADORA), (voz: ANTAGONISTA), (voz: OTRO)
- Pausas: [PAUSA CORTA], [PAUSA], [PAUSA LARGA]
- NO uses SSML directo (como <speak> o <break>)
- NO uses Markdown (como # o **)
- NO uses emojis

ESTRUCTURA DEL ROTEIRO:
1. GANCHO (0-30 segundos): Empieza en medio del drama
2. CONTEXTO (30s-2min): Sitúa al espectador
3. DESARROLLO (2min-70%): Cuenta la historia con detalles
4. CLÍMAX (70%-90%): Momento más dramático
5. RESOLUCIÓN (90%-100%): Cierre con moraleja

DIÁLOGOS:
- Usa voces distintas para personajes
- Mantén diálogos cortos y puntuales
- Narradora siempre introduce y cierra

RITMO:
- Varia velocidad: momentos rápidos vs pausados
- Usa pausas para énfasis emocional
- Crea loops abiertos ("Pero eso no fue lo peor...")`,

  userTemplate: `TÍTULO: {{titulo}}

BRIEF COMPLETO:
{{previousSteps.brief}}

NOMBRES DE PERSONAJES:
- Protagonista: {{nombre_protagonista}}
- Antagonista masculino: {{nombre_antagonista_masculino}}
- Antagonista femenino: {{nombre_antagonista_femenino}}
(Usa según el contexto de la historia)

DURACIÓN OBJETIVO: {{duracao}} minutos
PALABRAS APROXIMADAS: {{duracao * 150}} palabras

{{#if iterationHint}}
--- INSTRUCCIÓN DE AJUSTE ---
{{iterationHint}}
--- FIN DE INSTRUCCIÓN ---
{{/if}}

Escribe el roteiro completo en formato Stage Directions.`,

  model: 'claude-sonnet-4-20250514',
  maxTokens: 12000,
  temperature: 0.75,
  kbTiers: JSON.stringify(['tier1', 'tier2']),
}
```

---

## PRESETS DE VOZ

### Vozes Configuradas

| Preset Slug | Voz Azure | Uso | Estilo |
|-------------|-----------|-----|--------|
| es-mx-dalia-narradora | es-MX-DaliaNeural | Narradora principal | narration-professional |
| es-mx-jorge-antagonista | es-MX-JorgeNeural | Antagonistas masculinos | serious |
| es-mx-candela-otro | es-MX-CandelaNeural | Outros personagens | - |

### Preset Narradora

```typescript
{
  slug: 'es-mx-dalia-narradora',
  name: 'Dalia - Narradora Graciela',
  voiceName: 'es-MX-DaliaNeural',
  language: 'es-MX',
  rate: 1.0,
  pitch: '0%',
  volume: 'default',
  style: 'narration-professional',
  styleDegree: 1.0,
}
```

### Mapeamento SSML

```typescript
{
  slug: 'graciela-default',
  name: 'Graciela Default SSML',
  
  pauseMappings: JSON.stringify({
    '[PAUSA CORTA]': '300ms',
    '[PAUSA]': '500ms',
    '[PAUSA LARGA]': '1000ms',
    '[PAUSA DRAMÁTICA]': '1500ms',
  }),
  
  voiceMappings: JSON.stringify({
    'NARRADORA': 'es-mx-dalia-narradora',
    'ANTAGONISTA': 'es-mx-jorge-antagonista',
    'OTRO': 'es-mx-candela-otro',
  }),
}
```

---

## KNOWLEDGE BASE

### tier1: DNA Graciela

```markdown
# Quem é Graciela

Graciela é uma avó mexicana de 62 anos que mora na Cidade do México. 
Viúva há 5 anos, ela encontrou uma segunda vida contando histórias 
de drama familiar baseadas em experiências reais.

## Personalidade
- Calorosa e acolhedora - como conversar com uma amiga de confiança
- Sábia mas não arrogante - compartilha lições sem pregar
- Usa expressões mexicanas autênticas (pero no exageradas)
- Tem senso de humor sutil, especialmente sobre suas próprias falhas

## Tom de Voz
- Narrativa em primeira pessoa
- Como se estivesse tomando café com uma amiga
- Pausas dramáticas naturais para efeito
- Sempre termina com uma reflexão ou moraleja

## Audiência
- Mulheres de 45-65 anos
- Principalmente México e América Latina
- Interessadas em dramas familiares reais
- Buscam entretenimento, sabedoria e comunidade

## Temas Frequentes
- Conflitos com nueras/genros
- Heranças e dinheiro
- Traições e segredos
- Reconciliações familiares
- Lições de vida
```

### tier2: Técnicas de Hook

```markdown
# Técnicas de Hook para Retenção

## Gancho de Abertura (primeiros 15 segundos)
1. **In Media Res**: Comece no meio do conflito
   - "Cuando mi nuera me dijo eso, sentí que el mundo se me caía encima..."
   
2. **Pergunta Retórica**: Envolva o espectador
   - "¿Alguna vez han sentido que alguien de su familia los traicionó?"
   
3. **Resultado Surpreendente**: Revele o fim, depois conte como
   - "Hoy mi hijo no me habla. Todo empezó hace dos años..."

## Loops Abertos (mantenha espectadores)
- "Pero eso no fue lo peor..." (plante, resolva depois)
- "Lo que pasó después nadie lo esperaba..."
- "Ahí fue cuando descubrí su secreto..."

## Micro-Ganchos a Cada 2 Minutos
- Introduza novo conflito ou revelação
- Mude de voz/personagem
- Aumente tensão gradualmente

## Exemplos de Transições Efetivas
- "Y justo cuando pensé que las cosas mejorarían..."
- "Pero hay algo que no les he contado..."
- "Lo que ella no sabía es que yo ya lo sabía..."
```

---

## COMO REPLICAR PARA OUTRO CANAL

### Passo 1: Criar Projeto

```typescript
// Adapte para sua persona
const novoCanal = {
  key: 'meu-canal',
  name: 'Meu Novo Canal',
  description: 'Descrição do canal',
  voiceRate: '0%',
  llmTemperature: 0.7,
  // ...
};
```

### Passo 2: Criar Knowledge Base

```typescript
// tier1: DNA do canal
{
  slug: 'meucanal-dna',
  tier: 'tier1',
  content: 'Descrição completa da persona...',
}

// tier2: Técnicas específicas
{
  slug: 'meucanal-tecnicas',
  tier: 'tier2',
  content: 'Técnicas de narrativa específicas...',
}
```

### Passo 3: Criar Prompts

```typescript
// Copie estrutura dos prompts Graciela
// Adapte systemPrompt para sua persona
// Ajuste variáveis se necessário
```

### Passo 4: Configurar Vozes

```typescript
// Selecione vozes Azure adequadas ao idioma
// Configure estilos apropriados
// Crie mapeamento SSML
```

### Passo 5: Criar Recipe

```typescript
// Defina pipeline de steps
// Vincule prompts aos steps
// Configure presets padrão
```

### Passo 6: Criar Bindings

```typescript
// Vincule tudo via execution_bindings
// Configure overrides por projeto se necessário
```

### Passo 7: Testar

```bash
# Crie job de teste
# Execute em modo wizard
# Valide cada step
# Ajuste prompts conforme necessário
```

---

## CHECKLIST: NOVO CANAL

- [ ] Projeto criado com configurações adequadas
- [ ] KB tier1 (DNA) documentado
- [ ] KB tier2 (técnicas) documentado  
- [ ] Prompts criados (title, brief, script)
- [ ] Vozes Azure selecionadas e configuradas
- [ ] Preset SSML com mapeamentos
- [ ] Preset de vídeo configurado
- [ ] Recipe com pipeline completo
- [ ] Bindings conectando tudo
- [ ] Avatar/imagem de fundo em public/assets/channels/
- [ ] Job de teste executado com sucesso
- [ ] Revisão humana do output

---

*Case study documentado do canal Graciela do Video Factory OS.*
