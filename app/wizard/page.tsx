"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppShell } from "@/components/layout";
import { Wand2, Loader2 } from "lucide-react";
import { getRecipes, getProjects } from "@/app/admin/actions";
import { createJob, startJob } from "@/app/jobs/actions";

type Recipe = Awaited<ReturnType<typeof getRecipes>>[0];
type Project = Awaited<ReturnType<typeof getProjects>>[0];

export default function WizardEntryPage() {
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [tema, setTema] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const [recipesData, projectsData] = await Promise.all([
                getRecipes(),
                getProjects()
            ]);
            setRecipes(recipesData);
            setProjects(projectsData.filter(p => p.isActive));
            if (recipesData.length === 1) {
                setSelectedRecipe(recipesData[0]);
            }
            if (projectsData.length > 0) {
                setSelectedProjectId(projectsData[0].id);
            }
        });
    }, []);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecipe || !tema || !selectedProjectId) return;

        startTransition(async () => {
            const job = await createJob(selectedRecipe.id, selectedProjectId, {
                tema,
                title: tema,
                brief: "",
            }, "wizard"); // executionMode = wizard

            // Iniciar job para criar os steps via runner
            await startJob(job.id);

            router.push(`/wizard/${job.id}`);
        });
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background overflow-auto">
            {/* Breadcrumb e Header (Replicando estilo do AppShell/JobId Page) */}
            <div className="border-b bg-card/50">
                <div className="container py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="hover:text-foreground flex items-center gap-1 cursor-pointer" onClick={() => router.push("/jobs")}>
                            Produção
                        </span>
                        <span>/</span>
                        <span className="text-foreground">Wizard</span>
                    </div>
                </div>
            </div>

            <div className="container py-8 max-w-2xl">
                <div className="mb-8 space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Wizard de Criação</h1>
                    <p className="text-muted-foreground">
                        Crie um vídeo passo a passo com aprovação em cada etapa
                    </p>
                </div>

                <form onSubmit={handleStart} className="space-y-8 pb-20">
                    {/* Step 1: Projeto */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">1. Selecione o Projeto</h2>
                            <p className="text-sm text-muted-foreground">
                                Escolha o canal/projeto para este vídeo
                            </p>
                        </div>

                        <div className="max-w-sm">
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um projeto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Step 2: Recipe */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">2. Selecione a Recipe</h2>
                            <p className="text-sm text-muted-foreground">
                                Escolha o pipeline de produção
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {recipes.map((recipe) => (
                                <Card
                                    key={recipe.id}
                                    className={`cursor-pointer transition-colors ${selectedRecipe?.id === recipe.id
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-muted-foreground/50"
                                        }`}
                                    onClick={() => setSelectedRecipe(recipe)}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">{recipe.name}</CardTitle>
                                        <CardDescription className="text-xs">
                                            {(() => {
                                                try {
                                                    const p = typeof recipe.pipeline === "string"
                                                        ? JSON.parse(recipe.pipeline)
                                                        : recipe.pipeline;
                                                    return Array.isArray(p) ? p.length : 0;
                                                } catch { return 0; }
                                            })()} etapas
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Tema */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">3. Defina o Tema</h2>
                            <p className="text-sm text-muted-foreground">
                                Descreva o tema do vídeo que deseja criar
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tema">Tema</Label>
                            <Textarea
                                id="tema"
                                placeholder="Ex: Una mujer descubre que su marido la engaña con su mejor amiga..."
                                value={tema}
                                onChange={(e) => setTema(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isPending || !selectedRecipe || !tema || !selectedProjectId}
                        className="w-full"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Iniciar Wizard
                    </Button>
                </form>
            </div>
        </div>
    );
}
