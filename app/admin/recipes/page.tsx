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
    SplitView,
    SplitViewListItem,
    SplitViewDetail,
    SplitViewDetailEmpty,
    FiltersBar,
    EmptyState,
} from "@/components/layout";
import { Plus, Save, Loader2, BookOpen } from "lucide-react";
import { getRecipes, updateRecipe, createRecipe } from "../actions";

type Recipe = Awaited<ReturnType<typeof getRecipes>>[0];

export default function AdminRecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selected, setSelected] = useState<Recipe | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Recipe>>({});

    useEffect(() => {
        loadData();
    }, [searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const data = await getRecipes(searchValue);
            setRecipes(data);
        });
    };

    const handleSelect = (item: Recipe) => {
        setSelected(item);
        setEdited(item);
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updateRecipe(selected.id, edited);
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newItem = await createRecipe();
            loadData();
            setSelected(newItem as Recipe);
            setEdited(newItem);
        });
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Recipes" }]}
                    title="Recipes"
                    description="Pipelines de produção de vídeo"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Nova Recipe
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <FiltersBar searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Buscar..." className="mb-4" />

                    <SplitView
                        isLoading={isPending && recipes.length === 0}
                        isEmpty={recipes.length === 0}
                        emptyState={<EmptyState variant="empty" title="Nenhuma recipe" action={{ label: "Criar", onClick: handleCreate }} />}
                        list={
                            <div>
                                {recipes.map((item) => (
                                    <SplitViewListItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={item.slug}
                                        meta={`v${item.version}`}
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
                                                <Badge variant="outline">v{selected.version}</Badge>
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
                                                <Label>Slug</Label>
                                                <Input value={edited.slug || ""} onChange={(e) => setEdited({ ...edited, slug: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Descrição</Label>
                                            <Textarea value={edited.description || ""} onChange={(e) => setEdited({ ...edited, description: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pipeline (JSON)</Label>
                                            <Textarea
                                                rows={10}
                                                className="font-mono text-sm"
                                                value={typeof edited.pipeline === "string" ? edited.pipeline : JSON.stringify(JSON.parse(edited.pipeline || "[]"), null, 2)}
                                                onChange={(e) => setEdited({ ...edited, pipeline: e.target.value })}
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
