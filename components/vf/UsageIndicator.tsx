"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UsageIndicatorProps {
    count: number;
    label?: string;
    onClick?: () => void;
    className?: string;
}

/**
 * UsageIndicator - Badge para mostrar contagem de uso
 * 
 * Usado em providers, recipes, presets para mostrar quantos
 * projetos/steps usam esse recurso.
 */
export function UsageIndicator({
    count,
    label = "usos",
    onClick,
    className,
}: UsageIndicatorProps) {
    const hasUsage = count > 0;

    return (
        <Badge
            variant={hasUsage ? "secondary" : "outline"}
            className={cn(
                "text-xs font-normal",
                hasUsage && "bg-primary/10 text-primary hover:bg-primary/20",
                !hasUsage && "text-muted-foreground",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {count} {label}
        </Badge>
    );
}

/**
 * UsageIndicatorList - Lista de indicadores de uso
 * 
 * Mostra onde um recurso está sendo usado
 */
interface Usage {
    type: "project" | "recipe" | "step";
    name: string;
    id?: string;
}

interface UsageIndicatorListProps {
    usages: Usage[];
    maxVisible?: number;
    className?: string;
}

export function UsageIndicatorList({
    usages,
    maxVisible = 5,
    className,
}: UsageIndicatorListProps) {
    if (usages.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Não está sendo usado em nenhum lugar.
            </p>
        );
    }

    const visible = usages.slice(0, maxVisible);
    const remaining = usages.length - maxVisible;

    const typeLabels = {
        project: "Projeto",
        recipe: "Recipe",
        step: "Step",
    };

    return (
        <div className={cn("space-y-2", className)}>
            {visible.map((usage, index) => (
                <div
                    key={`${usage.type}-${usage.name}-${index}`}
                    className="flex items-center gap-2 text-sm"
                >
                    <Badge variant="outline" className="text-xs">
                        {typeLabels[usage.type]}
                    </Badge>
                    <span className="text-foreground">{usage.name}</span>
                </div>
            ))}
            {remaining > 0 && (
                <p className="text-xs text-muted-foreground">
                    +{remaining} outros usos
                </p>
            )}
        </div>
    );
}
