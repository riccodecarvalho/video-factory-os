"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
    SectionCards,
    SplitView,
    SplitViewListItem,
    SplitViewDetail,
    SplitViewDetailEmpty,
    FiltersBar,
    EmptyState,
} from "@/components/layout";
import { ContextBanner } from "@/components/ui/ContextBanner";
import { Plus, Save, Loader2, Cpu, Mic, Database } from "lucide-react";
import { getProviders, getProviderTypes, updateProvider, createProvider } from "../actions";
import { getUsedBy } from "../execution-map/actions";
import { UsedBySection } from "@/components/vf";

type Provider = Awaited<ReturnType<typeof getProviders>>[0];

const typeIcons: Record<string, typeof Cpu> = {
    all: Database,
    llm: Cpu,
    tts: Mic,
    image: Database,
};

// Opções disponíveis por tipo de provider
const CLAUDE_MODELS = [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Latest)" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Fast)" },
];

const AZURE_VOICES = [
    { value: "es-MX-DaliaNeural", label: "Dalia (MX Feminina)" },
    { value: "es-MX-JorgeNeural", label: "Jorge (MX Masculina)" },
    { value: "es-ES-ElviraNeural", label: "Elvira (ES Feminina)" },
    { value: "es-AR-ElenaNeural", label: "Elena (AR Feminina)" },
    { value: "pt-BR-FranciscaNeural", label: "Francisca (BR Feminina)" },
    { value: "pt-BR-AntonioNeural", label: "Antonio (BR Masculina)" },
];

const AZURE_OUTPUT_FORMATS = [
    { value: "audio-16khz-128kbitrate-mono-mp3", label: "MP3 128kbps" },
    { value: "audio-24khz-160kbitrate-mono-mp3", label: "MP3 160kbps (HQ)" },
    { value: "riff-24khz-16bit-mono-pcm", label: "WAV 24kHz" },
];

export default function AdminProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [types, setTypes] = useState<Record<string, number>>({});
    const [selectedType, setSelectedType] = useState("all");
    const [selected, setSelected] = useState<Provider | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Provider>>({});

    useEffect(() => {
        loadData();
    }, [selectedType, searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const [data, typesData] = await Promise.all([
                getProviders(searchValue, selectedType),
                getProviderTypes(),
            ]);
            setProviders(data);
            setTypes(typesData);
        });
    };

    const handleSelect = (item: Provider) => {
        setSelected(item);
        setEdited(item);
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updateProvider(selected.id, edited);
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newItem = await createProvider();
            loadData();
            setSelected(newItem as Provider);
            setEdited(newItem);
        });
    };

    const typeCards = Object.entries(types).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.toUpperCase(),
        count,
        icon: typeIcons[id] || Database,
    }));

    // Parse config JSON
    const getConfig = () => {
        try {
            return typeof edited.config === "string"
                ? JSON.parse(edited.config || "{}")
                : (edited.config || {});
        } catch {
            return {};
        }
    };

    const updateConfig = (key: string, value: unknown) => {
        const config = getConfig();
        config[key] = value;
        setEdited({ ...edited, config: JSON.stringify(config) });
    };

    const renderLLMConfig = () => {
        const config = getConfig();
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Select
                            value={edited.defaultModel || ""}
                            onValueChange={(v) => setEdited({ ...edited, defaultModel: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o modelo" />
                            </SelectTrigger>
                            <SelectContent>
                                {CLAUDE_MODELS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Max Tokens</Label>
                        <Input
                            type="number"
                            value={config.maxTokens || 4096}
                            onChange={(e) => updateConfig("maxTokens", parseInt(e.target.value))}
                            min={1000}
                            max={200000}
                        />
                        <p className="text-xs text-muted-foreground">1.000 - 200.000</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Temperature: {(config.temperature || 0.7).toFixed(1)}</Label>
                    <Slider
                        value={[config.temperature || 0.7]}
                        onValueChange={([v]) => updateConfig("temperature", v)}
                        min={0}
                        max={1}
                        step={0.1}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Preciso</span>
                        <span>Criativo</span>
                    </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        💡 <strong>Dica:</strong> Use temperature baixa (0.1-0.3) para tarefas precisas
                        e alta (0.7-1.0) para geração criativa de conteúdo.
                    </p>
                </div>
            </div>
        );
    };

    const renderTTSConfig = () => {
        const config = getConfig();
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Voz Padrão</Label>
                        <Select
                            value={config.defaultVoice || ""}
                            onValueChange={(v) => updateConfig("defaultVoice", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a voz" />
                            </SelectTrigger>
                            <SelectContent>
                                {AZURE_VOICES.map((v) => (
                                    <SelectItem key={v.value} value={v.value}>
                                        {v.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Formato de Saída</Label>
                        <Select
                            value={config.outputFormat || "audio-16khz-128kbitrate-mono-mp3"}
                            onValueChange={(v) => updateConfig("outputFormat", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Formato" />
                            </SelectTrigger>
                            <SelectContent>
                                {AZURE_OUTPUT_FORMATS.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Rate (Velocidade): {(config.rate || 0)}%</Label>
                    <Slider
                        value={[config.rate || 0]}
                        onValueChange={([v]) => updateConfig("rate", v)}
                        min={-50}
                        max={50}
                        step={5}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>-50% (Lento)</span>
                        <span>Normal</span>
                        <span>+50% (Rápido)</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Pitch (Tom): {(config.pitch || 0)}%</Label>
                    <Slider
                        value={[config.pitch || 0]}
                        onValueChange={([v]) => updateConfig("pitch", v)}
                        min={-20}
                        max={20}
                        step={5}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Grave</span>
                        <span>Normal</span>
                        <span>Agudo</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Providers" }]}
                    title="Providers"
                    description="LLM, TTS e outros serviços externos"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Provider
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <ContextBanner
                        title="O que são Providers?"
                        description="Providers são serviços externos usados pelo pipeline: Claude para geração de texto, Azure para TTS, etc."
                        tips={[
                            "Claude (LLM): Gera roteiros, títulos e descrições",
                            "Azure Speech (TTS): Converte texto em áudio",
                            "Configure modelo, temperatura e tokens conforme necessidade",
                        ]}
                        variant="info"
                    />

                    {typeCards.length > 0 && (
                        <SectionCards cards={typeCards} activeId={selectedType} onSelect={setSelectedType} className="mb-6" />
                    )}

                    <FiltersBar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        searchPlaceholder="Buscar providers..."
                        className="mb-4"
                    />

                    <SplitView
                        isLoading={isPending && providers.length === 0}
                        isEmpty={providers.length === 0}
                        emptyState={
                            <EmptyState variant="empty" title="Nenhum provider" description="Execute o seed ou crie um novo" action={{ label: "Criar", onClick: handleCreate }} />
                        }
                        list={
                            <div>
                                {providers.map((item) => (
                                    <SplitViewListItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={item.slug}
                                        meta={item.type}
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
                                                <Badge variant="outline">{selected.type?.toUpperCase()}</Badge>
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
                                                <Label>Tipo</Label>
                                                <Select
                                                    value={edited.type || ""}
                                                    onValueChange={(v) => setEdited({ ...edited, type: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="llm">LLM (Texto)</SelectItem>
                                                        <SelectItem value="tts">TTS (Áudio)</SelectItem>
                                                        <SelectItem value="image">Imagem</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Config específica por tipo */}
                                        <div className="border-t pt-4">
                                            <h3 className="font-medium mb-4">
                                                {selected.type === "llm" ? "⚙️ Configurações Claude" :
                                                    selected.type === "tts" ? "🎙️ Configurações Azure TTS" :
                                                        "⚙️ Configurações"}
                                            </h3>

                                            {selected.type === "llm" && renderLLMConfig()}
                                            {selected.type === "tts" && renderTTSConfig()}

                                            {selected.type !== "llm" && selected.type !== "tts" && (
                                                <div className="space-y-2">
                                                    <Label>Base URL</Label>
                                                    <Input value={edited.baseUrl || ""} onChange={(e) => setEdited({ ...edited, baseUrl: e.target.value })} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 pt-4">
                                            <Badge className={selected.isActive ? "bg-status-success/10 text-status-success" : "bg-muted"}>
                                                {selected.isActive ? "ATIVO" : "INATIVO"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Used By Section */}
                                    <div className="mt-6 pt-6 border-t">
                                        <UsedBySection
                                            entityId={selected.id}
                                            entityType="provider"
                                            getUsedBy={getUsedBy}
                                        />
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
