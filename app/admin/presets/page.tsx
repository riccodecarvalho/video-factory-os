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
import { Save, Loader2, Mic, Video, Sparkles, FileCode, Sliders } from "lucide-react";
import { getPresets, getPresetCounts, updatePreset, type PresetType } from "../actions";

type Preset = Awaited<ReturnType<typeof getPresets>>[0];

const typeIcons: Record<string, typeof Sliders> = {
    all: Sliders,
    voice: Mic,
    video: Video,
    effects: Sparkles,
    ssml: FileCode,
};

// Opções para Voice Presets
const VOICE_STYLES = [
    { value: "neutral", label: "Neutro" },
    { value: "cheerful", label: "Alegre" },
    { value: "sad", label: "Triste" },
    { value: "angry", label: "Irritado" },
    { value: "fearful", label: "Amedrontado" },
    { value: "whispering", label: "Sussurrando" },
    { value: "shouting", label: "Gritando" },
];

// Opções para Video Presets
const VIDEO_RESOLUTIONS = [
    { value: "1280:720", label: "720p (HD)" },
    { value: "1920:1080", label: "1080p (Full HD)" },
    { value: "3840:2160", label: "4K (UHD)" },
];

const VIDEO_ENCODERS = [
    { value: "libx264", label: "libx264 (CPU)" },
    { value: "h264_videotoolbox", label: "VideoToolbox (Mac GPU)" },
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

    // Renderiza form específico para Voice
    const renderVoiceForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nome da Voz</Label>
                    <Input
                        value={String(edited.voiceName || "")}
                        onChange={(e) => setEdited({ ...edited, voiceName: e.target.value })}
                        placeholder="es-MX-DaliaNeural"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Input
                        value={String(edited.language || "")}
                        onChange={(e) => setEdited({ ...edited, language: e.target.value })}
                        placeholder="es-MX"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Rate (Velocidade): {String(edited.rate || "0")}%</Label>
                <Slider
                    value={[Number(edited.rate) || 0]}
                    onValueChange={([v]) => setEdited({ ...edited, rate: String(v) })}
                    min={-50}
                    max={50}
                    step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50% Lento</span>
                    <span>Normal</span>
                    <span>+50% Rápido</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Pitch (Tom): {String(edited.pitch || "0")}%</Label>
                <Slider
                    value={[Number(edited.pitch) || 0]}
                    onValueChange={([v]) => setEdited({ ...edited, pitch: String(v) })}
                    min={-20}
                    max={20}
                    step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Grave</span>
                    <span>Normal</span>
                    <span>Agudo</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Estilo</Label>
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
                </div>
                <div className="space-y-2">
                    <Label>Intensidade Estilo: {String(edited.styleDegree || 1)}</Label>
                    <Slider
                        value={[Number(edited.styleDegree) || 1]}
                        onValueChange={([v]) => setEdited({ ...edited, styleDegree: v })}
                        min={0.5}
                        max={2}
                        step={0.1}
                    />
                </div>
            </div>
        </div>
    );

    // Renderiza form específico para Video
    const renderVideoForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Resolução</Label>
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
                </div>
                <div className="space-y-2">
                    <Label>Encoder</Label>
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
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Bitrate</Label>
                    <Input
                        value={String(edited.bitrate || "4M")}
                        onChange={(e) => setEdited({ ...edited, bitrate: e.target.value })}
                        placeholder="4M, 8M, 12M"
                    />
                    <p className="text-xs text-muted-foreground">Ex: 4M, 8M, 12M</p>
                </div>
                <div className="space-y-2">
                    <Label>FPS</Label>
                    <Select
                        value={String(edited.fps || "30")}
                        onValueChange={(v) => setEdited({ ...edited, fps: parseInt(v) })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24">24 fps (Cinema)</SelectItem>
                            <SelectItem value="30">30 fps (Padrão)</SelectItem>
                            <SelectItem value="60">60 fps (Suave)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Pixel Format</Label>
                    <Input
                        value={String(edited.pixelFormat || "yuv420p")}
                        onChange={(e) => setEdited({ ...edited, pixelFormat: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Audio Codec</Label>
                    <Input
                        value={String(edited.audioCodec || "aac")}
                        onChange={(e) => setEdited({ ...edited, audioCodec: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );

    // Renderiza form genérico (JSON) para outros tipos
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
                    description="Voice, Video, Effects e SSML presets"
                />

                <div className="flex-1 p-6">
                    <ContextBanner
                        title="O que são Presets?"
                        description="Presets são configurações reutilizáveis para voz, vídeo e efeitos. Definem como o áudio e vídeo serão gerados."
                        tips={[
                            "Voice: Configurações de voz TTS (velocidade, tom, estilo)",
                            "Video: Resolução, encoder, bitrate e FPS",
                            "SSML: Templates de marcação para TTS",
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
                                        {/* Nome e descrição */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input
                                                    value={String(edited.name || "")}
                                                    onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Slug</Label>
                                                <Input
                                                    value={String(edited.slug || "")}
                                                    onChange={(e) => setEdited({ ...edited, slug: e.target.value })}
                                                    disabled
                                                />
                                            </div>
                                        </div>

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
