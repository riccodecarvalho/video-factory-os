"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Save, Loader2, Mic, Video, Sparkles, FileCode, Sliders } from "lucide-react";
import { getPresets, getPresetCounts, type PresetType } from "../actions";

type Preset = Awaited<ReturnType<typeof getPresets>>[0];

const typeIcons: Record<string, typeof Sliders> = {
    all: Sliders,
    voice: Mic,
    video: Video,
    effects: Sparkles,
    ssml: FileCode,
};

export default function AdminPresetsPage() {
    const [presets, setPresets] = useState<Preset[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selected, setSelected] = useState<Preset | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();

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
    };

    const typeCards = Object.entries(counts).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.charAt(0).toUpperCase() + id.slice(1),
        count,
        icon: typeIcons[id] || Sliders,
    }));

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
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-semibold">{selected.name}</h2>
                                            <Badge variant="outline">{selected.presetType}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{selected.slug}</p>
                                    </div>

                                    <div className="space-y-4">
                                        {"description" in selected && selected.description && (
                                            <div className="space-y-2">
                                                <Label>Descrição</Label>
                                                <p className="text-sm">{selected.description}</p>
                                            </div>
                                        )}

                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Configuração</p>
                                            <pre className="text-sm font-mono whitespace-pre-wrap">
                                                {JSON.stringify(
                                                    Object.fromEntries(
                                                        Object.entries(selected).filter(([k]) =>
                                                            !["id", "slug", "name", "description", "presetType", "createdAt", "isActive"].includes(k)
                                                        )
                                                    ),
                                                    null,
                                                    2
                                                )}
                                            </pre>
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
