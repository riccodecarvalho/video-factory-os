"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Play, CheckCircle, XCircle, Loader2, FileJson, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_TIMELINE = {
    version: "1.0",
    metadata: {
        title: "Timeline de Teste",
        duration: 60,
        fps: 30,
        resolution: { width: 1920, height: 1080 }
    },
    scenes: [
        {
            id: "scene-1",
            name: "Intro",
            start: 0,
            end: 10,
            elements: [
                {
                    id: "text-1",
                    type: "text",
                    content: "Bem-vindo!",
                    start: 0,
                    end: 10,
                    position: { x: 50, y: 50 },
                    style: { fontSize: 48, fontFamily: "Arial", color: "#ffffff" }
                }
            ]
        }
    ]
};

export default function TimelineTestPage() {
    const [timelineJson, setTimelineJson] = useState(JSON.stringify(EXAMPLE_TIMELINE, null, 2));
    const [result, setResult] = useState<{ success: boolean; message: string; data?: Record<string, unknown> } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleValidate = async () => {
        setLoading(true);
        try {
            const timeline = JSON.parse(timelineJson);

            // Validação básica de estrutura
            if (!timeline.version || !timeline.metadata || !timeline.scenes) {
                throw new Error("Timeline inválida: falta version, metadata ou scenes");
            }

            setResult({
                success: true,
                message: "Timeline válida!",
                data: {
                    scenes: timeline.scenes.length,
                    elements: timeline.scenes.reduce((acc: number, s: { elements?: unknown[] }) =>
                        acc + (s.elements?.length || 0), 0),
                    duration: timeline.metadata.duration
                }
            });
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
        setLoading(false);
    };

    const handleSubmitJob = async () => {
        setLoading(true);
        try {
            const timeline = JSON.parse(timelineJson);

            const response = await fetch("/api/render/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipeSlug: "test-timeline",
                    input: { tema: "Timeline Test" },
                    useTimelineDSL: true,
                    timeline: timeline
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao submeter job");
            }

            setResult({
                success: true,
                message: `Job criado com sucesso!`,
                data: { jobId: data.jobId, status: data.status }
            });
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Clapperboard className="w-6 h-6" />
                    Timeline DSL - Página de Teste
                </h1>
                <p className="text-muted-foreground mt-1">
                    Teste a Timeline DSL do Render Engine (JSON2Video inspirado)
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileJson className="w-5 h-5" />
                            Timeline JSON
                        </CardTitle>
                        <CardDescription>
                            Cole ou edite uma Timeline DSL para validar e testar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={timelineJson}
                            onChange={(e) => setTimelineJson(e.target.value)}
                            className="font-mono text-sm h-80"
                            placeholder="Cole o JSON da Timeline aqui..."
                        />

                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleValidate} disabled={loading}>
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Validar
                            </Button>
                            <Button onClick={handleSubmitJob} disabled={loading} variant="secondary">
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4 mr-2" />
                                )}
                                Submeter Job
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card className={cn(
                        "border-2",
                        result.success ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"
                    )}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                {result.success ? "Sucesso" : "Erro"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{result.message}</p>
                            {result.data && (
                                <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>📚 Documentação</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>lib/timeline/schema.ts</strong> - Schema Zod da Timeline</li>
                            <li><strong>lib/timeline/validator.ts</strong> - Validação completa</li>
                            <li><strong>lib/timeline/compiler.ts</strong> - Timeline → RenderPlan</li>
                            <li><strong>ADR-013</strong> - Arquitetura Timeline DSL</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
