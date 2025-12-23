"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Target, Star } from "lucide-react";

/**
 * NarrativeStructure - Visualização de estrutura narrativa
 * 
 * Mostra revelações progressivas, espalhamentos e bordas dramáticas
 * seguindo o padrão de referência do wizard.
 */

export interface PlotPoint {
    position: number; // 0-100 (percentual do progresso)
    label: string;
    type: "setup" | "rising" | "climax" | "resolution";
    description?: string;
}

export interface SymbolicObject {
    name: string;
    meaning: string;
    emotion?: string;
}

export interface DramaticEdge {
    timestamp: string;
    character: string;
    line: string;
}

export interface NarrativeStructureProps {
    plotPoints?: PlotPoint[];
    symbolicObjects?: SymbolicObject[];
    dramaticEdges?: DramaticEdge[];
    className?: string;
}

const typeColors = {
    setup: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    rising: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    climax: "bg-red-500/20 text-red-600 border-red-500/30",
    resolution: "bg-green-500/20 text-green-600 border-green-500/30",
};

const typeIcons = {
    setup: Sparkles,
    rising: TrendingUp,
    climax: Target,
    resolution: Star,
};

export function NarrativeStructure({
    plotPoints = [],
    symbolicObjects = [],
    dramaticEdges = [],
    className,
}: NarrativeStructureProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Revelações Progressivas (Plot Points) */}
            {plotPoints.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Revelações Progressivas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Progress Bar com pontos */}
                        <div className="relative h-8 mb-4">
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full" />
                            {plotPoints.map((point, idx) => {
                                const Icon = typeIcons[point.type];
                                return (
                                    <div
                                        key={idx}
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                        style={{ left: `${point.position}%` }}
                                    >
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center border",
                                                typeColors[point.type]
                                            )}
                                        >
                                            <Icon className="w-3 h-3" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Lista de pontos */}
                        <div className="space-y-2">
                            {plotPoints.map((point, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 text-sm"
                                >
                                    <Badge
                                        variant="outline"
                                        className={cn("text-xs", typeColors[point.type])}
                                    >
                                        {point.position}%
                                    </Badge>
                                    <div>
                                        <span className="font-medium">{point.label}</span>
                                        {point.description && (
                                            <p className="text-muted-foreground text-xs mt-0.5">
                                                {point.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Objetos Simbólicos */}
            {symbolicObjects.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Objetos Simbólicos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {symbolicObjects.map((obj, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-muted/30 border"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{obj.name}</span>
                                        {obj.emotion && (
                                            <Badge variant="outline" className="text-xs">
                                                {obj.emotion}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        → {obj.meaning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bordas Dramáticas */}
            {dramaticEdges.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Bordas Dramáticas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {dramaticEdges.map((edge, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                                        {edge.timestamp}
                                    </Badge>
                                    <div className="text-sm">
                                        <span className="font-medium">{edge.character}:</span>
                                        <span className="text-muted-foreground italic ml-1">
                                            &ldquo;{edge.line}&rdquo;
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default NarrativeStructure;
