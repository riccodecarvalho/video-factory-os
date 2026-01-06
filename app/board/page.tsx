'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { BoardColumn } from './components/BoardColumn';
import { BoardCard } from './components/BoardCard';
import { BoardTopbar } from './components/BoardTopbar';
import { NewVideoModal } from './components/NewVideoModal';
import {
    type BoardData,
    type BoardJob,
    getJobsBoard,
    moveJobToColumn
} from './actions';
import { type BoardColumn as BoardColumnType } from '@/lib/engine/job-state-machine';
import { useToast } from '@/components/ui/use-toast';

const COLUMNS: BoardColumnType[] = ['A_FAZER', 'ROTEIRO', 'NARRACAO', 'VIDEO', 'CONCLUIDO'];
const POLL_INTERVAL = 3000; // 3 seconds

export default function BoardPage() {
    const [boardData, setBoardData] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeJob, setActiveJob] = useState<BoardJob | null>(null);
    const [showNewVideoModal, setShowNewVideoModal] = useState(false);
    const [autoVideoEnabled, setAutoVideoEnabled] = useState(true);
    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load board data
    const loadBoard = useCallback(async () => {
        try {
            const data = await getJobsBoard();
            setBoardData(data);
            setAutoVideoEnabled(data.autoVideoEnabled);
        } catch (error) {
            console.error('Error loading board:', error);
            toast({
                title: 'Erro ao carregar board',
                description: 'Tente atualizar a página',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Initial load and polling
    useEffect(() => {
        loadBoard();
        const interval = setInterval(loadBoard, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [loadBoard]);

    // Drag handlers
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const job = findJobById(active.id as string);
        setActiveJob(job);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveJob(null);

        if (!over || !boardData) return;

        const jobId = active.id as string;
        const targetColumn = over.id as BoardColumnType;

        // Don't do anything if dropped in same column
        const sourceColumn = findJobColumn(jobId);
        if (sourceColumn === targetColumn) return;

        // Optimistic update
        const job = findJobById(jobId);
        if (!job) return;

        setBoardData(prev => {
            if (!prev) return null;
            const newColumns = { ...prev.columns };

            // Remove from source
            newColumns[sourceColumn] = newColumns[sourceColumn].filter(j => j.id !== jobId);

            // Add to target
            newColumns[targetColumn] = [job, ...newColumns[targetColumn]];

            return { ...prev, columns: newColumns };
        });

        // Call server action
        try {
            const result = await moveJobToColumn(jobId, targetColumn);
            toast({
                title: 'Card movido',
                description: `Novo estado: ${result.newState}`,
            });
            // Refresh to get actual state
            await loadBoard();
        } catch (error) {
            toast({
                title: 'Erro ao mover card',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive',
            });
            // Revert optimistic update
            await loadBoard();
        }
    };

    const findJobById = (id: string): BoardJob | null => {
        if (!boardData) return null;
        for (const jobs of Object.values(boardData.columns)) {
            const job = jobs.find(j => j.id === id);
            if (job) return job;
        }
        return null;
    };

    const findJobColumn = (jobId: string): BoardColumnType => {
        if (!boardData) return 'A_FAZER';
        for (const [column, jobs] of Object.entries(boardData.columns)) {
            if (jobs.some(j => j.id === jobId)) {
                return column as BoardColumnType;
            }
        }
        return 'A_FAZER';
    };

    const handleCardClick = (jobId: string) => {
        // TODO: Open job details drawer
        console.log('Open job details:', jobId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <BoardTopbar
                autoVideoEnabled={autoVideoEnabled}
                onAutoVideoToggle={setAutoVideoEnabled}
                onNewVideo={() => setShowNewVideoModal(true)}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <main className="flex-1 overflow-x-auto p-4">
                    <div className="flex gap-4 h-full min-w-max">
                        {COLUMNS.map(columnId => (
                            <BoardColumn
                                key={columnId}
                                id={columnId}
                                jobs={boardData?.columns[columnId] || []}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                </main>

                <DragOverlay>
                    {activeJob && (
                        <div className="w-72">
                            <BoardCard job={activeJob} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {showNewVideoModal && (
                <NewVideoModal
                    onClose={() => setShowNewVideoModal(false)}
                    onCreated={() => {
                        setShowNewVideoModal(false);
                        loadBoard();
                    }}
                />
            )}
        </div>
    );
}
