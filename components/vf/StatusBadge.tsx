"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "pending" | "running" | "completed" | "failed" | "cancelled" | "success" | "skipped";

interface StatusBadgeProps {
    status: Status;
    className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
    pending: { label: "Pendente", className: "bg-muted text-muted-foreground" },
    running: { label: "Executando", className: "bg-status-running/10 text-status-running" },
    completed: { label: "Concluído", className: "bg-status-success/10 text-status-success" },
    success: { label: "Sucesso", className: "bg-status-success/10 text-status-success" },
    failed: { label: "Falha", className: "bg-status-error/10 text-status-error" },
    cancelled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
    skipped: { label: "Ignorado", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.pending;

    return (
        <Badge className={cn(config.className, className)}>
            {config.label}
        </Badge>
    );
}
