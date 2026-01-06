"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepExecutionProgressProps {
    stepName: string;
    stepKey: string;
    isExecuting: boolean;
    estimatedSeconds?: number;
    logs?: string[];
    onCancel?: () => void;
    className?: string;
}

/**
 * StepExecutionProgress - Visual feedback for AI step execution
 * 
 * Features:
 * - Animated progress bar
 * - Real-time elapsed time counter
 * - Descriptive status text
 * - Rolling logs display
 * - Cancel button
 */
export function StepExecutionProgress({
    stepName,
    stepKey,
    isExecuting,
    estimatedSeconds = 60,
    logs = [],
    onCancel,
    className,
}: StepExecutionProgressProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const router = useRouter();

    // Timer effect
    useEffect(() => {
        if (!isExecuting) {
            setElapsedSeconds(0);
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        // Auto-refresh every 3s to keep UI in sync
        const refreshInterval = setInterval(() => {
            router.refresh();
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(refreshInterval);
        };
    }, [isExecuting, router]);

    // Calculate progress percentage (capped at 95% until complete)
    const progressPercent = Math.min(
        95,
        Math.round((elapsedSeconds / estimatedSeconds) * 100)
    );

    // Format time display
    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // Get last 3 logs
    const recentLogs = logs.slice(-3);

    if (!isExecuting) return null;

    return (
        <div
            className={cn(
                "rounded-lg border bg-card p-4 space-y-4",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div>
                        <div className="font-medium">{stepName}</div>
                        <div className="text-xs text-muted-foreground">
                            Chamando IA Claude...
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTime(elapsedSeconds)}
                </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            "bg-gradient-to-r from-blue-500 to-primary",
                            "animate-pulse"
                        )}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                        {progressPercent < 30 && "Preparando requisição..."}
                        {progressPercent >= 30 && progressPercent < 60 && "Processando com IA..."}
                        {progressPercent >= 60 && progressPercent < 90 && "Gerando resposta..."}
                        {progressPercent >= 90 && "Finalizando..."}
                    </span>
                    <span>{progressPercent}%</span>
                </div>
            </div>

            {/* Expectation text */}
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                💡 Este processo leva cerca de 30-60 segundos
            </div>

            {/* Logs (if any) */}
            {recentLogs.length > 0 && (
                <div className="space-y-1 font-mono text-xs text-muted-foreground border-t pt-3">
                    <div className="text-xxs uppercase tracking-wider opacity-60 mb-1">
                        Logs:
                    </div>
                    {recentLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className="text-muted-foreground/50">›</span>
                            <span className="break-all">{log}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel button */}
            {onCancel && (
                <div className="pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="gap-2 text-muted-foreground hover:text-destructive"
                    >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                    </Button>
                </div>
            )}
        </div>
    );
}

/**
 * StepExecutionToast - Toast notification for background execution
 */
export function StepExecutionToast({
    stepName,
    isVisible,
    onClose,
}: {
    stepName: string;
    isVisible: boolean;
    onClose: () => void;
}) {
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
            <div className="bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <div>
                    <div className="text-sm font-medium">Geração iniciada</div>
                    <div className="text-xs text-muted-foreground">
                        {stepName} em execução...
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={onClose}
                >
                    ✕
                </Button>
            </div>
        </div>
    );
}
