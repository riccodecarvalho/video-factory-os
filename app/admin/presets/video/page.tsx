"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    PageHeader,
    SplitView,
    SplitViewListItem,
    SplitViewDetail,
    SplitViewDetailEmpty,
    FiltersBar,
    EmptyState,
} from "@/components/layout";
import {
    Plus,
    Video,
    Save,
    Loader2,
    Trash2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getVideoPresets, createVideoPreset, updateVideoPreset, deleteVideoPreset } from "../../actions";

type VideoPreset = Awaited<ReturnType<typeof getVideoPresets>>[0];

const ENCODERS = [
    { value: 'h264_videotoolbox', label: 'VideoToolbox (Mac)' },
    { value: 'libx264', label: 'libx264 (Universal)' },
    { value: 'libx265', label: 'libx265 (HEVC)' },
];

const SCALES = [
    { value: '1920:1080', label: '1080p (1920x1080)' },
    { value: '1280:720', label: '720p (1280x720)' },
    { value: '854:480', label: '480p (854x480)' },
    { value: '3840:2160', label: '4K (3840x2160)' },
];

const BITRATES = [
    { value: '2M', label: '2 Mbps (Baixo)' },
    { value: '4M', label: '4 Mbps (Médio)' },
    { value: '8M', label: '8 Mbps (Alto)' },
    { value: '12M', label: '12 Mbps (Muito Alto)' },
];

const FPS_OPTIONS = [24, 25, 30, 60];

export default function AdminVideoPresetsPage() {
    const [presets, setPresets] = useState<VideoPreset[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<VideoPreset | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [editedPreset, setEditedPreset] = useState<Partial<VideoPreset>>({});

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        startTransition(async () => {
            const data = await getVideoPresets();
            setPresets(data);
        });
    };

    const handleSelectPreset = (preset: VideoPreset) => {
        setSelectedPreset(preset);
        setEditedPreset(preset);
    };

    const handleSave = () => {
        if (!selectedPreset) return;
        startTransition(async () => {
            await updateVideoPreset(selectedPreset.id, editedPreset);
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newPreset = await createVideoPreset({
                slug: `preset-${Date.now()}`,
                name: "Novo Preset de Vídeo",
            });
            loadData();
            if (newPreset) {
                setSelectedPreset(newPreset as VideoPreset);
                setEditedPreset(newPreset);
            }
        });
    };

    const handleDelete = () => {
        if (!selectedPreset) return;
        if (!confirm(`Deletar preset "${selectedPreset.name}"?`)) return;
        startTransition(async () => {
            await deleteVideoPreset(selectedPreset.id);
            setSelectedPreset(null);
            setEditedPreset({});
            loadData();
        });
    };

    // Filter presets
    const filteredPresets = presets.filter(p =>
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <>
                                        <PageHeader
                    breadcrumb={[
                        { label: "Admin", href: "/admin" },
                        { label: "Presets" },
                        { label: "Vídeo" },
                    ]}
                    title="Presets de Vídeo"
                    description="Configurações FFmpeg para render — encoder, resolução, bitrate"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Preset
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <FiltersBar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        searchPlaceholder="Buscar presets..."
                        className="mb-4"
                    />

                    <SplitView
                        isLoading={isPending && presets.length === 0}
                        isEmpty={presets.length === 0}
                        emptyState={
                            <EmptyState
                                variant="empty"
                                title="Nenhum preset encontrado"
                                description="Crie seu primeiro preset de vídeo"
                                action={{ label: "Criar Preset", onClick: handleCreate }}
                            />
                        }
                        list={
                            <div>
                                {filteredPresets.map((preset) => (
                                    <SplitViewListItem
                                        key={preset.id}
                                        title={preset.name}
                                        subtitle={preset.slug}
                                        meta={
                                            <Badge variant={preset.isActive ? "default" : "secondary"}>
                                                {preset.scale}
                                            </Badge>
                                        }
                                        isActive={selectedPreset?.id === preset.id}
                                        onClick={() => handleSelectPreset(preset)}
                                    />
                                ))}
                            </div>
                        }
                        detail={
                            selectedPreset ? (
                                <SplitViewDetail>
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Video className="w-5 h-5 text-muted-foreground" />
                                                <h2 className="text-xl font-semibold">{selectedPreset.name}</h2>
                                                <Badge className={selectedPreset.isActive ? "bg-status-success/10 text-status-success" : "bg-muted"}>
                                                    {selectedPreset.isActive ? "ATIVO" : "INATIVO"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selectedPreset.slug}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isPending}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" className="gap-2" onClick={handleSave} disabled={isPending}>
                                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Salvar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input
                                                    value={editedPreset.name || ""}
                                                    onChange={(e) => setEditedPreset({ ...editedPreset, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Slug</Label>
                                                <Input
                                                    value={editedPreset.slug || ""}
                                                    onChange={(e) => setEditedPreset({ ...editedPreset, slug: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Video Settings */}
                                        <div className="border-t pt-4">
                                            <h3 className="text-sm font-medium mb-4">Configurações de Vídeo</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Encoder</Label>
                                                    <Select
                                                        value={editedPreset.encoder || "h264_videotoolbox"}
                                                        onValueChange={(value) => setEditedPreset({ ...editedPreset, encoder: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ENCODERS.map(enc => (
                                                                <SelectItem key={enc.value} value={enc.value}>
                                                                    {enc.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Resolução</Label>
                                                    <Select
                                                        value={editedPreset.scale || "1280:720"}
                                                        onValueChange={(value) => setEditedPreset({ ...editedPreset, scale: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SCALES.map(s => (
                                                                <SelectItem key={s.value} value={s.value}>
                                                                    {s.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Bitrate</Label>
                                                    <Select
                                                        value={editedPreset.bitrate || "4M"}
                                                        onValueChange={(value) => setEditedPreset({ ...editedPreset, bitrate: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {BITRATES.map(b => (
                                                                <SelectItem key={b.value} value={b.value}>
                                                                    {b.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>FPS</Label>
                                                    <Select
                                                        value={String(editedPreset.fps || 30)}
                                                        onValueChange={(value) => setEditedPreset({ ...editedPreset, fps: parseInt(value) })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {FPS_OPTIONS.map(f => (
                                                                <SelectItem key={f} value={String(f)}>
                                                                    {f} fps
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Audio Settings */}
                                        <div className="border-t pt-4">
                                            <h3 className="text-sm font-medium mb-4">Configurações de Áudio</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Codec de Áudio</Label>
                                                    <Select
                                                        value={editedPreset.audioCodec || "aac"}
                                                        onValueChange={(value) => setEditedPreset({ ...editedPreset, audioCodec: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="aac">AAC</SelectItem>
                                                            <SelectItem value="mp3">MP3</SelectItem>
                                                            <SelectItem value="opus">Opus</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Bitrate de Áudio</Label>
                                                    <Select
                                                        value={editedPreset.audioBitrate || "192k"}
                                                        onValueChange={(value) => setEditedPreset({ ...editedPreset, audioBitrate: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="128k">128 kbps</SelectItem>
                                                            <SelectItem value="192k">192 kbps</SelectItem>
                                                            <SelectItem value="256k">256 kbps</SelectItem>
                                                            <SelectItem value="320k">320 kbps</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Toggle */}
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Status</Label>
                                                    <p className="text-sm text-muted-foreground">Preset ativo pode ser usado em recipes</p>
                                                </div>
                                                <Button
                                                    variant={editedPreset.isActive ? "default" : "outline"}
                                                    onClick={() => setEditedPreset({ ...editedPreset, isActive: !editedPreset.isActive })}
                                                >
                                                    {editedPreset.isActive ? "Ativo" : "Inativo"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
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
