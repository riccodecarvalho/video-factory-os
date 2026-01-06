import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PipelineView,
    StatusBadge,
    StepPreview,
    WizardStepper,
    StepExecutionProgress,
    GeneratedResultCard,
    WizardFooter,
    WizardApprovalActions,
    PreviousStepsContext,
    DEFAULT_WIZARD_PHASES,
    getPhaseStatus,
    getCurrentPhase,
    extractStepSummary,
    STEP_NAMES,
    parseAIOutputMetadata,
    extractMainContent,
    StepConfigurator,
} from "@/components/vf";
import { ArrowLeft, Wand2, Play, RotateCcw, CheckCircle, RefreshCw, Home } from "lucide-react";
import {
    getJobById,
    getJobSteps,
    getJobArtifacts,
    continueWizard,
    startJob,
    retryFromStep,
    retryWithInstruction,
    updateJobInput
} from "@/app/jobs/actions";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Wizard Flow Page - Redesigned
 * 
 * Features:
 * - Hierarchical stepper (phases + steps)
 * - Visual execution progress
 * - Structured result cards
 * - Context from previous steps
 * - Fixed footer navigation
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
    const createdAt = job.createdAt
        ? new Date(job.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        })
        : undefined;

    // Progresso
    const completedSteps = steps.filter(s => s.status === "success").length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Step atual e anterior
    const currentStepIndex = steps.findIndex(s => s.status === "pending" || s.status === "running");
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
    const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

    // Mapear steps para formato do WizardStepper
    const wizardSteps = steps.map(s => ({
        key: s.stepKey,
        status: s.status as "pending" | "running" | "success" | "failed" | "skipped",
        name: STEP_NAMES[s.stepKey] || s.stepKey,
    }));

    // Calcular fases com status
    const phases = DEFAULT_WIZARD_PHASES.map(phase => ({
        ...phase,
        status: getPhaseStatus(phase, wizardSteps),
    }));

    // Fase atual
    const currentPhase = getCurrentPhase(currentStep?.stepKey || null, phases);

    // Contexto dos passos anteriores (últimos 3 completos)
    const previousSteps = steps
        .filter(s => s.status === "success")
        .slice(-3)
        .map(s => ({
            stepKey: s.stepKey,
            stepName: STEP_NAMES[s.stepKey] || s.stepKey,
            summary: extractStepSummary(s.outputRefs || ""),
        }));

    // Server Actions
    async function handleStartWizard() {
        "use server";
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

    async function handleRegenerate(stepKey: string) {
        "use server";
        await retryFromStep(params.jobId, stepKey);
        revalidatePath(`/wizard/${params.jobId}`);
    }

    async function handleIterateWithInstruction(stepKey: string, instruction: string) {
        "use server";
        await retryWithInstruction(params.jobId, stepKey, instruction);
        revalidatePath(`/wizard/${params.jobId}`);
    }

    // Estado: sem steps ainda - mostrar botão para iniciar
    if (steps.length === 0 && job.status === "pending") {
        return (
            <div className="min-h-screen bg-background">
                {/* Breadcrumb */}
                <div className="border-b bg-card/50">
                    <div className="container py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground flex items-center gap-1">
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <span>/</span>
                            <Link href="/jobs" className="hover:text-foreground">
                                Produção
                            </Link>
                            <span>/</span>
                            <span className="text-foreground">Wizard</span>
                        </div>
                    </div>
                </div>

                <div className="container py-8">
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
            </div>
        );
    }

    // Estado: job running - mostrar feedback de execução
    if (job.status === "running") {
        const runningStep = steps.find(s => s.status === "running");

        return (
            <div className="min-h-screen bg-background">
                {/* Breadcrumb */}
                <div className="border-b bg-card/50">
                    <div className="container py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground flex items-center gap-1">
                                <Home className="w-4 h-4" />
                            </Link>
                            <span>/</span>
                            <Link href="/jobs" className="hover:text-foreground">Produção</Link>
                            <span>/</span>
                            <span className="text-foreground">Wizard</span>
                        </div>
                    </div>
                </div>

                <div className="container py-8 max-w-4xl">
                    {/* Stepper */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <WizardStepper
                                phases={phases}
                                currentPhaseId={currentPhase?.id || "conceituacao"}
                                currentStepKey={runningStep?.stepKey || null}
                                steps={wizardSteps}
                                progress={progress}
                                projectId={job.id.slice(0, 8)}
                                projectName={jobTitle}
                                createdAt={createdAt}
                            />
                        </CardContent>
                    </Card>

                    {/* Execution Progress */}
                    <StepExecutionProgress
                        stepName={STEP_NAMES[runningStep?.stepKey || ""] || runningStep?.stepKey || "Processando"}
                        stepKey={runningStep?.stepKey || ""}
                        isExecuting={true}
                        estimatedSeconds={60}
                    />

                    {/* Refresh button */}
                    <div className="flex justify-center mt-6">
                        <form action={handleRefresh}>
                            <Button type="submit" variant="outline" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Atualizar
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Estado normal: mostrar wizard UI completo
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground flex items-center gap-1">
                            <Home className="w-4 h-4" />
                        </Link>
                        <span>/</span>
                        <Link href="/jobs" className="hover:text-foreground">Produção</Link>
                        <span>/</span>
                        <span className="text-foreground">Wizard</span>
                    </div>
                </div>
            </div>

            <div className="container py-6 max-w-5xl">
                {/* Stepper Header */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <WizardStepper
                            phases={phases}
                            currentPhaseId={currentPhase?.id || "conceituacao"}
                            currentStepKey={currentStep?.stepKey || null}
                            steps={wizardSteps}
                            progress={progress}
                            projectId={job.id.slice(0, 8)}
                            projectName={jobTitle}
                            createdAt={createdAt}
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Sidebar: Pipeline + Context */}
                    <div className="space-y-6">
                        {/* Previous Steps Context */}
                        {previousSteps.length > 0 && (
                            <PreviousStepsContext steps={previousSteps} />
                        )}

                        {/* Pipeline Mini */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center justify-between">
                                    Pipeline
                                    <form action={handleRefresh}>
                                        <Button type="submit" variant="ghost" size="sm" className="h-7 w-7 p-0">
                                            <RefreshCw className="h-3 w-3" />
                                        </Button>
                                    </form>
                                </CardTitle>
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

                    {/* Main: Step Atual + Resultado Anterior */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step Atual */}
                        {currentStep && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span>📝 {STEP_NAMES[currentStep.stepKey] || currentStep.stepKey}</span>
                                        <StatusBadge status={currentStep.status as "pending" | "running"} />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {currentStep.status === "pending" && (
                                        <>
                                            <p className="text-sm text-muted-foreground">
                                                Clique para executar este step e gerar o conteúdo.
                                            </p>

                                            {/* Configuration UI for steps that need it */}
                                            <div className="my-4">
                                                <StepConfigurator
                                                    stepKey={currentStep.stepKey}
                                                    currentInput={input}
                                                    onSave={async (newConfig) => {
                                                        "use server";
                                                        await updateJobInput(params.jobId, newConfig);
                                                    }}
                                                />
                                            </div>

                                            <form action={handleContinue}>
                                                <Button type="submit" className="w-full gap-2">
                                                    <Play className="h-4 w-4" />
                                                    Executar {STEP_NAMES[currentStep.stepKey] || currentStep.stepKey}
                                                </Button>
                                            </form>
                                        </>
                                    )}
                                    {currentStep.status === "running" && (
                                        <StepExecutionProgress
                                            stepName={STEP_NAMES[currentStep.stepKey] || currentStep.stepKey}
                                            stepKey={currentStep.stepKey}
                                            isExecuting={true}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Resultado do Step Anterior */}
                        {prevStep && prevStep.status === "success" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Resultado: {STEP_NAMES[prevStep.stepKey] || prevStep.stepKey}
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

                        {/* Ações de Aprovação */}
                        {prevStep && currentStep && currentStep.status === "pending" && (
                            <WizardApprovalActions
                                jobId={params.jobId}
                                stepKey={prevStep.stepKey}
                                onApprove={handleContinue}
                                onRegenerate={handleRegenerate}
                                onIterateWithInstruction={handleIterateWithInstruction}
                            />
                        )}

                        {/* Job Completo */}
                        {job.status === "completed" && (
                            <Card className="border-green-500/50 bg-green-500/5">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center justify-center gap-4 text-green-500 py-4">
                                        <CheckCircle className="h-12 w-12" />
                                        <span className="text-xl font-semibold">Wizard Completo!</span>
                                        <p className="text-muted-foreground text-center">
                                            Todos os steps foram executados com sucesso.
                                        </p>
                                        <Link href={`/jobs?id=${job.id}`}>
                                            <Button variant="outline" className="gap-2">
                                                Ver Job Completo
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Job com falha */}
                        {job.status === "failed" && (
                            <Card className="border-red-500/50 bg-red-500/5">
                                <CardContent className="pt-6">
                                    <div className="text-center text-red-500">
                                        <p className="font-medium">Ocorreu um erro na execução</p>
                                        {job.lastError && (
                                            <p className="text-sm mt-2 font-mono bg-red-500/10 p-3 rounded">
                                                {job.lastError}
                                            </p>
                                        )}
                                        <form action={handleContinue} className="mt-4">
                                            <Button type="submit" variant="outline" className="gap-2">
                                                <RotateCcw className="h-4 w-4" />
                                                Tentar Novamente
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Sem steps pendentes - estado estranho */}
                        {!currentStep && steps.length > 0 && job.status !== "completed" && job.status !== "failed" && (
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

            {/* Footer fixo - escondido por enquanto (precisa de client component para navegar) */}
            {/* 
            <WizardFooter
                stepDescription={`${STEP_NAMES[currentStep?.stepKey || ""] || currentStep?.stepKey || "Aguardando"}`}
                canGoBack={currentStepIndex > 0}
                canGoNext={!!currentStep && currentStep.status === "pending"}
                onBack={() => {}}
                onNext={() => {}}
            />
            */}
        </div>
    );
}
