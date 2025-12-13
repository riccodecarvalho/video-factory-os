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
import { Plus, Save, Loader2, BookOpen, FileText, Lightbulb } from "lucide-react";
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
                    description="Documentos de contexto para prompts (tier1: sempre, tier2: sob demanda)"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Documento
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
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
                                        meta={item.tier}
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
                                                <Badge variant="outline">{selected.tier}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selected.slug}</p>
                                        </div>
                                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar
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
                                                <Input value={edited.tier || ""} onChange={(e) => setEdited({ ...edited, tier: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Recipe Slug</Label>
                                                <Input value={edited.recipeSlug || ""} onChange={(e) => setEdited({ ...edited, recipeSlug: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Conteúdo</Label>
                                            <Textarea
                                                rows={12}
                                                className="font-mono text-sm"
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
