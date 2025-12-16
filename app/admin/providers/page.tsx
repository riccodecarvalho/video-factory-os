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
import { getUsedBy } from "../execution-map/actions";
import { UsedBySection } from "@/components/vf";

type Provider = Awaited<ReturnType<typeof getProviders>>[0];

const typeIcons: Record<string, typeof Cpu> = {
    all: Database,
    llm: Cpu,
    tts: Mic,
    image: Database,
};

// =============================================
// OPÇÕES CONFIGURÁVEIS — MODELOS CLAUDE ATUALIZADOS
// =============================================

const CLAUDE_MODELS = [
    // Claude 4.5 (mais recente)
    { value: "claude-sonnet-4-5-20250514", label: "Claude 4.5 Sonnet (mais recente)" },
    // Claude 4
    { value: "claude-sonnet-4-20250514", label: "Claude 4 Sonnet" },
    { value: "claude-opus-4-20250514", label: "Claude 4 Opus (mais capaz)" },
    // Claude 3.5
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (rápido)" },
    // Claude 3
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (mais rápido)" },
];

const TEMPERATURE_OPTIONS = [
    { value: "0.0", label: "0.0 (Determinístico - sempre igual)" },
    { value: "0.1", label: "0.1 (Muito preciso)" },
    { value: "0.3", label: "0.3 (Preciso)" },
    { value: "0.5", label: "0.5 (Equilibrado)" },
    { value: "0.7", label: "0.7 (Criativo - recomendado)" },
    { value: "0.9", label: "0.9 (Muito criativo)" },
    { value: "1.0", label: "1.0 (Máxima criatividade)" },
];

const MAX_TOKENS_OPTIONS = [
    { value: "2048", label: "2.048 (respostas curtas)" },
    { value: "4096", label: "4.096 (padrão)" },
    { value: "8192", label: "8.192 (respostas longas)" },
    { value: "16000", label: "16.000 (roteiros médios)" },
    { value: "32000", label: "32.000 (roteiros longos)" },
    { value: "64000", label: "64.000 (roteiros muito longos)" },
    { value: "128000", label: "128.000 (máximo Claude 3.5)" },
];

const AZURE_VOICES = [
    { value: "es-MX-DaliaNeural", label: "Dalia (México - Feminina)" },
    { value: "es-MX-JorgeNeural", label: "Jorge (México - Masculina)" },
    { value: "es-ES-ElviraNeural", label: "Elvira (Espanha - Feminina)" },
    { value: "es-AR-ElenaNeural", label: "Elena (Argentina - Feminina)" },
    { value: "pt-BR-FranciscaNeural", label: "Francisca (Brasil - Feminina)" },
    { value: "pt-BR-AntonioNeural", label: "Antonio (Brasil - Masculina)" },
    { value: "en-US-JennyNeural", label: "Jenny (EUA - Feminina)" },
    { value: "en-US-GuyNeural", label: "Guy (EUA - Masculina)" },
];

const AZURE_OUTPUT_FORMATS = [
    { value: "audio-16khz-128kbitrate-mono-mp3", label: "MP3 128kbps (padrão)" },
    { value: "audio-24khz-160kbitrate-mono-mp3", label: "MP3 160kbps (alta qualidade)" },
    { value: "audio-48khz-192kbitrate-mono-mp3", label: "MP3 192kbps (máxima qualidade)" },
    { value: "riff-24khz-16bit-mono-pcm", label: "WAV 24kHz (sem compressão)" },
];

const RATE_OPTIONS = [
    { value: "-30%", label: "-30% (Bem lento)" },
    { value: "-20%", label: "-20% (Lento)" },
    { value: "-10%", label: "-10% (Pouco lento)" },
    { value: "0%", label: "0% (Normal)" },
    { value: "+10%", label: "+10% (Pouco rápido)" },
    { value: "+20%", label: "+20% (Rápido)" },
    { value: "+30%", label: "+30% (Bem rápido)" },
];

const PITCH_OPTIONS = [
    { value: "-15%", label: "-15% (Bem grave)" },
    { value: "-10%", label: "-10% (Grave)" },
    { value: "-5%", label: "-5% (Pouco grave)" },
    { value: "0%", label: "0% (Normal)" },
    { value: "+5%", label: "+5% (Pouco agudo)" },
    { value: "+10%", label: "+10% (Agudo)" },
    { value: "+15%", label: "+15% (Bem agudo)" },
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

    // Helper para campo com explicação
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
        return (
            <div className="space-y-4">
                <FieldWithHelp label="Modelo" help="Modelo Claude a ser usado">
                    <Select
                        value={edited.defaultModel || String(config.model || "")}
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

                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs">
                        💡 <strong>Ou digite manualmente:</strong> Se quiser usar um modelo que não está na lista
                    </p>
                    <Input
                        className="mt-2"
                        value={edited.defaultModel || ""}
                        onChange={(e) => setEdited({ ...edited, defaultModel: e.target.value })}
                        placeholder="claude-sonnet-4-5-20250514"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FieldWithHelp label="Temperature" help="Criatividade da resposta">
                        <Select
                            value={String(config.temperature || "0.7")}
                            onValueChange={(v) => updateConfig("temperature", parseFloat(v))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TEMPERATURE_OPTIONS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>

                    <FieldWithHelp label="Max Tokens" help="Tamanho máximo da resposta">
                        <Select
                            value={String(config.maxTokens || "4096")}
                            onValueChange={(v) => updateConfig("maxTokens", parseInt(v))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MAX_TOKENS_OPTIONS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        💡 <strong>Dica:</strong> Use temperature baixa (0.1-0.3) para tarefas precisas como parsing.
                        Use alta (0.7-1.0) para geração criativa como roteiros.
                    </p>
                </div>
            </div>
        );
    };

    const renderTTSConfig = () => {
        const config = getConfig();
        return (
            <div className="space-y-4">
                <FieldWithHelp label="Voz Padrão" help="Voz Azure para narração">
                    <Select
                        value={String(config.defaultVoice || "")}
                        onValueChange={(v) => updateConfig("defaultVoice", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma voz" />
                        </SelectTrigger>
                        <SelectContent>
                            {AZURE_VOICES.map((v) => (
                                <SelectItem key={v.value} value={v.value}>
                                    {v.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs">
                        💡 <strong>Ou digite manualmente:</strong> Qualquer voz Azure válida
                    </p>
                    <Input
                        className="mt-2"
                        value={String(config.defaultVoice || "")}
                        onChange={(e) => updateConfig("defaultVoice", e.target.value)}
                        placeholder="es-MX-DaliaNeural"
                    />
                </div>

                <FieldWithHelp label="Formato de Saída" help="Qualidade do áudio">
                    <Select
                        value={String(config.outputFormat || "audio-16khz-128kbitrate-mono-mp3")}
                        onValueChange={(v) => updateConfig("outputFormat", v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AZURE_OUTPUT_FORMATS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <div className="grid grid-cols-2 gap-4">
                    <FieldWithHelp label="Rate (Velocidade)" help="Velocidade da fala">
                        <Select
                            value={String(config.rate || "0%")}
                            onValueChange={(v) => updateConfig("rate", v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RATE_OPTIONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>

                    <FieldWithHelp label="Pitch (Tom)" help="Tom grave/agudo">
                        <Select
                            value={String(config.pitch || "0%")}
                            onValueChange={(v) => updateConfig("pitch", v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
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
                            Novo Provider
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <ContextBanner
                        title="O que são Providers?"
                        description="Providers são os serviços de IA que o sistema usa: Claude gera textos, Azure Speech converte em áudio."
                        tips={[
                            "LLM (Claude): Gera roteiros, títulos, descrições, tags",
                            "TTS (Azure): Converte o roteiro em áudio narrado",
                            "Você pode ter vários providers do mesmo tipo com configs diferentes",
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
                                            <FieldWithHelp label="Nome" help="Nome amigável do provider">
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </FieldWithHelp>
                                            <FieldWithHelp label="Tipo" help="LLM para texto, TTS para áudio">
                                                <Select
                                                    value={edited.type || ""}
                                                    onValueChange={(v) => setEdited({ ...edited, type: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="llm">LLM (Geração de Texto)</SelectItem>
                                                        <SelectItem value="tts">TTS (Texto para Áudio)</SelectItem>
                                                        <SelectItem value="image">Imagem</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FieldWithHelp>
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
                                                <FieldWithHelp label="Base URL" help="Endpoint da API">
                                                    <Input value={edited.baseUrl || ""} onChange={(e) => setEdited({ ...edited, baseUrl: e.target.value })} />
                                                </FieldWithHelp>
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
