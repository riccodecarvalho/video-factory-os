/**
 * DarkFlow Job State Machine
 * 
 * Gerencia estados, transições e mapeamento de colunas do Kanban Board.
 * @see implementation_plan.md §1, §28, §35
 */

// ============================================================================
// Types
// ============================================================================

export type JobState =
    | 'DRAFT'           // Criado mas não configurado
    | 'READY'           // Configurado, aguardando arrastar
    | 'SCRIPTING'       // Executando steps de roteiro
    | 'SCRIPT_DONE'     // Roteiro pronto
    | 'TTS_RUNNING'     // Gerando narração
    | 'TTS_DONE'        // Narração pronta
    | 'RENDER_READY'    // Aguardando render (Auto OFF)
    | 'RENDER_RUNNING'  // Renderizando
    | 'DONE'            // Vídeo pronto, download disponível
    | 'FAILED'          // Erro em algum step
    | 'CANCELLED';      // Cancelado pelo usuário

export type BoardColumn =
    | 'A_FAZER'      // Vídeos a Fazer
    | 'ROTEIRO'      // Gerar Roteiro
    | 'NARRACAO'     // Gerar Narração
    | 'VIDEO'        // Gerar Vídeo
    | 'CONCLUIDO';   // Concluído

export interface Transition {
    from: JobState;
    to: JobState;
    trigger: 'user_action' | 'step_complete' | 'auto_advance' | 'error' | 'cancel';
}

export interface ExecutionResult {
    status: 'completed' | 'failed' | 'cancelled' | 'locked';
    lastStep?: string;
    step?: string;
    error?: unknown;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Estados que pertencem a cada coluna do board
 */
export const COLUMN_STATES: Record<BoardColumn, JobState[]> = {
    A_FAZER: ['DRAFT', 'READY'],
    ROTEIRO: ['SCRIPTING', 'SCRIPT_DONE'],
    NARRACAO: ['TTS_RUNNING', 'TTS_DONE'],
    VIDEO: ['RENDER_READY', 'RENDER_RUNNING'],
    CONCLUIDO: ['DONE'],
};

/**
 * Estados que aparecem como badge no card (não em coluna)
 */
export const BADGE_STATES: JobState[] = ['FAILED', 'CANCELLED'];

/**
 * Transições permitidas na state machine
 */
export const ALLOWED_TRANSITIONS: Transition[] = [
    // Fluxo normal
    { from: 'DRAFT', to: 'READY', trigger: 'user_action' },
    { from: 'READY', to: 'SCRIPTING', trigger: 'user_action' },
    { from: 'SCRIPTING', to: 'SCRIPT_DONE', trigger: 'step_complete' },
    { from: 'SCRIPT_DONE', to: 'TTS_RUNNING', trigger: 'user_action' },
    { from: 'SCRIPT_DONE', to: 'TTS_RUNNING', trigger: 'auto_advance' },
    { from: 'TTS_RUNNING', to: 'TTS_DONE', trigger: 'step_complete' },
    { from: 'TTS_DONE', to: 'RENDER_READY', trigger: 'step_complete' },
    { from: 'TTS_DONE', to: 'RENDER_RUNNING', trigger: 'auto_advance' },
    { from: 'RENDER_READY', to: 'RENDER_RUNNING', trigger: 'user_action' },
    { from: 'RENDER_RUNNING', to: 'DONE', trigger: 'step_complete' },

    // Erros e cancelamento
    { from: 'SCRIPTING', to: 'FAILED', trigger: 'error' },
    { from: 'TTS_RUNNING', to: 'FAILED', trigger: 'error' },
    { from: 'RENDER_RUNNING', to: 'FAILED', trigger: 'error' },
    { from: 'SCRIPTING', to: 'CANCELLED', trigger: 'cancel' },
    { from: 'TTS_RUNNING', to: 'CANCELLED', trigger: 'cancel' },
    { from: 'RENDER_RUNNING', to: 'CANCELLED', trigger: 'cancel' },

    // Recovery
    { from: 'FAILED', to: 'SCRIPTING', trigger: 'user_action' },
    { from: 'FAILED', to: 'TTS_RUNNING', trigger: 'user_action' },
    { from: 'FAILED', to: 'RENDER_RUNNING', trigger: 'user_action' },
    { from: 'CANCELLED', to: 'SCRIPTING', trigger: 'user_action' },
    { from: 'CANCELLED', to: 'TTS_RUNNING', trigger: 'user_action' },
    { from: 'CANCELLED', to: 'RENDER_RUNNING', trigger: 'user_action' },
];

/**
 * Mapeamento de coluna para step target do recipe
 */
export const COLUMN_TARGET_STEP: Record<BoardColumn, string> = {
    A_FAZER: '',           // Não executa nada
    ROTEIRO: 'roteiro',    // Executa até roteiro
    NARRACAO: 'tts',       // Executa até tts
    VIDEO: 'export',       // Executa até export
    CONCLUIDO: '',         // Não pode arrastar para cá
};

// ============================================================================
// Functions
// ============================================================================

/**
 * Deriva a coluna do board a partir do estado do job
 */
export function getColumnForState(state: JobState): BoardColumn {
    for (const [column, states] of Object.entries(COLUMN_STATES)) {
        if (states.includes(state)) {
            return column as BoardColumn;
        }
    }
    // Estados FAILED e CANCELLED mantém na coluna anterior (exibido como badge)
    return 'A_FAZER';
}

/**
 * Verifica se uma transição é permitida
 */
export function canTransition(from: JobState, to: JobState): boolean {
    return ALLOWED_TRANSITIONS.some(t => t.from === from && t.to === to);
}

/**
 * Verifica se o job pode ser arrastado para uma coluna
 */
export function canMoveToColumn(currentState: JobState, targetColumn: BoardColumn): boolean {
    const currentColumn = getColumnForState(currentState);

    // Não pode arrastar para trás
    const columnOrder: BoardColumn[] = ['A_FAZER', 'ROTEIRO', 'NARRACAO', 'VIDEO', 'CONCLUIDO'];
    const currentIndex = columnOrder.indexOf(currentColumn);
    const targetIndex = columnOrder.indexOf(targetColumn);

    if (targetIndex <= currentIndex) {
        return false;
    }

    // Não pode pular colunas
    if (targetIndex > currentIndex + 1) {
        return false;
    }

    // Não pode arrastar para CONCLUIDO (só via pipeline)
    if (targetColumn === 'CONCLUIDO') {
        return false;
    }

    // Não pode arrastar se estiver em execução
    if (currentState.endsWith('_RUNNING')) {
        return false;
    }

    return true;
}

/**
 * Obtém o step target para uma coluna
 */
export function getTargetStepForColumn(column: BoardColumn): string {
    return COLUMN_TARGET_STEP[column];
}

/**
 * Verifica se o estado indica execução em andamento
 */
export function isRunningState(state: JobState): boolean {
    return state.endsWith('_RUNNING') || state === 'SCRIPTING';
}

/**
 * Verifica se o job permite edição de configurações
 */
export function isEditableState(state: JobState): boolean {
    const editableStates: JobState[] = [
        'DRAFT',
        'READY',
        'SCRIPT_DONE',
        'TTS_DONE',
        'RENDER_READY',
    ];
    return editableStates.includes(state);
}

/**
 * Obtém o próximo estado após step completar
 */
export function getNextState(
    currentState: JobState,
    autoVideoEnabled: boolean
): JobState | null {
    switch (currentState) {
        case 'SCRIPTING':
            return 'SCRIPT_DONE';
        case 'SCRIPT_DONE':
            return 'TTS_RUNNING';
        case 'TTS_RUNNING':
            return 'TTS_DONE';
        case 'TTS_DONE':
            return autoVideoEnabled ? 'RENDER_RUNNING' : 'RENDER_READY';
        case 'RENDER_RUNNING':
            return 'DONE';
        default:
            return null;
    }
}

/**
 * Obtém o estado anterior para retry
 */
export function getRetryState(failedStep: string): JobState {
    const stepToState: Record<string, JobState> = {
        ideacao: 'SCRIPTING',
        titulo: 'SCRIPTING',
        brief: 'SCRIPTING',
        planejamento: 'SCRIPTING',
        roteiro: 'SCRIPTING',
        prompts_cenas: 'TTS_RUNNING',
        gerar_imagens: 'TTS_RUNNING',
        tts: 'TTS_RUNNING',
        render: 'RENDER_RUNNING',
        export: 'RENDER_RUNNING',
    };
    return stepToState[failedStep] || 'READY';
}

/**
 * Formata estado para exibição no UI
 */
export function formatStateForUI(state: JobState): string {
    const labels: Record<JobState, string> = {
        DRAFT: 'Rascunho',
        READY: 'Pronto',
        SCRIPTING: 'Gerando roteiro...',
        SCRIPT_DONE: 'Roteiro pronto',
        TTS_RUNNING: 'Gerando narração...',
        TTS_DONE: 'Narração pronta',
        RENDER_READY: 'Aguardando render',
        RENDER_RUNNING: 'Renderizando...',
        DONE: 'Concluído',
        FAILED: 'Erro',
        CANCELLED: 'Cancelado',
    };
    return labels[state];
}

/**
 * Formata coluna para exibição no UI
 */
export function formatColumnForUI(column: BoardColumn): string {
    const labels: Record<BoardColumn, string> = {
        A_FAZER: 'Vídeos a Fazer',
        ROTEIRO: 'Gerar Roteiro',
        NARRACAO: 'Gerar Narração',
        VIDEO: 'Gerar Vídeo',
        CONCLUIDO: 'Concluído',
    };
    return labels[column];
}
