/**
 * Step Key Mapper - Suporte a step keys PT-BR e EN
 * 
 * Permite nomenclatura em português (ideacao, titulo, planejamento)
 * com mapeamento para executores internos.
 */

// Mapeamento de step keys canônicos (PT-BR) para aliases (EN)
const STEP_ALIASES: Record<string, string[]> = {
    'ideacao': ['ideation'],
    'titulo': ['title'],
    'planejamento': ['planning', 'brief'],
    'roteiro': ['script'],
    'miniaturas': ['thumbnails'],
    'descricao': ['description'],
    'tags': ['tags'],
    'comunidade': ['community'],
    'parse_ssml': ['parse_ssml'],
    'tts': ['tts'],
    'renderizacao': ['render'],
    'exportacao': ['export'],
};

// Reverse mapping: aliases → canonical
const ALIAS_TO_CANONICAL: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(STEP_ALIASES)) {
    ALIAS_TO_CANONICAL[canonical] = canonical; // self-reference
    for (const alias of aliases) {
        ALIAS_TO_CANONICAL[alias] = canonical;
    }
}

/**
 * Normaliza step key para forma canônica (PT-BR)
 */
export function normalizeStepKey(key: string): string {
    const lower = key.toLowerCase().trim();
    return ALIAS_TO_CANONICAL[lower] || lower;
}

/**
 * Retorna o tipo de executor para um step key
 */
export function getStepExecutorType(key: string): 'llm' | 'tts' | 'transform' | 'render' | 'export' | 'unknown' {
    const normalized = normalizeStepKey(key);

    const EXECUTOR_MAP: Record<string, 'llm' | 'tts' | 'transform' | 'render' | 'export'> = {
        'ideacao': 'llm',
        'titulo': 'llm',
        'planejamento': 'llm',
        'roteiro': 'llm',
        'miniaturas': 'llm',
        'descricao': 'llm',
        'tags': 'llm',
        'comunidade': 'llm',
        'parse_ssml': 'transform',
        'tts': 'tts',
        'renderizacao': 'render',
        'exportacao': 'export',
    };

    return EXECUTOR_MAP[normalized] || 'unknown';
}

/**
 * Verifica se um step key é válido
 */
export function isValidStepKey(key: string): boolean {
    return normalizeStepKey(key) in STEP_ALIASES || key in ALIAS_TO_CANONICAL;
}

/**
 * Retorna todos os step keys canônicos
 */
export function getAllCanonicalStepKeys(): string[] {
    return Object.keys(STEP_ALIASES);
}

/**
 * Retorna o step key para leitura de previousOutputs
 * Tenta ambas formas (PT-BR e EN) para retrocompatibilidade
 */
export function getPreviousOutputKey(
    previousOutputs: Record<string, unknown>,
    stepKey: string
): unknown {
    const normalized = normalizeStepKey(stepKey);

    // Tenta forma canônica primeiro
    if (previousOutputs[normalized] !== undefined) {
        return previousOutputs[normalized];
    }

    // Tenta aliases
    const aliases = STEP_ALIASES[normalized] || [];
    for (const alias of aliases) {
        if (previousOutputs[alias] !== undefined) {
            return previousOutputs[alias];
        }
    }

    // Tenta step key original
    return previousOutputs[stepKey];
}
