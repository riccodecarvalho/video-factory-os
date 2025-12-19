"use client";

import { useEffect, useState } from "react";
import { StepProps } from "../page";

export default function StepProducao({ stepKey, isLoading, onGenerate, onApprove }: StepProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Aguardando...");

    const stepLabels: Record<string, { label: string; icon: string; description: string }> = {
        renderizacao: { label: "Renderização", icon: "🎬", description: "Renderizando vídeo com FFmpeg" },
        exportacao: { label: "Exportação", icon: "📦", description: "Exportando arquivos finais" },
    };

    const current = stepLabels[stepKey] || { label: stepKey, icon: "⚙️", description: "Processando..." };

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setProgress(p => Math.min(p + 5, 95));
            }, 500);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    useEffect(() => {
        if (isLoading) {
            setStatus("Em andamento...");
            setProgress(0);
        }
    }, [isLoading]);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="text-center mb-8">
                <span className="text-6xl mb-4 block">{current.icon}</span>
                <h2 className="text-2xl font-bold text-white mb-2">{current.label}</h2>
                <p className="text-gray-400">{current.description}</p>
            </div>

            {/* Progress */}
            {isLoading ? (
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>{status}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            ) : (
                <button
                    onClick={onGenerate}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 px-6 rounded-xl transition-all mb-4"
                >
                    ▶️ Iniciar {current.label}
                </button>
            )}

            {/* Pipeline Status */}
            <div className="bg-gray-900/50 rounded-xl p-4 mt-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Pipeline de Produção</div>
                <div className="space-y-2">
                    {["renderizacao", "exportacao"].map((key) => {
                        const step = stepLabels[key];
                        const isCurrent = key === stepKey;
                        const isPast = ["renderizacao", "exportacao"].indexOf(key) <
                            ["renderizacao", "exportacao"].indexOf(stepKey);

                        return (
                            <div
                                key={key}
                                className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? "bg-purple-600/20" : ""}`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isPast
                                    ? "bg-green-600 text-white"
                                    : isCurrent
                                        ? "bg-purple-600 text-white animate-pulse"
                                        : "bg-gray-700 text-gray-400"
                                    }`}>
                                    {isPast ? "✓" : step.icon}
                                </span>
                                <span className={isCurrent ? "text-white" : "text-gray-400"}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {!isLoading && progress === 0 && (
                <p className="text-center text-gray-500 text-sm mt-6">
                    Clique para iniciar esta etapa da produção
                </p>
            )}
        </div>
    );
}
