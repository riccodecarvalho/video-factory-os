"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    className?: string;
}

export function MetricCard({ label, value, icon, className }: MetricCardProps) {
    return (
        <div className={cn("border rounded-lg p-4", className)}>
            <div className="flex items-center gap-2 mb-1">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    );
}
