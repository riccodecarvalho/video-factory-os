'use client';

interface TabLogsProps {
    events: Array<{
        id: string;
        eventType: string;
        stepKey?: string | null;
        payload?: string | null;
        createdAt: string;
    }>;
}

const EVENT_ICONS: Record<string, string> = {
    step_started: '▶️',
    step_progress: '📊',
    step_completed: '✅',
    step_failed: '❌',
    artifact_written: '📄',
    job_completed: '🎉',
    auto_transition: '➡️',
};

const EVENT_COLORS: Record<string, string> = {
    step_started: 'text-blue-500',
    step_progress: 'text-yellow-500',
    step_completed: 'text-green-500',
    step_failed: 'text-red-500',
    artifact_written: 'text-purple-500',
    job_completed: 'text-green-600',
    auto_transition: 'text-gray-500',
};

export function TabLogs({ events }: TabLogsProps) {
    if (events.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-muted-foreground text-sm">
                    Logs aparecerão aqui durante a execução
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="space-y-2">
                {events.map((event) => {
                    const icon = EVENT_ICONS[event.eventType] || '📌';
                    const color = EVENT_COLORS[event.eventType] || 'text-muted-foreground';

                    let details: Record<string, unknown> = {};
                    if (event.payload) {
                        try {
                            details = JSON.parse(event.payload);
                        } catch {
                            // Ignore parse errors
                        }
                    }

                    return (
                        <div
                            key={event.id}
                            className="flex gap-3 text-sm"
                        >
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                                <span className={color}>{icon}</span>
                                <div className="flex-1 w-px bg-border" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium ${color}`}>
                                        {formatEventType(event.eventType)}
                                    </span>
                                    {event.stepKey && (
                                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                            {event.stepKey}
                                        </span>
                                    )}
                                </div>

                                {/* Payload details */}
                                {Object.keys(details).length > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        {typeof details.percent === 'number' && (
                                            <div>Progresso: {details.percent}%</div>
                                        )}
                                        {typeof details.message === 'string' && (
                                            <div>{details.message}</div>
                                        )}
                                        {typeof details.reason === 'string' && (
                                            <div>Motivo: {details.reason}</div>
                                        )}
                                        {typeof details.fromState === 'string' && typeof details.toState === 'string' && (
                                            <div>{details.fromState} → {details.toState}</div>
                                        )}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className="text-xs text-muted-foreground mt-1">
                                    {formatTime(event.createdAt)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function formatEventType(type: string): string {
    const labels: Record<string, string> = {
        step_started: 'Step Iniciado',
        step_progress: 'Progresso',
        step_completed: 'Step Concluído',
        step_failed: 'Falha',
        artifact_written: 'Arquivo Gerado',
        job_completed: 'Job Concluído',
        auto_transition: 'Transição',
    };
    return labels[type] || type;
}

function formatTime(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return dateStr;
    }
}
