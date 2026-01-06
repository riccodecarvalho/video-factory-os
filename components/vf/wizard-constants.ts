
/**
 * Phase definition for the wizard stepper
 */
export interface WizardPhase {
    id: string;
    name: string;
    steps: string[];
    status: "pending" | "active" | "completed";
}

/**
 * Step definition with details
 */
export interface WizardStep {
    key: string;
    status: "pending" | "running" | "success" | "failed" | "skipped";
    name?: string;
}

/**
 * Default phase configuration for Video Factory
 */
export const DEFAULT_WIZARD_PHASES: WizardPhase[] = [
    {
        id: "conceituacao",
        name: "Conceituação",
        steps: ["ideacao", "titulo", "brief"],
        status: "pending",
    },
    {
        id: "planejamento",
        name: "Planejamento",
        steps: ["planejamento", "roteiro"],
        status: "pending",
    },
    {
        id: "visual",
        name: "Visual",
        steps: ["imagens", "thumbnail"],
        status: "pending",
    },
    {
        id: "producao",
        name: "Produção",
        steps: ["ssml", "tts", "render"],
        status: "pending",
    },
    {
        id: "revisao",
        name: "Revisão",
        steps: ["revisao"],
        status: "pending",
    },
    {
        id: "finalizacao",
        name: "Finalização",
        steps: ["export"],
        status: "pending",
    },
];

/**
 * Helper to get phase status based on steps
 */
export function getPhaseStatus(
    phase: WizardPhase,
    steps: WizardStep[]
): "pending" | "active" | "completed" {
    const phaseSteps = steps.filter(s => phase.steps.includes(s.key));

    if (phaseSteps.length === 0) return "pending";

    const allCompleted = phaseSteps.every(s => s.status === "success");
    if (allCompleted) return "completed";

    const hasActiveOrCompleted = phaseSteps.some(
        s => s.status === "running" || s.status === "success"
    );
    if (hasActiveOrCompleted) return "active";

    return "pending";
}

/**
 * Helper to get current phase based on current step
 */
export function getCurrentPhase(
    currentStepKey: string | null,
    phases: WizardPhase[]
): WizardPhase | undefined {
    if (!currentStepKey) return phases[0];

    return phases.find(phase => phase.steps.includes(currentStepKey));
}

/**
 * Step name mapping for display
 */
export const STEP_NAMES: Record<string, string> = {
    ideacao: "Ideação",
    titulo: "Título",
    title: "Título",
    brief: "Brief",
    planejamento: "Planejamento",
    script: "Roteiro",
    roteiro: "Roteiro",
    ssml: "SSML",
    tts: "Narração",
    render: "Renderização",
    imagens: "Imagens",
    thumbnail: "Thumbnail",
    revisao: "Revisão",
    export: "Exportar",
};

/**
 * Helper to extract summary from step output
 */
export function extractStepSummary(output: string, maxLength: number = 150): string {
    if (!output) return "";

    // Try to parse JSON and get content
    try {
        const parsed = JSON.parse(output);
        const content = parsed.content || parsed.texto || parsed.text || parsed.summary || parsed.titulo || "";
        if (content) {
            return content.length > maxLength
                ? content.slice(0, maxLength) + "..."
                : content;
        }
    } catch {
        // Not JSON
    }

    // Clean markdown and truncate
    const cleaned = output
        .replace(/\`\`\`[\s\S]*?\`\`\`/g, "") // Remove code blocks
        .replace(/[#*_\`]/g, "") // Remove markdown
        .replace(/\n+/g, " ") // Newlines to spaces
        .trim();

    return cleaned.length > maxLength
        ? cleaned.slice(0, maxLength) + "..."
        : cleaned;
}
