"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    FileText,
    Clock,
    Type,
    Maximize2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WPM = 150; // Words per minute for duration estimation

interface StepPreviewProps {
    jobId: string;
    stepKey: string;
    status: "pending" | "running" | "success" | "failed" | "skipped";
    className?: string;
}

interface ArtifactContent {
    text: string;
    wordCount: number;
    charCount: number;
    estimatedDuration: number; // in minutes
    isJson: boolean;
    parsedJson?: any;
    summary?: Record<string, string>;
}

// Extract key fields from JSON for summary
function extractJsonSummary(json: Record<string, unknown>): Record<string, string> {
    const summary: Record<string, string> = {};

    // Try to find protagonist name
    if (json.protagonista && typeof json.protagonista === "object") {
        const prot = json.protagonista as Record<string, string>;
        if (prot.nombre) summary["Protagonista"] = prot.nombre;
        if (prot.edad) summary["Edad"] = prot.edad;
    }

    // Try to find antagonist name
    if (json.antagonista && typeof json.antagonista === "object") {
        const ant = json.antagonista as Record<string, string>;
        if (ant.nombre) summary["Antagonista"] = ant.nombre;
    }

    // Hook type
    if (json.seleccion_automatica && typeof json.seleccion_automatica === "object") {
        const sel = json.seleccion_automatica as Record<string, string>;
        if (sel.hook_tipo) summary["Hook"] = sel.hook_tipo;
    }

    // Título
    if (json.titulo && typeof json.titulo === "string") {
        summary["Título"] = json.titulo.substring(0, 60) + (json.titulo.length > 60 ? "..." : "");
    }

    return summary;
}

function parseArtifactContent(text: string): ArtifactContent {
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;
    const estimatedDuration = Math.round((wordCount / WPM) * 10) / 10;

    let isJson = false;
    let summary: Record<string, string> | undefined;
    let parsedJson: any = null;

    try {
        // Try to parse as JSON
        const parsed = JSON.parse(text);
        isJson = true;
        parsedJson = parsed;
        summary = extractJsonSummary(parsed);
    } catch {
        // Not JSON, try to extract from markdown-style JSON blocks
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                isJson = true;
                parsedJson = parsed;
                summary = extractJsonSummary(parsed);
            } catch {
                // Ignore
            }
        }
    }

    return { text, wordCount, charCount, estimatedDuration, isJson, summary, parsedJson };
}

export function StepPreview({ jobId, stepKey, status, className }: StepPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [content, setContent] = useState<ArtifactContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Only load when expanded and status is success
    useEffect(() => {
        async function loadArtifact() {
            setLoading(true);
            try {
                const res = await fetch(`/api/jobs/${jobId}/artifacts/${stepKey}`);
                if (res.ok) {
                    const text = await res.text();
                    setContent(parseArtifactContent(text));
                }
            } catch (e) {
                console.error("Failed to load artifact:", e);
            } finally {
                setLoading(false);
            }
        }

        if (isExpanded && status === "success" && !content) {
            loadArtifact();
        }
    }, [isExpanded, status, content, jobId, stepKey]);

    async function handleCopy() {
        if (content?.text) {
            await navigator.clipboard.writeText(content.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    // Only show for completed steps
    if (status !== "success") return null;

    return (
        <div className={cn("mt-2", className)}>
            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
            >
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Ver Resultado
                </span>
                {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                ) : (
                    <ChevronDown className="w-3 h-3" />
                )}
            </Button>

            {/* Preview Panel */}
            {isExpanded && (
                <div className="mt-2 border rounded-lg bg-muted/30 overflow-hidden max-w-full">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Carregando...
                        </div>
                    ) : content ? (
                        <>
                            {/* Tabs */}
                            <Tabs defaultValue="preview" className="w-full">
                                <div className="flex items-center justify-between px-2 py-1 border-b bg-muted/50">
                                    <TabsList className="h-7">
                                        <TabsTrigger value="preview" className="text-xs h-6">
                                            Visual
                                        </TabsTrigger>
                                        <TabsTrigger value="raw" className="text-xs h-6">
                                            Código (JSON)
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="h-6 px-2"
                                            title="Copiar conteúdo"
                                        >
                                            {copied ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsFullscreen(true)}
                                            className="h-6 px-2"
                                            title="Tela cheia"
                                        >
                                            <Maximize2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <TabsContent value="preview" className="p-0 m-0">
                                    {content.isJson ? (
                                        <SmartJsonPreview content={content.parsedJson} stepKey={stepKey} />
                                    ) : (
                                        <div className="p-4 text-sm whitespace-pre-wrap">
                                            {content.text.substring(0, 1000)}
                                            {content.text.length > 1000 && "..."}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="raw" className="m-0 overflow-hidden">
                                    <pre className="p-3 text-xs overflow-x-auto overflow-y-auto max-h-64 bg-background/50 break-all whitespace-pre-wrap font-mono">
                                        {content.text.substring(0, 5000)}
                                        {content.text.length > 5000 && "\n\n... (truncado)"}
                                    </pre>
                                </TabsContent>
                            </Tabs>

                            {/* Metrics Bar */}
                            <div className="flex items-center gap-3 px-3 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
                                <Badge variant="outline" className="h-5 text-[10px]">
                                    <Type className="w-2.5 h-2.5 mr-1" />
                                    {content.wordCount.toLocaleString()} palavras
                                </Badge>
                                <Badge variant="outline" className="h-5 text-[10px]">
                                    <Clock className="w-2.5 h-2.5 mr-1" />
                                    ~{content.estimatedDuration} min
                                </Badge>
                                <Badge variant="outline" className="h-5 text-[10px]">
                                    {(content.charCount / 1024).toFixed(1)} KB
                                </Badge>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhum conteúdo disponível
                        </div>
                    )}
                </div>
            )}

            {/* Fullscreen Dialog */}
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {stepKey} - Resultado Completo
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-muted/30 p-4 rounded-lg">
                        {content?.isJson ? (
                            <SmartJsonPreview content={content.parsedJson} stepKey={stepKey} />
                        ) : (
                            <pre className="text-sm whitespace-pre-wrap font-mono">
                                {content?.text}
                            </pre>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SmartJsonPreview({ content, stepKey }: { content: any; stepKey: string }) {
    if (!content) return null;

    // View: IDEACAO
    if (content.ideacao_completa && content.ideias) {
        return (
            <div className="space-y-6 p-4">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Tema Original</div>
                    <div className="font-medium text-lg">{content.ideacao_completa.tema_original}</div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {content.ideias.length}
                        </span>
                        Ideias Geradas
                    </h3>
                    <div className="grid gap-4 md:grid-cols-1">
                        {content.ideias.map((idea: any, i: number) => (
                            <div key={i} className="group border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card hover:shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-base">{idea.titulo}</h4>
                                    <Badge variant="secondary" className="text-[10px]">{idea.estilo || "Geral"}</Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground border-l-2 pl-3 italic">
                                        &quot;{idea.hook}&quot;
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        {idea.sinopse || idea.resumo}
                                    </p>

                                    {idea.potencial_viral && (
                                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded w-fit">
                                            <span className="font-bold">Potencial Viral:</span> {idea.potencial_viral}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // View: ROTEIRO (Script)
    if (content.roteiro || (Array.isArray(content) && content[0]?.cena)) {
        const scenes = content.roteiro || content;
        if (Array.isArray(scenes)) {
            return (
                <div className="space-y-6 p-4 font-mono text-sm">
                    {scenes.map((scene: any, i: number) => (
                        <div key={i} className="border-b pb-4 last:border-0">
                            <div className="font-bold text-muted-foreground mb-2">CENA {scene.cena || i + 1}</div>
                            <div className="space-y-2 pl-4">
                                <div className="text-primary font-semibold uppercase">{scene.visual || scene.imagem}</div>
                                <div className="text-foreground pl-4 border-l-2 border-primary/20 bg-muted/10 p-2 rounded">
                                    <span className="font-bold text-xs uppercase text-muted-foreground block mb-1">Narração</span>
                                    {scene.narracao || scene.texto}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    }

    // View: PROMPTS CENAS (Scene Prompts)
    if (content.scenes && Array.isArray(content.scenes)) {
        return (
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">
                        {content.scenes_count} Cenas
                    </Badge>
                    <Badge variant={content.prompts_generated === content.scenes_count ? "default" : "secondary"}>
                        {content.prompts_generated} Prompts Gerados
                    </Badge>
                </div>

                <div className="grid gap-6">
                    {content.scenes.map((scene: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-3 border-b pb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="h-5">Cena {scene.scene_number}</Badge>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {scene.timing?.start} - {scene.timing?.end} ({scene.timing?.duration_seconds}s)
                                    </span>
                                </div>
                                <Badge variant="secondary" className="text-[10px] uppercase">
                                    {scene.position}
                                </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Texto Principal */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Texto</div>
                                    <p className="text-sm bg-muted/20 p-2 rounded border-l-2 border-muted-foreground/30 italic">
                                        &quot;{scene.main_text}&quot;
                                    </p>
                                </div>

                                {/* Prompt de Imagem */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                                        Prompt de Imagem
                                        {scene.image_prompt ? <Check className="w-3 h-3 text-green-500" /> : null}
                                    </div>
                                    {scene.image_prompt ? (
                                        <div className="text-sm bg-primary/5 p-2 rounded border-l-2 border-primary/50 font-medium">
                                            {scene.image_prompt}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic bg-muted/10 p-2 rounded">
                                            Aguardando geração...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Default: Pretty JSON
    return (
        <div className="p-4">
            <div className="space-y-2">
                {Object.entries(content).map(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                        return (
                            <div key={key} className="border rounded p-3">
                                <div className="font-bold text-xs uppercase text-muted-foreground mb-2">{key}</div>
                                <pre className="text-xs overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                            </div>
                        );
                    }
                    return (
                        <div key={key} className="flex flex-col gap-1 border-b py-2 last:border-0">
                            <span className="font-bold text-xs text-muted-foreground uppercase">{key}</span>
                            <span className="text-sm">{String(value)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
