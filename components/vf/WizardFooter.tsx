"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WizardFooterProps {
    stepDescription?: string;
    canGoBack: boolean;
    canGoNext: boolean;
    canSave?: boolean;
    onBack: () => void;
    onNext: () => void;
    onSave?: () => void;
    isNextLoading?: boolean;
    isSaveLoading?: boolean;
    nextLabel?: string;
    className?: string;
}

/**
 * WizardFooter - Fixed footer for wizard navigation
 * 
 * Features:
 * - Back/Next navigation buttons
 * - Optional save button
 * - Step description
 * - Loading states
 */
export function WizardFooter({
    stepDescription,
    canGoBack,
    canGoNext,
    canSave = false,
    onBack,
    onNext,
    onSave,
    isNextLoading = false,
    isSaveLoading = false,
    nextLabel = "Próximo",
    className,
}: WizardFooterProps) {
    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40",
                "bg-background/95 backdrop-blur-sm border-t",
                "px-6 py-4",
                className
            )}
        >
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                {/* Back button */}
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={!canGoBack}
                    className="gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                </Button>

                {/* Step description */}
                <div className="text-sm text-muted-foreground text-center max-w-md truncate">
                    {stepDescription}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    {/* Save button */}
                    {canSave && onSave && (
                        <Button
                            variant="outline"
                            onClick={onSave}
                            disabled={isSaveLoading}
                            className="gap-2"
                        >
                            {isSaveLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Salvar
                        </Button>
                    )}

                    {/* Next button */}
                    <Button
                        onClick={onNext}
                        disabled={!canGoNext || isNextLoading}
                        className="gap-2"
                    >
                        {isNextLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {nextLabel}
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
