import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PipelineView,
    StatusBadge,
    StepPreview,
} from "@/components/vf";
import { ArrowLeft, Wand2, Play, RotateCcw, CheckCircle, RefreshCw } from "lucide-react";
import { getJobById, getJobSteps, getJobArtifacts, continueWizard, startJob } from "@/app/jobs/actions";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Wizard Flow Page
 * 
 * Mostra pipeline e permite execução step-by-step
 * NÃO faz auto-init para evitar loops
 */

export default async function WizardFlowPage({ params }: { params: { jobId: string } }) {
    const [job, steps] = await Promise.all([
        getJobById(params.jobId),
        getJobSteps(params.jobId),
    ]);

    if (!job) {
        notFound();
    }

    // Se job não é wizard mode, redireciona para /jobs
    if (job.executionMode !== "wizard") {
        redirect(`/jobs?id=${job.id}`);
    }

    const input = JSON.parse(job.input || "{}");
    const jobTitle = input.tema || input.title || "Wizard";

    // Progresso
    const completedSteps = steps.filter(s => s.status === "success").length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Step atual
    const currentStepIndex = steps.findIndex(s => s.status === "pending" || s.status === "running");
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
    const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

    // Server Actions
    async function handleStartWizard() {
        "use server";
        // Inicia o job - cria steps e executa o primeiro
        await startJob(params.jobId);
        revalidatePath(`/wizard/${params.jobId}`);
    }

    async function handleContinue() {
        "use server";
        await continueWizard(params.jobId);
        revalidatePath(`/wizard/${params.jobId}`);
    }

    async function handleRefresh() {
        "use server";
        revalidatePath(`/wizard/${params.jobId}`);
    }

    // Estado: sem steps ainda - mostrar botão para iniciar
    if (steps.length === 0 && job.status === "pending") {
        return (
            <div className="container py-8">
                <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar aos Jobs
                </Link>

                <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                    <Wand2 className="h-16 w-16 text-primary" />
                    <h1 className="text-2xl font-bold">{jobTitle}</h1>
                    <p className="text-muted-foreground text-center max-w-md">
                        Este wizard ainda não foi iniciado. Clique abaixo para começar a execução step-by-step.
                    </p>
                    <form action={handleStartWizard}>
                        <Button type="submit" size="lg" className="gap-2">
                            <Play className="h-5 w-5" />
                            Iniciar Wizard
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // Estado: job running - mostrar loading com refresh
    if (job.status === "running") {
        return (
            <div className="container py-8">
                <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar aos Jobs
                </Link>

                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <h2 className="text-xl font-semibold">Executando Step...</h2>
                    <p className="text-muted-foreground">
                        {steps.length > 0 ? `Step ${completedSteps + 1} de ${totalSteps}` : "Criando steps..."}
                    </p>
                    <form action={handleRefresh}>
                        <Button type="submit" variant="outline" className="mt-4 gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // Estado normal: mostrar wizard UI
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
                            <Wand2 className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">{jobTitle}</h1>
                            <StatusBadge status={job.status as "pending" | "running" | "completed" | "failed"} />
                        </div>
                        <p className="text-muted-foreground">
                            Wizard Mode • {job.recipeSlug} • {completedSteps} de {totalSteps} steps completos
                        </p>
                    </div>
                    <form action={handleRefresh}>
                        <Button type="submit" variant="ghost" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sidebar: Pipeline */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Progresso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold">{progress}%</span>
                                <span className="text-sm text-muted-foreground">
                                    {completedSteps} de {totalSteps}
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Pipeline</CardTitle>
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
                                jobId={params.jobId}
                                currentStep={currentStep?.stepKey || null}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Main: Step Atual */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Step Atual */}
                    {currentStep && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="capitalize">{currentStep.stepKey}</span>
                                    <StatusBadge status={currentStep.status as "pending" | "running"} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentStep.status === "pending" && (
                                    <form action={handleContinue}>
                                        <Button type="submit" className="w-full gap-2">
                                            <Play className="h-4 w-4" />
                                            Executar {currentStep.stepKey}
                                        </Button>
                                    </form>
                                )}
                                {currentStep.status === "running" && (
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                        Executando...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Preview do Step Anterior */}
                    {prevStep && prevStep.status === "success" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Resultado: {prevStep.stepKey}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StepPreview
                                    jobId={params.jobId}
                                    stepKey={prevStep.stepKey}
                                    status={prevStep.status as "success"}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Ações */}
                    {prevStep && currentStep && currentStep.status === "pending" && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <form action={handleContinue} className="flex-1">
                                        <Button type="submit" className="w-full gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Aprovar e Continuar
                                        </Button>
                                    </form>
                                    <Button variant="outline" className="gap-2" disabled>
                                        <RotateCcw className="h-4 w-4" />
                                        Regenerar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Job Completo */}
                    {job.status === "completed" && (
                        <Card className="border-green-500/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center gap-2 text-green-500">
                                    <CheckCircle className="h-6 w-6" />
                                    <span className="text-lg font-medium">Wizard Completo!</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Sem steps pendentes - todos completos ou vazio */}
                    {!currentStep && steps.length > 0 && job.status !== "completed" && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    Todos os steps foram processados.{" "}
                                    <form action={handleRefresh} className="inline">
                                        <Button type="submit" variant="link" className="p-0">
                                            Clique para atualizar
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
