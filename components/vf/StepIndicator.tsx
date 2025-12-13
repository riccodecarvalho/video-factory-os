"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Check,
    X,
    Loader2,
    Circle
} from "lucide-react";

type JobStatus = "pending" | "running" | "success" | "failed" | "warning" | "skipped";

/**
 * StepIndicator - Indicador visual de um step no pipeline
 * 
 * Variantes:
 * - icon: Mostra ícone (check, x, spinner, dot)
 * - minimal: Apenas o ponto colorido com glow
 */

export interface StepIndicatorProps {
    status: JobStatus;
    variant?: "icon" | "minimal";
    label?: string;
    isActive?: boolean;
    onClick?: () => void;
    size?: "sm" | "default" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
};

const iconSizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
};

const statusColors = {
    pending: "bg-muted border-border text-muted-foreground",
    running: "bg-status-running/20 border-status-running text-status-running",
    success: "bg-status-success/20 border-status-success text-status-success",
    failed: "bg-status-error/20 border-status-error text-status-error",
    warning: "bg-status-warning/20 border-status-warning text-status-warning",
    skipped: "bg-muted border-muted-foreground/30 text-muted-foreground",
};

const StatusIcon = ({ status, size }: { status: JobStatus; size: "sm" | "default" | "lg" }) => {
    const iconClass = cn(iconSizeClasses[size]);

    switch (status) {
        case "success":
            return <Check className={iconClass} />;
        case "failed":
            return <X className={iconClass} />;
        case "running":
            return <Loader2 className={cn(iconClass, "animate-spin")} />;
        case "pending":
        case "skipped":
        default:
            return <Circle className={cn(iconClass, "fill-current")} />;
    }
};

export function StepIndicator({
    status,
    variant = "icon",
    label,
    isActive = false,
    onClick,
    size = "default",
    className,
}: StepIndicatorProps) {
    const isClickable = !!onClick;

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <button
                type="button"
                onClick={onClick}
                disabled={!isClickable}
                className={cn(
                    "rounded-full border-2 flex items-center justify-center transition-all",
                    sizeClasses[size],
                    statusColors[status],
                    isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    status === "running" && "animate-pulse-glow",
                    isClickable && "cursor-pointer hover:scale-110",
                    !isClickable && "cursor-default"
                )}
            >
                {variant === "icon" ? (
                    <StatusIcon status={status} size={size} />
                ) : (
                    <div className={cn(
                        "rounded-full",
                        size === "sm" && "h-2 w-2",
                        size === "default" && "h-3 w-3",
                        size === "lg" && "h-4 w-4",
                        status === "pending" ? "bg-muted-foreground" : "bg-current"
                    )} />
                )}
            </button>

            {label && (
                <span className={cn(
                    "text-xs font-medium text-muted-foreground",
                    isActive && "text-foreground"
                )}>
                    {label}
                </span>
            )}
        </div>
    );
}
