import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, FileX, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "empty" | "error" | "no-results";

interface EmptyStateProps {
    /** Variant determines icon and default messaging */
    variant?: EmptyStateVariant;
    /** Custom icon */
    icon?: LucideIcon;
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Action button */
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
    empty: FileX,
    error: AlertCircle,
    "no-results": Search,
};

/**
 * EmptyState - Estado vazio padrão
 * 
 * Variantes: empty (sem dados), error, no-results (busca)
 */
export function EmptyState({
    variant = "empty",
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    const Icon = icon || variantIcons[variant];

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 text-center",
            className
        )}>
            <div className="rounded-full bg-muted p-4 mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
