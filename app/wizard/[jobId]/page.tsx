"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWizardState, runWizardStep, approveStepAndContinue, regenerateWithFeedback } from "@/lib/engine/wizard-runner";

// Step components
import StepTema from "./steps/StepTema";
import StepIdeacao from "./steps/StepIdeacao";
import StepTitulos from "./steps/StepTitulos";
import StepPlanejamento from "./steps/StepPlanejamento";
import StepRoteiro from "./steps/StepRoteiro";
import StepProducao from "./steps/StepProducao";

type WizardState = Awaited<ReturnType<typeof getWizardState>>;

const STEP_COMPONENTS: Record<string, React.ComponentType<StepProps>> = {
    ideacao: StepIdeacao,
    titulo: StepTitulos,
    planejamento: StepPlanejamento,
    roteiro: StepRoteiro,
    tts: StepProducao,
    renderizacao: StepProducao,
    exportacao: StepProducao,
};

export type StepProps = {
    jobId: string;
    stepKey: string;
    output: unknown;
    isLoading: boolean;
    onGenerate: () => void;
    onRegenerate: (feedback: string) => void;
    onApprove: (selected?: string) => void;
    onBack: () => void;
};

export default function WizardFlowPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;

    const [state, setState] = useState<WizardState>(null);
    const [currentOutput, setCurrentOutput] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        async function loadState() {
            setIsLoading(true);
            const wizardState = await getWizardState(jobId);
            setState(wizardState);
            setIsLoading(false);
        }
        loadState();
    }, [jobId]);

    if (isLoading || !state) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-400">Carregando wizard...</p>
                </div>
            </div>
        );
    }

    const currentStep = state.currentStep || state.pipeline[0]?.key || "ideacao";
    const stepIndex = state.pipeline.findIndex((s: { key: string }) => s.key === currentStep);
    const StepComponent = STEP_COMPONENTS[currentStep] || StepTema;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await runWizardStep(jobId, currentStep);
            if (result.success) {
                setCurrentOutput(result.output);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = async (feedback: string) => {
        setIsGenerating(true);
        try {
            const result = await regenerateWithFeedback(jobId, currentStep, feedback);
            if (result.success) {
                setCurrentOutput(result.output);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApprove = async (selected?: string) => {
        setIsLoading(true);
        try {
            const result = await approveStepAndContinue(jobId, currentStep, selected);
            if (result.success) {
                if (result.nextStep) {
                    // Reload state to get updated current step
                    const newState = await getWizardState(jobId);
                    setState(newState);
                    setCurrentOutput(null);
                } else {
                    // Job complete
                    router.push(`/jobs?id=${jobId}`);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) {
            // Go to previous step
            const prevStep = state.pipeline[stepIndex - 1].key;
            // Update state manually for now
            setState({
                ...state,
                currentStep: prevStep,
            });
            setCurrentOutput(null);
        } else {
            router.push("/wizard");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header with Stepper */}
            <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-white">
                            🎬 Wizard de Criação
                        </h1>
                        <span className="text-sm text-gray-400">
                            Step {stepIndex + 1} de {state.pipeline.length}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((stepIndex + 1) / state.pipeline.length) * 100}%` }}
                        />
                    </div>

                    {/* Step Pills */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {state.pipeline.slice(0, 6).map((step: { key: string }, i: number) => {
                            const isActive = step.key === currentStep;
                            const isCompleted = i < stepIndex;
                            return (
                                <span
                                    key={step.key}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isActive
                                            ? "bg-purple-600 text-white"
                                            : isCompleted
                                                ? "bg-green-600/30 text-green-400"
                                                : "bg-gray-700 text-gray-400"
                                        }`}
                                >
                                    {isCompleted ? "✓ " : ""}
                                    {step.key}
                                </span>
                            );
                        })}
                        {state.pipeline.length > 6 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                                +{state.pipeline.length - 6} mais
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="max-w-4xl mx-auto p-8">
                <StepComponent
                    jobId={jobId}
                    stepKey={currentStep}
                    output={currentOutput}
                    isLoading={isGenerating}
                    onGenerate={handleGenerate}
                    onRegenerate={handleRegenerate}
                    onApprove={handleApprove}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
