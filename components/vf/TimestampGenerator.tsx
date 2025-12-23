"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Plus, Trash2, Copy, Wand2 } from "lucide-react";

/**
 * TimestampGenerator - Gerador de timestamps para descrição do YouTube
 * 
 * Permite criar e editar timestamps de forma estruturada,
 * com formatação automática e cópia para clipboard.
 */

export interface Timestamp {
    time: string; // formato "MM:SS" ou "HH:MM:SS"
    label: string;
}

export interface TimestampGeneratorProps {
    timestamps?: Timestamp[];
    onChange?: (timestamps: Timestamp[]) => void;
    onGenerate?: () => void;
    isGenerating?: boolean;
    editable?: boolean;
    className?: string;
}

function formatTimeToSeconds(time: string): number {
    const parts = time.split(":").map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

function formatSecondsToTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TimestampGenerator({
    timestamps = [],
    onChange,
    onGenerate,
    isGenerating = false,
    editable = true,
    className,
}: TimestampGeneratorProps) {
    const [newTime, setNewTime] = useState("0:00");
    const [newLabel, setNewLabel] = useState("");

    const handleAdd = () => {
        if (!newLabel.trim()) return;

        const updated = [...timestamps, { time: newTime, label: newLabel }];
        // Ordenar por tempo
        updated.sort((a, b) => formatTimeToSeconds(a.time) - formatTimeToSeconds(b.time));
        onChange?.(updated);
        setNewTime("0:00");
        setNewLabel("");
    };

    const handleRemove = (index: number) => {
        const updated = timestamps.filter((_, i) => i !== index);
        onChange?.(updated);
    };

    const handleUpdate = (index: number, field: "time" | "label", value: string) => {
        const updated = [...timestamps];
        updated[index] = { ...updated[index], [field]: value };

        if (field === "time") {
            updated.sort((a, b) => formatTimeToSeconds(a.time) - formatTimeToSeconds(b.time));
        }
        onChange?.(updated);
    };

    const handleCopy = () => {
        const text = timestamps
            .map(t => `${t.time} ${t.label}`)
            .join("\n");
        navigator.clipboard.writeText(text);
    };

    const formattedText = timestamps
        .map(t => `${t.time} ${t.label}`)
        .join("\n");

    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timestamps
                        {timestamps.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {timestamps.length}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {onGenerate && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onGenerate}
                                disabled={isGenerating}
                                className="gap-1"
                            >
                                <Wand2 className="w-3 h-3" />
                                {isGenerating ? "Gerando..." : "Gerar"}
                            </Button>
                        )}
                        {timestamps.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="gap-1"
                            >
                                <Copy className="w-3 h-3" />
                                Copiar
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Lista de timestamps */}
                {timestamps.length > 0 ? (
                    <div className="space-y-2">
                        {timestamps.map((ts, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 group"
                            >
                                {editable ? (
                                    <>
                                        <Input
                                            value={ts.time}
                                            onChange={(e) => handleUpdate(idx, "time", e.target.value)}
                                            className="w-20 font-mono text-sm"
                                        />
                                        <Input
                                            value={ts.label}
                                            onChange={(e) => handleUpdate(idx, "label", e.target.value)}
                                            className="flex-1 text-sm"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(idx)}
                                            className="opacity-0 group-hover:opacity-100 text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {ts.time}
                                        </Badge>
                                        <span className="text-sm">{ts.label}</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        Nenhum timestamp adicionado.
                    </div>
                )}

                {/* Adicionar novo timestamp */}
                {editable && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                        <Input
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            placeholder="0:00"
                            className="w-20 font-mono text-sm"
                        />
                        <Input
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Descrição do momento"
                            className="flex-1 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAdd}
                            disabled={!newLabel.trim()}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Preview formatado */}
                {timestamps.length > 0 && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-2">Preview para descrição:</p>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                            {formattedText}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default TimestampGenerator;
