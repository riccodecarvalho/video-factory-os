"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * MetricCard - Card de métrica (custo, tempo, tokens)
 * 
 * Estilo: Borda glass, fundo gradiente sutil
 * Conteúdo: Label (muted), Valor (Big & Mono), Trend (+/- color)
 */

export interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    trend?: {
        value: number;
        label?: string;
    };
    icon?: LucideIcon;
    className?: string;
}

export function MetricCard({
    label,
    value,
    unit,
    trend,
    icon: Icon,
    className,
}: MetricCardProps) {
    const trendDirection = trend
        ? trend.value > 0
            ? "up"
            : trend.value < 0
                ? "down"
                : "neutral"
        : null;

    const TrendIcon = trendDirection === "up"
        ? TrendingUp
        : trendDirection === "down"
            ? TrendingDown
            : Minus;

    return (
        <div className={cn(
            "relative rounded-lg border bg-card p-4 overflow-hidden",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:pointer-events-none",
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-mono tracking-tight">
                            {value}
                        </span>
                        {unit && (
                            <span className="text-sm text-muted-foreground">{unit}</span>
                        )}
                    </div>
                </div>

                {Icon && (
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                )}
            </div>

            {trend && (
                <div className={cn(
                    "mt-3 flex items-center gap-1 text-xs font-medium",
                    trendDirection === "up" && "text-status-success",
                    trendDirection === "down" && "text-status-error",
                    trendDirection === "neutral" && "text-muted-foreground"
                )}>
                    <TrendIcon className="h-3 w-3" />
                    <span>
                        {trend.value > 0 ? "+" : ""}{trend.value}%
                    </span>
                    {trend.label && (
                        <span className="text-muted-foreground">{trend.label}</span>
                    )}
                </div>
            )}
        </div>
    );
}
