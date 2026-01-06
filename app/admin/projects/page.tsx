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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Save, Loader2, Building2, Power, Cpu, Mic, Video, ChefHat, HelpCircle, FileText, BookOpen } from "lucide-react";
import {
    getProjects,
    updateProject,
    createProject,
    toggleProjectActive,
    getProjectBindings,
    updateProjectBinding,
    getAvailableProvidersForProject,
    getAvailablePresetsForProject,
    getAvailableRecipesForProject,
    getProjectPrompts,
    getKnowledgeBase,
    toggleProjectKbBinding,
    type ProjectBindingSlot,
    type ProjectBinding,
    type ProjectPrompt,
} from "../actions";

type Project = Awaited<ReturnType<typeof getProjects>>[0];

interface AvailableProviders {
    llm: { id: string; name: string; slug: string; model: string | null }[];
    tts: { id: string; name: string; slug: string }[];
}

interface AvailablePresets {
    voice: { id: string; name: string; slug: string; voiceName: string }[];
    video: { id: string; name: string; slug: string; scale: string }[];
}

interface AvailableRecipe {
    id: string;
    name: string;
    slug: string;
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selected, setSelected] = useState<Project | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Project>>({});

    // Bindings state
    const [bindings, setBindings] = useState<ProjectBinding[]>([]);
    const [providers, setProviders] = useState<AvailableProviders>({ llm: [], tts: [] });
    const [presets, setPresets] = useState<AvailablePresets>({ voice: [], video: [] });
    const [recipes, setRecipes] = useState<AvailableRecipe[]>([]);
    const [projectPrompts, setProjectPrompts] = useState<ProjectPrompt[]>([]);
    const [allKbs, setAllKbs] = useState<Awaited<ReturnType<typeof getKnowledgeBase>>>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        loadAvailableOptions();
    }, [searchValue]);

    const loadData = () => {
        startTransition(async () => {
            try {
                const data = await getProjects(searchValue);
                setProjects(data);
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const loadAvailableOptions = async () => {
        try {
            const [p, pr, r, k] = await Promise.all([
                getAvailableProvidersForProject(),
                getAvailablePresetsForProject(),
                getAvailableRecipesForProject(),
                getKnowledgeBase(),
            ]);
            setProviders(p);
            setPresets(pr);
            setRecipes(r);
            setAllKbs(k);
        } catch (e) {
            console.error('Error loading options:', e);
        }
    };

    const loadProjectBindings = async (projectId: string) => {
        try {
            const [bindingsData, promptsData] = await Promise.all([
                getProjectBindings(projectId),
                getProjectPrompts(projectId),
            ]);
            setBindings(bindingsData);
            setProjectPrompts(promptsData);
        } catch (e) {
            console.error('Error loading bindings:', e);
        }
    };

    const handleSelect = (item: Project) => {
        setSelected(item);
        setEdited(item);
        loadProjectBindings(item.id);
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            try {
                await updateProject(selected.id, {
                    name: edited.name,
                    key: edited.key,
                    description: edited.description || undefined,
                    voiceRate: (edited as any).voiceRate,
                    voicePitch: (edited as any).voicePitch,
                    llmTemperature: (edited as any).llmTemperature,
                    llmMaxTokens: (edited as any).llmMaxTokens,
                });
                loadData();
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            try {
                const newItem = await createProject();
                loadData();
                setSelected(newItem as Project);
                setEdited(newItem);
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const handleToggleActive = () => {
        if (!selected) return;
        startTransition(async () => {
            try {
                await toggleProjectActive(selected.id, !selected.isActive);
                loadData();
                setSelected({ ...selected, isActive: !selected.isActive });
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const handleBindingChange = (slot: ProjectBindingSlot, targetId: string) => {
        if (!selected) return;
        startTransition(async () => {
            try {
                await updateProjectBinding(selected.id, slot, targetId);
                await loadProjectBindings(selected.id);
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const getBindingValue = (slot: ProjectBindingSlot): string => {
        const binding = bindings.find(b => b.slot === slot);
        return binding?.targetId || '';
    };

    const FieldWithHelp = ({ label, help, children }: { label: string; help: string; children: React.ReactNode }) => (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label>{label}</Label>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    {help}
                </span>
            </div>
            {children}
        </div>
    );

    // Resumo das configurações atuais
    const ConfigSummary = () => {
        // ... previous implementation ...
        const llm = bindings.find(b => b.slot === 'provider_llm');
        const tts = bindings.find(b => b.slot === 'provider_tts');
        const voice = bindings.find(b => b.slot === 'preset_voice');
        const video = bindings.find(b => b.slot === 'preset_video');
        const recipe = bindings.find(b => b.slot === 'recipe');

        return (
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">{llm?.targetName || <span className="text-muted-foreground">LLM não definido</span>}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{tts?.targetName || <span className="text-muted-foreground">TTS não definido</span>}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm">🗣️ {voice?.targetName || <span className="text-muted-foreground">Voz não definida</span>}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{video?.targetName || <span className="text-muted-foreground">Vídeo não definido</span>}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                    <ChefHat className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{recipe?.targetName || <span className="text-muted-foreground">Recipe não definida</span>}</span>
                </div>
            </div>
        );
    };

    const handleKbToggle = (kbId: string, isActive: boolean) => {
        if (!selected) return;
        startTransition(async () => {
            await toggleProjectKbBinding(selected.id, kbId, isActive);
            // Reload bindings
            const newBindings = await getProjectBindings(selected.id);
            setBindings(newBindings);
        });
    };

    const parseVoicePercent = (val: string | null | undefined): number => {
        if (!val) return 0;
        try {
            return parseInt(val.replace('%', '')) || 0;
        } catch { return 0; }
    };

    const formatVoicePercent = (val: number): string => {
        if (val === 0) return "0%";
        return (val > 0 ? "+" : "") + val + "%";
    };

    const isKbBound = (kbId: string) => {
        return bindings.some(b => b.slot === 'kb' && b.targetId === kbId && b.isActive !== false);
    };

    return (
        <>
            <PageHeader
                breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Projects" }]}
                title="Projects"
                description="Hub central de configuração por projeto"
                actions={
                    <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Novo Project
                    </Button>
                }
            />

            <div className="flex-1 p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500">
                        <strong>Erro:</strong> {error}
                    </div>
                )}

                <ContextBanner
                    title="O que são Projects?"
                    description="Projects são canais/projetos de conteúdo. Aqui você configura TUDO: qual IA usar, qual voz, qual preset de vídeo."
                    tips={[
                        "LLM: Qual Claude usar (4.5 Opus, 4.5 Sonnet, etc)",
                        "TTS: Qual serviço de voz (Azure)",
                        "Voice: Qual voz específica (Ximena, Jorge, etc)",
                        "Video: Qual preset de renderização (720p, 1080p)",
                        "Recipe: Qual pipeline seguir",
                    ]}
                    variant="info"
                />

                <FiltersBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Buscar projects..."
                    className="mb-4"
                />

                <SplitView
                    isLoading={isPending && projects.length === 0}
                    isEmpty={projects.length === 0}
                    emptyState={
                        <EmptyState variant="empty" title="Nenhum project" description="Execute o seed ou crie um novo" action={{ label: "Criar", onClick: handleCreate }} />
                    }
                    list={
                        <div>
                            {projects.map((item) => (
                                <SplitViewListItem
                                    key={item.id}
                                    title={item.name}
                                    subtitle={item.key}
                                    meta={item.isActive ? "Ativo" : "Inativo"}
                                    isActive={selected?.id === item.id}
                                    onClick={() => handleSelect(item)}
                                />
                            ))}
                        </div>
                    }
                    detail={
                        selected ? (
                            <SplitViewDetail>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">{selected.name}</h2>
                                        <p className="text-sm text-muted-foreground">{selected.key}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={selected.isActive ? "secondary" : "default"}
                                            onClick={handleToggleActive}
                                            disabled={isPending}
                                        >
                                            <Power className="w-4 h-4 mr-1" />
                                            {selected.isActive ? "Desativar" : "Ativar"}
                                        </Button>
                                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar
                                        </Button>
                                    </div>
                                </div>

                                <ConfigSummary />

                                <Tabs defaultValue="geral" className="w-full">
                                    <TabsList className="grid w-full grid-cols-7">
                                        <TabsTrigger value="geral">📋 Geral</TabsTrigger>
                                        <TabsTrigger value="pipeline">⚙️ Pipeline</TabsTrigger>
                                        <TabsTrigger value="prompts">📝 Prompts</TabsTrigger>
                                        <TabsTrigger value="kb">🧬 KB</TabsTrigger>
                                        <TabsTrigger value="voz">🗣️ Voz</TabsTrigger>
                                        <TabsTrigger value="video">🎬 Vídeo</TabsTrigger>
                                        <TabsTrigger value="images">🖼️ Imagens</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="geral" className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Key</Label>
                                                <Input value={edited.key || ""} onChange={(e) => setEdited({ ...edited, key: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Descrição</Label>
                                            <Textarea
                                                value={edited.description || ""}
                                                onChange={(e) => setEdited({ ...edited, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-4">
                                            <Badge className={selected.isActive ? "bg-status-success/10 text-status-success" : "bg-muted"}>
                                                {selected.isActive ? "ATIVO" : "INATIVO"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Criado em {new Date(selected.createdAt).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="pipeline" className="space-y-6 pt-4">
                                        {/* Fluxo de Produção */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Fluxo de Produção</h3>
                                            <FieldWithHelp label="Pipeline (Recipe)" help="Sequência de passos para produzir vídeo">
                                                <Select
                                                    value={getBindingValue('recipe')}
                                                    onValueChange={(v) => handleBindingChange('recipe', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o fluxo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {recipes.map((r) => (
                                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FieldWithHelp>
                                        </div>

                                        {/* IA (Agrupado com Pipeline pois define a inteligência do fluxo) */}
                                        <div className="space-y-3 pt-4 border-t">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">🤖 Inteligência Artificial (Override)</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FieldWithHelp label="Modelo LLM" help="Qual IA usar">
                                                    <Select
                                                        value={getBindingValue('provider_llm')}
                                                        onValueChange={(v) => handleBindingChange('provider_llm', v)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Padrão Global" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {providers.llm.map((p) => (
                                                                <SelectItem key={p.id} value={p.id}>
                                                                    {p.name} {p.model ? `(${p.model})` : ''}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWithHelp>
                                                <FieldWithHelp label="Criatividade" help="Temperatura da IA">
                                                    <Select
                                                        value={String(edited.llmTemperature || 0.7)}
                                                        onValueChange={(v) => setEdited({ ...edited, llmTemperature: parseFloat(v) })}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0.3">Preciso</SelectItem>
                                                            <SelectItem value="0.5">Equilibrado</SelectItem>
                                                            <SelectItem value="0.7">Criativo (recomendado)</SelectItem>
                                                            <SelectItem value="0.9">Muito criativo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWithHelp>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="prompts" className="space-y-4 pt-4">
                                        <div className="text-sm text-muted-foreground mb-4">
                                            Prompts vinculados via Recipe ({projectPrompts.length} total)
                                        </div>
                                        {projectPrompts.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>Nenhum prompt vinculado</p>
                                                <p className="text-xs">Selecione uma Recipe primeiro</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {projectPrompts.map((prompt) => (
                                                    <div
                                                        key={prompt.promptId}
                                                        className={`flex items-center justify-between p-3 rounded-lg border ${prompt.isActive ? 'bg-background' : 'bg-muted/30 opacity-60'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                {prompt.stepKey}
                                                            </Badge>
                                                            <div>
                                                                <div className="font-medium text-sm">{prompt.promptName}</div>
                                                                <div className="text-xs text-muted-foreground">{prompt.promptSlug}</div>
                                                            </div>
                                                        </div>
                                                        <Badge className={prompt.isActive ? "bg-status-success/10 text-status-success" : "bg-muted"}>
                                                            {prompt.isActive ? "ATIVO" : "INATIVO"}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="kb" className="space-y-4 pt-4">
                                        <div className="text-sm text-muted-foreground mb-4">
                                            Knowledge Base (DNA do projeto) - Personalidade, tom de voz e referências.
                                        </div>

                                        {!getBindingValue('recipe') ? (
                                            <div className="p-4 border border-yellow-500/30 bg-yellow-500/5 rounded text-center">
                                                <p className="text-yellow-600 mb-2">⚠️ Necessário selecionar um Pipeline (Recipe) primeiro.</p>
                                                <p className="text-xs text-muted-foreground">O Knowledge Base é vinculado ao fluxo de trabalho.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 border rounded-md p-1 bg-muted/20 max-h-[400px] overflow-y-auto">
                                                {allKbs.length === 0 ? (
                                                    <div className="p-8 text-center text-muted-foreground">
                                                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                        <p>Nenhum documento disponível na Knowledge Base global.</p>
                                                    </div>
                                                ) : (
                                                    allKbs.map((kb) => {
                                                        const isActive = isKbBound(kb.id);
                                                        return (
                                                            <div
                                                                key={kb.id}
                                                                className={`flex items-center p-3 rounded hover:bg-muted/50 transition-colors cursor-pointer ${isActive ? 'bg-primary/5 border border-primary/20' : ''}`}
                                                                onClick={() => handleKbToggle(kb.id, !isActive)}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isActive}
                                                                    onChange={() => { }} // Handled by div click
                                                                    className="mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm flex items-center gap-2">
                                                                        {kb.name}
                                                                        <Badge variant="outline" className="text-[10px] h-5 px-1 py-0">{kb.tier}</Badge>
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">{kb.category} • {kb.slug}</div>
                                                                </div>
                                                                {isActive && <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Vinculado</Badge>}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="voz" className="space-y-4 pt-4">
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">🗣️ Voz do Projeto</h3>
                                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-sm mb-4">
                                                💡 Escolha a voz padrão para este projeto. Ela será usada em todos os vídeos gerados.
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <FieldWithHelp label="Voz (Preset)" help="Personagem narrador">
                                                    <Select
                                                        value={getBindingValue('preset_voice')}
                                                        onValueChange={(v) => handleBindingChange('preset_voice', v)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione a voz" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {presets.voice.map((p) => (
                                                                <SelectItem key={p.id} value={p.id}>
                                                                    {p.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWithHelp>

                                                <div className="space-y-1">
                                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Velocidade (%)</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="font-mono text-right"
                                                            value={parseVoicePercent(edited.voiceRate)}
                                                            onChange={(e) => setEdited({ ...edited, voiceRate: formatVoicePercent(parseInt(e.target.value) || 0) })}
                                                            step={5}
                                                        />
                                                        <span className="text-xs text-muted-foreground w-12 text-center text-nowrap">
                                                            {edited.voiceRate || "0%"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">Override de velocidade (-50 a +50)</p>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tom (%)</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="font-mono text-right"
                                                            value={parseVoicePercent(edited.voicePitch)}
                                                            onChange={(e) => setEdited({ ...edited, voicePitch: formatVoicePercent(parseInt(e.target.value) || 0) })}
                                                            step={5}
                                                        />
                                                        <span className="text-xs text-muted-foreground w-12 text-center text-nowrap">
                                                            {edited.voicePitch || "0%"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">Override de tom (-30 a +30)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="video" className="space-y-4 pt-4">
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">🎬 Formato de Vídeo</h3>
                                            <FieldWithHelp label="Resolução (Preset)" help="Qualidade e formato de saída">
                                                <Select
                                                    value={getBindingValue('preset_video')}
                                                    onValueChange={(v) => handleBindingChange('preset_video', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione a resolução" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {presets.video.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.name} ({p.scale})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FieldWithHelp>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="images" className="space-y-4 pt-4">
                                        <div className="text-sm text-muted-foreground mb-4">
                                            Configurações de estilo para geração de imagens (ImageFX)
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Prefixo de Estilo (Global)</Label>
                                                <Textarea
                                                    placeholder="Ex: Cinematic photo, 8k, highly detailed..."
                                                    value={(edited as any).imageStylePrefix || ""}
                                                    onChange={(e) => setEdited({ ...edited, imageStylePrefix: e.target.value } as any)}
                                                    rows={4}
                                                    className="font-sans"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Texto adicionado automaticamente ao INÍCIO de todo prompt de imagem.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Sufixo de Estilo (Global)</Label>
                                                <Textarea
                                                    placeholder="Ex: --ar 16:9 --v 6.0"
                                                    value={(edited as any).imageStyleSuffix || ""}
                                                    onChange={(e) => setEdited({ ...edited, imageStyleSuffix: e.target.value } as any)}
                                                    rows={4}
                                                    className="font-sans"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Texto adicionado automaticamente ao FINAL de todo prompt de imagem.</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </SplitViewDetail>
                        ) : (
                            <SplitViewDetailEmpty />
                        )
                    }
                />
            </div>
        </>
    );
}
