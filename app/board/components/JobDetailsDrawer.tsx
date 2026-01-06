'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getJobDetails,
    getJobEvents,
    updateJobConfig,
    cancelJob,
    resumeJob,
} from '../actions';
import {
    formatStateForUI,
    isEditableState,
    isRunningState,
    type JobState
} from '@/lib/engine/job-state-machine';
import { TabInformacoes } from './drawer/TabInformacoes';
import { TabOutline } from './drawer/TabOutline';
import { TabImagens } from './drawer/TabImagens';
import { TabRoteiro } from './drawer/TabRoteiro';
import { TabAudios } from './drawer/TabAudios';
import { TabLogs } from './drawer/TabLogs';
import { useToast } from '@/components/ui/use-toast';

interface JobDetailsDrawerProps {
    jobId: string;
    onClose: () => void;
    onJobUpdated: () => void;
}

type DrawerTab = 'informacoes' | 'outline' | 'imagens' | 'roteiro' | 'audios' | 'logs';

const TABS: { id: DrawerTab; label: string }[] = [
    { id: 'informacoes', label: 'Informações' },
    { id: 'outline', label: 'Outline' },
    { id: 'imagens', label: 'Imagens' },
    { id: 'roteiro', label: 'Roteiro' },
    { id: 'audios', label: 'Áudios' },
    { id: 'logs', label: 'Logs' },
];

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

export function JobDetailsDrawer({ jobId, onClose, onJobUpdated }: JobDetailsDrawerProps) {
    const [job, setJob] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DrawerTab>('informacoes');
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();

    // Load job data (derived from DB, not local state)
    const loadJobData = useCallback(async () => {
        try {
            const [jobData, jobEvents] = await Promise.all([
                getJobDetails(jobId),
                getJobEvents(jobId),
            ]);
            setJob(jobData);
            setEvents(jobEvents);
        } catch (error) {
            console.error('Error loading job:', error);
            toast({
                title: 'Erro ao carregar job',
                description: 'Tente novamente',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [jobId, toast]);

    // Initial load and polling
    useEffect(() => {
        loadJobData();

        // Poll while job is running
        const interval = setInterval(() => {
            if (job && isRunningState(job.state)) {
                loadJobData();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [loadJobData, job?.state]);

    // Actions
    const handleCancel = async () => {
        if (!job) return;
        setActionLoading(true);
        try {
            await cancelJob(jobId);
            toast({ title: 'Job cancelado' });
            await loadJobData();
            onJobUpdated();
        } catch (error) {
            toast({
                title: 'Erro ao cancelar',
                description: error instanceof Error ? error.message : 'Erro',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleResume = async () => {
        if (!job) return;
        setActionLoading(true);
        try {
            await resumeJob(jobId);
            toast({ title: 'Job retomado' });
            await loadJobData();
            onJobUpdated();
        } catch (error) {
            toast({
                title: 'Erro ao retomar',
                description: error instanceof Error ? error.message : 'Erro',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfigUpdate = async (config: Record<string, unknown>) => {
        setActionLoading(true);
        try {
            await updateJobConfig(jobId, config);
            toast({ title: 'Configuração salva' });
            await loadJobData();
            onJobUpdated();
        } catch (error) {
            toast({
                title: 'Erro ao salvar',
                description: error instanceof Error ? error.message : 'Erro',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <DrawerContainer onClose={onClose}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                </div>
            </DrawerContainer>
        );
    }

    if (!job) {
        return (
            <DrawerContainer onClose={onClose}>
                <div className="p-6 text-center text-muted-foreground">
                    Job não encontrado
                </div>
            </DrawerContainer>
        );
    }

    const state = (job.state || 'DRAFT') as JobState;
    const isEditable = isEditableState(state);
    const isRunning = isRunningState(state);
    const stateColor = STATE_COLORS[state] || 'bg-gray-500';

    // Parse title from input
    let title = 'Sem título';
    try {
        const input = JSON.parse(job.input);
        title = input.title || 'Sem título';
    } catch {
        title = job.input?.substring(0, 50) || 'Sem título';
    }

    return (
        <DrawerContainer onClose={onClose}>
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">
                        #{job.id.substring(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${stateColor}`}>
                        {formatStateForUI(state)}
                    </span>
                </div>
                <h2 className="font-semibold text-lg">{title}</h2>

                {/* Progress (when running) */}
                {isRunning && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{job.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${stateColor}`}
                                style={{ width: `${job.progress || 0}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    {isRunning && (
                        <button
                            onClick={handleCancel}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-xs border border-red-500 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950"
                        >
                            Cancelar
                        </button>
                    )}
                    {state === 'CANCELLED' && (
                        <button
                            onClick={handleResume}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-xs border border-green-500 text-green-500 rounded hover:bg-green-50 dark:hover:bg-green-950"
                        >
                            Retomar
                        </button>
                    )}
                    {state === 'FAILED' && (
                        <button
                            onClick={handleResume}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-50 dark:hover:bg-yellow-950"
                        >
                            Tentar Novamente
                        </button>
                    )}
                    {state === 'DONE' && (
                        <button
                            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded"
                        >
                            ⬇ Download
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              px-4 py-2 text-sm whitespace-nowrap transition-colors
              ${activeTab === tab.id
                                ? 'border-b-2 border-primary text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'informacoes' && (
                    <TabInformacoes
                        job={job}
                        isEditable={isEditable}
                        onUpdate={handleConfigUpdate}
                        loading={actionLoading}
                    />
                )}
                {activeTab === 'outline' && (
                    <TabOutline jobId={jobId} />
                )}
                {activeTab === 'imagens' && (
                    <TabImagens jobId={jobId} isEditable={isEditable} />
                )}
                {activeTab === 'roteiro' && (
                    <TabRoteiro jobId={jobId} />
                )}
                {activeTab === 'audios' && (
                    <TabAudios jobId={jobId} />
                )}
                {activeTab === 'logs' && (
                    <TabLogs events={events} />
                )}
            </div>
        </DrawerContainer>
    );
}

// ============================================================================
// Drawer Container
// ============================================================================

function DrawerContainer({
    children,
    onClose
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-xl z-50 flex flex-col animate-in slide-in-from-right">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
                >
                    ✕
                </button>

                {children}
            </div>
        </>
    );
}
