"use client";

import { StepProps } from "../page";

export default function StepTema({ onGenerate, isLoading }: StepProps) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">💡</span>
                <h2 className="text-2xl font-bold text-white mb-2">Tema Recebido</h2>
                <p className="text-gray-400">
                    Vamos transformar sua ideia em um conceito estruturado
                </p>
            </div>

            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
            >
                {isLoading ? "⏳ Gerando conceito..." : "🎯 Gerar Ideação"}
            </button>
        </div>
    );
}
