"use client";

import { cn } from "@/lib/utils";
import { Check, X, RotateCw, Sparkles, User, Swords, Heart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GeneratedResultMetadata {
    protagonista?: string;
    conflito?: string;
    emocaoAlvo?: string;
    keywords?: string[];
}

interface GeneratedResultCardProps {
    title: string;
    content: string;
    metadata?: GeneratedResultMetadata;
    isViral?: boolean;
    stepKey: string;
    onRegenerate?: () => void;
    onDiscard?: () => void;
    onApprove?: () => void;
    isRegenerating?: boolean;
    className?: string;
}

/**
 * GeneratedResultCard - Structured result card for AI-generated content
 * 
 * Features:
 * - Header with title and viral badge
 * - Main content display
 * - Metadata sections (protagonista, conflito, emoção, keywords)
 * - Action buttons (regenerate, discard, approve)
 */
export function GeneratedResultCard({
    title,
    content,
    metadata,
    isViral = false,
    stepKey,
    onRegenerate,
    onDiscard,
    onApprove,
    isRegenerating = false,
    className,
}: GeneratedResultCardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border bg-card overflow-hidden",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isViral && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                            <Sparkles className="w-3 h-3 mr-1" />
                            VIRAL
                        </Badge>
                    )}
                    {onDiscard && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDiscard}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Main text content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground leading-relaxed">
                        &ldquo;{content}&rdquo;
                    </p>
                </div>

                {/* Metadata grid */}
                {metadata && Object.keys(metadata).some(k => metadata[k as keyof GeneratedResultMetadata]) && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        {metadata.protagonista && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <User className="w-3.5 h-3.5" />
                                    Protagonista
                                </div>
                                <p className="text-sm">{metadata.protagonista}</p>
                            </div>
                        )}

                        {metadata.conflito && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Swords className="w-3.5 h-3.5" />
                                    Conflito
                                </div>
                                <p className="text-sm">{metadata.conflito}</p>
                            </div>
                        )}

                        {metadata.emocaoAlvo && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Heart className="w-3.5 h-3.5" />
                                    Emoção Alvo
                                </div>
                                <p className="text-sm">{metadata.emocaoAlvo}</p>
                            </div>
                        )}

                        {metadata.keywords && metadata.keywords.length > 0 && (
                            <div className="space-y-1 col-span-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Tag className="w-3.5 h-3.5" />
                                    Keywords
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {metadata.keywords.map((keyword, i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            {(onRegenerate || onApprove) && (
                <div className="flex items-center gap-2 px-4 py-3 border-t bg-muted/20">
                    {onRegenerate && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className="gap-2"
                        >
                            <RotateCw className={cn(
                                "w-4 h-4",
                                isRegenerating && "animate-spin"
                            )} />
                            Regenerar
                        </Button>
                    )}
                    {onApprove && (
                        <Button
                            size="sm"
                            onClick={onApprove}
                            className="gap-2 ml-auto"
                        >
                            <Check className="w-4 h-4" />
                            Aprovar
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Helper to parse AI output and extract metadata
 */
export function parseAIOutputMetadata(output: string): GeneratedResultMetadata | undefined {
    // Try to parse JSON metadata from output
    try {
        // Look for JSON block in output
        const jsonMatch = output.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            return {
                protagonista: parsed.protagonista || parsed.protagonist,
                conflito: parsed.conflito || parsed.conflict,
                emocaoAlvo: parsed.emocaoAlvo || parsed.emotion || parsed.emocao,
                keywords: parsed.keywords || parsed.tags,
            };
        }

        // Try direct JSON parse
        if (output.trim().startsWith("{")) {
            const parsed = JSON.parse(output);
            return {
                protagonista: parsed.protagonista || parsed.protagonist,
                conflito: parsed.conflito || parsed.conflict,
                emocaoAlvo: parsed.emocaoAlvo || parsed.emotion || parsed.emocao,
                keywords: parsed.keywords || parsed.tags,
            };
        }
    } catch {
        // Not JSON, return undefined
    }

    return undefined;
}

/**
 * Helper to extract main content from AI output
 */
export function extractMainContent(output: string): string {
    // Remove JSON blocks
    const content = output.replace(/```json\n?[\s\S]*?\n?```/g, "").trim();

    // Try to extract content field from JSON
    try {
        if (output.trim().startsWith("{")) {
            const parsed = JSON.parse(output);
            if (parsed.content || parsed.texto || parsed.text) {
                return parsed.content || parsed.texto || parsed.text;
            }
        }
    } catch {
        // Not JSON
    }

    // Return cleaned content
    return content || output;
}
