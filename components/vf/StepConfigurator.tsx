"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface StepConfiguratorProps {
    stepKey: string;
    currentInput: Record<string, any>;
    onSave: (config: Record<string, any>) => void;
}

export function StepConfigurator({ stepKey, currentInput, onSave }: StepConfiguratorProps) {
    if (stepKey === "prompts_cenas") {
        return <PromptsCenasConfigurator currentInput={currentInput} onSave={onSave} />;
    }

    // Default: no config needed
    return null;
}

// ============================================
// PROMPTS CENAS CONFIGURATOR
// ============================================

function PromptsCenasConfigurator({ currentInput, onSave }: Omit<StepConfiguratorProps, "stepKey">) {
    const [mode, setMode] = useState<string>(currentInput.generation_mode || "7x1");
    const [platform, setPlatform] = useState<string>(currentInput.platform || "imagefx");
    const [style, setStyle] = useState<string>(currentInput.image_style || "cinematográfico, realista, detalhes minuciosos, iluminação dramática");
    const [wpm, setWpm] = useState<number>(currentInput.wpm_rate || 130);
    const [wordsPerScene, setWordsPerScene] = useState<number>(currentInput.words_per_scene || 100);

    // Update parent when any value changes
    const handleUpdate = (updates: Partial<typeof currentInput>) => {
        onSave({
            ...currentInput,
            ...updates,
        });
    };

    return (
        <div className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Configuração de Cenas</h3>
                    <p className="text-sm text-muted-foreground">Defina como o roteiro será dividido em cenas visuais</p>
                </div>
                <Badge variant="outline" className="uppercase">{mode}</Badge>
            </div>

            <Separator />

            {/* Generation Mode */}
            <div className="space-y-3">
                <Label>Modo de Geração</Label>
                <RadioGroup
                    value={mode}
                    onValueChange={(val) => {
                        setMode(val);
                        handleUpdate({ generation_mode: val });
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div className={getCellClass(mode === "7x1")}>
                        <RadioGroupItem value="7x1" id="m-7x1" className="sr-only" />
                        <Label htmlFor="m-7x1" className="cursor-pointer space-y-1 block w-full">
                            <div className="font-semibold flex items-center gap-2">
                                ⚡️ Padrão 7x1
                                {mode === "7x1" && <Badge variant="secondary" className="text-[10px]">Recomendado</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                O timming ideal para retenção no Youtube/Tiktok. 6 &ldquo;hooks&rdquo; rápidos seguidos de cenas mais longas.
                            </p>
                        </Label>
                    </div>

                    <div className={getCellClass(mode === "automatic")}>
                        <RadioGroupItem value="automatic" id="m-auto" className="sr-only" />
                        <Label htmlFor="m-auto" className="cursor-pointer space-y-1 block w-full">
                            <div className="font-semibold">🤖 Automático Smart</div>
                            <p className="text-xs text-muted-foreground">
                                IA decide o melhor corte baseado no ritmo da narração (aprox. a cada 80 palavras).
                            </p>
                        </Label>
                    </div>

                    <div className={getCellClass(mode === "by-words")}>
                        <RadioGroupItem value="by-words" id="m-words" className="sr-only" />
                        <Label htmlFor="m-words" className="cursor-pointer space-y-1 block w-full">
                            <div className="font-semibold">📏 Por Palavras (Fixo)</div>
                            <p className="text-xs text-muted-foreground">
                                Corte exato a cada X palavras. Ideal para sincronia precisa.
                            </p>
                        </Label>
                    </div>

                    <div className={getCellClass(mode === "by-paragraphs")}>
                        <RadioGroupItem value="by-paragraphs" id="m-para" className="sr-only" />
                        <Label htmlFor="m-para" className="cursor-pointer space-y-1 block w-full">
                            <div className="font-semibold">📝 Por Parágrafos</div>
                            <p className="text-xs text-muted-foreground">
                                Tenta respeitar a quebra de parágrafos do roteiro original.
                            </p>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Conditional Inputs */}
            {mode === "by-words" && (
                <div className="space-y-2 bg-muted/20 p-4 rounded border">
                    <Label>Palavras por Cena</Label>
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[wordsPerScene]}
                            onValueChange={([val]) => {
                                setWordsPerScene(val);
                                handleUpdate({ words_per_scene: val });
                            }}
                            min={30}
                            max={300}
                            step={10}
                            className="flex-1"
                        />
                        <span className="font-mono text-sm w-12">{wordsPerScene}</span>
                    </div>
                </div>
            )}

            {/* Style & Platform */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label>Estilo Visual</Label>
                    <Input
                        value={style}
                        onChange={(e) => {
                            setStyle(e.target.value);
                            handleUpdate({ image_style: e.target.value });
                        }}
                        placeholder="Ex: cinematográfico, anime, pixel art..."
                    />
                </div>

                <div className="space-y-3">
                    <Label>Plataforma de Imagem</Label>
                    <Select
                        value={platform}
                        onValueChange={(val) => {
                            setPlatform(val);
                            handleUpdate({ platform: val });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="imagefx">Google ImageFX (Gratuito/Rápido)</SelectItem>
                            <SelectItem value="midjourney">Midjourney</SelectItem>
                            <SelectItem value="dall-e">DALL-E 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

function getCellClass(isActive: boolean) {
    return `border rounded-lg p-4 transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/30 ${isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
        }`;
}
