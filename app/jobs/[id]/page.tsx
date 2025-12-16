import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PipelineView,
    StatusBadge,
    MetricCard,
} from "@/components/vf";
import { ArrowLeft, Clock, Hash, FileText, Play, RotateCcw, XCircle, RefreshCw } from "lucide-react";
import { getJobById, getJobSteps, getJobArtifacts, resumeJob, cancelJob, startJob } from "@/app/jobs/actions";
import { notFound } from "next/navigation";

/**
 * Job Detail - "Inspection Deck"
 * 
 * Mostra: pipeline com dados reais, logs, previews, metadata
 */

// Função para formatar duração
function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
}

// Função para calcular tempo decorrido
function getElapsedTime(startedAt: string | null): string {
    if (!startedAt) return "—";
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = now - start;
    return formatDuration(elapsed);
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    // Buscar dados reais do banco
    const [job, steps, artifacts] = await Promise.all([
        getJobById(params.id),
        getJobSteps(params.id),
        getJobArtifacts(params.id)
    ]);

    if (!job) {
        notFound();
    }

    // Parse input para pegar título
    const input = JSON.parse(job.input || "{}");
    const jobTitle = input.title || input.idea || job.recipeSlug || "Job sem título";

    // Calcular progresso
    const completedSteps = steps.filter(s => s.status === "success" || s.status === "skipped").length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Encontrar step atual (running)
    const currentStep = steps.find(s => s.status === "running")?.stepKey || null;

    // Calcular tempo total de execução
    const totalDuration = steps.reduce((acc, s) => acc + (s.durationMs || 0), 0);

    // Pegar hash do primeiro step como referência (se existir)
    const inputHash = steps[0]?.inputHash?.substring(0, 8) || "—";


    // Actions com binding de jobId (Server Actions)
    async function handleResume() {
        "use server";
        await resumeJob(params.id);
    }

    async function handleCancel() {
        "use server";
        await cancelJob(params.id);
    }

    async function handleStart() {
        "use server";
        await startJob(params.id);
    }

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar aos Jobs
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold tracking-tight">{jobTitle}</h1>
                            <StatusBadge status={job.status as "pending" | "running" | "completed" | "failed" | "cancelled"} />
                        </div>
                        <p className="text-muted-foreground">
                            {job.recipeSlug} • Criado em {new Date(job.createdAt || "").toLocaleString('pt-BR')}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {job.status === "pending" && (
                            <form action={handleStart}>
                                <Button type="submit" className="gap-2">
                                    <Play className="h-4 w-4" />
                                    Iniciar
                                </Button>
                            </form>
                        )}
                        {(job.status === "failed" || job.status === "cancelled") && (
                            <form action={handleResume}>
                                <Button type="submit" variant="outline" className="gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Retomar
                                </Button>
                            </form>
                        )}
                        {job.status === "running" && (
                            <form action={handleCancel}>
                                <Button type="submit" variant="destructive" className="gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Cancelar
                                </Button>
                            </form>
                        )}
                        {job.status === "running" && (
                            <form>
                                <Button type="submit" variant="ghost" formAction={() => { }}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main: Pipeline */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress Bar */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold">{progress}%</span>
                                <span className="text-sm text-muted-foreground">
                                    {completedSteps} de {totalSteps} steps
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pipeline Steps */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PipelineView
                                steps={steps.map(s => ({
                                    id: s.id,
                                    stepKey: s.stepKey,
                                    stepOrder: s.stepOrder,
                                    status: s.status as "pending" | "running" | "success" | "failed" | "skipped",
                                    durationMs: s.durationMs,
                                    attempts: s.attempts || 0,
                                    lastError: s.lastError,
                                }))}
                                currentStep={currentStep}
                            />
                        </CardContent>
                    </Card>

                    {/* Logs (do último step ou erro) */}
                    {job.lastError && (
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Erro</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-black rounded-lg p-4 font-mono text-sm text-red-400 max-h-64 overflow-auto scrollbar-hide">
                                    <pre className="whitespace-pre-wrap">{job.lastError}</pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Artifacts */}
                    {artifacts.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Artefatos ({artifacts.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {artifacts.map((artifact) => (
                                        <div key={artifact.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                            <div>
                                                <p className="text-sm font-medium">{artifact.stepKey}</p>
                                                <p className="text-xs text-muted-foreground">{artifact.type}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {artifact.path?.split('/').pop()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Metadata */}
                <div className="space-y-6">
                    {/* Metrics */}
                    <div className="grid gap-4">
                        <MetricCard
                            label="Tempo Total"
                            value={totalDuration > 0 ? formatDuration(totalDuration) : "—"}
                        />
                        {job.status === "running" && job.startedAt && (
                            <MetricCard
                                label="Tempo Decorrido"
                                value={getElapsedTime(job.startedAt)}
                            />
                        )}
                    </div>

                    {/* Hashes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Checksums</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Input Hash
                                </span>
                                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                    {inputHash}
                                </code>
                            </div>
                        </CardContent>

                    </Card>

                    {/* Input Original */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Input Original</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-2">
                                {input.idea && (
                                    <div>
                                        <span className="font-medium text-foreground">Ideia:</span>
                                        <p className="mt-1">{input.idea}</p>
                                    </div>
                                )}
                                {input.theme && (
                                    <div>
                                        <span className="font-medium text-foreground">Tema:</span>
                                        <p className="mt-1">{input.theme}</p>
                                    </div>
                                )}
                                {input.brief && (
                                    <div>
                                        <span className="font-medium text-foreground">Brief:</span>
                                        <p className="mt-1">{input.brief}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job ID */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Job Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ID</span>
                                <code className="font-mono text-xs truncate max-w-[150px]" title={job.id}>
                                    {job.id.substring(0, 8)}...
                                </code>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Recipe</span>
                                <span>{job.recipeSlug}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Versão</span>
                                <span>v{job.recipeVersion}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
