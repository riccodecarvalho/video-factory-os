"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProjects, getRecipes } from "@/app/jobs/actions";
import { createWizardJob } from "@/lib/engine/wizard-runner";

type Project = { id: string; key: string; name: string };
type Recipe = { id: string; slug: string; name: string };

export default function WizardPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedRecipeId, setSelectedRecipeId] = useState("");
    const [tema, setTema] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            const [projectsData, recipesData] = await Promise.all([
                getProjects(),
                getRecipes(),
            ]);
            setProjects(projectsData);
            setRecipes(recipesData);
            if (projectsData.length > 0) {
                setSelectedProjectId(projectsData[0].id);
            }
            if (recipesData.length > 0) {
                setSelectedRecipeId(recipesData[0].id);
            }
        }
        loadData();
    }, []);

    const handleStart = async () => {
        if (!selectedProjectId || !selectedRecipeId || !tema.trim()) return;

        setIsLoading(true);
        try {
            const { jobId: newJobId } = await createWizardJob(
                selectedRecipeId,
                selectedProjectId,
                { tema: tema.trim() }
            );
            router.push(`/wizard/${newJobId}`);
        } catch (error) {
            console.error("Error creating wizard job:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
                        🎬 Wizard de Criação
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Crie vídeos passo a passo com controle total sobre cada etapa
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                    {/* Project Select */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Projeto
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        >
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Recipe Select */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Recipe
                        </label>
                        <select
                            value={selectedRecipeId}
                            onChange={(e) => setSelectedRecipeId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        >
                            {recipes.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tema Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            💡 Tema / Ideia
                        </label>
                        <textarea
                            value={tema}
                            onChange={(e) => setTema(e.target.value)}
                            placeholder="Ex: velha motorista de van humilhada por pais ricos bilionária..."
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Pode ser bagunçado! O sistema vai estruturar para você.
                        </p>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStart}
                        disabled={!tema.trim() || isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Iniciando...
                            </>
                        ) : (
                            <>
                                🚀 Iniciar Wizard
                            </>
                        )}
                    </button>
                </div>

                {/* Info */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>O wizard guiará você por cada etapa:</p>
                    <p className="mt-1">Ideação → Títulos → Planejamento → Roteiro → Produção</p>
                </div>
            </div>
        </div>
    );
}
