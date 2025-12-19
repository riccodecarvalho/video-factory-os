"use client";

import { useState } from "react";
import { StepProps } from "../page";

export default function StepTitulos({ output, isLoading, onGenerate, onRegenerate, onApprove, onBack }: StepProps) {
    const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
    const [feedback, setFeedback] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    // Parse titles from output (expect array or string with multiple titles)
    const titles: string[] = (() => {
        if (!output) return [];
        if (Array.isArray(output)) return output;
        if (typeof output === "string") {
            // Try to parse numbered list
            const lines = output.split("\n").filter(l => l.trim());
            return lines.map(l => l.replace(/^\d+[\.\)]\s*/, "").trim()).filter(Boolean);
        }
        return [];
    })();

    if (!output) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">📝</span>
                    <h2 className="text-2xl font-bold text-white mb-2">Títulos Virais</h2>
                    <p className="text-gray-400">
                        Gerando 5-8 opções de títulos com gatilhos de curiosidade
                    </p>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
                >
                    {isLoading ? "⏳ Gerando títulos..." : "📝 Gerar Títulos"}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Titles Grid */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">📝 Escolha um Título</h2>
                    <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg text-sm transition"
                    >
                        {isLoading ? "⏳" : "+5 Novos"}
                    </button>
                </div>

                <div className="space-y-3">
                    {titles.map((title, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedTitle(title)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedTitle === title
                                    ? "border-purple-500 bg-purple-600/20"
                                    : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${selectedTitle === title
                                        ? "bg-purple-500 text-white"
                                        : "bg-gray-600 text-gray-300"
                                    }`}>
                                    {selectedTitle === title ? "✓" : i + 1}
                                </span>
                                <span className="text-white flex-1">{title}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Selected Preview */}
                {selectedTitle && (
                    <div className="mt-4 p-4 bg-green-600/10 border border-green-600/30 rounded-xl">
                        <div className="text-xs text-green-400 mb-1">Título selecionado:</div>
                        <div className="text-white font-medium">{selectedTitle}</div>
                    </div>
                )}

                {/* Feedback */}
                {showFeedback ? (
                    <div className="mt-4 bg-gray-700/50 rounded-xl p-4">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Ex: Quero títulos mais curtos..."
                            rows={2}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none mb-3"
                        />
                        <div className="flex gap-2">
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
                        className="mt-4 text-purple-400 hover:text-purple-300 text-sm underline"
                    >
                        🔄 Regenerar com feedback
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
                >
                    ← Voltar
                </button>
                <button
                    onClick={() => onApprove(selectedTitle || undefined)}
                    disabled={!selectedTitle}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                    ✅ Aprovar Título
                </button>
            </div>
        </div>
    );
}
