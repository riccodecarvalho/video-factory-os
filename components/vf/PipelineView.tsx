"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { StepIndicator } from "./StepIndicator";
import type { JobStatus } from "./StatusBadge";

/**
 * PipelineView - Visualização do pipeline com steps conectados
 * 
 * Variante horizontal (desktop) com linhas conectoras
 * Animação: Linha entre step pronto e running tem gradiente animado
 */

export interface PipelineStep {
    key: string;
    label: string;
    status: JobStatus;
}

export interface PipelineViewProps {
    steps: PipelineStep[];
    currentStep?: string;
    onStepClick?: (stepKey: string) => void;
    orientation?: "horizontal" | "vertical";
    size?: "sm" | "default" | "lg";
    className?: string;
}

export function PipelineView({
    steps,
    currentStep,
    onStepClick,
    orientation = "horizontal",
    size = "default",
    className,
}: PipelineViewProps) {
    const isHorizontal = orientation === "horizontal";

    return (
        <div
            className={cn(
                "flex gap-0",
                isHorizontal ? "flex-row items-start" : "flex-col items-start",
                className
            )}
        >
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const isActive = step.key === currentStep;
                const nextStep = steps[index + 1];

                // Determinar cor da linha conectora
                const lineStatus = step.status === "success" && nextStep?.status === "running"
                    ? "running"
                    : step.status === "success"
                        ? "success"
                        : "pending";

                return (
                    <React.Fragment key={step.key}>
                        <StepIndicator
                            status={step.status}
                            label={step.label}
                            isActive={isActive}
                            onClick={onStepClick ? () => onStepClick(step.key) : undefined}
                            size={size}
                        />

                        {/* Linha conectora */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "flex items-center justify-center",
                                    isHorizontal
                                        ? "h-8 w-8 flex-shrink-0"
                                        : "h-8 w-8 flex-shrink-0"
                                )}
                            >
                                <div
                                    className={cn(
                                        "transition-all",
                                        isHorizontal ? "h-0.5 w-full" : "h-full w-0.5",
                                        lineStatus === "success" && "bg-status-success",
                                        lineStatus === "running" && "bg-gradient-to-r from-status-success to-status-running animate-flow bg-[length:200%_100%]",
                                        lineStatus === "pending" && "bg-border"
                                    )}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/**
 * MiniPipeline - Versão compacta para o JobCard
 */
export interface MiniPipelineProps {
    steps: PipelineStep[];
    className?: string;
}

export function MiniPipeline({ steps, className }: MiniPipelineProps) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.key}>
                        <div
                            className={cn(
                                "h-2 w-2 rounded-full transition-colors",
                                step.status === "success" && "bg-status-success",
                                step.status === "running" && "bg-status-running animate-pulse",
                                step.status === "failed" && "bg-status-error",
                                step.status === "pending" && "bg-muted-foreground/30",
                                step.status === "skipped" && "bg-muted-foreground/20"
                            )}
                            title={`${step.label}: ${step.status}`}
                        />
                        {!isLast && (
                            <div className={cn(
                                "h-0.5 w-2",
                                step.status === "success" ? "bg-status-success/50" : "bg-border"
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
