"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Process {
    id: string;
    title: string;
    status: "running" | "completed" | "failed";
    stepName?: string;
}

interface ProcessNotificationProps {
    processes: Process[];
    onDismiss: (id: string) => void;
    autoDismissMs?: number;
    className?: string;
}

/**
 * ProcessNotification - Toast para processos em background
 * 
 * Features:
 * - Lista de processos ativos
 * - Auto-dismiss para completed após X segundos
 * - Ícones de status
 * - Botão para fechar
 */
export function ProcessNotification({
    processes,
    onDismiss,
    autoDismissMs = 5000,
    className,
}: ProcessNotificationProps) {
    // Auto-dismiss completed processes
    useEffect(() => {
        const completedProcesses = processes.filter(p => p.status === "completed");

        completedProcesses.forEach(process => {
            const timer = setTimeout(() => {
                onDismiss(process.id);
            }, autoDismissMs);

            return () => clearTimeout(timer);
        });
    }, [processes, autoDismissMs, onDismiss]);

    if (processes.length === 0) return null;

    return (
        <div
            className={cn(
                "fixed bottom-4 right-4 z-50 space-y-2",
                "animate-in slide-in-from-bottom-4",
                className
            )}
        >
            {processes.map((process) => (
                <ProcessToast
                    key={process.id}
                    process={process}
                    onDismiss={() => onDismiss(process.id)}
                />
            ))}
        </div>
    );
}

interface ProcessToastProps {
    process: Process;
    onDismiss: () => void;
}

function ProcessToast({ process, onDismiss }: ProcessToastProps) {
    const statusConfig = {
        running: {
            icon: Loader2,
            iconClass: "animate-spin text-primary",
            bgClass: "bg-card",
        },
        completed: {
            icon: CheckCircle,
            iconClass: "text-green-500",
            bgClass: "bg-green-50 dark:bg-green-900/20",
        },
        failed: {
            icon: XCircle,
            iconClass: "text-red-500",
            bgClass: "bg-red-50 dark:bg-red-900/20",
        },
    };

    const config = statusConfig[process.status];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border shadow-lg min-w-[280px]",
                config.bgClass
            )}
        >
            <Icon className={cn("w-5 h-5 flex-shrink-0", config.iconClass)} />

            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                    {process.title}
                </div>
                {process.stepName && (
                    <div className="text-xs text-muted-foreground truncate">
                        {process.stepName}
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}

/**
 * Hook para gerenciar processos de notificação
 */
export function useProcessNotifications() {
    const [processes, setProcesses] = useState<Process[]>([]);

    const addProcess = (process: Omit<Process, "id">) => {
        const id = `process-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setProcesses(prev => [...prev, { ...process, id }]);
        return id;
    };

    const updateProcess = (id: string, updates: Partial<Process>) => {
        setProcesses(prev =>
            prev.map(p => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const dismissProcess = (id: string) => {
        setProcesses(prev => prev.filter(p => p.id !== id));
    };

    return {
        processes,
        addProcess,
        updateProcess,
        dismissProcess,
    };
}
