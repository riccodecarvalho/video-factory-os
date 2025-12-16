"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FileText, Lightbulb, BookOpen } from "lucide-react";

interface TierExplainerProps {
    className?: string;
    variant?: "cards" | "inline";
}

const tiers = [
    {
        id: "tier1",
        name: "Tier 1",
        label: "Sempre Carrega",
        description: "DNA do projeto, regras base, orchestrator. Usado em TODA execução.",
        icon: FileText,
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        examples: ["Regras de formato", "Persona base", "Constraints globais"],
    },
    {
        id: "tier2",
        name: "Tier 2",
        label: "Por Fase",
        description: "Contexto específico da etapa. Carrega conforme o pipeline.",
        icon: Lightbulb,
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        examples: ["Regras de roteiro", "Estilos de voz", "Templates SSML"],
    },
    {
        id: "tier3",
        name: "Tier 3",
        label: "Sob Demanda",
        description: "Referências e exemplos. Carrega só quando necessário.",
        icon: BookOpen,
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        examples: ["Schemas JSON", "Exemplos de roteiros", "Dados históricos"],
    },
];

export function TierExplainer({ className, variant = "cards" }: TierExplainerProps) {
    if (variant === "inline") {
        return (
            <div className={cn("flex gap-2 flex-wrap", className)}>
                {tiers.map((tier) => (
                    <Badge key={tier.id} variant="outline" className={cn("gap-1", tier.color)}>
                        <tier.icon className="h-3 w-3" />
                        {tier.name}: {tier.label}
                    </Badge>
                ))}
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-3 gap-4", className)}>
            {tiers.map((tier) => (
                <div
                    key={tier.id}
                    className={cn(
                        "rounded-lg border p-4",
                        tier.color
                    )}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <tier.icon className="h-5 w-5" />
                        <div>
                            <span className="font-semibold text-sm">{tier.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {tier.label}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-sm opacity-80 mb-3">{tier.description}</p>
                    <div className="space-y-1">
                        <p className="text-xs font-medium opacity-60 uppercase tracking-wider">
                            Exemplos:
                        </p>
                        <ul className="text-xs opacity-70 space-y-0.5">
                            {tier.examples.map((ex, i) => (
                                <li key={i}>• {ex}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
