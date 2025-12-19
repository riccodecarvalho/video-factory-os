import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PipelineView,
    StatusBadge,
    StepPreview,
} from "@/components/vf";
import { ArrowLeft, Wand2, Play, RotateCcw, CheckCircle } from "lucide-react";
import { getJobById, getJobSteps, getJobArtifacts, continueWizard } from "@/app/jobs/actions";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Wizard Flow Page
 * 
 * Mostra pipeline com PipelineView e preview do step atual com StepPreview
 * Reutiliza componentes VF existentes conforme ADR-011
 */

export default async function WizardFlowPage({ params }: { params: { jobId: string } }) {
    const [job, steps, artifacts] = await Promise.all([
        getJobById(params.jobId),
        getJobSteps(params.jobId),
        getJobArtifacts(params.jobId)
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

    // Encontrar step atual (pending ou running)
    const currentStepIndex = steps.findIndex(s => s.status === "pending" || s.status === "running");
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

    // Step anterior (para preview)
    const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

    // Progresso
    const completedSteps = steps.filter(s => s.status === "success").length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Server Actions
    async function handleExecuteStep() {
        "use server";
        await continueWizard(params.jobId);
        revalidatePath(`/wizard/${params.jobId}`);
    }

    async function handleApprove() {
        "use server";
        // Continuar wizard para próximo step
        await continueWizard(params.jobId);
        revalidatePath(`/wizard/${params.jobId}`);
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
                            <Wand2 className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">{jobTitle}</h1>
                            <StatusBadge status={job.status as "pending" | "running" | "completed" | "failed"} />
                        </div>
                        <p className="text-muted-foreground">
                            Wizard Mode • {job.recipeSlug} • Step {completedSteps + 1} de {totalSteps}
                        </p>
                    </div>
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
                                    <form action={handleExecuteStep}>
                                        <Button type="submit" className="w-full gap-2">
                                            <Play className="h-4 w-4" />
                                            Executar {currentStep.stepKey}
                                        </Button>
                                    </form>
                                )}
                                {currentStep.status === "running" && (
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                        Executando...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Preview do Step Anterior (se existir) */}
                    {prevStep && prevStep.status === "success" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Preview: {prevStep.stepKey}
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

                    {/* Ações de aprovação */}
                    {prevStep && currentStep && currentStep.status === "pending" && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <form action={handleApprove} className="flex-1">
                                        <Button type="submit" className="w-full gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Aprovar e Continuar
                                        </Button>
                                    </form>
                                    <Button variant="outline" className="gap-2">
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
                </div>
            </div>
        </div>
    );
}
