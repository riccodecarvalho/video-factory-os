"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppShell } from "@/components/layout";
import { Play, Video, Loader2 } from "lucide-react";
import { getRecipes, getProjects } from "@/app/admin/actions";
import { createJob, startJob } from "../actions";

type Recipe = Awaited<ReturnType<typeof getRecipes>>[0];
type Project = Awaited<ReturnType<typeof getProjects>>[0];

export default function NewJobPage() {
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [title, setTitle] = useState("");
    const [brief, setBrief] = useState("");
    const [isPending, startTransition] = useTransition();

    // Load recipes and projects from DB
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
            // Default to first project
            if (projectsData.length > 0) {
                setSelectedProjectId(projectsData[0].id);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecipe || !title || !selectedProjectId) return;

        startTransition(async () => {
            const job = await createJob(selectedRecipe.id, selectedProjectId, {
                title,
                brief,
                tema: title,
            });
            router.push(`/jobs?id=${job.id}`);
        });
    };

    const handleStartImmediately = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecipe || !title || !selectedProjectId) return;

        startTransition(async () => {
            const job = await createJob(selectedRecipe.id, selectedProjectId, {
                title,
                brief,
                tema: title,
            });
            await startJob(job.id);
            router.push(`/jobs?id=${job.id}`);
        });
    };

    return (
        <AppShell
            breadcrumb={[
                { label: "Produção", href: "/jobs" },
                { label: "Nova Produção" },
            ]}
            title="Nova Produção"
            description="Configure e inicie um novo vídeo"
        >
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
                {/* Step 1: Select Project */}
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

                {/* Step 2: Select Recipe */}
                {selectedProjectId && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">2. Escolha a Recipe</h2>
                            <p className="text-sm text-muted-foreground">
                                Selecione o tipo de vídeo que deseja criar
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {recipes.map((recipe) => {
                                const isSelected = selectedRecipe?.id === recipe.id;

                                return (
                                    <Card
                                        key={recipe.id}
                                        className={`cursor-pointer transition-all ${isSelected
                                            ? "border-primary bg-primary/5"
                                            : "hover:border-primary/50"
                                            }`}
                                        onClick={() => setSelectedRecipe(recipe)}
                                    >
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="rounded-lg bg-primary/10 p-3">
                                                <Video className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{recipe.name}</CardTitle>
                                                <CardDescription>
                                                    {recipe.description || recipe.slug}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                );
                            })}

                            {recipes.length === 0 && !isPending && (
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma recipe disponível. Execute o seed primeiro.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Input */}
                {selectedRecipe && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">3. Defina o Conteúdo</h2>
                            <p className="text-sm text-muted-foreground">
                                Informe o título e brief do vídeo
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título / Tema</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Mi mamá me desheredó por casarme sin su permiso"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brief">Brief (opcional)</Label>
                                <Textarea
                                    id="brief"
                                    placeholder="Descrição adicional, contexto, personagens..."
                                    value={brief}
                                    onChange={(e) => setBrief(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {selectedRecipe && title && (
                    <div className="flex gap-4 pt-4 border-t">
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Criar Job
                        </Button>
                        <Button
                            type="button"
                            onClick={handleStartImmediately}
                            disabled={isPending}
                            className="gap-2"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            Criar e Executar
                        </Button>
                    </div>
                )}
            </form>
        </AppShell>
    );
}
