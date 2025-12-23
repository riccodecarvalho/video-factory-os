"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Save, Loader2, Cpu, Mic, Database, HelpCircle } from "lucide-react";
import { getProviders, getProviderTypes, updateProvider, createProvider } from "../actions";

type Provider = Awaited<ReturnType<typeof getProviders>>[0];

const typeIcons: Record<string, typeof Cpu> = {
    all: Database,
    llm: Cpu,
    tts: Mic,
    image: Database,
};

// =============================================
// CLAUDE MODELS - COMPLETO OUT/2025
// Fonte: https://platform.claude.com/docs/en/about-claude/models/overview
// =============================================
const CLAUDE_MODELS = [
    // Claude 4.5 (Nov 2025 - mais recente)
    { value: "claude-opus-4-5-20251101", label: "Claude 4.5 Opus (mais capaz - Nov 2025)", maxOutput: 32000, contextWindow: 200000 },
    { value: "claude-sonnet-4-5-20250514", label: "Claude 4.5 Sonnet (melhor custo-benefício)", maxOutput: 64000, contextWindow: 200000 },

    // Claude 4 (Mai 2025)
    { value: "claude-opus-4-20250514", label: "Claude 4 Opus", maxOutput: 32000, contextWindow: 200000 },
    { value: "claude-sonnet-4-20250514", label: "Claude 4 Sonnet", maxOutput: 64000, contextWindow: 200000 },

    // Claude 3.5 (Out 2024)
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (v2)", maxOutput: 8192, contextWindow: 200000 },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (rápido)", maxOutput: 8192, contextWindow: 200000 },

    // Claude 3 (Mar 2024)
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus", maxOutput: 4096, contextWindow: 200000 },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet", maxOutput: 4096, contextWindow: 200000 },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku", maxOutput: 4096, contextWindow: 200000 },
];

const TEMPERATURE_OPTIONS = [
    { value: "0.0", label: "0.0 — Determinístico" },
    { value: "0.1", label: "0.1 — Muito preciso" },
    { value: "0.2", label: "0.2 — Preciso" },
    { value: "0.3", label: "0.3 — Moderado" },
    { value: "0.5", label: "0.5 — Equilibrado" },
    { value: "0.7", label: "0.7 — Criativo (recomendado)" },
    { value: "0.8", label: "0.8 — Muito criativo" },
    { value: "1.0", label: "1.0 — Máximo" },
];

const getMaxTokensOptions = (model: string) => {
    const modelInfo = CLAUDE_MODELS.find(m => m.value === model);
    const maxOutput = modelInfo?.maxOutput || 64000;

    const allOptions = [
        { value: "1024", label: "1.024" },
        { value: "2048", label: "2.048" },
        { value: "4096", label: "4.096 (padrão)" },
        { value: "8192", label: "8.192" },
        { value: "16000", label: "16.000" },
        { value: "32000", label: "32.000" },
        { value: "64000", label: "64.000 (máx Claude 4.5 Sonnet)" },
    ];

    return allOptions.filter(o => parseInt(o.value) <= maxOutput);
};
// =============================================
// AZURE TTS - Configurações do Provider
// NOTA: As vozes estão cadastradas em presets_voice (53 vozes)
// e são selecionadas em Projects > Presets, não aqui.
// =============================================

const AZURE_OUTPUT_FORMATS = [
    { value: "audio-16khz-64kbitrate-mono-mp3", label: "MP3 64kbps 16kHz" },
    { value: "audio-16khz-128kbitrate-mono-mp3", label: "MP3 128kbps 16kHz (padrão)" },
    { value: "audio-24khz-96kbitrate-mono-mp3", label: "MP3 96kbps 24kHz" },
    { value: "audio-24khz-160kbitrate-mono-mp3", label: "MP3 160kbps 24kHz (alta)" },
    { value: "audio-48khz-192kbitrate-mono-mp3", label: "MP3 192kbps 48kHz (máxima)" },
    { value: "riff-24khz-16bit-mono-pcm", label: "WAV 24kHz (sem compressão)" },
];

const RATE_OPTIONS = [
    { value: "-50%", label: "-50% — Muito lento" },
    { value: "-30%", label: "-30% — Lento" },
    { value: "-20%", label: "-20% — Pouco lento" },
    { value: "0%", label: "0% — Normal" },
    { value: "+20%", label: "+20% — Rápido" },
    { value: "+30%", label: "+30% — Bem rápido" },
    { value: "+50%", label: "+50% — Muito rápido" },
];

const PITCH_OPTIONS = [
    { value: "-30%", label: "-30% — Grave" },
    { value: "-15%", label: "-15% — Pouco grave" },
    { value: "0%", label: "0% — Normal" },
    { value: "+15%", label: "+15% — Agudo" },
    { value: "+30%", label: "+30% — Bem agudo" },
];

export default function AdminProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [types, setTypes] = useState<Record<string, number>>({});
    const [selectedType, setSelectedType] = useState("all");
    const [selected, setSelected] = useState<Provider | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Provider>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [selectedType, searchValue]);

    const loadData = () => {
        setError(null);
        startTransition(async () => {
            try {
                const [data, typesData] = await Promise.all([
                    getProviders(searchValue, selectedType),
                    getProviderTypes(),
                ]);
                setProviders(data);
                setTypes(typesData);
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const handleSelect = (item: Provider) => {
        setSelected(item);
        setEdited(item);
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            try {
                await updateProvider(selected.id, edited);
                loadData();
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            try {
                const newItem = await createProvider();
                loadData();
                setSelected(newItem as Provider);
                setEdited(newItem);
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const typeCards = Object.entries(types).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.toUpperCase(),
        count,
        icon: typeIcons[id] || Database,
    }));

    const getConfig = (): Record<string, unknown> => {
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

    const renderLLMConfig = () => {
        const config = getConfig();
        const currentModel = edited.defaultModel || String(config.model || "");
        const modelInfo = CLAUDE_MODELS.find(m => m.value === currentModel);

        return (
            <div className="space-y-4">
                <FieldWithHelp label="Modelo Claude" help="Selecione ou digite manualmente">
                    <Select
                        value={currentModel}
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
                </FieldWithHelp>

                {modelInfo && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-sm grid grid-cols-2 gap-2">
                        <p><strong>Context:</strong> {modelInfo.contextWindow.toLocaleString()} tokens</p>
                        <p><strong>Max Output:</strong> {modelInfo.maxOutput.toLocaleString()} tokens</p>
                    </div>
                )}

                <FieldWithHelp label="Ou digite manualmente" help="Para modelos não listados">
                    <Input
                        value={edited.defaultModel || ""}
                        onChange={(e) => setEdited({ ...edited, defaultModel: e.target.value })}
                        placeholder="claude-opus-4-5-20251101"
                        className="font-mono text-sm"
                    />
                </FieldWithHelp>

                <div className="grid grid-cols-2 gap-4">
                    <FieldWithHelp label="Temperature" help="Criatividade">
                        <Select
                            value={String(config.temperature || "0.7")}
                            onValueChange={(v) => updateConfig("temperature", parseFloat(v))}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {TEMPERATURE_OPTIONS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>

                    <FieldWithHelp label="Max Tokens" help="Tamanho resposta">
                        <Select
                            value={String(config.maxTokens || "4096")}
                            onValueChange={(v) => updateConfig("maxTokens", parseInt(v))}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {getMaxTokensOptions(currentModel).map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>
                </div>
            </div>
        );
    };

    const renderTTSConfig = () => {
        const config = getConfig();

        return (
            <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm font-medium mb-2">📢 Vozes configuradas em Projects</p>
                    <p className="text-xs text-muted-foreground">
                        As 53 vozes Azure estão cadastradas no banco de dados.
                        Selecione a voz específica em <strong>Projects &gt; Presets</strong>.
                    </p>
                </div>

                <FieldWithHelp label="Formato de Saída" help="Qualidade do áudio">
                    <Select
                        value={String(config.outputFormat || "audio-24khz-160kbitrate-mono-mp3")}
                        onValueChange={(v) => updateConfig("outputFormat", v)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {AZURE_OUTPUT_FORMATS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <div className="grid grid-cols-2 gap-4">
                    <FieldWithHelp label="Rate" help="Velocidade">
                        <Select
                            value={String(config.rate || "0%")}
                            onValueChange={(v) => updateConfig("rate", v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {RATE_OPTIONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>

                    <FieldWithHelp label="Pitch" help="Tom">
                        <Select
                            value={String(config.pitch || "0%")}
                            onValueChange={(v) => updateConfig("pitch", v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PITCH_OPTIONS.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>
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
                    description="Serviços externos: LLM (Claude) e TTS (Azure)"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo
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
                        title="O que são Providers?"
                        description="Providers são os serviços de IA que geram conteúdo (Claude) e áudio (Azure TTS)."
                        tips={[
                            "Claude 4.5 Opus: mais capaz | Sonnet: melhor custo-benefício",
                            "70+ vozes Azure incluindo Multilingual (falam 41 idiomas)",
                        ]}
                        variant="info"
                    />

                    {typeCards.length > 0 && (
                        <SectionCards cards={typeCards} activeId={selectedType} onSelect={setSelectedType} className="mb-6" />
                    )}

                    <FiltersBar searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Buscar..." className="mb-4" />

                    <SplitView
                        isLoading={isPending && providers.length === 0}
                        isEmpty={providers.length === 0}
                        emptyState={<EmptyState variant="empty" title="Nenhum provider" action={{ label: "Criar", onClick: handleCreate }} />}
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <FieldWithHelp label="Nome" help="Nome amigável">
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </FieldWithHelp>
                                            <FieldWithHelp label="Tipo" help="LLM ou TTS">
                                                <Select value={edited.type || ""} onValueChange={(v) => setEdited({ ...edited, type: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="llm">LLM (Texto)</SelectItem>
                                                        <SelectItem value="tts">TTS (Áudio)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FieldWithHelp>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h3 className="font-medium mb-4">
                                                {selected.type === "llm" ? "⚙️ Configurações Claude" : "🎙️ Configurações Azure TTS"}
                                            </h3>
                                            {selected.type === "llm" && renderLLMConfig()}
                                            {selected.type === "tts" && renderTTSConfig()}
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
