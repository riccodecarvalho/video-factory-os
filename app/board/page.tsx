'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
import { JobDetailsDrawer } from './components/JobDetailsDrawer';
import {
    type BoardData,
    type BoardJob,
    getJobsBoard,
    moveJobToColumn
} from './actions';
import {
    type BoardColumn as BoardColumnType,
    canMoveToColumn,
    isRunningState,
} from '@/lib/engine/job-state-machine';
import { useToast } from '@/components/ui/use-toast';

const COLUMNS: BoardColumnType[] = ['A_FAZER', 'ROTEIRO', 'NARRACAO', 'VIDEO', 'CONCLUIDO'];

// Polling intervals conforme o plano
const POLL_INTERVALS = {
    idle: 5000,        // jobs parados
    running: 1000,     // job executando
};

export default function BoardPage() {
    const [boardData, setBoardData] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeJob, setActiveJob] = useState<BoardJob | null>(null);
    const [showNewVideoModal, setShowNewVideoModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [autoVideoEnabled, setAutoVideoEnabled] = useState(true);
    const [movingJobId, setMovingJobId] = useState<string | null>(null);
    const { toast } = useToast();
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // Check if any job is running
    const hasRunningJob = useCallback((): boolean => {
        if (!boardData) return false;
        for (const jobs of Object.values(boardData.columns)) {
            if (jobs.some(j => isRunningState(j.state))) {
                return true;
            }
        }
        return false;
    }, [boardData]);

    // Adaptive polling based on state
    useEffect(() => {
        loadBoard();

        const scheduleNextPoll = () => {
            if (pollIntervalRef.current) {
                clearTimeout(pollIntervalRef.current);
            }

            const interval = hasRunningJob() ? POLL_INTERVALS.running : POLL_INTERVALS.idle;
            pollIntervalRef.current = setTimeout(() => {
                loadBoard().then(() => {
                    scheduleNextPoll();
                });
            }, interval);
        };

        scheduleNextPoll();

        return () => {
            if (pollIntervalRef.current) {
                clearTimeout(pollIntervalRef.current);
            }
        };
    }, [loadBoard, hasRunningJob]);

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

        // Find job and source column
        const job = findJobById(jobId);
        if (!job) return;

        const sourceColumn = findJobColumn(jobId);

        // Don't do anything if dropped in same column
        if (sourceColumn === targetColumn) return;

        // ============================================================
        // VALIDAÇÃO DE DRAG (conforme state machine)
        // ============================================================

        // Validar usando a state machine
        if (!canMoveToColumn(job.state, targetColumn)) {
            let message = 'Movimento não permitido';

            // Mensagens específicas
            if (targetColumn === 'CONCLUIDO') {
                message = 'Não é possível mover diretamente para Concluído';
            } else if (isRunningState(job.state)) {
                message = 'Aguarde a execução terminar ou cancele o job';
            } else {
                // Verificar se está tentando pular ou voltar
                const columnOrder = COLUMNS;
                const sourceIdx = columnOrder.indexOf(sourceColumn);
                const targetIdx = columnOrder.indexOf(targetColumn);

                if (targetIdx < sourceIdx) {
                    message = 'Não é possível voltar para colunas anteriores';
                } else if (targetIdx > sourceIdx + 1) {
                    message = 'Não é possível pular colunas';
                }
            }

            toast({
                title: 'Movimento bloqueado',
                description: message,
                variant: 'destructive',
            });
            return;
        }

        // ============================================================
        // EXECUTAR VIA executeUntil (não update direto)
        // ============================================================

        // Mostrar loading no card
        setMovingJobId(jobId);

        try {
            // Chama moveJobToColumn que internamente chama executeUntil
            const result = await moveJobToColumn(jobId, targetColumn);

            toast({
                title: 'Execução iniciada',
                description: `Job movido para ${result.newState}`,
            });

            // IMPORTANTE: Não fazer optimistic update!
            // O board vai ser atualizado pelo polling que já está configurado
            // para rodar a cada 1s quando tem job running

        } catch (error) {
            toast({
                title: 'Erro ao mover card',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive',
            });
        } finally {
            setMovingJobId(null);
            // Força refresh imediato para pegar o novo estado
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
        setSelectedJobId(jobId);
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
                                jobs={(boardData?.columns[columnId] || []).map(job => ({
                                    ...job,
                                    // Adiciona indicador de loading se este job está sendo movido
                                    isMoving: job.id === movingJobId,
                                }))}
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

            {selectedJobId && (
                <JobDetailsDrawer
                    jobId={selectedJobId}
                    onClose={() => setSelectedJobId(null)}
                    onJobUpdated={loadBoard}
                />
            )}
        </div>
    );
}
