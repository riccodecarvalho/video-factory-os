"use client";

import * as React from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge, type JobStatus } from "./StatusBadge";
import { MiniPipeline, type PipelineStep } from "./PipelineView";
import { QuickAction, QuickActionGroup } from "./QuickAction";
import { Video, MoreHorizontal } from "lucide-react";

/**
 * JobCard - O coração do dashboard
 * 
 * Mostra: título, recipe, status, mini-pipeline, ações
 * Estado "Running": borda com animação de pulse
 */

export interface JobCardProps {
    id: string;
    title: string;
    recipe: string;
    status: JobStatus;
    progress?: number;
    steps?: PipelineStep[];
    createdAt: string | Date;
    onRetry?: () => void;
    onPreview?: () => void;
    onDownload?: () => void;
    onClick?: () => void;
    className?: string;
}

export function JobCard({
    id,
    title,
    recipe,
    status,
    progress,
    steps = [],
    createdAt,
    onRetry,
    onPreview,
    onDownload,
    onClick,
    className,
}: JobCardProps) {
    const isRunning = status === "running";
    const isFailed = status === "failed";
    const isSuccess = status === "success";

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:border-primary/30",
                isRunning && "border-status-running/50 animate-pulse-glow",
                isFailed && "border-status-error/30",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {/* Progress bar overlay */}
            {isRunning && progress !== undefined && (
                <div
                    className="absolute top-0 left-0 h-1 bg-status-running transition-all"
                    style={{ width: `${progress}%` }}
                />
            )}

            <div className="p-4">
                {/* Header: Icon + Title + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                            <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground truncate">
                                {title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {recipe} • {formatRelativeTime(createdAt)}
                            </p>
                        </div>
                    </div>

                    <StatusBadge status={status} size="sm" />
                </div>

                {/* Mini Pipeline */}
                {steps.length > 0 && (
                    <div className="mb-3">
                        <MiniPipeline steps={steps} />
                    </div>
                )}

                {/* Footer: Actions */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">
                        #{id.slice(0, 8)}
                    </span>

                    <QuickActionGroup className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {isFailed && onRetry && (
                            <QuickAction action="retry" onClick={onRetry} size="sm" />
                        )}
                        {isSuccess && onPreview && (
                            <QuickAction action="preview" onClick={onPreview} size="sm" />
                        )}
                        {isSuccess && onDownload && (
                            <QuickAction action="download" onClick={onDownload} size="sm" />
                        )}
                        <QuickAction action="more" size="sm" />
                    </QuickActionGroup>
                </div>
            </div>
        </Card>
    );
}

/**
 * JobCardSkeleton - Loading state
 */
export function JobCardSkeleton() {
    return (
        <Card className="p-4">
            <div className="flex items-start gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-muted animate-pulse" />
                ))}
            </div>
            <div className="flex justify-between">
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
        </Card>
    );
}
