"use client";

import { useState } from "react";
import { StepProps } from "../page";

export default function StepTags({ output, isLoading, onGenerate, onRegenerate, onApprove, onBack }: StepProps) {
    const [feedback, setFeedback] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    // Parse tags from output
    const tags: string[] = (() => {
        if (!output) return [];
        if (typeof output === "string") {
            // Try to parse comma-separated or newline-separated tags
            if (output.includes(",")) {
                return output.split(",").map(t => t.trim()).filter(Boolean);
            }
            return output.split("\n").map(t => t.trim().replace(/^#/, "")).filter(Boolean);
        }
        if (Array.isArray(output)) return output;
        return [];
    })();

    if (!output) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🏷️</span>
                    <h2 className="text-2xl font-bold text-white mb-2">Tags & Hashtags</h2>
                    <p className="text-gray-400">
                        Gerando tags otimizadas para alcance no YouTube
                    </p>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
                >
                    {isLoading ? "⏳ Gerando tags..." : "🏷️ Gerar Tags"}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">🏷️ Tags Geradas</h2>
                    <span className="px-3 py-1 bg-green-600/30 text-green-400 rounded-full text-xs">
                        {tags.length} tags
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 bg-gray-900/50 rounded-xl p-4">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition cursor-default"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Copy All Button */}
                <button
                    onClick={() => navigator.clipboard.writeText(tags.map(t => `#${t}`).join(" "))}
                    className="mt-4 text-sm text-gray-400 hover:text-white transition flex items-center gap-2"
                >
                    📋 Copiar todas as tags
                </button>

                {showFeedback ? (
                    <div className="mt-4 bg-gray-700/50 rounded-xl p-4">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Ex: Adiciona mais tags sobre familia..."
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
                    <button onClick={() => setShowFeedback(true)} className="mt-2 text-purple-400 hover:text-purple-300 text-sm underline">
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
                    ✅ Aprovar Tags
                </button>
            </div>
        </div>
    );
}
