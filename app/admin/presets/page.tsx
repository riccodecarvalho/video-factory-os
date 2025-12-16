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
import { Save, Loader2, Mic, Video, Sparkles, FileCode, Sliders, HelpCircle } from "lucide-react";
import { getPresets, getPresetCounts, updatePreset, type PresetType } from "../actions";

type Preset = Awaited<ReturnType<typeof getPresets>>[0];

const typeIcons: Record<string, typeof Sliders> = {
    all: Sliders,
    voice: Mic,
    video: Video,
    effects: Sparkles,
    ssml: FileCode,
};

// =============================================
// OPÇÕES CONFIGURÁVEIS (todas como listas)
// =============================================

const VOICE_NAMES = [
    { value: "es-MX-DaliaNeural", label: "Dalia (México - Feminina)" },
    { value: "es-MX-JorgeNeural", label: "Jorge (México - Masculina)" },
    { value: "es-ES-ElviraNeural", label: "Elvira (Espanha - Feminina)" },
    { value: "es-AR-ElenaNeural", label: "Elena (Argentina - Feminina)" },
    { value: "pt-BR-FranciscaNeural", label: "Francisca (Brasil - Feminina)" },
    { value: "pt-BR-AntonioNeural", label: "Antonio (Brasil - Masculina)" },
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

const VOICE_STYLES = [
    { value: "neutral", label: "Neutro (padrão)" },
    { value: "cheerful", label: "Alegre" },
    { value: "sad", label: "Triste" },
    { value: "angry", label: "Irritado" },
    { value: "fearful", label: "Amedrontado" },
    { value: "whispering", label: "Sussurrando" },
    { value: "shouting", label: "Gritando" },
    { value: "empathetic", label: "Empático" },
];

const STYLE_DEGREE_OPTIONS = [
    { value: "0.5", label: "0.5 (Sutil)" },
    { value: "1.0", label: "1.0 (Normal)" },
    { value: "1.5", label: "1.5 (Intenso)" },
    { value: "2.0", label: "2.0 (Máximo)" },
];

const VIDEO_RESOLUTIONS = [
    { value: "1280:720", label: "720p HD (1280x720)" },
    { value: "1920:1080", label: "1080p Full HD (1920x1080)" },
    { value: "2560:1440", label: "1440p 2K (2560x1440)" },
    { value: "3840:2160", label: "4K UHD (3840x2160)" },
];

const VIDEO_ENCODERS = [
    { value: "libx264", label: "libx264 (CPU - compatível)" },
    { value: "h264_videotoolbox", label: "VideoToolbox (Mac GPU - rápido)" },
];

const VIDEO_BITRATES = [
    { value: "2M", label: "2 Mbps (baixa qualidade)" },
    { value: "4M", label: "4 Mbps (boa qualidade)" },
    { value: "8M", label: "8 Mbps (alta qualidade)" },
    { value: "12M", label: "12 Mbps (máxima qualidade)" },
    { value: "16M", label: "16 Mbps (4K)" },
];

const VIDEO_FPS = [
    { value: "24", label: "24 fps (Cinema)" },
    { value: "30", label: "30 fps (Padrão)" },
    { value: "60", label: "60 fps (Suave)" },
];

export default function AdminPresetsPage() {
    const [presets, setPresets] = useState<Preset[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selected, setSelected] = useState<Preset | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Record<string, unknown>>({});

    useEffect(() => {
        loadData();
    }, [selectedType, searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const type = selectedType === "all" ? undefined : selectedType as PresetType;
            const [data, countsData] = await Promise.all([
                getPresets(type, searchValue),
                getPresetCounts(),
            ]);
            setPresets(data);
            setCounts(countsData);
        });
    };

    const handleSelect = (item: Preset) => {
        setSelected(item);
        setEdited({ ...item });
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updatePreset(selected.presetType as PresetType, selected.id, edited);
            loadData();
        });
    };

    const typeCards = Object.entries(counts).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.charAt(0).toUpperCase() + id.slice(1),
        count,
        icon: typeIcons[id] || Sliders,
    }));

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

    // Renderiza form específico para Voice
    const renderVoiceForm = () => (
        <div className="space-y-4">
            <FieldWithHelp label="Voz" help="Voz do Azure TTS usada para narração">
                <Select
                    value={String(edited.voiceName || "")}
                    onValueChange={(v) => setEdited({ ...edited, voiceName: v })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione uma voz" />
                    </SelectTrigger>
                    <SelectContent>
                        {VOICE_NAMES.map((v) => (
                            <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FieldWithHelp>

            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Rate (Velocidade)" help="Velocidade da fala">
                    <Select
                        value={String(edited.rate || "0%")}
                        onValueChange={(v) => setEdited({ ...edited, rate: v })}
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

                <FieldWithHelp label="Pitch (Tom)" help="Tom de voz grave/agudo">
                    <Select
                        value={String(edited.pitch || "0%")}
                        onValueChange={(v) => setEdited({ ...edited, pitch: v })}
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

            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Estilo de Voz" help="Emoção/entonação da fala">
                    <Select
                        value={String(edited.style || "neutral")}
                        onValueChange={(v) => setEdited({ ...edited, style: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {VOICE_STYLES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <FieldWithHelp label="Intensidade Estilo" help="Quão forte é o estilo">
                    <Select
                        value={String(edited.styleDegree || "1.0")}
                        onValueChange={(v) => setEdited({ ...edited, styleDegree: parseFloat(v) })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STYLE_DEGREE_OPTIONS.map((d) => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>
            </div>

            <FieldWithHelp label="Idioma" help="Código do idioma (pode digitar)">
                <Input
                    value={String(edited.language || "")}
                    onChange={(e) => setEdited({ ...edited, language: e.target.value })}
                    placeholder="es-MX, pt-BR, en-US..."
                />
            </FieldWithHelp>
        </div>
    );

    // Renderiza form específico para Video
    const renderVideoForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Resolução" help="Tamanho do vídeo final">
                    <Select
                        value={String(edited.scale || "1920:1080")}
                        onValueChange={(v) => setEdited({ ...edited, scale: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {VIDEO_RESOLUTIONS.map((r) => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <FieldWithHelp label="Encoder" help="Processador de vídeo">
                    <Select
                        value={String(edited.encoder || "libx264")}
                        onValueChange={(v) => setEdited({ ...edited, encoder: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {VIDEO_ENCODERS.map((e) => (
                                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Bitrate" help="Qualidade vs tamanho arquivo">
                    <Select
                        value={String(edited.bitrate || "4M")}
                        onValueChange={(v) => setEdited({ ...edited, bitrate: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {VIDEO_BITRATES.map((b) => (
                                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <FieldWithHelp label="FPS" help="Quadros por segundo">
                    <Select
                        value={String(edited.fps || "30")}
                        onValueChange={(v) => setEdited({ ...edited, fps: parseInt(v) })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {VIDEO_FPS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Pixel Format" help="Formato de cor (pode digitar)">
                    <Input
                        value={String(edited.pixelFormat || "yuv420p")}
                        onChange={(e) => setEdited({ ...edited, pixelFormat: e.target.value })}
                    />
                </FieldWithHelp>
                <FieldWithHelp label="Audio Codec" help="Codec de áudio">
                    <Input
                        value={String(edited.audioCodec || "aac")}
                        onChange={(e) => setEdited({ ...edited, audioCodec: e.target.value })}
                    />
                </FieldWithHelp>
            </div>
        </div>
    );

    // Renderiza form genérico
    const renderGenericForm = () => (
        <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Configuração</p>
            <pre className="text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(
                    Object.fromEntries(
                        Object.entries(selected || {}).filter(([k]) =>
                            !["id", "slug", "name", "description", "presetType", "createdAt", "isActive"].includes(k)
                        )
                    ),
                    null,
                    2
                )}
            </pre>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Presets" }]}
                    title="Presets"
                    description="Configurações reutilizáveis para voz e vídeo"
                />

                <div className="flex-1 p-6">
                    <ContextBanner
                        title="O que são Presets?"
                        description="Presets são configurações prontas que você aplica ao gerar áudio e vídeo. Selecione valores nas listas abaixo."
                        tips={[
                            "Voice Preset: Define voz, velocidade, tom e estilo de narração",
                            "Video Preset: Define resolução, qualidade e formato do vídeo",
                            "Cada job usa um preset de voz e um de vídeo",
                        ]}
                        variant="info"
                    />

                    {typeCards.length > 0 && (
                        <SectionCards cards={typeCards} activeId={selectedType} onSelect={setSelectedType} className="mb-6" />
                    )}

                    <FiltersBar searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Buscar presets..." className="mb-4" />

                    <SplitView
                        isLoading={isPending && presets.length === 0}
                        isEmpty={presets.length === 0}
                        emptyState={<EmptyState variant="empty" title="Nenhum preset" description="Execute o seed para criar presets iniciais" />}
                        list={
                            <div>
                                {presets.map((item) => (
                                    <SplitViewListItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={item.slug}
                                        meta={item.presetType}
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
                                                <Badge variant="outline">{selected.presetType}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selected.slug}</p>
                                        </div>
                                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Nome */}
                                        <FieldWithHelp label="Nome do Preset" help="Nome amigável para identificar">
                                            <Input
                                                value={String(edited.name || "")}
                                                onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                                            />
                                        </FieldWithHelp>

                                        {/* Form específico por tipo */}
                                        <div className="border-t pt-4">
                                            <h3 className="font-medium mb-4">
                                                {selected.presetType === "voice" ? "🎙️ Configurações de Voz" :
                                                    selected.presetType === "video" ? "🎬 Configurações de Vídeo" :
                                                        "⚙️ Configurações"}
                                            </h3>

                                            {selected.presetType === "voice" && renderVoiceForm()}
                                            {selected.presetType === "video" && renderVideoForm()}
                                            {selected.presetType !== "voice" && selected.presetType !== "video" && renderGenericForm()}
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
