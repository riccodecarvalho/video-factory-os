'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type BoardJob } from '../actions';
import { formatStateForUI, isRunningState, type JobState } from '@/lib/engine/job-state-machine';

interface BoardCardProps {
    job: BoardJob;
    onClick?: () => void;
}

const LANGUAGE_FLAGS: Record<string, string> = {
    'pt-BR': '🇧🇷',
    'es-ES': '🇪🇸',
    'en-US': '🇺🇸',
};

const STATE_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    READY: 'bg-blue-500',
    SCRIPTING: 'bg-yellow-500',
    SCRIPT_DONE: 'bg-green-500',
    TTS_RUNNING: 'bg-yellow-500',
    TTS_DONE: 'bg-green-500',
    RENDER_READY: 'bg-purple-500',
    RENDER_RUNNING: 'bg-purple-500',
    DONE: 'bg-green-600',
    FAILED: 'bg-red-500',
    CANCELLED: 'bg-gray-400',
};

export function BoardCard({ job, onClick }: BoardCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isRunning = isRunningState(job.state);
    const stateColor = STATE_COLORS[job.state] || 'bg-gray-500';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`
        bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing
        shadow-sm hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary' : ''}
      `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">
                    #{job.id.substring(0, 8)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${stateColor}`}>
                    {formatStateForUI(job.state)}
                </span>
            </div>

            {/* Title */}
            <h3 className="font-medium text-sm mb-2 line-clamp-2">
                {job.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{LANGUAGE_FLAGS[job.language] || '🌐'} {job.language}</span>
                <span>•</span>
                <span>{job.storyType}</span>
            </div>

            {/* Progress bar (when running) */}
            {isRunning && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{job.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${stateColor}`}
                            style={{ width: `${job.progress}%` }}
                        />
                    </div>
                    {job.etaSeconds !== null && job.etaSeconds > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                            ETA: {formatEta(job.etaSeconds)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function formatEta(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
