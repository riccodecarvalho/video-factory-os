"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Circle,
    Loader2,
    XCircle,
    SkipForward,
    RotateCcw,
    Clock,
} from "lucide-react";

type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface PipelineStep {
    id: string;
    stepKey: string;
    stepOrder: number;
    status: StepStatus;
    durationMs?: number | null;
    attempts?: number;
    lastError?: string | null;
}

interface PipelineViewProps {
    steps: PipelineStep[];
    currentStep?: string | null;
    onRetry?: (stepKey: string) => void;
    className?: string;
}

const statusIcons: Record<StepStatus, typeof Circle> = {
    pending: Circle,
    running: Loader2,
    success: CheckCircle2,
    failed: XCircle,
    skipped: SkipForward,
};

const statusColors: Record<StepStatus, string> = {
    pending: "text-muted-foreground",
    running: "text-status-running",
    success: "text-status-success",
    failed: "text-status-error",
    skipped: "text-muted-foreground",
};

const stepLabels: Record<string, string> = {
    title: "Gerar Títulos",
    brief: "Expandir Brief",
    script: "Gerar Roteiro",
    parse_ssml: "Converter SSML",
    tts: "Gerar Áudio (TTS)",
    render: "Renderizar Vídeo",
    export: "Exportar Pacote",
};

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
}

export function PipelineView({ steps, currentStep, onRetry, className }: PipelineViewProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <h3 className="text-sm font-medium mb-3">Pipeline</h3>
            <div className="space-y-2">
                {steps.map((step, index) => {
                    const Icon = statusIcons[step.status as StepStatus] || Circle;
                    const colorClass = statusColors[step.status as StepStatus] || "";
                    const isActive = step.stepKey === currentStep;
                    const label = stepLabels[step.stepKey] || step.stepKey;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-md transition-colors",
                                isActive && "bg-primary/5 border border-primary/20",
                                step.status === "failed" && "bg-status-error/5"
                            )}
                        >
                            {/* Icon */}
                            <Icon
                                className={cn(
                                    "w-4 h-4 shrink-0",
                                    colorClass,
                                    step.status === "running" && "animate-spin"
                                )}
                            />

                            {/* Label + Meta */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{label}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Step {index + 1}</span>
                                    {step.durationMs && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDuration(step.durationMs)}
                                            </span>
                                        </>
                                    )}
                                    {(step.attempts || 0) > 1 && (
                                        <>
                                            <span>•</span>
                                            <span>Tentativa {step.attempts}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs shrink-0",
                                    step.status === "success" && "bg-status-success/10 text-status-success border-status-success/30",
                                    step.status === "running" && "bg-status-running/10 text-status-running border-status-running/30",
                                    step.status === "failed" && "bg-status-error/10 text-status-error border-status-error/30"
                                )}
                            >
                                {step.status}
                            </Badge>

                            {/* Retry button */}
                            {step.status === "failed" && onRetry && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRetry(step.stepKey)}
                                    className="shrink-0"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            {steps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum step executado ainda
                </p>
            )}
        </div>
    );
}
