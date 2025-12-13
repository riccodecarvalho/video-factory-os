/**
 * Video Factory OS - Database Seed
 * 
 * SEED REAL para Graciela:
 * - Prompts (title, brief, script)
 * - Voice presets (narradora, antagonista)
 * - Video preset (VideoToolbox Mac)
 * - SSML preset (pause mappings)
 * - Validators (stage directions)
 * - Recipe completa
 * - Knowledge base (DNA Graciela)
 */

import { getDb, closeDb } from './index';
import {
    projects,
    executionBindings,
    prompts,
    knowledgeBase,
    presetsVoice,
    presetsVideo,
    presetsEffects,
    presetsSsml,
    validators,
    providers,
    recipes,
} from './schema';
import { v4 as uuid } from 'uuid';

async function seed() {
    console.log('🌱 Iniciando seed do Video Factory OS...');
    const db = getDb();
    const now = new Date().toISOString();

    // ============================================
    // 0. PROJECT - Graciela
    // ============================================
    console.log('🎬 Criando projeto Graciela...');
    const gracielaProjectId = uuid();
    await db.insert(projects).values([
        {
            id: gracielaProjectId,
            key: 'graciela',
            name: 'Verdades de Graciela',
            description: 'Canal de storytime em espanhol mexicano com histórias familiares dramáticas',
            isActive: true,
            createdAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 1. PROVIDERS
    // ============================================
    console.log('📦 Criando providers...');
    await db.insert(providers).values([
        {
            id: uuid(),
            slug: 'claude',
            name: 'Claude (Anthropic)',
            type: 'llm',
            defaultModel: 'claude-sonnet-4-20250514',
            config: JSON.stringify({ maxTokens: 8192 }),
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'azure-tts',
            name: 'Azure Speech Services',
            type: 'tts',
            baseUrl: 'https://brazilsouth.tts.speech.microsoft.com',
            config: JSON.stringify({
                outputFormat: 'audio-48khz-192kbitrate-mono-mp3',
                region: 'brazilsouth'
            }),
            isActive: true,
            createdAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 2. VOICE PRESETS (Azure)
    // ============================================
    console.log('🎤 Criando presets de voz...');
    await db.insert(presetsVoice).values([
        {
            id: uuid(),
            slug: 'es-mx-dalia-narradora',
            name: 'Dalia - Narradora (ES-MX)',
            description: 'Voz principal da Graciela, estilo narração profissional',
            voiceName: 'es-MX-DaliaNeural',
            language: 'es-MX',
            rate: 1.0,
            pitch: '0%',
            volume: 'default',
            style: 'narration-professional',
            styleDegree: 1.2,
            role: null,
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'es-mx-jorge-antagonista',
            name: 'Jorge - Antagonista (ES-MX)',
            description: 'Voz masculina para personagens antagonistas',
            voiceName: 'es-MX-JorgeNeural',
            language: 'es-MX',
            rate: 0.95,
            pitch: '-5%',
            volume: 'default',
            style: 'serious',
            styleDegree: 1.0,
            role: null,
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'es-mx-candela-otro',
            name: 'Candela - Outro (ES-MX)',
            description: 'Voz feminina para outros personagens',
            voiceName: 'es-MX-CandelaNeural',
            language: 'es-MX',
            rate: 1.0,
            pitch: '0%',
            volume: 'default',
            style: null,
            styleDegree: 1.0,
            role: null,
            isActive: true,
            createdAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 3. VIDEO PRESETS (FFmpeg)
    // ============================================
    console.log('🎬 Criando presets de vídeo...');
    await db.insert(presetsVideo).values([
        {
            id: uuid(),
            slug: 'mac-videotoolbox-720p',
            name: 'Mac VideoToolbox 720p',
            description: 'Encoder acelerado por hardware no Mac. Recomendado para produção.',
            encoder: 'h264_videotoolbox',
            scale: '1280:720',
            fps: 30,
            bitrate: '4M',
            pixelFormat: 'yuv420p',
            audioCodec: 'aac',
            audioBitrate: '192k',
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'software-libx264-720p',
            name: 'Software libx264 720p',
            description: 'Encoder por software. Fallback quando VideoToolbox não disponível.',
            encoder: 'libx264',
            scale: '1280:720',
            fps: 30,
            bitrate: '4M',
            pixelFormat: 'yuv420p',
            audioCodec: 'aac',
            audioBitrate: '192k',
            isActive: true,
            createdAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 4. EFFECTS PRESETS (FFmpeg filtergraph)
    // ============================================
    console.log('✨ Criando presets de efeitos...');
    await db.insert(presetsEffects).values([
        {
            id: uuid(),
            slug: 'none',
            name: 'Sem efeitos',
            description: 'Render limpo sem filtros adicionais',
            filtergraph: '',
            order: 0,
            enabledByDefault: true,
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'subtle-vignette',
            name: 'Vinheta sutil',
            description: 'Vinheta leve nas bordas',
            filtergraph: "vignette=PI/4",
            order: 1,
            enabledByDefault: false,
            isActive: true,
            createdAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 5. SSML PRESETS (pause + voice mappings)
    // ============================================
    console.log('📝 Criando presets SSML...');
    await db.insert(presetsSsml).values([
        {
            id: uuid(),
            slug: 'graciela-default',
            name: 'Graciela - SSML Default',
            pauseMappings: JSON.stringify({
                '[PAUSA CORTA]': '300ms',
                '[PAUSA]': '500ms',
                '[PAUSA LARGA]': '1000ms',
            }),
            voiceMappings: JSON.stringify({
                'NARRADORA': 'es-mx-dalia-narradora',
                'ANTAGONISTA': 'es-mx-jorge-antagonista',
                'OTRO': 'es-mx-candela-otro',
            }),
            isActive: true,
            createdAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 6. VALIDATORS (regras como dados)
    // ============================================
    console.log('✅ Criando validators...');
    await db.insert(validators).values([
        {
            id: uuid(),
            slug: 'stage-directions-no-ssml',
            name: 'Stage Directions: Sem SSML',
            description: 'Roteiro não pode conter tags SSML',
            type: 'forbidden_patterns',
            config: JSON.stringify({
                patterns: ['<speak', '<voice', '<break', '</voice>', '</speak>'],
            }),
            errorMessage: 'Roteiro contém tags SSML. Use marcadores de Stage Directions.',
            severity: 'error',
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'stage-directions-no-markdown',
            name: 'Stage Directions: Sem Markdown',
            description: 'Roteiro não pode conter formatação Markdown',
            type: 'forbidden_patterns',
            config: JSON.stringify({
                patterns: ['**', '```', '# ', '## ', '### '],
            }),
            errorMessage: 'Roteiro contém Markdown. Use texto puro com Stage Directions.',
            severity: 'error',
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'stage-directions-starts-correctly',
            name: 'Stage Directions: Início correto',
            description: 'Roteiro deve começar com (voz: NARRADORA)',
            type: 'required_patterns',
            config: JSON.stringify({
                patterns: ['^\\(voz:\\s*NARRADORA\\)'],
                flags: 'i',
            }),
            errorMessage: 'Roteiro deve começar com (voz: NARRADORA)',
            severity: 'error',
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'stage-directions-min-words',
            name: 'Stage Directions: Mínimo de palavras',
            description: 'Roteiro deve ter no mínimo 6000 palavras',
            type: 'min_words',
            config: JSON.stringify({
                min: 6000,
            }),
            errorMessage: 'Roteiro muito curto. Mínimo: 6000 palavras.',
            severity: 'error',
            isActive: true,
            createdAt: now,
        },
        {
            id: uuid(),
            slug: 'stage-directions-valid-voices',
            name: 'Stage Directions: Vozes válidas',
            description: 'Marcadores de voz devem ser NARRADORA, ANTAGONISTA ou OTRO',
            type: 'required_patterns',
            config: JSON.stringify({
                checkAllMatches: true,
                matchPattern: '\\(voz:\\s*(\\w+)\\)',
                allowedValues: ['NARRADORA', 'ANTAGONISTA', 'OTRO'],
            }),
            errorMessage: 'Marcador de voz inválido. Use: NARRADORA, ANTAGONISTA ou OTRO.',
            severity: 'error',
            isActive: true,
            createdAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 7. PROMPTS (título, brief, script)
    // ============================================
    console.log('💬 Criando prompts...');
    await db.insert(prompts).values([
        {
            id: uuid(),
            slug: 'graciela.title.v1',
            name: 'Graciela - Gerador de Títulos',
            category: 'title',
            description: 'Gera opções de títulos impactantes para vídeos',
            systemPrompt: `Eres un experto en crear títulos virales para YouTube en español.
Tu objetivo es crear títulos que generen curiosidad y clics.

Reglas:
- Máximo 60 caracteres
- Usar números cuando posible
- Incluir gancho emocional
- Evitar clickbait extremo`,
            userTemplate: `Genera 5 opciones de títulos para un video sobre:

Tema: {{tema}}
Brief: {{brief}}

Formato de respuesta:
1. [título]
2. [título]
3. [título]
4. [título]
5. [título]`,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 500,
            temperature: 0.8,
            kbTiers: JSON.stringify(['tier1']),
            version: 1,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuid(),
            slug: 'graciela.brief.v1',
            name: 'Graciela - Gerador de Brief',
            category: 'brief',
            description: 'Expande uma ideia em um brief estruturado',
            systemPrompt: `Eres un guionista experto en narrativa dramática.
Tu objetivo es expandir una idea en un brief estructurado.`,
            userTemplate: `Expande esta idea en un brief para un video de {{duracao}} minutos:

Título: {{titulo}}
Idea base: {{idea}}

El brief debe incluir:
1. Premisa (1-2 oraciones)
2. Personajes principales
3. Conflicto central
4. Arco emocional
5. Resolución esperada`,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 1000,
            temperature: 0.7,
            kbTiers: JSON.stringify(['tier1']),
            version: 1,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuid(),
            slug: 'graciela.script.v1',
            name: 'Graciela - Gerador de Roteiro',
            category: 'script',
            description: 'Gera roteiro completo em formato Stage Directions',
            systemPrompt: `Eres Graciela, una narradora de historias dramáticas familiares.
Tu voz es cálida pero incisiva. Cuentas historias de herencias, traiciones y reconciliaciones.

REGLAS ABSOLUTAS DE FORMATO:
1. NUNCA uses etiquetas SSML (<speak>, <voice>, <break>, etc.)
2. NUNCA uses Markdown (**, #, \`\`\`, etc.)
3. Usa SOLO el formato "Stage Directions":
   - (voz: NARRADORA) para tu voz principal
   - (voz: ANTAGONISTA) para personajes conflictivos
   - (voz: OTRO) para otros personajes
   - [PAUSA CORTA], [PAUSA], [PAUSA LARGA] para pausas dramáticas

ESTRUCTURA:
- Comienza SIEMPRE con (voz: NARRADORA)
- Hook inicial "in media res" (acción ya en curso)
- Mínimo 6000 palabras
- Arco de 7 actos dramáticos
- Final con reflexión y moraleja`,
            userTemplate: `{{#if knowledge}}
CONTEXTO Y DNA:
{{knowledge}}
---
{{/if}}

Escribe un guion dramático completo sobre:

Título: {{titulo}}
Brief: {{brief}}

Duración objetivo: ~40 minutos (mínimo 6000 palabras)

RECUERDA: 
- Formato Stage Directions ÚNICAMENTE
- Comienza con (voz: NARRADORA)
- NO uses SSML ni Markdown
- Mínimo 6000 palabras`,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 16000,
            temperature: 0.75,
            kbTiers: JSON.stringify(['tier1', 'tier2']),
            version: 1,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 8. KNOWLEDGE BASE (DNA Graciela)
    // ============================================
    console.log('📚 Criando knowledge base...');
    await db.insert(knowledgeBase).values([
        {
            id: uuid(),
            slug: 'graciela-dna-tier1',
            name: 'DNA Graciela - Personalidade',
            tier: 'tier1',
            category: 'dna',
            content: `# Verdades de Graciela - DNA del Canal

## Quién es Graciela
Graciela es una mujer de 55 años, refinada pero accesible. Tiene el don de contar historias familiares con una mezcla de empatía y picardía. Su voz es cálida pero incisiva.

## Temas Centrales
- Herencias y testamentos
- Traiciones familiares
- Secretos revelados
- Reconciliaciones dramáticas
- Lecciones de vida

## Tono
- Narrativo y envolvente
- Dramático sin ser melodramático
- Sabio pero nunca condescendiente
- Ocasionalmente sarcástico

## Audiencia
- Mujeres 35-65 años
- Hispanoamérica (México foco principal)
- Buscan entretenimiento emocional
- Valoran historias con moraleja`,
            recipeSlug: 'graciela-youtube-long',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuid(),
            slug: 'graciela-hooks-tier2',
            name: 'Graciela - Técnicas de Hook',
            tier: 'tier2',
            category: 'rules',
            content: `# Técnicas de Hook - In Media Res

## Regla de Oro
Nunca comiences con exposición. Comienza con acción, conflicto o revelación.

## Ejemplos de Buenos Hooks
✅ "Cuando mi madre leyó el testamento, todos nos quedamos en silencio."
✅ "La última vez que vi a mi hermana fue en el funeral de nuestro padre."
✅ "El abogado me miró y dijo: 'Señora, usted no existe en este documento.'"

## Ejemplos de Malos Hooks
❌ "Esta es la historia de una familia..."
❌ "Hoy les voy a contar sobre..."
❌ "Hace muchos años, en una pequeña ciudad..."

## Estructura del Primer Minuto
1. Acción/Revelación impactante (hook)
2. Pregunta implícita para el espectador
3. Promesa de lo que viene
4. Transición suave a contexto`,
            recipeSlug: 'graciela-youtube-long',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
    ]).onConflictDoNothing();

    // ============================================
    // 9. RECIPE (Graciela YouTube Long)
    // ============================================
    console.log('📖 Criando recipe Graciela...');
    await db.insert(recipes).values([
        {
            id: uuid(),
            slug: 'graciela-youtube-long',
            name: 'Graciela - YouTube 40min',
            description: 'Pipeline completo para vídeos longos do canal Verdades de Graciela',
            pipeline: JSON.stringify([
                {
                    key: 'title',
                    name: 'Gerar Títulos',
                    promptSlug: 'graciela.title.v1',
                    required: true,
                },
                {
                    key: 'brief',
                    name: 'Expandir Brief',
                    promptSlug: 'graciela.brief.v1',
                    required: true,
                },
                {
                    key: 'script',
                    name: 'Gerar Roteiro',
                    promptSlug: 'graciela.script.v1',
                    required: true,
                },
                {
                    key: 'parse_ssml',
                    name: 'Converter para SSML',
                    ssmlPresetSlug: 'graciela-default',
                    required: true,
                },
                {
                    key: 'tts',
                    name: 'Gerar Áudio (TTS)',
                    providerSlug: 'azure-tts',
                    required: true,
                },
                {
                    key: 'render',
                    name: 'Renderizar Vídeo',
                    videoPresetSlug: 'mac-videotoolbox-720p',
                    required: true,
                },
                {
                    key: 'export',
                    name: 'Exportar Pacote',
                    required: true,
                },
            ]),
            defaultVoicePresetSlug: 'es-mx-dalia-narradora',
            defaultVideoPresetSlug: 'mac-videotoolbox-720p',
            validatorsConfig: JSON.stringify({
                script: [
                    'stage-directions-no-ssml',
                    'stage-directions-no-markdown',
                    'stage-directions-starts-correctly',
                    'stage-directions-min-words',
                    'stage-directions-valid-voices',
                ],
            }),
            version: 1,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
    ]).onConflictDoNothing();

    console.log('✅ Seed concluído com sucesso!');
    closeDb();
}

// Run seed
seed().catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
});
