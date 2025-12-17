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
import { Plus, Save, Loader2, Building2, Power, Cpu, Mic, Video, ChefHat, HelpCircle, FileText } from "lucide-react";
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
            const [p, pr, r] = await Promise.all([
                getAvailableProvidersForProject(),
                getAvailablePresetsForProject(),
                getAvailableRecipesForProject(),
            ]);
            setProviders(p);
            setPresets(pr);
            setRecipes(r);
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

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
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

                                    <Tabs defaultValue="config" className="w-full">
                                        <TabsList className="grid w-full grid-cols-5">
                                            <TabsTrigger value="config">⚙️ Configuração</TabsTrigger>
                                            <TabsTrigger value="prompts">📝 Prompts</TabsTrigger>
                                            <TabsTrigger value="providers">🤖 Providers</TabsTrigger>
                                            <TabsTrigger value="presets">🎛️ Presets</TabsTrigger>
                                            <TabsTrigger value="geral">📋 Geral</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="config" className="space-y-4 pt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FieldWithHelp label="Recipe (Pipeline)" help="Qual fluxo seguir">
                                                    <Select
                                                        value={getBindingValue('recipe')}
                                                        onValueChange={(v) => handleBindingChange('recipe', v)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione a recipe" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {recipes.map((r) => (
                                                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FieldWithHelp>
                                            </div>

                                            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                                <p className="text-sm">💡 Configure os <strong>Providers</strong> e <strong>Presets</strong> nas abas ao lado.</p>
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

                                        <TabsContent value="providers" className="space-y-4 pt-4">
                                            <FieldWithHelp label="Provider LLM (Texto)" help="Claude para gerar roteiros">
                                                <Select
                                                    value={getBindingValue('provider_llm')}
                                                    onValueChange={(v) => handleBindingChange('provider_llm', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o LLM" />
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

                                            <FieldWithHelp label="Provider TTS (Áudio)" help="Azure Speech para gerar narração">
                                                <Select
                                                    value={getBindingValue('provider_tts')}
                                                    onValueChange={(v) => handleBindingChange('provider_tts', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o TTS" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {providers.tts.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FieldWithHelp>
                                        </TabsContent>

                                        <TabsContent value="presets" className="space-y-4 pt-4">
                                            <FieldWithHelp label="Preset de Voz" help="Qual voz e configurações usar">
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
                                                                {p.name} ({p.voiceName})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FieldWithHelp>

                                            <FieldWithHelp label="Preset de Vídeo" help="Resolução e encoder">
                                                <Select
                                                    value={getBindingValue('preset_video')}
                                                    onValueChange={(v) => handleBindingChange('preset_video', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o preset de vídeo" />
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
                                        </TabsContent>

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
                                    </Tabs>
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
