"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

interface JobCardProps {
    id: string;
    title: string;
    recipe: string;
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    progress?: number;
    createdAt: string;
    className?: string;
}

export function JobCard({ id, title, recipe, status, progress, createdAt, className }: JobCardProps) {
    return (
        <Link href={`/jobs?id=${id}`}>
            <div className={cn("border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer", className)}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{title}</h3>
                        <p className="text-sm text-muted-foreground">{recipe}</p>
                    </div>
                    <StatusBadge status={status} />
                </div>
                {status === "running" && progress !== undefined && (
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div className="bg-status-running h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                    {new Date(createdAt).toLocaleString("pt-BR")}
                </p>
            </div>
        </Link>
    );
}

export function JobCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("border rounded-lg p-4 animate-pulse", className)}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                </div>
                <div className="h-5 bg-muted rounded w-16" />
            </div>
            <div className="h-3 bg-muted rounded w-1/4 mt-2" />
        </div>
    );
}
