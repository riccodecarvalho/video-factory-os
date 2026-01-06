'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardCard } from './BoardCard';
import { type BoardJob } from '../actions';
import { formatColumnForUI, type BoardColumn as BoardColumnType } from '@/lib/engine/job-state-machine';

interface BoardColumnProps {
    id: BoardColumnType;
    jobs: BoardJob[];
    onCardClick?: (jobId: string) => void;
}

const COLUMN_COLORS: Record<BoardColumnType, string> = {
    A_FAZER: 'border-t-blue-500',
    ROTEIRO: 'border-t-yellow-500',
    NARRACAO: 'border-t-orange-500',
    VIDEO: 'border-t-purple-500',
    CONCLUIDO: 'border-t-green-500',
};

export function BoardColumn({ id, jobs, onCardClick }: BoardColumnProps) {
    // Prefix column ID to avoid conflict with sortable card IDs
    const droppableId = `column:${id}`;
    const { setNodeRef, isOver } = useDroppable({ id: droppableId });

    const columnColor = COLUMN_COLORS[id];
    const jobIds = jobs.map(j => j.id);

    return (
        <div
            ref={setNodeRef}
            className={`
        flex flex-col w-72 min-w-[288px] bg-muted/30 rounded-lg border-t-4 ${columnColor}
        ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
        >
            {/* Column Header */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm">{formatColumnForUI(id)}</h2>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                        {jobs.length}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {jobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Arraste cards aqui
                        </div>
                    ) : (
                        jobs.map(job => (
                            <BoardCard
                                key={job.id}
                                job={job}
                                onClick={() => onCardClick?.(job.id)}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
