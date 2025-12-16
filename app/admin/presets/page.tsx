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
// AZURE VOICES - LISTA COMPLETA COM MULTILINGUAL
// Inclui todas as vozes que você pode ter no DB
// =============================================
const VOICE_NAMES = [
    // === MULTILINGUAL (41 idiomas) ===
    { value: "es-ES-XimenaMultilingualNeural", label: "🌐 Ximena Multilingual (ES)" },
    { value: "es-ES-IsidoraMultilingualNeural", label: "🌐 Isidora Multilingual (ES)" },
    { value: "es-ES-ArabellaMultilingualNeural", label: "🌐 Arabella Multilingual (ES)" },
    { value: "pt-BR-ThalitaMultilingualNeural", label: "🌐 Thalita Multilingual (BR)" },
    { value: "en-US-AvaMultilingualNeural", label: "🌐 Ava Multilingual (US)" },
    { value: "en-US-AndrewMultilingualNeural", label: "🌐 Andrew Multilingual (US)" },
    { value: "en-US-EmmaMultilingualNeural", label: "🌐 Emma Multilingual (US)" },
    { value: "en-US-BrianMultilingualNeural", label: "🌐 Brian Multilingual (US)" },

    // === ESPANHOL MÉXICO ===
    { value: "es-MX-DaliaNeural", label: "🇲🇽 Dalia (México)" },
    { value: "es-MX-JorgeNeural", label: "🇲🇽 Jorge (México)" },
    { value: "es-MX-BeatrizNeural", label: "🇲🇽 Beatriz (México)" },
    { value: "es-MX-CandelaNeural", label: "🇲🇽 Candela (México)" },
    { value: "es-MX-CarlotaNeural", label: "🇲🇽 Carlota (México)" },
    { value: "es-MX-CecilioNeural", label: "🇲🇽 Cecilio (México)" },
    { value: "es-MX-GerardoNeural", label: "🇲🇽 Gerardo (México)" },
    { value: "es-MX-LarissaNeural", label: "🇲🇽 Larissa (México)" },
    { value: "es-MX-LibertoNeural", label: "🇲🇽 Liberto (México)" },
    { value: "es-MX-LucianoNeural", label: "🇲🇽 Luciano (México)" },
    { value: "es-MX-MarinaNeural", label: "🇲🇽 Marina (México)" },
    { value: "es-MX-NuriaNeural", label: "🇲🇽 Nuria (México Criança)" },
    { value: "es-MX-PelayoNeural", label: "🇲🇽 Pelayo (México)" },
    { value: "es-MX-RenataNeural", label: "🇲🇽 Renata (México)" },
    { value: "es-MX-YagoNeural", label: "🇲🇽 Yago (México)" },

    // === ESPANHOL ESPANHA ===
    { value: "es-ES-ElviraNeural", label: "🇪🇸 Elvira (Espanha)" },
    { value: "es-ES-AlvaroNeural", label: "🇪🇸 Álvaro (Espanha)" },
    { value: "es-ES-AbrilNeural", label: "🇪🇸 Abril (Espanha)" },
    { value: "es-ES-ArnauNeural", label: "🇪🇸 Arnau (Espanha)" },
    { value: "es-ES-DarioNeural", label: "🇪🇸 Dario (Espanha)" },
    { value: "es-ES-EliasNeural", label: "🇪🇸 Elías (Espanha)" },
    { value: "es-ES-EstrellaNeural", label: "🇪🇸 Estrella (Espanha)" },
    { value: "es-ES-IreneNeural", label: "🇪🇸 Irene (Espanha)" },
    { value: "es-ES-LaiaNeural", label: "🇪🇸 Laia (Espanha)" },
    { value: "es-ES-LiaNeural", label: "🇪🇸 Lía (Espanha)" },
    { value: "es-ES-NilNeural", label: "🇪🇸 Nil (Espanha)" },
    { value: "es-ES-SaulNeural", label: "🇪🇸 Saúl (Espanha)" },
    { value: "es-ES-TeoNeural", label: "🇪🇸 Teo (Espanha)" },
    { value: "es-ES-TrianaNeural", label: "🇪🇸 Triana (Espanha)" },
    { value: "es-ES-VeraNeural", label: "🇪🇸 Vera (Espanha)" },

    // === ESPANHOL LATAM ===
    { value: "es-AR-ElenaNeural", label: "🇦🇷 Elena (Argentina)" },
    { value: "es-AR-TomasNeural", label: "🇦🇷 Tomás (Argentina)" },
    { value: "es-CO-SalomeNeural", label: "🇨🇴 Salomé (Colômbia)" },
    { value: "es-CO-GonzaloNeural", label: "🇨🇴 Gonzalo (Colômbia)" },
    { value: "es-CL-CatalinaNeural", label: "🇨🇱 Catalina (Chile)" },
    { value: "es-CL-LorenzoNeural", label: "🇨🇱 Lorenzo (Chile)" },

    // === PORTUGUÊS BRASIL ===
    { value: "pt-BR-FranciscaNeural", label: "🇧🇷 Francisca (Brasil)" },
    { value: "pt-BR-AntonioNeural", label: "🇧🇷 Antonio (Brasil)" },
    { value: "pt-BR-BrendaNeural", label: "🇧🇷 Brenda (Brasil)" },
    { value: "pt-BR-DonatoNeural", label: "🇧🇷 Donato (Brasil)" },
    { value: "pt-BR-ElzaNeural", label: "🇧🇷 Elza (Brasil)" },
    { value: "pt-BR-FabioNeural", label: "🇧🇷 Fabio (Brasil)" },
    { value: "pt-BR-GiovannaNeural", label: "🇧🇷 Giovanna (Brasil)" },
    { value: "pt-BR-HumbertoNeural", label: "🇧🇷 Humberto (Brasil)" },
    { value: "pt-BR-JulioNeural", label: "🇧🇷 Julio (Brasil)" },
    { value: "pt-BR-LeilaNeural", label: "🇧🇷 Leila (Brasil)" },
    { value: "pt-BR-LeticiaNeural", label: "🇧🇷 Letícia (Brasil)" },
    { value: "pt-BR-ManuelaNeural", label: "🇧🇷 Manuela (Brasil)" },
    { value: "pt-BR-NicolauNeural", label: "🇧🇷 Nicolau (Brasil)" },
    { value: "pt-BR-ThalitaNeural", label: "🇧🇷 Thalita (Brasil)" },
    { value: "pt-BR-ValerioNeural", label: "🇧🇷 Valério (Brasil)" },
    { value: "pt-BR-YaraNeural", label: "🇧🇷 Yara (Brasil)" },

    // === PORTUGUÊS PORTUGAL ===
    { value: "pt-PT-RaquelNeural", label: "🇵🇹 Raquel (Portugal)" },
    { value: "pt-PT-DuarteNeural", label: "🇵🇹 Duarte (Portugal)" },

    // === INGLÊS ===
    { value: "en-US-JennyNeural", label: "🇺🇸 Jenny (EUA)" },
    { value: "en-US-GuyNeural", label: "🇺🇸 Guy (EUA)" },
    { value: "en-US-AriaNeural", label: "🇺🇸 Aria (EUA)" },
    { value: "en-US-DavisNeural", label: "🇺🇸 Davis (EUA)" },
];

// RATE: Schema usa REAL 0.5-2.0
const RATE_OPTIONS = [
    { value: "0.5", label: "0.5x — Metade" },
    { value: "0.7", label: "0.7x — Lento" },
    { value: "0.8", label: "0.8x — Pouco lento" },
    { value: "0.9", label: "0.9x — Quase normal" },
    { value: "1.0", label: "1.0x — Normal" },
    { value: "1.1", label: "1.1x — Pouco rápido" },
    { value: "1.2", label: "1.2x — Rápido" },
    { value: "1.3", label: "1.3x — Bem rápido" },
    { value: "1.5", label: "1.5x — Muito rápido" },
    { value: "2.0", label: "2.0x — Dobro" },
];

// PITCH: Schema usa TEXT '-50%' a '+50%'
const PITCH_OPTIONS = [
    { value: "-30%", label: "-30% — Grave" },
    { value: "-20%", label: "-20% — Pouco grave" },
    { value: "-10%", label: "-10%" },
    { value: "-8%", label: "-8%" },
    { value: "0%", label: "0% — Normal" },
    { value: "+8%", label: "+8%" },
    { value: "+10%", label: "+10%" },
    { value: "+20%", label: "+20% — Agudo" },
    { value: "+30%", label: "+30% — Bem agudo" },
];

const VOICE_STYLES = [
    { value: "", label: "Nenhum (padrão)" },
    { value: "narration-professional", label: "Narração profissional" },
    { value: "newscast", label: "Âncora de notícias" },
    { value: "customerservice", label: "Atendimento" },
    { value: "chat", label: "Conversa" },
    { value: "cheerful", label: "Alegre" },
    { value: "empathetic", label: "Empático" },
    { value: "sad", label: "Triste" },
    { value: "angry", label: "Irritado" },
    { value: "fearful", label: "Amedrontado" },
    { value: "shouting", label: "Gritando" },
    { value: "whispering", label: "Sussurrando" },
];

const STYLE_DEGREE_OPTIONS = [
    { value: "0.5", label: "0.5 — Sutil" },
    { value: "0.75", label: "0.75 — Leve" },
    { value: "1.0", label: "1.0 — Normal" },
    { value: "1.25", label: "1.25 — Acentuado" },
    { value: "1.5", label: "1.5 — Intenso" },
    { value: "2.0", label: "2.0 — Máximo" },
];

const VIDEO_RESOLUTIONS = [
    { value: "1280:720", label: "720p HD" },
    { value: "1920:1080", label: "1080p Full HD" },
    { value: "2560:1440", label: "1440p 2K" },
    { value: "3840:2160", label: "4K UHD" },
];

const VIDEO_ENCODERS = [
    { value: "libx264", label: "libx264 (CPU)" },
    { value: "h264_videotoolbox", label: "VideoToolbox (Mac GPU)" },
];

const VIDEO_BITRATES = [
    { value: "2M", label: "2 Mbps — baixa" },
    { value: "4M", label: "4 Mbps — boa" },
    { value: "8M", label: "8 Mbps — alta" },
    { value: "12M", label: "12 Mbps — máxima" },
    { value: "16M", label: "16 Mbps — 4K" },
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [selectedType, searchValue]);

    const loadData = () => {
        setError(null);
        startTransition(async () => {
            try {
                const type = selectedType === "all" ? undefined : selectedType as PresetType;
                const [data, countsData] = await Promise.all([
                    getPresets(type, searchValue),
                    getPresetCounts(),
                ]);
                setPresets(data);
                setCounts(countsData);
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const handleSelect = (item: Preset) => {
        setSelected(item);
        setEdited({ ...item });
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            try {
                await updatePreset(selected.presetType as PresetType, selected.id, edited);
                loadData();
            } catch (e) {
                setError(String(e));
            }
        });
    };

    const typeCards = Object.entries(counts).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.charAt(0).toUpperCase() + id.slice(1),
        count,
        icon: typeIcons[id] || Sliders,
    }));

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

    // Encontrar a voz atual na lista ou usar manual
    const findVoiceLabel = (voiceName: string) => {
        const found = VOICE_NAMES.find(v => v.value === voiceName);
        return found ? found.label : voiceName;
    };

    const renderVoiceForm = () => {
        const currentVoice = String(edited.voiceName || "");
        const voiceInList = VOICE_NAMES.some(v => v.value === currentVoice);

        return (
            <div className="space-y-4">
                {/* Mostra valor atual */}
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-sm grid grid-cols-2 gap-2">
                    <p><strong>Voz:</strong> {findVoiceLabel(currentVoice) || "não definida"}</p>
                    <p><strong>Idioma:</strong> {String(edited.language || "—")}</p>
                    <p><strong>Velocidade:</strong> {String(edited.rate || 1.0)}x</p>
                    <p><strong>Tom:</strong> {String(edited.pitch || "0%")}</p>
                </div>

                <FieldWithHelp label="Voz Azure" help="Selecione ou digite abaixo">
                    <Select
                        value={voiceInList ? currentVoice : ""}
                        onValueChange={(v) => setEdited({ ...edited, voiceName: v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={currentVoice || "Selecione"} />
                        </SelectTrigger>
                        <SelectContent>
                            {VOICE_NAMES.map((v) => (
                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <FieldWithHelp label="Ou digite manualmente" help="Qualquer voz Azure válida">
                    <Input
                        value={currentVoice}
                        onChange={(e) => setEdited({ ...edited, voiceName: e.target.value })}
                        placeholder="es-ES-XimenaMultilingualNeural"
                        className="font-mono text-sm"
                    />
                </FieldWithHelp>

                <FieldWithHelp label="Idioma" help="Código do idioma">
                    <Input
                        value={String(edited.language || "")}
                        onChange={(e) => setEdited({ ...edited, language: e.target.value })}
                        placeholder="es-ES, pt-BR, en-US..."
                    />
                </FieldWithHelp>

                <div className="grid grid-cols-2 gap-4">
                    <FieldWithHelp label="Rate (Velocidade)" help="0.5x a 2.0x">
                        <Select
                            value={String(edited.rate || "1.0")}
                            onValueChange={(v) => setEdited({ ...edited, rate: parseFloat(v) })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {RATE_OPTIONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>

                    <FieldWithHelp label="Pitch (Tom)" help="-30% a +30%">
                        <Select
                            value={String(edited.pitch || "0%")}
                            onValueChange={(v) => setEdited({ ...edited, pitch: v })}
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

                <div className="grid grid-cols-2 gap-4">
                    <FieldWithHelp label="Estilo" help="Emoção/entonação">
                        <Select
                            value={String(edited.style || "")}
                            onValueChange={(v) => setEdited({ ...edited, style: v || null })}
                        >
                            <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                            <SelectContent>
                                {VOICE_STYLES.map((s) => (
                                    <SelectItem key={s.value || "none"} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>

                    <FieldWithHelp label="Intensidade" help="0.5 a 2.0">
                        <Select
                            value={String(edited.styleDegree || "1.0")}
                            onValueChange={(v) => setEdited({ ...edited, styleDegree: parseFloat(v) })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STYLE_DEGREE_OPTIONS.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldWithHelp>
                </div>
            </div>
        );
    };

    const renderVideoForm = () => (
        <div className="space-y-4">
            {/* Mostra valores atuais */}
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-sm grid grid-cols-2 gap-2">
                <p><strong>Resolução:</strong> {String(edited.scale || "—")}</p>
                <p><strong>Encoder:</strong> {String(edited.encoder || "—")}</p>
                <p><strong>Bitrate:</strong> {String(edited.bitrate || "—")}</p>
                <p><strong>FPS:</strong> {String(edited.fps || "—")}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Resolução" help="Tamanho do vídeo">
                    <Select
                        value={String(edited.scale || "1920:1080")}
                        onValueChange={(v) => setEdited({ ...edited, scale: v })}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {VIDEO_RESOLUTIONS.map((r) => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>

                <FieldWithHelp label="Encoder" help="CPU vs GPU">
                    <Select
                        value={String(edited.encoder || "libx264")}
                        onValueChange={(v) => setEdited({ ...edited, encoder: v })}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {VIDEO_ENCODERS.map((e) => (
                                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Bitrate" help="Qualidade vs tamanho">
                    <Select
                        value={String(edited.bitrate || "4M")}
                        onValueChange={(v) => setEdited({ ...edited, bitrate: v })}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {VIDEO_FPS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWithHelp>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWithHelp label="Pixel Format" help="Formato de cor">
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

    const renderGenericForm = () => (
        <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase mb-2">Configuração</p>
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
                    description="Configurações de voz e vídeo"
                />

                <div className="flex-1 p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500">
                            <strong>Erro:</strong> {error}
                        </div>
                    )}

                    <ContextBanner
                        title="O que são Presets?"
                        description="Presets são configurações prontas para áudio (TTS) e vídeo (FFmpeg)."
                        tips={[
                            "Voice: Voz Azure, velocidade, tom, estilo",
                            "Video: Resolução, encoder, bitrate, FPS",
                        ]}
                        variant="info"
                    />

                    {typeCards.length > 0 && (
                        <SectionCards cards={typeCards} activeId={selectedType} onSelect={setSelectedType} className="mb-6" />
                    )}

                    <FiltersBar searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Buscar..." className="mb-4" />

                    <SplitView
                        isLoading={isPending && presets.length === 0}
                        isEmpty={presets.length === 0}
                        emptyState={<EmptyState variant="empty" title="Nenhum preset" description="Execute seed" />}
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
                                        <FieldWithHelp label="Nome" help="Nome amigável">
                                            <Input
                                                value={String(edited.name || "")}
                                                onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                                            />
                                        </FieldWithHelp>

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
