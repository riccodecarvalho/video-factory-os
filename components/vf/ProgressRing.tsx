"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ProgressRing - Progresso circular para jobs
 */

export interface ProgressRingProps {
    value: number;
    max?: number;
    size?: "sm" | "default" | "lg";
    showPercent?: boolean;
    className?: string;
}

const sizeConfig = {
    sm: { size: 32, stroke: 3 },
    default: { size: 48, stroke: 4 },
    lg: { size: 64, stroke: 5 },
};

export function ProgressRing({
    value,
    max = 100,
    size = "default",
    showPercent = true,
    className,
}: ProgressRingProps) {
    const config = sizeConfig[size];
    const radius = (config.size - config.stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const percent = Math.min(Math.max(value / max, 0), 1);
    const offset = circumference - percent * circumference;

    return (
        <div
            className={cn("relative inline-flex items-center justify-center", className)}
            style={{ width: config.size, height: config.size }}
        >
            <svg
                className="transform -rotate-90"
                width={config.size}
                height={config.size}
            >
                {/* Background circle */}
                <circle
                    className="text-muted"
                    strokeWidth={config.stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={config.size / 2}
                    cy={config.size / 2}
                />
                {/* Progress circle */}
                <circle
                    className="text-primary transition-all duration-300 ease-in-out"
                    strokeWidth={config.stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={config.size / 2}
                    cy={config.size / 2}
                />
            </svg>

            {showPercent && (
                <span className={cn(
                    "absolute font-mono font-medium",
                    size === "sm" && "text-[10px]",
                    size === "default" && "text-xs",
                    size === "lg" && "text-sm"
                )}>
                    {Math.round(percent * 100)}%
                </span>
            )}
        </div>
    );
}
