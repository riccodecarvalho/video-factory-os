"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, HelpCircle, Lightbulb } from "lucide-react";
import { Button } from "./button";

interface ContextBannerProps {
    title: string;
    description: string;
    tips?: string[];
    variant?: "info" | "help" | "tip";
    defaultOpen?: boolean;
    className?: string;
}

const variantStyles = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    help: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    tip: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
};

const variantIcons = {
    info: HelpCircle,
    help: HelpCircle,
    tip: Lightbulb,
};

export function ContextBanner({
    title,
    description,
    tips,
    variant = "info",
    defaultOpen = false,
    className,
}: ContextBannerProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const Icon = variantIcons[variant];

    return (
        <div
            className={cn(
                "rounded-lg border p-4 mb-4",
                variantStyles[variant],
                className
            )}
        >
            <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm">{title}</h4>
                        {tips && tips.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs opacity-70 hover:opacity-100"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                                {isOpen ? "Menos" : "Dicas"}
                            </Button>
                        )}
                    </div>
                    <p className="text-sm opacity-90 mt-1">{description}</p>

                    {isOpen && tips && tips.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                            {tips.map((tip, i) => (
                                <li key={i} className="text-sm opacity-80 flex items-start gap-2">
                                    <span className="font-mono text-xs bg-background/50 px-1.5 py-0.5 rounded">
                                        {i + 1}
                                    </span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
