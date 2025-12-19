"use client";

import { useState } from "react";
import { StepProps } from "../page";

export default function StepRoteiro({ output, isLoading, onGenerate, onRegenerate, onApprove, onBack }: StepProps) {
    const [feedback, setFeedback] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    const wordCount = typeof output === "string"
        ? output.split(/\s+/).filter(w => w.length > 0).length
        : 0;

    const estimatedMinutes = Math.round(wordCount / 130); // ~130 WPM for narration

    if (!output) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">📜</span>
                    <h2 className="text-2xl font-bold text-white mb-2">Roteiro</h2>
                    <p className="text-gray-400">
                        Gerando roteiro completo com mínimo de 6000 palavras
                    </p>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
                >
                    {isLoading ? "⏳ Escrevendo roteiro..." : "📜 Gerar Roteiro"}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">📜 Roteiro Completo</h2>
                    <div className="flex gap-3">
                        <span className="px-3 py-1 bg-purple-600/30 text-purple-400 rounded-full text-xs">
                            {wordCount.toLocaleString()} palavras
                        </span>
                        <span className="px-3 py-1 bg-blue-600/30 text-blue-400 rounded-full text-xs">
                            ~{estimatedMinutes} min
                        </span>
                    </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 mb-4 max-h-[500px] overflow-y-auto">
                    <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
                    </div>
                </div>

                {showFeedback ? (
                    <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Ex: Preciso de mais tensão no ato 3..."
                            rows={3}
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
                                {isLoading ? "⏳" : "🔄 Regenerar"}
                            </button>
                            <button
                                onClick={() => setShowFeedback(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowFeedback(true)}
                        className="text-purple-400 hover:text-purple-300 text-sm underline"
                    >
                        🔄 Regenerar com feedback
                    </button>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
                >
                    ← Voltar
                </button>
                <button
                    onClick={() => onApprove()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                    🎬 Aprovar e Produzir
                </button>
            </div>
        </div>
    );
}
