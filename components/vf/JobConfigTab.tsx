"use client";

/**
 * JobConfigTab - Mostra snapshot da configuração usada no job
 * 
 * Exibe manifest.snapshots.config_by_step organizado por step:
 * - Prompt usado (link clicável)
 * - Provider usado (link clicável)
 * - Presets usados (links clicáveis)
 * - Validators aplicados (links clicáveis)
 * - KB tiers usados (links clicáveis)
 */

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    FileText,
    Server,
    Mic,
    FileCode,
    ShieldCheck,
    BookOpen,
    ChevronRight,
    Globe,
    Building2,
} from "lucide-react";

interface ConfigItem {
    id: string;
    name: string;
    source?: "global" | "project";
}

interface StepConfig {
    prompt?: ConfigItem;
    provider?: ConfigItem;
    preset_voice?: ConfigItem;
    preset_ssml?: ConfigItem;
    validators?: { items: ConfigItem[]; source: "global" | "project" };
    kb?: { items: ConfigItem[]; source: "global" | "project" };
}

interface ManifestSnapshot {
    version: string;
    config_by_step?: Record<string, StepConfig>;
}

interface JobConfigTabProps {
    manifest: ManifestSnapshot | null;
    className?: string;
}

const SlotIcon = {
    prompt: FileText,
    provider: Server,
    preset_voice: Mic,
    preset_ssml: FileCode,
    validators: ShieldCheck,
    kb: BookOpen,
};

const SlotLabel = {
    prompt: "Prompt",
    provider: "Provider",
    preset_voice: "Voice Preset",
    preset_ssml: "SSML Preset",
    validators: "Validators",
    kb: "Knowledge Base",
};

const SlotLink = {
    prompt: "/admin/prompts",
    provider: "/admin/providers",
    preset_voice: "/admin/presets",
    preset_ssml: "/admin/presets",
    validators: "/admin/validators",
    kb: "/admin/knowledge-base",
};

function ConfigItemLink({
    item,
    slot,
}: {
    item: ConfigItem;
    slot: keyof typeof SlotIcon;
}) {
    const Icon = SlotIcon[slot];
    const baseUrl = SlotLink[slot];

    return (
        <Link
            href={`${baseUrl}?id=${item.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors group"
        >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm">{item.name}</span>
            {item.source && (
                <Badge variant="outline" className="text-xs">
                    {item.source === "project" ? (
                        <Building2 className="h-3 w-3 mr-1" />
                    ) : (
                        <Globe className="h-3 w-3 mr-1" />
                    )}
                    {item.source}
                </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

function StepConfigCard({
    stepKey,
    config,
}: {
    stepKey: string;
    config: StepConfig;
}) {
    const slots = Object.entries(config).filter(([_, value]) => value);

    if (slots.length === 0) {
        return (
            <Card className="opacity-60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{stepKey}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Nenhuma configuração registrada
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                    {stepKey.replace(/_/g, " ")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {slots.map(([slotKey, value]) => {
                    const slot = slotKey as keyof typeof SlotIcon;

                    // Handle array slots (validators, kb)
                    if (value && "items" in value) {
                        return (
                            <div key={slotKey}>
                                <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
                                    {SlotLabel[slot]}
                                    {value.source && (
                                        <Badge variant="outline" className="text-[10px]">
                                            {value.source}
                                        </Badge>
                                    )}
                                </div>
                                {value.items.map((item: ConfigItem) => (
                                    <ConfigItemLink
                                        key={item.id}
                                        item={item}
                                        slot={slot}
                                    />
                                ))}
                            </div>
                        );
                    }

                    // Handle single-value slots
                    if (value && "id" in value) {
                        return (
                            <ConfigItemLink
                                key={slotKey}
                                item={value as ConfigItem}
                                slot={slot}
                            />
                        );
                    }

                    return null;
                })}
            </CardContent>
        </Card>
    );
}

export function JobConfigTab({ manifest, className }: JobConfigTabProps) {
    if (!manifest) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <p>Manifest não disponível</p>
            </div>
        );
    }

    const configByStep = manifest.config_by_step || {};
    const steps = Object.keys(configByStep);

    if (steps.length === 0) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <p>Nenhuma configuração de step registrada</p>
                <p className="text-xs mt-1">Manifest version: {manifest.version}</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Configuração snapshot no momento da execução
                </p>
                <Badge variant="outline">v{manifest.version}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {steps.map((stepKey) => (
                    <StepConfigCard
                        key={stepKey}
                        stepKey={stepKey}
                        config={configByStep[stepKey]}
                    />
                ))}
            </div>
        </div>
    );
}
