"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    AlertCircle,
    MinusCircle
} from "lucide-react";

/**
 * StatusBadge - Badge colorido com status do job/step
 * 
 * Design: Fundo translúcido com texto vibrante e borda sutil
 * Forma: Pill (arredondado)
 */

const statusBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
    {
        variants: {
            status: {
                pending: "bg-status-pending/15 text-status-pending border-status-pending/20",
                running: "bg-status-running/15 text-status-running border-status-running/20",
                success: "bg-status-success/15 text-status-success border-status-success/20",
                failed: "bg-status-error/15 text-status-error border-status-error/20",
                warning: "bg-status-warning/15 text-status-warning border-status-warning/20",
                skipped: "bg-muted text-muted-foreground border-border",
            },
            size: {
                sm: "px-2 py-0.5 text-[10px]",
                default: "px-2.5 py-1 text-xs",
                lg: "px-3 py-1.5 text-sm",
            },
        },
        defaultVariants: {
            status: "pending",
            size: "default",
        },
    }
);

const statusIcons = {
    pending: Clock,
    running: Loader2,
    success: CheckCircle2,
    failed: XCircle,
    warning: AlertCircle,
    skipped: MinusCircle,
};

const statusLabels = {
    pending: "Aguardando",
    running: "Executando",
    success: "Concluído",
    failed: "Falhou",
    warning: "Atenção",
    skipped: "Ignorado",
};

export type JobStatus = keyof typeof statusIcons;

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
    status: JobStatus;
    showIcon?: boolean;
    showLabel?: boolean;
    label?: string;
}

export function StatusBadge({
    status,
    size,
    showIcon = true,
    showLabel = true,
    label,
    className,
    ...props
}: StatusBadgeProps) {
    const Icon = statusIcons[status];
    const displayLabel = label || statusLabels[status];

    return (
        <div
            className={cn(statusBadgeVariants({ status, size }), className)}
            {...props}
        >
            {showIcon && (
                <Icon
                    className={cn(
                        "h-3 w-3",
                        status === "running" && "animate-spin"
                    )}
                />
            )}
            {showLabel && <span>{displayLabel}</span>}
        </div>
    );
}
