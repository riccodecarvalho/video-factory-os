"use client";

import { useState } from "react";
import { StepProps } from "../page";

export default function StepMiniaturas({ output, isLoading, onGenerate, onRegenerate, onApprove, onBack }: StepProps) {
    const [feedback, setFeedback] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    // Parse miniatures suggestions from output
    const miniatures: string[] = (() => {
        if (!output) return [];
        if (typeof output === "string") {
            return output.split("\n").filter(l => l.trim()).slice(0, 5);
        }
        return [];
    })();

    if (!output) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🖼️</span>
                    <h2 className="text-2xl font-bold text-white mb-2">Miniaturas</h2>
                    <p className="text-gray-400">
                        Gerando 5 conceitos de miniaturas com elementos visuais impactantes
                    </p>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
                >
                    {isLoading ? "⏳ Gerando miniaturas..." : "🖼️ Gerar Conceitos"}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">🖼️ Conceitos de Miniaturas</h2>
                    <span className="px-3 py-1 bg-orange-600/30 text-orange-400 rounded-full text-xs">
                        Ideias Visuais
                    </span>
                </div>

                <div className="space-y-4">
                    {miniatures.map((miniature, i) => (
                        <div key={i} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center text-sm font-bold">
                                    {i + 1}
                                </span>
                                <p className="text-gray-300 flex-1">{miniature}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {showFeedback ? (
                    <div className="mt-4 bg-gray-700/50 rounded-xl p-4">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Ex: Quero miniaturas mais dramáticas..."
                            rows={2}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => {
                                    onRegenerate(feedback);
                                    setShowFeedback(false);
                                    setFeedback("");
                                }}
                                disabled={!feedback.trim() || isLoading}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm"
                            >
                                🔄 Regenerar
                            </button>
                            <button onClick={() => setShowFeedback(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm">
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowFeedback(true)} className="mt-4 text-purple-400 hover:text-purple-300 text-sm underline">
                        🔄 Regenerar com feedback
                    </button>
                )}
            </div>

            <div className="flex gap-4">
                <button onClick={onBack} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition">
                    ← Voltar
                </button>
                <button
                    onClick={() => onApprove()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                    ✅ Aprovar Conceitos
                </button>
            </div>
        </div>
    );
}
