"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SuspenseSidebar } from "@/components/layout/SuspenseSidebar";
import {
    PageHeader,
    SplitView,
    SplitViewListItem,
    SplitViewDetail,
    SplitViewDetailEmpty,
    EmptyState,
} from "@/components/layout";
import {
    Settings2,
    RefreshCw,
    Check,
    Loader2,
    FileText,
    Server,
    Mic,
    ShieldCheck,
    BookOpen,
    ExternalLink,
    Video,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
    getProjects,
    getRecipeSteps,
    getEffectiveConfig,
    setBinding,
    resetToGlobal,
    seedDefaultBindings,
} from "./actions";
import { getRecipes, getPrompts, getProviders, getValidators, getKnowledgeBase, getVoicePresets, getSsmlPresets } from "../actions";
import { getStepKind, getAllowedSlots, KIND_LABELS, SlotType } from "@/lib/engine/capabilities";

type Project = Awaited<ReturnType<typeof getProjects>>[0];
type Recipe = Awaited<ReturnType<typeof getRecipes>>[0];

interface StepSlot {
    slot: SlotType;
    label: string;
    icon: typeof FileText;
    type: "single" | "multi";
}

const ALL_SLOTS: StepSlot[] = [
    { slot: "prompt", label: "Prompt", icon: FileText, type: "single" },
    { slot: "provider", label: "Provider", icon: Server, type: "single" },
    { slot: "preset_voice", label: "Voice Preset", icon: Mic, type: "single" },
    { slot: "preset_ssml", label: "SSML Preset", icon: FileText, type: "single" },
    { slot: "preset_video", label: "Video Preset", icon: Video, type: "single" },
    { slot: "preset_effects", label: "Effects Preset", icon: Sparkles, type: "single" },
    { slot: "validators", label: "Validators", icon: ShieldCheck, type: "multi" },
    { slot: "kb", label: "Knowledge Base", icon: BookOpen, type: "multi" },
];

export default function ExecutionMapPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("global");
    const [steps, setSteps] = useState<Array<{ key: string; name: string; order: number }>>([]);
    const [selectedStep, setSelectedStep] = useState<string | null>(null);
    const [stepConfig, setStepConfig] = useState<Record<string, unknown>>({});
    const [isPending, startTransition] = useTransition();

    // Entity lists for dropdowns
    const [promptsList, setPromptsList] = useState<Array<{ id: string; name: string }>>([]);
    const [providersList, setProvidersList] = useState<Array<{ id: string; name: string }>>([]);
    const [validatorsList, setValidatorsList] = useState<Array<{ id: string; name: string }>>([]);
    const [kbList, setKbList] = useState<Array<{ id: string; name: string }>>([]);
    const [voicePresetsList, setVoicePresetsList] = useState<Array<{ id: string; name: string }>>([]);
    const [ssmlPresetsList, setSsmlPresetsList] = useState<Array<{ id: string; name: string }>>([]);

    // Load initial data
    useEffect(() => {
        startTransition(async () => {
            const [projectsData, recipesData, prompts, providers, validators, kb, voicePresets, ssmlPresets] = await Promise.all([
                getProjects(),
                getRecipes(),
                getPrompts(),
                getProviders(),
                getValidators(),
                getKnowledgeBase(),
                getVoicePresets(),
                getSsmlPresets(),
            ]);
            setProjects(projectsData);
            setRecipes(recipesData);
            setPromptsList(prompts.map(p => ({ id: p.id, name: p.name })));
            setProvidersList(providers.map(p => ({ id: p.id, name: p.name })));
            setValidatorsList(validators.map(v => ({ id: v.id, name: v.name })));
            setKbList(kb.map(k => ({ id: k.id, name: k.name })));
            setVoicePresetsList(voicePresets.map(v => ({ id: v.id, name: v.name })));
            setSsmlPresetsList(ssmlPresets.map(s => ({ id: s.id, name: s.name })));

            // Auto-select first recipe
            if (recipesData.length > 0) {
                setSelectedRecipeId(recipesData[0].id);
            }
        });
    }, []);

    // Load steps when recipe changes
    useEffect(() => {
        if (!selectedRecipeId) return;
        startTransition(async () => {
            const stepsData = await getRecipeSteps(selectedRecipeId);
            setSteps(stepsData);
            if (stepsData.length > 0) {
                setSelectedStep(stepsData[0].key);
            }
        });
    }, [selectedRecipeId]);

    // Load step config when step or project changes
    useEffect(() => {
        if (!selectedRecipeId || !selectedStep) return;
        startTransition(async () => {
            const config = await getEffectiveConfig(
                selectedRecipeId,
                selectedStep,
                selectedProjectId === "global" ? undefined : selectedProjectId
            );
            setStepConfig(config);
        });
    }, [selectedRecipeId, selectedStep, selectedProjectId]);

    const handleSetBinding = async (slot: string, targetId: string) => {
        if (!selectedRecipeId || !selectedStep) return;
        startTransition(async () => {
            await setBinding(
                selectedRecipeId,
                selectedStep,
                slot,
                targetId,
                selectedProjectId === "global" ? "global" : "project",
                selectedProjectId === "global" ? undefined : selectedProjectId
            );
            // Reload config
            const config = await getEffectiveConfig(
                selectedRecipeId,
                selectedStep,
                selectedProjectId === "global" ? undefined : selectedProjectId
            );
            setStepConfig(config);
        });
    };

    const handleResetToGlobal = async (slot: string) => {
        if (!selectedRecipeId || !selectedStep || selectedProjectId === "global") return;
        startTransition(async () => {
            await resetToGlobal(selectedRecipeId, selectedStep, slot, selectedProjectId);
            const config = await getEffectiveConfig(
                selectedRecipeId,
                selectedStep,
                selectedProjectId
            );
            setStepConfig(config);
        });
    };

    const handleSeedBindings = async () => {
        if (!selectedRecipeId) return;
        startTransition(async () => {
            await seedDefaultBindings(selectedRecipeId);
            if (selectedStep) {
                const config = await getEffectiveConfig(
                    selectedRecipeId,
                    selectedStep,
                    selectedProjectId === "global" ? undefined : selectedProjectId
                );
                setStepConfig(config);
            }
        });
    };

    const getSlotValue = (slot: string): { id?: string; name?: string; source?: string; items?: Array<{ id: string; name: string }> } => {
        return (stepConfig[slot] as any) || {};
    };

    const getOptionsForSlot = (slot: string) => {
        switch (slot) {
            case "prompt": return promptsList;
            case "provider": return providersList;
            case "validators": return validatorsList;
            case "kb": return kbList;
            case "preset_voice": return voicePresetsList;
            case "preset_ssml": return ssmlPresetsList;
            default: return [];
        }
    };

    // Get step kind and allowed slots
    const stepKind = selectedStep ? getStepKind(selectedStep) : null;
    const allowedSlots = selectedStep ? getAllowedSlots(selectedStep) : [];
    const filteredSlots = ALL_SLOTS.filter(s => allowedSlots.includes(s.slot));

    return (
        <div className="flex min-h-screen bg-background">
            <SuspenseSidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Execution Map" }]}
                    title="Execution Map"
                    description="Governança de wiring: prompt → provider → preset por step"
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleSeedBindings} disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
                                Seed Bindings
                            </Button>
                        </div>
                    }
                />

                <div className="flex-1 p-6">
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="space-y-2">
                            <Label>Recipe</Label>
                            <Select value={selectedRecipeId || ""} onValueChange={setSelectedRecipeId}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Selecionar recipe..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {recipes.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Scope</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="global">Global (padrão)</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* SplitView: Steps | Config */}
                    <SplitView
                        isLoading={isPending && steps.length === 0}
                        isEmpty={steps.length === 0}
                        emptyState={
                            <EmptyState
                                variant="empty"
                                title="Nenhum step na recipe"
                                description="Selecione uma recipe com pipeline definido"
                            />
                        }
                        list={
                            <div>
                                {steps.map((step, index) => {
                                    const kind = getStepKind(step.key);
                                    return (
                                        <SplitViewListItem
                                            key={step.key}
                                            title={step.name}
                                            subtitle={`${step.key} • ${KIND_LABELS[kind]}`}
                                            meta={`Step ${index + 1}`}
                                            isActive={selectedStep === step.key}
                                            onClick={() => setSelectedStep(step.key)}
                                        />
                                    );
                                })}
                            </div>
                        }
                        detail={
                            selectedStep ? (
                                <SplitViewDetail>
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-semibold">{steps.find(s => s.key === selectedStep)?.name}</h2>
                                            <Badge variant="outline">{stepKind && KIND_LABELS[stepKind]}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Step: {selectedStep} • Scope: {selectedProjectId === "global" ? "Global" : projects.find(p => p.id === selectedProjectId)?.name}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {filteredSlots.map(slotDef => {
                                            const value = getSlotValue(slotDef.slot);
                                            const Icon = slotDef.icon;
                                            const options = getOptionsForSlot(slotDef.slot);

                                            return (
                                                <div key={slotDef.slot} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="w-4 h-4 text-muted-foreground" />
                                                            <span className="font-medium">{slotDef.label}</span>
                                                            {value.source && (
                                                                <Badge variant="outline" className={value.source === "project" ? "bg-primary/10 text-primary" : ""}>
                                                                    {value.source}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {value.source === "project" && selectedProjectId !== "global" && (
                                                            <Button variant="ghost" size="sm" onClick={() => handleResetToGlobal(slotDef.slot)}>
                                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                                Reset to Global
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {slotDef.type === "single" ? (
                                                        <div className="flex items-center gap-2">
                                                            <Select
                                                                value={value.id || ""}
                                                                onValueChange={(id) => handleSetBinding(slotDef.slot, id)}
                                                            >
                                                                <SelectTrigger className="flex-1">
                                                                    <SelectValue placeholder={`Selecionar ${slotDef.label.toLowerCase()}...`} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {options.map(o => (
                                                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {value.id && (
                                                                <Link href={`/admin/${slotDef.slot === "prompt" ? "prompts" : slotDef.slot === "provider" ? "providers" : "presets"}?id=${value.id}`}>
                                                                    <Button variant="ghost" size="sm">
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {value.items && value.items.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {value.items.map((item: { id: string; name: string }) => (
                                                                        <Badge key={item.id} variant="secondary" className="gap-1">
                                                                            <Check className="w-3 h-3" />
                                                                            {item.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">Nenhum {slotDef.label.toLowerCase()} configurado</p>
                                                            )}
                                                            <Select onValueChange={(id) => handleSetBinding(slotDef.slot, id)}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={`Adicionar ${slotDef.label.toLowerCase()}...`} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {options.map(o => (
                                                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </SplitViewDetail>
                            ) : (
                                <SplitViewDetailEmpty />
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}
