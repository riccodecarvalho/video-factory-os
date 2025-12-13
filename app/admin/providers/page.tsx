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
import { Plus, Save, Loader2, Cpu, Mic, Database } from "lucide-react";
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

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Providers" }]}
                    title="Providers"
                    description="LLM, TTS e outros serviços externos"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Provider
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
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
                                            <h2 className="text-xl font-semibold">{selected.name}</h2>
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
                                                <Label>Tipo</Label>
                                                <Input value={edited.type || ""} onChange={(e) => setEdited({ ...edited, type: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Default Model</Label>
                                            <Input value={edited.defaultModel || ""} onChange={(e) => setEdited({ ...edited, defaultModel: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Base URL</Label>
                                            <Input value={edited.baseUrl || ""} onChange={(e) => setEdited({ ...edited, baseUrl: e.target.value })} />
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
