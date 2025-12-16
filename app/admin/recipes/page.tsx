"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/layout/Sidebar";
import {
    PageHeader,
    SplitView,
    SplitViewListItem,
    SplitViewDetail,
    SplitViewDetailEmpty,
    FiltersBar,
    EmptyState,
} from "@/components/layout";
import { ContextBanner } from "@/components/ui/ContextBanner";
import { Plus, Save, Loader2, Trash2, ChevronUp, ChevronDown, GripVertical, HelpCircle } from "lucide-react";
import { getRecipes, updateRecipe, createRecipe } from "../actions";

type Recipe = Awaited<ReturnType<typeof getRecipes>>[0];

// Tipos de step disponíveis
const STEP_TYPES = [
    { value: "llm", label: "LLM (Geração de texto)", icon: "🤖", description: "Usa Claude para gerar conteúdo" },
    { value: "tts", label: "TTS (Texto para áudio)", icon: "🎙️", description: "Converte roteiro em áudio narrado" },
    { value: "render", label: "Render (Vídeo)", icon: "🎬", description: "Gera o vídeo final com áudio e imagem" },
    { value: "export", label: "Export (Pacote)", icon: "📦", description: "Cria pacote com todos arquivos" },
];

// Steps predefinidos comum
const PREDEFINED_STEPS = [
    { key: "ideacao", type: "llm", label: "Ideação", description: "Gera 3 ideias baseadas no tema" },
    { key: "titulo", type: "llm", label: "Título", description: "Gera título otimizado para YouTube" },
    { key: "planejamento", type: "llm", label: "Planejamento", description: "Planeja estrutura do roteiro" },
    { key: "roteiro", type: "llm", label: "Roteiro", description: "Gera roteiro completo" },
    { key: "parse_ssml", type: "llm", label: "Parse SSML", description: "Converte roteiro para SSML" },
    { key: "tts", type: "tts", label: "TTS", description: "Gera áudio narrado" },
    { key: "renderizacao", type: "render", label: "Renderização", description: "Gera vídeo final" },
    { key: "exportacao", type: "export", label: "Exportação", description: "Empacota arquivos" },
    { key: "miniaturas", type: "llm", label: "Miniaturas", description: "Gera descrições de thumbnails" },
    { key: "descricao", type: "llm", label: "Descrição", description: "Gera descrição YouTube" },
    { key: "tags", type: "llm", label: "Tags", description: "Gera tags otimizadas" },
    { key: "comunidade", type: "llm", label: "Comunidade", description: "Gera post para aba comunidade" },
];

interface PipelineStep {
    key: string;
    type: string;
}

export default function AdminRecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selected, setSelected] = useState<Recipe | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Recipe>>({});
    const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);

    useEffect(() => {
        loadData();
    }, [searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const data = await getRecipes(searchValue);
            setRecipes(data);
        });
    };

    const handleSelect = (item: Recipe) => {
        setSelected(item);
        setEdited(item);
        // Parse pipeline
        try {
            const steps = JSON.parse(item.pipeline || "[]");
            setPipelineSteps(steps);
        } catch {
            setPipelineSteps([]);
        }
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updateRecipe(selected.id, {
                ...edited,
                pipeline: JSON.stringify(pipelineSteps)
            });
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newItem = await createRecipe();
            loadData();
            setSelected(newItem as Recipe);
            setEdited(newItem);
            setPipelineSteps([]);
        });
    };

    // Adicionar step predefinido
    const addPredefinedStep = (stepKey: string) => {
        const predefined = PREDEFINED_STEPS.find(s => s.key === stepKey);
        if (predefined && !pipelineSteps.find(s => s.key === predefined.key)) {
            setPipelineSteps([...pipelineSteps, { key: predefined.key, type: predefined.type }]);
        }
    };

    // Adicionar step customizado
    const addCustomStep = () => {
        const key = `custom_${Date.now()}`;
        setPipelineSteps([...pipelineSteps, { key, type: "llm" }]);
    };

    // Remover step
    const removeStep = (index: number) => {
        const newSteps = [...pipelineSteps];
        newSteps.splice(index, 1);
        setPipelineSteps(newSteps);
    };

    // Mover step para cima
    const moveStepUp = (index: number) => {
        if (index === 0) return;
        const newSteps = [...pipelineSteps];
        [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
        setPipelineSteps(newSteps);
    };

    // Mover step para baixo
    const moveStepDown = (index: number) => {
        if (index === pipelineSteps.length - 1) return;
        const newSteps = [...pipelineSteps];
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
        setPipelineSteps(newSteps);
    };

    // Atualizar step
    const updateStep = (index: number, field: keyof PipelineStep, value: string) => {
        const newSteps = [...pipelineSteps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setPipelineSteps(newSteps);
    };

    // Obter info do step
    const getStepInfo = (key: string) => {
        return PREDEFINED_STEPS.find(s => s.key === key);
    };

    const getStepTypeInfo = (type: string) => {
        return STEP_TYPES.find(t => t.value === type);
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Recipes" }]}
                    title="Recipes"
                    description="Pipelines de produção de vídeo"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Nova Recipe
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <ContextBanner
                        title="O que é uma Recipe?"
                        description="Recipe é a 'receita' de produção. Define a ORDEM das etapas: primeiro gera ideia, depois título, roteiro, áudio, vídeo."
                        tips={[
                            "Use os botões abaixo para adicionar etapas à pipeline",
                            "Arraste ou use setas para reordenar as etapas",
                            "Cada etapa é executada em sequência — se uma falha, o sistema para e você pode retomar",
                        ]}
                        variant="tip"
                    />

                    <FiltersBar searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Buscar..." className="mb-4" />

                    <SplitView
                        isLoading={isPending && recipes.length === 0}
                        isEmpty={recipes.length === 0}
                        emptyState={<EmptyState variant="empty" title="Nenhuma recipe" action={{ label: "Criar", onClick: handleCreate }} />}
                        list={
                            <div>
                                {recipes.map((item) => (
                                    <SplitViewListItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={item.slug}
                                        meta={`v${item.version} • ${JSON.parse(item.pipeline || "[]").length} etapas`}
                                        isActive={selected?.id === item.id}
                                        onClick={() => handleSelect(item)}
                                    />
                                ))}
                            </div>
                        }
                        detail={
                            selected ? (
                                <SplitViewDetail>
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-semibold">{selected.name}</h2>
                                                <Badge variant="outline">v{selected.version}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selected.slug}</p>
                                        </div>
                                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Campos básicos */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Slug</Label>
                                                <Input value={edited.slug || ""} onChange={(e) => setEdited({ ...edited, slug: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Descrição</Label>
                                            <Textarea
                                                value={edited.description || ""}
                                                onChange={(e) => setEdited({ ...edited, description: e.target.value })}
                                                placeholder="Ex: Pipeline para vídeos do canal Graciela"
                                            />
                                        </div>

                                        {/* Editor Visual de Pipeline */}
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-medium">📋 Pipeline ({pipelineSteps.length} etapas)</h3>
                                            </div>

                                            {/* Lista de Steps */}
                                            <div className="space-y-2 mb-4">
                                                {pipelineSteps.map((step, index) => {
                                                    const info = getStepInfo(step.key);
                                                    const typeInfo = getStepTypeInfo(step.type);
                                                    return (
                                                        <div
                                                            key={`${step.key}-${index}`}
                                                            className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border group"
                                                        >
                                                            <div className="flex flex-col gap-0.5 opacity-50 group-hover:opacity-100">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-5 w-5 p-0"
                                                                    onClick={() => moveStepUp(index)}
                                                                    disabled={index === 0}
                                                                >
                                                                    <ChevronUp className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-5 w-5 p-0"
                                                                    onClick={() => moveStepDown(index)}
                                                                    disabled={index === pipelineSteps.length - 1}
                                                                >
                                                                    <ChevronDown className="w-3 h-3" />
                                                                </Button>
                                                            </div>

                                                            <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-mono">
                                                                {index + 1}
                                                            </div>

                                                            <div className="flex-1 grid grid-cols-3 gap-2">
                                                                <Input
                                                                    value={step.key}
                                                                    onChange={(e) => updateStep(index, "key", e.target.value)}
                                                                    placeholder="nome_step"
                                                                    className="font-mono text-sm"
                                                                />
                                                                <Select
                                                                    value={step.type}
                                                                    onValueChange={(v) => updateStep(index, "type", v)}
                                                                >
                                                                    <SelectTrigger className="text-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {STEP_TYPES.map((t) => (
                                                                            <SelectItem key={t.value} value={t.value}>
                                                                                {t.icon} {t.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <div className="text-xs text-muted-foreground flex items-center">
                                                                    {info?.description || typeInfo?.description || "Step customizado"}
                                                                </div>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive opacity-50 hover:opacity-100"
                                                                onClick={() => removeStep(index)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}

                                                {pipelineSteps.length === 0 && (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        Pipeline vazia. Adicione etapas abaixo.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Adicionar Steps */}
                                            <div className="space-y-3">
                                                <Label className="flex items-center gap-2">
                                                    <Plus className="w-4 h-4" />
                                                    Adicionar Etapa
                                                </Label>

                                                <div className="flex flex-wrap gap-2">
                                                    {PREDEFINED_STEPS.filter(ps => !pipelineSteps.find(s => s.key === ps.key)).slice(0, 8).map((step) => (
                                                        <Button
                                                            key={step.key}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addPredefinedStep(step.key)}
                                                            className="text-xs"
                                                        >
                                                            {getStepTypeInfo(step.type)?.icon} {step.label}
                                                        </Button>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={addCustomStep}
                                                        className="text-xs border-dashed"
                                                    >
                                                        + Customizado
                                                    </Button>
                                                </div>

                                                {PREDEFINED_STEPS.filter(ps => !pipelineSteps.find(s => s.key === ps.key)).length > 8 && (
                                                    <Select onValueChange={addPredefinedStep}>
                                                        <SelectTrigger className="w-[200px] text-sm">
                                                            <SelectValue placeholder="Mais etapas..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PREDEFINED_STEPS.filter(ps => !pipelineSteps.find(s => s.key === ps.key)).slice(8).map((step) => (
                                                                <SelectItem key={step.key} value={step.key}>
                                                                    {getStepTypeInfo(step.type)?.icon} {step.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-4">
                                            <Badge className={selected.isActive ? "bg-status-success/10 text-status-success" : "bg-muted"}>
                                                {selected.isActive ? "ATIVO" : "INATIVO"}
                                            </Badge>
                                        </div>
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
