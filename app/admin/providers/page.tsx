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
// CLAUDE MODELS - DADOS COMPLETOS 2025
// Fonte: https://platform.claude.com/docs/en/about-claude/models/overview
// =============================================
const CLAUDE_MODELS = [
    // Claude 4.5 (Lançado Set 2025 - mais recente)
    { value: "claude-sonnet-4-5-20250514", label: "Claude 4.5 Sonnet (mais recente)", maxOutput: 64000, contextWindow: 200000 },

    // Claude 4 (Lançado 2025)
    { value: "claude-sonnet-4-20250514", label: "Claude 4 Sonnet", maxOutput: 64000, contextWindow: 200000 },
    { value: "claude-opus-4-20250514", label: "Claude 4 Opus (mais capaz)", maxOutput: 32000, contextWindow: 200000 },

    // Claude 3.5 (2024)
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", maxOutput: 8192, contextWindow: 200000 },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (rápido)", maxOutput: 8192, contextWindow: 200000 },

    // Claude 3 (2024)
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus", maxOutput: 4096, contextWindow: 200000 },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet", maxOutput: 4096, contextWindow: 200000 },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (mais rápido)", maxOutput: 4096, contextWindow: 200000 },
];

const TEMPERATURE_OPTIONS = [
    { value: "0.0", label: "0.0 — Determinístico (sempre igual)" },
    { value: "0.1", label: "0.1 — Muito preciso" },
    { value: "0.2", label: "0.2 — Preciso" },
    { value: "0.3", label: "0.3 — Moderado" },
    { value: "0.5", label: "0.5 — Equilibrado" },
    { value: "0.7", label: "0.7 — Criativo (recomendado para roteiros)" },
    { value: "0.8", label: "0.8 — Muito criativo" },
    { value: "1.0", label: "1.0 — Máxima criatividade" },
];

// Max tokens dinâmico por modelo
const getMaxTokensOptions = (model: string) => {
    const modelInfo = CLAUDE_MODELS.find(m => m.value === model);
    const maxOutput = modelInfo?.maxOutput || 64000;

    const options = [
        { value: "1024", label: "1.024 (respostas curtas)" },
        { value: "2048", label: "2.048 (respostas médias)" },
        { value: "4096", label: "4.096 (padrão)" },
        { value: "8192", label: "8.192 (respostas longas)" },
        { value: "16000", label: "16.000 (roteiros médios)" },
        { value: "32000", label: "32.000 (roteiros longos)" },
    ];

    if (maxOutput >= 64000) {
        options.push({ value: "64000", label: "64.000 (máximo Claude 4+)" });
    }

    return options.filter(o => parseInt(o.value) <= maxOutput);
};

// =============================================
// AZURE VOICES - LISTA COMPLETA ESPANHOL/PORTUGUÊS
// Fonte: https://learn.microsoft.com/azure/ai-services/speech-service/language-support
// =============================================
const AZURE_VOICES = [
    // Espanhol México
    { value: "es-MX-DaliaNeural", label: "🇲🇽 Dalia (México - Feminina - Narrativa)", gender: "Female" },
    { value: "es-MX-JorgeNeural", label: "🇲🇽 Jorge (México - Masculina)", gender: "Male" },
    { value: "es-MX-CarlotaNeural", label: "🇲🇽 Carlota (México - Feminina)", gender: "Female" },
    { value: "es-MX-LibertoNeural", label: "🇲🇽 Liberto (México - Masculina - Idoso)", gender: "Male" },
    { value: "es-MX-LucianoNeural", label: "🇲🇽 Luciano (México - Masculina - Jovem)", gender: "Male" },
    { value: "es-MX-MarinaNeural", label: "🇲🇽 Marina (México - Feminina)", gender: "Female" },
    { value: "es-MX-NuriaNeural", label: "🇲🇽 Nuria (México - Feminina - Criança)", gender: "Female" },
    { value: "es-MX-RenataNeural", label: "🇲🇽 Renata (México - Feminina)", gender: "Female" },
    { value: "es-MX-YagoNeural", label: "🇲🇽 Yago (México - Masculina)", gender: "Male" },

    // Espanhol Espanha
    { value: "es-ES-ElviraNeural", label: "🇪🇸 Elvira (Espanha - Feminina)", gender: "Female" },
    { value: "es-ES-AlvaroNeural", label: "🇪🇸 Álvaro (Espanha - Masculina)", gender: "Male" },
    { value: "es-ES-AbrilNeural", label: "🇪🇸 Abril (Espanha - Feminina)", gender: "Female" },
    { value: "es-ES-ArnauNeural", label: "🇪🇸 Arnau (Espanha - Masculina)", gender: "Male" },
    { value: "es-ES-DarioNeural", label: "🇪🇸 Dario (Espanha - Masculina)", gender: "Male" },
    { value: "es-ES-EliasNeural", label: "🇪🇸 Elías (Espanha - Masculina)", gender: "Male" },
    { value: "es-ES-EstrellaNeural", label: "🇪🇸 Estrella (Espanha - Feminina)", gender: "Female" },
    { value: "es-ES-IreneNeural", label: "🇪🇸 Irene (Espanha - Feminina)", gender: "Female" },
    { value: "es-ES-LaiaNeural", label: "🇪🇸 Laia (Espanha - Feminina)", gender: "Female" },
    { value: "es-ES-LiaNeural", label: "🇪🇸 Lía (Espanha - Feminina)", gender: "Female" },
    { value: "es-ES-NilNeural", label: "🇪🇸 Nil (Espanha - Masculina)", gender: "Male" },
    { value: "es-ES-SaulNeural", label: "🇪🇸 Saúl (Espanha - Masculina)", gender: "Male" },
    { value: "es-ES-TeoNeural", label: "🇪🇸 Teo (Espanha - Masculina)", gender: "Male" },
    { value: "es-ES-TrianaNeural", label: "🇪🇸 Triana (Espanha - Feminina)", gender: "Female" },
    { value: "es-ES-VeraNeural", label: "🇪🇸 Vera (Espanha - Feminina)", gender: "Female" },

    // Espanhol Argentina
    { value: "es-AR-ElenaNeural", label: "🇦🇷 Elena (Argentina - Feminina)", gender: "Female" },
    { value: "es-AR-TomasNeural", label: "🇦🇷 Tomás (Argentina - Masculina)", gender: "Male" },

    // Espanhol Colômbia
    { value: "es-CO-SalomeNeural", label: "🇨🇴 Salomé (Colômbia - Feminina)", gender: "Female" },
    { value: "es-CO-GonzaloNeural", label: "🇨🇴 Gonzalo (Colômbia - Masculina)", gender: "Male" },

    // Espanhol Chile
    { value: "es-CL-CatalinaNeural", label: "🇨🇱 Catalina (Chile - Feminina)", gender: "Female" },
    { value: "es-CL-LorenzoNeural", label: "🇨🇱 Lorenzo (Chile - Masculina)", gender: "Male" },

    // Português Brasil
    { value: "pt-BR-FranciscaNeural", label: "🇧🇷 Francisca (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-AntonioNeural", label: "🇧🇷 Antonio (Brasil - Masculina)", gender: "Male" },
    { value: "pt-BR-BrendaNeural", label: "🇧🇷 Brenda (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-DonatoNeural", label: "🇧🇷 Donato (Brasil - Masculina)", gender: "Male" },
    { value: "pt-BR-ElzaNeural", label: "🇧🇷 Elza (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-FabioNeural", label: "🇧🇷 Fabio (Brasil - Masculina)", gender: "Male" },
    { value: "pt-BR-GiovannaNeural", label: "🇧🇷 Giovanna (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-HumbertoNeural", label: "🇧🇷 Humberto (Brasil - Masculina)", gender: "Male" },
    { value: "pt-BR-JulioNeural", label: "🇧🇷 Julio (Brasil - Masculina)", gender: "Male" },
    { value: "pt-BR-LeilaNeural", label: "🇧🇷 Leila (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-LeticiaNeural", label: "🇧🇷 Letícia (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-ManuelaNeural", label: "🇧🇷 Manuela (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-NicolauNeural", label: "🇧🇷 Nicolau (Brasil - Masculina)", gender: "Male" },
    { value: "pt-BR-ValerioNeural", label: "🇧🇷 Valério (Brasil - Masculina)", gender: "Male" },
    { value: "pt-BR-YaraNeural", label: "🇧🇷 Yara (Brasil - Feminina)", gender: "Female" },
    { value: "pt-BR-ThalitaNeural", label: "🇧🇷 Thalita (Brasil - Feminina - Conversacional)", gender: "Female" },

    // Português Portugal
    { value: "pt-PT-RaquelNeural", label: "🇵🇹 Raquel (Portugal - Feminina)", gender: "Female" },
    { value: "pt-PT-DuarteNeural", label: "🇵🇹 Duarte (Portugal - Masculina)", gender: "Male" },

    // Inglês EUA
    { value: "en-US-JennyNeural", label: "🇺🇸 Jenny (EUA - Feminina)", gender: "Female" },
    { value: "en-US-GuyNeural", label: "🇺🇸 Guy (EUA - Masculina)", gender: "Male" },
    { value: "en-US-AriaNeural", label: "🇺🇸 Aria (EUA - Feminina)", gender: "Female" },
    { value: "en-US-DavisNeural", label: "🇺🇸 Davis (EUA - Masculina)", gender: "Male" },
];

const AZURE_OUTPUT_FORMATS = [
    { value: "audio-16khz-32kbitrate-mono-mp3", label: "MP3 32kbps (baixa qualidade)" },
    { value: "audio-16khz-64kbitrate-mono-mp3", label: "MP3 64kbps (média)" },
    { value: "audio-16khz-128kbitrate-mono-mp3", label: "MP3 128kbps (padrão)" },
    { value: "audio-24khz-48kbitrate-mono-mp3", label: "MP3 48kbps 24kHz" },
    { value: "audio-24khz-96kbitrate-mono-mp3", label: "MP3 96kbps 24kHz" },
    { value: "audio-24khz-160kbitrate-mono-mp3", label: "MP3 160kbps (alta qualidade)" },
    { value: "audio-48khz-192kbitrate-mono-mp3", label: "MP3 192kbps 48kHz (máxima)" },
    { value: "riff-16khz-16bit-mono-pcm", label: "WAV 16kHz (sem compressão)" },
    { value: "riff-24khz-16bit-mono-pcm", label: "WAV 24kHz (sem compressão)" },
    { value: "riff-48khz-16bit-mono-pcm", label: "WAV 48kHz (estúdio)" },
];

const RATE_OPTIONS = [
    { value: "-50%", label: "-50% (Muito lento)" },
    { value: "-30%", label: "-30% (Bem lento)" },
    { value: "-20%", label: "-20% (Lento)" },
    { value: "-10%", label: "-10% (Pouco lento)" },
    { value: "0%", label: "0% (Normal)" },
    { value: "+10%", label: "+10% (Pouco rápido)" },
    { value: "+20%", label: "+20% (Rápido)" },
    { value: "+30%", label: "+30% (Bem rápido)" },
    { value: "+50%", label: "+50% (Muito rápido)" },
];

const PITCH_OPTIONS = [
    { value: "-50%", label: "-50% (Muito grave)" },
    { value: "-30%", label: "-30% (Bem grave)" },
    { value: "-15%", label: "-15% (Grave)" },
    { value: "-5%", label: "-5% (Pouco grave)" },
    { value: "0%", label: "0% (Normal)" },
    { value: "+5%", label: "+5% (Pouco agudo)" },
    { value: "+15%", label: "+15% (Agudo)" },
    { value: "+30%", label: "+30% (Bem agudo)" },
    { value: "+50%", label: "+50% (Muito agudo)" },
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
        const currentModel = edited.defaultModel || String(config.model || "");
        const modelInfo = CLAUDE_MODELS.find(m => m.value === currentModel);

        return (
            <div className="space-y-4">
                <FieldWithHelp label="Modelo" help="Modelo Claude a ser usado">
                    <Select
                        value={currentModel}
                        onValueChange={(v) => setEdited({ ...edited, defaultModel: v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="" disabled>— Claude 4.5 (2025) —</SelectItem>
                            {CLAUDE_MODELS.filter(m => m.value.includes("4-5")).map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Claude 4 (2025) —</SelectItem>
                            {CLAUDE_MODELS.filter(m => m.value.includes("-4-") && !m.value.includes("4-5")).map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Claude 3.5 (2024) —</SelectItem>
                            {CLAUDE_MODELS.filter(m => m.value.includes("3-5")).map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Claude 3 (2024) —</SelectItem>
                            {CLAUDE_MODELS.filter(m => m.value.includes("3-") && !m.value.includes("3-5")).map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                {modelInfo && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-sm">
                        <p><strong>Context Window:</strong> {modelInfo.contextWindow.toLocaleString()} tokens</p>
                        <p><strong>Max Output:</strong> {modelInfo.maxOutput.toLocaleString()} tokens</p>
                    </div>
                )}

                <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-xs mb-2">💡 <strong>Ou digite manualmente:</strong></p>
                    <Input
                        value={edited.defaultModel || ""}
                        onChange={(e) => setEdited({ ...edited, defaultModel: e.target.value })}
                        placeholder="claude-sonnet-4-5-20250514"
                        className="font-mono text-sm"
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
                <FieldWithHelp label="Voz Padrão" help="Voz Azure para narração">
                    <Select
                        value={String(config.defaultVoice || "")}
                        onValueChange={(v) => updateConfig("defaultVoice", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma voz" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="" disabled>— Espanhol México —</SelectItem>
                            {AZURE_VOICES.filter(v => v.value.startsWith("es-MX")).map((v) => (
                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Espanhol Espanha —</SelectItem>
                            {AZURE_VOICES.filter(v => v.value.startsWith("es-ES")).map((v) => (
                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Espanhol Latam —</SelectItem>
                            {AZURE_VOICES.filter(v => v.value.startsWith("es-") && !v.value.startsWith("es-MX") && !v.value.startsWith("es-ES")).map((v) => (
                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Português Brasil —</SelectItem>
                            {AZURE_VOICES.filter(v => v.value.startsWith("pt-BR")).map((v) => (
                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Português Portugal —</SelectItem>
                            {AZURE_VOICES.filter(v => v.value.startsWith("pt-PT")).map((v) => (
                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                            <SelectItem value="" disabled>— Inglês —</SelectItem>
                            {AZURE_VOICES.filter(v => v.value.startsWith("en-")).map((v) => (
                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-xs mb-2">💡 <strong>Ou digite manualmente:</strong> Qualquer voz Azure válida</p>
                    <Input
                        value={String(config.defaultVoice || "")}
                        onChange={(e) => updateConfig("defaultVoice", e.target.value)}
                        placeholder="es-MX-DaliaNeural"
                        className="font-mono text-sm"
                    />
                </div>

                <FieldWithHelp label="Formato de Saída" help="Qualidade do áudio">
                    <Select
                        value={String(config.outputFormat || "audio-24khz-160kbitrate-mono-mp3")}
                        onValueChange={(v) => updateConfig("outputFormat", v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AZURE_OUTPUT_FORMATS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
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
                        description="Providers são os serviços de IA: Claude gera textos, Azure Speech converte em áudio."
                        tips={[
                            "Claude 4.5 Sonnet: Até 64.000 tokens de output, contexto de 200k",
                            "Azure TTS: 400+ vozes neurais em 140 idiomas",
                            "Selecione na lista ou digite manualmente para flexibilidade",
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
                                            <FieldWithHelp label="Tipo" help="LLM para texto, TTS para áudio">
                                                <Select value={edited.type || ""} onValueChange={(v) => setEdited({ ...edited, type: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="llm">LLM (Geração de Texto)</SelectItem>
                                                        <SelectItem value="tts">TTS (Texto para Áudio)</SelectItem>
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

                                    <div className="mt-6 pt-6 border-t">
                                        <UsedBySection entityId={selected.id} entityType="provider" getUsedBy={getUsedBy} />
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
