"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useTransition, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/Sidebar";
import {
    PageHeader,
    SectionCards,
    SplitView,
    SplitViewListItem,
    SplitViewDetail,
    SplitViewDetailEmpty,
    FiltersBar,
    EmptyState,
} from "@/components/layout";
import { PipelineView, LogsViewer, ManifestViewer, JobConfigTab, JobArtifactsTab } from "@/components/vf";
import {
    Plus,
    Play,
    Pause,
    RotateCcw,
    XCircle,
    Loader2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Circle,
} from "lucide-react";
import {
    getJobs,
    getJobStatusCounts,
    getJobById,
    getJobSteps,
    startJob,
    retryStep,
    cancelJob,
} from "./actions";
import { getProjects } from "@/app/admin/actions";

type Job = Awaited<ReturnType<typeof getJobs>>[0];
type JobStep = Awaited<ReturnType<typeof getJobSteps>>[0];
type Project = Awaited<ReturnType<typeof getProjects>>[0];

const statusIcons: Record<string, typeof Circle> = {
    pending: Clock,
    running: Loader2,
    completed: CheckCircle2,
    failed: AlertCircle,
    cancelled: XCircle,
};

const statusColors: Record<string, string> = {
    pending: "text-muted-foreground",
    running: "text-status-running",
    completed: "text-status-success",
    failed: "text-status-error",
    cancelled: "text-muted-foreground",
};

function formatTime(iso: string | null): string {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function JobsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedId = searchParams.get("id");

    const [jobs, setJobs] = useState<Job[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();

    // Selected job state
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobSteps, setJobSteps] = useState<JobStep[]>([]);
    const [jobLogs, setJobLogs] = useState<Array<{ timestamp: string; level: string; message: string; stepKey?: string }>>([]);

    // Project filter
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("projectId") || "all");

    // Load projects once
    useEffect(() => {
        startTransition(async () => {
            const projectsData = await getProjects();
            setProjects(projectsData.filter(p => p.isActive));
        });
    }, []);

    // Load jobs list
    const loadJobs = useCallback(() => {
        startTransition(async () => {
            const [jobsData, countsData] = await Promise.all([
                getJobs(selectedStatus, searchValue, selectedProjectId),
                getJobStatusCounts(),
            ]);
            setJobs(jobsData);
            setCounts(countsData);
        });
    }, [selectedStatus, searchValue, selectedProjectId]);

    // Load selected job details
    const loadJobDetails = useCallback(async (jobId: string) => {
        const [job, steps] = await Promise.all([
            getJobById(jobId),
            getJobSteps(jobId),
        ]);
        setSelectedJob(job);
        setJobSteps(steps);

        // Aggregate logs from steps
        const allLogs: Array<{ timestamp: string; level: string; message: string; stepKey?: string }> = [];
        steps.forEach(step => {
            if (step.logs) {
                try {
                    const stepLogs = JSON.parse(step.logs);
                    allLogs.push(...stepLogs);
                } catch { }
            }
        });
        allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setJobLogs(allLogs);
    }, []);

    // Initial load
    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    // Load selected job
    useEffect(() => {
        if (selectedId) {
            loadJobDetails(selectedId);
        } else {
            setSelectedJob(null);
            setJobSteps([]);
            setJobLogs([]);
        }
    }, [selectedId, loadJobDetails]);

    // Polling for running jobs
    useEffect(() => {
        if (!selectedJob || selectedJob.status !== "running") return;

        const interval = setInterval(() => {
            if (selectedId) {
                loadJobDetails(selectedId);
            }
            loadJobs();
        }, 2000);

        return () => clearInterval(interval);
    }, [selectedJob?.status, selectedId, loadJobDetails, loadJobs]);

    const handleSelectJob = (job: Job) => {
        router.push(`/jobs?id=${job.id}`);
    };

    const handleStartJob = async () => {
        if (!selectedJob) return;
        await startJob(selectedJob.id);
        loadJobDetails(selectedJob.id);
        loadJobs();
    };

    const handleRetryStep = async (stepKey: string) => {
        if (!selectedJob) return;
        await retryStep(selectedJob.id, stepKey);
        loadJobDetails(selectedJob.id);
        loadJobs();
    };

    const handleCancelJob = async () => {
        if (!selectedJob) return;
        await cancelJob(selectedJob.id);
        loadJobDetails(selectedJob.id);
        loadJobs();
    };

    // Build status cards
    const statusCards = [
        { id: "all", label: "Todos", count: counts.all || 0, icon: Circle },
        { id: "running", label: "Em Execução", count: counts.running || 0, icon: Loader2 },
        { id: "completed", label: "Concluídos", count: counts.completed || 0, icon: CheckCircle2 },
        { id: "failed", label: "Falhas", count: counts.failed || 0, icon: AlertCircle },
        { id: "pending", label: "Pendentes", count: counts.pending || 0, icon: Clock },
    ];

    // Parse job input for display
    const getJobTitle = (job: Job): string => {
        try {
            const input = JSON.parse(job.input || "{}");
            return input.title || input.tema || `Job ${job.id.slice(0, 8)}`;
        } catch {
            return `Job ${job.id.slice(0, 8)}`;
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Produção" }]}
                    title="Produção"
                    description="Gerenciamento de jobs de vídeo"
                    actions={
                        <Button size="sm" className="gap-2" onClick={() => router.push("/jobs/new")}>
                            <Plus className="w-4 h-4" />
                            Nova Produção
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <SectionCards
                        cards={statusCards}
                        activeId={selectedStatus}
                        onSelect={setSelectedStatus}
                        className="mb-6"
                    />

                    <div className="flex gap-4 mb-4">
                        <Select
                            value={selectedProjectId}
                            onValueChange={(value) => {
                                setSelectedProjectId(value);
                                const params = new URLSearchParams(window.location.search);
                                if (value === "all") {
                                    params.delete("projectId");
                                } else {
                                    params.set("projectId", value);
                                }
                                router.push(`/jobs?${params.toString()}`);
                            }}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Todos os Projetos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Projetos</SelectItem>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex-1">
                            <FiltersBar
                                searchValue={searchValue}
                                onSearchChange={setSearchValue}
                                searchPlaceholder="Buscar jobs..."
                            />
                        </div>
                    </div>

                    <SplitView
                        isLoading={isPending && jobs.length === 0}
                        isEmpty={jobs.length === 0}
                        emptyState={
                            <EmptyState
                                variant="empty"
                                title="Nenhum job encontrado"
                                description="Crie uma nova produção para começar"
                                action={{ label: "Nova Produção", onClick: () => router.push("/jobs/new") }}
                            />
                        }
                        list={
                            <div>
                                {jobs.map((job) => {
                                    const Icon = statusIcons[job.status] || Circle;
                                    return (
                                        <SplitViewListItem
                                            key={job.id}
                                            title={getJobTitle(job)}
                                            subtitle={job.recipeSlug}
                                            meta={formatTime(job.createdAt)}
                                            isActive={selectedJob?.id === job.id}
                                            onClick={() => handleSelectJob(job)}
                                        />
                                    );
                                })}
                            </div>
                        }
                        detail={
                            selectedJob ? (
                                <SplitViewDetail>
                                    {/* Job Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-semibold">{getJobTitle(selectedJob)}</h2>
                                                <Badge
                                                    className={
                                                        selectedJob.status === "completed"
                                                            ? "bg-status-success/10 text-status-success"
                                                            : selectedJob.status === "running"
                                                                ? "bg-status-running/10 text-status-running"
                                                                : selectedJob.status === "failed"
                                                                    ? "bg-status-error/10 text-status-error"
                                                                    : "bg-muted"
                                                    }
                                                >
                                                    {selectedJob.status}
                                                </Badge>
                                                {selectedJob.progress !== undefined && selectedJob.progress !== null && selectedJob.progress > 0 && (
                                                    <span className="text-sm text-muted-foreground">{selectedJob.progress}%</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Recipe: {selectedJob.recipeSlug} v{selectedJob.recipeVersion}
                                            </p>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-2">
                                            {(selectedJob.status === "pending" || selectedJob.status === "failed") && (
                                                <Button size="sm" className="gap-2" onClick={handleStartJob}>
                                                    <Play className="w-4 h-4" />
                                                    {selectedJob.status === "failed" ? "Retry" : "Run"}
                                                </Button>
                                            )}
                                            {selectedJob.status === "running" && (
                                                <Button size="sm" variant="destructive" className="gap-2" onClick={handleCancelJob}>
                                                    <XCircle className="w-4 h-4" />
                                                    Cancelar
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <Tabs defaultValue="pipeline" className="space-y-4">
                                        <TabsList>
                                            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                                            <TabsTrigger value="config">Config</TabsTrigger>
                                            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
                                            <TabsTrigger value="logs">Logs</TabsTrigger>
                                            <TabsTrigger value="manifest">Manifest</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="pipeline">
                                            <PipelineView
                                                steps={jobSteps as any}
                                                currentStep={selectedJob.currentStep}
                                                onRetry={handleRetryStep}
                                            />
                                        </TabsContent>

                                        <TabsContent value="config">
                                            <JobConfigTab
                                                manifest={selectedJob.manifest ? JSON.parse(selectedJob.manifest) : null}
                                            />
                                        </TabsContent>

                                        <TabsContent value="artifacts">
                                            <JobArtifactsTab
                                                manifest={selectedJob.manifest ? JSON.parse(selectedJob.manifest) : null}
                                                jobId={selectedJob.id}
                                            />
                                        </TabsContent>

                                        <TabsContent value="logs">
                                            <LogsViewer logs={jobLogs as any} />
                                        </TabsContent>

                                        <TabsContent value="manifest">
                                            <ManifestViewer
                                                manifest={selectedJob.manifest ? JSON.parse(selectedJob.manifest) : null}
                                            />
                                        </TabsContent>
                                    </Tabs>

                                    {/* Error display */}
                                    {selectedJob.lastError && (
                                        <div className="mt-4 p-3 bg-status-error/10 border border-status-error/30 rounded-lg">
                                            <p className="text-sm text-status-error font-medium">Erro:</p>
                                            <p className="text-sm text-status-error">{selectedJob.lastError}</p>
                                        </div>
                                    )}
                                </SplitViewDetail>
                            ) : (
                                <SplitViewDetailEmpty />
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
            <JobsPageContent />
        </Suspense>
    );
}
