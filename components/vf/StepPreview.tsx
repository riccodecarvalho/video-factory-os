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

    try {
        // Try to parse as JSON
        const parsed = JSON.parse(text);
        isJson = true;
        summary = extractJsonSummary(parsed);
    } catch {
        // Not JSON, try to extract from markdown-style JSON blocks
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                isJson = true;
                summary = extractJsonSummary(parsed);
            } catch {
                // Ignore
            }
        }
    }

    return { text, wordCount, charCount, estimatedDuration, isJson, summary };
}

export function StepPreview({ jobId, stepKey, status, className }: StepPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [content, setContent] = useState<ArtifactContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Only load when expanded and status is success
    useEffect(() => {
        if (isExpanded && status === "success" && !content) {
            loadArtifact();
        }
    }, [isExpanded, status]);

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
                                            Preview
                                        </TabsTrigger>
                                        <TabsTrigger value="raw" className="text-xs h-6">
                                            Raw
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="h-6 px-2"
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
                                        >
                                            <Maximize2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <TabsContent value="preview" className="p-3 m-0">
                                    {/* Summary from JSON */}
                                    {content.summary && Object.keys(content.summary).length > 0 && (
                                        <div className="space-y-1 mb-3">
                                            {Object.entries(content.summary).map(([key, value]) => (
                                                <div key={key} className="flex gap-2 text-xs">
                                                    <span className="font-medium text-muted-foreground">
                                                        {key}:
                                                    </span>
                                                    <span className="truncate">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Text preview (first 500 chars) */}
                                    {!content.summary && (
                                        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6">
                                            {content.text.substring(0, 500)}
                                            {content.text.length > 500 && "..."}
                                        </p>
                                    )}
                                </TabsContent>

                                <TabsContent value="raw" className="m-0 overflow-hidden">
                                    <pre className="p-3 text-xs overflow-x-auto overflow-y-auto max-h-48 bg-background/50 break-all whitespace-pre-wrap">
                                        {content.text.substring(0, 2000)}
                                        {content.text.length > 2000 && "\n\n... (truncado)"}
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
                                {content.isJson && (
                                    <Badge variant="secondary" className="h-5 text-[10px]">
                                        JSON
                                    </Badge>
                                )}
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
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {stepKey} - Resultado Completo
                        </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-auto max-h-[60vh]">
                        <pre className="text-xs whitespace-pre-wrap p-4 bg-muted rounded-lg">
                            {content?.text}
                        </pre>
                    </div>
                    {content && (
                        <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
                            <span>{content.wordCount.toLocaleString()} palavras</span>
                            <span>•</span>
                            <span>~{content.estimatedDuration} min de áudio</span>
                            <span>•</span>
                            <span>{(content.charCount / 1024).toFixed(1)} KB</span>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
