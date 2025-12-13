"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface QuickActionProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    disabled?: boolean;
    className?: string;
}

export function QuickAction({ label, icon, onClick, variant = "outline", disabled, className }: QuickActionProps) {
    return (
        <Button variant={variant} size="sm" onClick={onClick} disabled={disabled} className={cn("gap-2", className)}>
            {icon}
            {label}
        </Button>
    );
}

interface QuickActionGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function QuickActionGroup({ children, className }: QuickActionGroupProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {children}
        </div>
    );
}
