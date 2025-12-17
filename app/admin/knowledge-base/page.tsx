"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { LineNumberedTextarea } from "@/components/ui/LineNumberedTextarea";
import { TierExplainer } from "@/components/vf/TierExplainer";
import { Plus, Save, Loader2, BookOpen, FileText, Lightbulb, Download } from "lucide-react";
import { getKnowledgeBase, getKnowledgeTiers, updateKnowledge, createKnowledge } from "../actions";

type Knowledge = Awaited<ReturnType<typeof getKnowledgeBase>>[0];

const tierIcons: Record<string, typeof BookOpen> = {
    all: BookOpen,
    tier1: FileText,
    tier2: Lightbulb,
    tier3: BookOpen,
};

export default function AdminKnowledgeBasePage() {
    const [items, setItems] = useState<Knowledge[]>([]);
    const [tiers, setTiers] = useState<Record<string, number>>({});
    const [selectedTier, setSelectedTier] = useState("all");
    const [selected, setSelected] = useState<Knowledge | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Knowledge>>({});
    const [showTierGuide, setShowTierGuide] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedTier, searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const [data, tiersData] = await Promise.all([
                getKnowledgeBase(searchValue, selectedTier),
                getKnowledgeTiers(),
            ]);
            setItems(data);
            setTiers(tiersData);
        });
    };

    const handleSelect = (item: Knowledge) => {
        setSelected(item);
        setEdited(item);
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updateKnowledge(selected.id, edited);
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newItem = await createKnowledge();
            loadData();
            setSelected(newItem as Knowledge);
            setEdited(newItem);
        });
    };

    const handleDownload = () => {
        if (!selected) return;
        const blob = new Blob([selected.content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selected.slug}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tierCards = Object.entries(tiers).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.replace("tier", "Tier "),
        count,
        icon: tierIcons[id] || BookOpen,
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Knowledge Base" }]}
                    title="Knowledge Base"
                    description="Documentos de contexto para prompts"
                    actions={
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowTierGuide(!showTierGuide)}
                            >
                                {showTierGuide ? "Ocultar Guia" : "Como usar Tiers?"}
                            </Button>
                            <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Novo Documento
                            </Button>
                        </div>
                    }
                />

                <div className="flex-1 p-6">
                    <ContextBanner
                        title="O que é Knowledge Base?"
                        description="Documentos de contexto que são injetados nos prompts de IA. Organizados em Tiers para controlar uso de tokens."
                        tips={[
                            "Tier 1: Carrega SEMPRE — DNA do projeto, regras globais",
                            "Tier 2: Carrega por FASE — regras de roteiro, estilos específicos",
                            "Tier 3: Carrega SOB DEMANDA — exemplos, schemas, referências",
                        ]}
                        variant="help"
                    />

                    {showTierGuide && (
                        <div className="mb-6">
                            <TierExplainer />
                        </div>
                    )}

                    {tierCards.length > 0 && (
                        <SectionCards cards={tierCards} activeId={selectedTier} onSelect={setSelectedTier} className="mb-6" />
                    )}

                    <FiltersBar searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Buscar..." className="mb-4" />

                    <SplitView
                        isLoading={isPending && items.length === 0}
                        isEmpty={items.length === 0}
                        emptyState={<EmptyState variant="empty" title="Nenhum documento" action={{ label: "Criar", onClick: handleCreate }} />}
                        list={
                            <div>
                                {items.map((item) => (
                                    <SplitViewListItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={item.slug}
                                        className={!item.isActive ? "opacity-50" : ""}
                                        meta={
                                            <div className="flex gap-1">
                                                {!item.isActive && (
                                                    <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                                                        INATIVO
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        item.tier === "tier1" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                            item.tier === "tier2" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                                "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                    }
                                                >
                                                    {item.tier}
                                                </Badge>
                                            </div>
                                        }
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
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        selected.tier === "tier1" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                            selected.tier === "tier2" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                                "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                    }
                                                >
                                                    {selected.tier.replace("tier", "Tier ")}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selected.slug}</p>
                                        </div>
                                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleDownload} title="Download .md">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Categoria</Label>
                                                <Input value={edited.category || ""} onChange={(e) => setEdited({ ...edited, category: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Tier</Label>
                                                <select
                                                    className="w-full p-2 border rounded-md bg-background"
                                                    value={edited.tier || "tier1"}
                                                    onChange={(e) => setEdited({ ...edited, tier: e.target.value })}
                                                >
                                                    <option value="tier1">Tier 1 — Sempre carrega</option>
                                                    <option value="tier2">Tier 2 — Por fase</option>
                                                    <option value="tier3">Tier 3 — Sob demanda</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Recipe Slug (opcional)</Label>
                                                <Input value={edited.recipeSlug || ""} onChange={(e) => setEdited({ ...edited, recipeSlug: e.target.value })} placeholder="graciela-youtube-long" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Conteúdo (com números de linha)</Label>
                                            <LineNumberedTextarea
                                                rows={16}
                                                value={edited.content || ""}
                                                onChange={(e) => setEdited({ ...edited, content: e.target.value })}
                                            />
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
