"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PreviousStepOutput {
    stepKey: string;
    stepName: string;
    summary: string;
}

interface PreviousStepsContextProps {
    steps: PreviousStepOutput[];
    maxVisible?: number;
    className?: string;
}

/**
 * PreviousStepsContext - Compact summary of previous steps' outputs
 * 
 * Shows context from completed steps to help the user understand
 * what was generated before the current step.
 */
export function PreviousStepsContext({
    steps,
    maxVisible = 2,
    className,
}: PreviousStepsContextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (steps.length === 0) return null;

    const visibleSteps = isExpanded ? steps : steps.slice(0, maxVisible);
    const hasMore = steps.length > maxVisible;

    return (
        <div
            className={cn(
                "rounded-lg bg-muted/30 border p-4 space-y-3",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="w-4 h-4" />
                Contexto dos passos anteriores
            </div>

            {/* Steps */}
            <div className="space-y-2">
                {visibleSteps.map((step, index) => (
                    <div
                        key={step.stepKey}
                        className="flex items-start gap-2 text-sm"
                    >
                        <span className="font-medium text-muted-foreground min-w-[100px]">
                            {step.stepName}:
                        </span>
                        <span className="text-foreground line-clamp-2">
                            {step.summary}
                        </span>
                    </div>
                ))}
            </div>

            {/* Expand/collapse button */}
            {hasMore && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full gap-2 text-muted-foreground"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Mostrar menos
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            Mostrar mais ({steps.length - maxVisible} ocultos)
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}


