"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IterateWithAI } from "@/components/vf";
import { CheckCircle, RotateCcw } from "lucide-react";

interface WizardApprovalActionsProps {
    jobId: string;
    stepKey: string;
    onApprove: () => Promise<void>;
    onRegenerate: (stepKey: string) => Promise<void>;
    onIterateWithInstruction: (stepKey: string, instruction: string) => Promise<void>;
}

export function WizardApprovalActions({
    jobId,
    stepKey,
    onApprove,
    onRegenerate,
    onIterateWithInstruction,
}: WizardApprovalActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [showIterate, setShowIterate] = useState(false);

    const handleApprove = () => {
        startTransition(async () => {
            await onApprove();
        });
    };

    const handleRegenerate = () => {
        startTransition(async () => {
            await onRegenerate(stepKey);
        });
    };

    const handleIterate = (instruction: string) => {
        startTransition(async () => {
            await onIterateWithInstruction(stepKey, instruction);
        });
    };

    return (
        <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 space-y-4">
                {/* Main Actions */}
                <div className="flex gap-4">
                    <Button
                        onClick={handleApprove}
                        disabled={isPending}
                        className="flex-1 gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        {isPending ? "Processando..." : "Aprovar e Continuar"}
                    </Button>
                    <Button
                        onClick={handleRegenerate}
                        disabled={isPending}
                        variant="outline"
                        className="gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Regenerar
                    </Button>
                </div>

                {/* Toggle Iterate */}
                {!showIterate ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowIterate(true)}
                        className="w-full text-muted-foreground"
                    >
                        ✨ Iterar com instrução customizada
                    </Button>
                ) : (
                    <IterateWithAI
                        onIterate={handleIterate}
                        isLoading={isPending}
                        placeholder="Ex: Mais dramático, mencione o vilão no início..."
                        suggestions={[
                            "Mais dramático",
                            "Mais curto",
                            "Mais suspense",
                            "Mais diálogos",
                        ]}
                    />
                )}
            </CardContent>
        </Card>
    );
}
