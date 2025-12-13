"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    RotateCcw,
    Play,
    Pause,
    Download,
    Eye,
    Trash2,
    MoreHorizontal,
    type LucideIcon
} from "lucide-react";

/**
 * QuickAction - Botões icon-only para alta densidade
 * 
 * Estilo: Ghost com hover background
 * Requisito: Tooltip sempre obrigatório (acessibilidade)
 */

export type QuickActionType =
    | "retry"
    | "play"
    | "pause"
    | "download"
    | "preview"
    | "delete"
    | "more";

const actionConfig: Record<QuickActionType, { icon: LucideIcon; label: string }> = {
    retry: { icon: RotateCcw, label: "Tentar novamente" },
    play: { icon: Play, label: "Executar" },
    pause: { icon: Pause, label: "Pausar" },
    download: { icon: Download, label: "Baixar" },
    preview: { icon: Eye, label: "Visualizar" },
    delete: { icon: Trash2, label: "Excluir" },
    more: { icon: MoreHorizontal, label: "Mais opções" },
};

export interface QuickActionProps {
    action: QuickActionType;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    size?: "sm" | "default" | "lg";
    variant?: "ghost" | "outline" | "destructive";
    className?: string;
}

export function QuickAction({
    action,
    onClick,
    disabled = false,
    loading = false,
    size = "default",
    variant = "ghost",
    className,
}: QuickActionProps) {
    const { icon: Icon, label } = actionConfig[action];

    const sizeClass = {
        sm: "h-7 w-7",
        default: "h-9 w-9",
        lg: "h-11 w-11",
    };

    const iconSizeClass = {
        sm: "h-3.5 w-3.5",
        default: "h-4 w-4",
        lg: "h-5 w-5",
    };

    return (
        <Button
            variant={action === "delete" ? "destructive" : variant}
            size="icon"
            onClick={onClick}
            disabled={disabled || loading}
            title={label}
            aria-label={label}
            className={cn(
                sizeClass[size],
                "transition-all",
                variant === "ghost" && "hover:bg-white/10",
                className
            )}
        >
            <Icon className={cn(
                iconSizeClass[size],
                loading && "animate-spin"
            )} />
        </Button>
    );
}

/**
 * QuickActionGroup - Agrupa múltiplas ações
 */
export interface QuickActionGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function QuickActionGroup({ children, className }: QuickActionGroupProps) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {children}
        </div>
    );
}
