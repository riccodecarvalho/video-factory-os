"use client";

import { cn } from "@/lib/utils";
import { Check, Circle, Loader2 } from "lucide-react";
import type { WizardPhase, WizardStep } from "./wizard-constants";

interface WizardStepperProps {
    phases: WizardPhase[];
    currentPhaseId: string;
    currentStepKey: string | null;
    steps: WizardStep[];
    progress: number;
    projectId?: string;
    projectName?: string;
    createdAt?: string;
    onStepClick?: (stepKey: string) => void;
}

/**
 * WizardStepper - Stepper hierárquico de 2 níveis
 * 
 * Nível 1: Fases (Conceituação → Planejamento → Visual → Produção → Revisão → Finalização)
 * Nível 2: Steps dentro de cada fase
 */
export function WizardStepper({
    phases,
    currentPhaseId,
    currentStepKey,
    steps,
    progress,
    projectId,
    projectName,
    createdAt,
    onStepClick,
}: WizardStepperProps) {
    // Get current phase
    const currentPhase = phases.find(p => p.id === currentPhaseId);

    // Get steps for current phase
    const currentPhaseSteps = currentPhase?.steps || [];
    const stepsInPhase = steps.filter(s => currentPhaseSteps.includes(s.key));

    return (
        <div className="space-y-4">
            {/* Header with project info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                        <h2 className="font-semibold">Wizard de Criação</h2>
                        {projectId && (
                            <span className="text-xs text-muted-foreground font-mono">
                                {projectId.slice(0, 12).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
                {currentPhase && (
                    <div className="text-sm text-muted-foreground">
                        {currentPhase.name}
                    </div>
                )}
            </div>

            {/* Project name and date */}
            {(projectName || createdAt) && (
                <div className="text-sm text-muted-foreground">
                    {projectName && <span>{projectName}</span>}
                    {projectName && createdAt && <span> • </span>}
                    {createdAt && <span>{createdAt}</span>}
                </div>
            )}

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                    {progress}% completo
                </div>
            </div>

            {/* Phase indicators (Level 1) */}
            <div className="flex items-center justify-between py-2">
                {phases.map((phase, index) => {
                    const isActive = phase.id === currentPhaseId;
                    const isCompleted = phase.status === "completed";

                    return (
                        <div key={phase.id} className="flex items-center">
                            {/* Phase circle */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                    isCompleted && "bg-primary text-primary-foreground",
                                    isActive && !isCompleted && "bg-primary/20 text-primary border-2 border-primary",
                                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>

                            {/* Connector line */}
                            {index < phases.length - 1 && (
                                <div
                                    className={cn(
                                        "w-8 h-0.5 mx-1",
                                        isCompleted ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Phase names */}
            <div className="flex justify-between text-xs text-muted-foreground">
                {phases.map(phase => (
                    <span
                        key={phase.id}
                        className={cn(
                            "text-center",
                            phase.id === currentPhaseId && "text-primary font-medium"
                        )}
                    >
                        {phase.name}
                    </span>
                ))}
            </div>

            {/* Steps in current phase (Level 2) */}
            {stepsInPhase.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {stepsInPhase.map(step => {
                        const isActive = step.key === currentStepKey;
                        const isCompleted = step.status === "success";
                        const isRunning = step.status === "running";
                        const isFailed = step.status === "failed";

                        return (
                            <button
                                key={step.key}
                                onClick={() => onStepClick?.(step.key)}
                                disabled={step.status === "pending"}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                    isCompleted && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                    isRunning && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                    isFailed && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                    isActive && !isCompleted && !isRunning && !isFailed && "bg-primary/10 text-primary",
                                    !isActive && !isCompleted && !isRunning && !isFailed && "bg-muted text-muted-foreground",
                                    step.status === "pending" && "cursor-not-allowed opacity-50"
                                )}
                            >
                                <span className="flex items-center gap-1.5">
                                    {isCompleted && <Check className="w-3 h-3" />}
                                    {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {isFailed && <Circle className="w-3 h-3" />}
                                    {step.name || step.key}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


