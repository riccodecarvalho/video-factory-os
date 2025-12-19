"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SplitViewProps {
    /** Left panel content (list) */
    list: ReactNode;
    /** Right panel content (detail) */
    detail: ReactNode;
    /** Loading state */
    isLoading?: boolean;
    /** Empty state (no items) */
    isEmpty?: boolean;
    /** Empty state component */
    emptyState?: ReactNode;
    /** List panel width */
    listWidth?: "1/3" | "1/4" | "2/5";
    className?: string;
}

/**
 * SplitView - Layout lista + detalhe
 * 
 * Pattern 4pice: lista à esquerda, detalhe à direita
 * Estados: loading, empty, selected
 */
export function SplitView({
    list,
    detail,
    isLoading = false,
    isEmpty = false,
    emptyState,
    listWidth = "1/3",
    className,
}: SplitViewProps) {
    const widthClasses = {
        "1/3": "w-1/3",
        "1/4": "w-1/4",
        "2/5": "w-2/5",
    };

    if (isLoading) {
        return (
            <div className={cn("flex items-center justify-center h-96", className)}>
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isEmpty && emptyState) {
        return <div className={className}>{emptyState}</div>;
    }

    return (
        <div className={cn("flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-card", className)}>
            {/* List Panel */}
            <div
                className={cn(
                    "border-r overflow-y-auto",
                    widthClasses[listWidth]
                )}
            >
                {list}
            </div>

            {/* Detail Panel */}
            <div className="flex-1 overflow-y-auto">
                {detail}
            </div>
        </div>
    );
}

// Sub-component: List Item
interface SplitViewListItemProps {
    title: string;
    subtitle?: React.ReactNode;
    meta?: React.ReactNode;
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
}

export function SplitViewListItem({
    title,
    subtitle,
    meta,
    isActive = false,
    onClick,
    className,
}: SplitViewListItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-4 py-3 border-b transition-colors",
                isActive
                    ? "bg-primary/5 border-l-4 border-l-primary"
                    : "hover:bg-muted/50",
                className
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        isActive && "text-primary"
                    )}>
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
                {meta && (
                    <span className="text-xs text-muted-foreground shrink-0">
                        {meta}
                    </span>
                )}
            </div>
        </button>
    );
}

// Sub-component: Detail Panel
interface SplitViewDetailProps {
    children: ReactNode;
    className?: string;
}

export function SplitViewDetail({ children, className }: SplitViewDetailProps) {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
}

// Sub-component: Detail Empty
export function SplitViewDetailEmpty() {
    return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Selecione um item para ver detalhes</p>
        </div>
    );
}
