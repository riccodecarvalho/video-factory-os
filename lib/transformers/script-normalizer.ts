export function normalizeScriptToSingleVoice(script: string): string {
    if (!script) return "";

    const clean = script
        // Remove padrões [PAUSA], [CORTA], etc
        .replace(/\[PAUSA[^\]]*\]/gi, "")
        // Remove tags de voz (voz: NARRADROA), (voz: XIMENA) e espaços subsequentes
        .replace(/\(voz:\s*[^)]+\)\s*/gi, "")
        // Remove Markdown headers que o modelo as vezes coloca
        .replace(/^#+\s+/gm, "")
        // Remove asteriscos de bold/italic
        .replace(/\*+/g, "")
        // Remove linhas vazias excessivas
        .replace(/\n{3,}/g, "\n\n");

    // TODO: Se precisarmos de rewrite com LLM (discurso indireto), 
    // isso seria um step separado do pipeline, não apenas uma regex.
    // Por enquanto, a remoção de tags força "tudo ser lido pela voz ativa".

    return clean.trim();
}
