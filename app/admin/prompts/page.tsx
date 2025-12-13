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
import {
    Plus,
    FileText,
    Sparkles,
    Code,
    Wrench,
    BarChart3,
    Save,
    Loader2,
} from "lucide-react";
import {
    getPrompts,
    getPromptCategories,
    updatePrompt,
    createPrompt,
} from "../actions";

type Prompt = Awaited<ReturnType<typeof getPrompts>>[0];

const categoryIcons: Record<string, typeof FileText> = {
    all: FileText,
    title: Sparkles,
    brief: FileText,
    script: Code,
    analysis: BarChart3,
};

export default function AdminPromptsPage() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [categories, setCategories] = useState<Record<string, number>>({});
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [editedPrompt, setEditedPrompt] = useState<Partial<Prompt>>({});

    // Load data
    useEffect(() => {
        loadData();
    }, [selectedCategory, searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const [promptsData, categoriesData] = await Promise.all([
                getPrompts(searchValue, selectedCategory),
                getPromptCategories(),
            ]);
            setPrompts(promptsData);
            setCategories(categoriesData);
        });
    };

    const handleSelectPrompt = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
        setEditedPrompt(prompt);
    };

    const handleSave = () => {
        if (!selectedPrompt) return;
        startTransition(async () => {
            await updatePrompt(selectedPrompt.id, editedPrompt);
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newPrompt = await createPrompt({});
            loadData();
            setSelectedPrompt(newPrompt as Prompt);
            setEditedPrompt(newPrompt);
        });
    };

    // Build category cards
    const categoryCards = Object.entries(categories).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.charAt(0).toUpperCase() + id.slice(1),
        count,
        icon: categoryIcons[id] || FileText,
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[
                        { label: "Admin", href: "/admin" },
                        { label: "Prompts" },
                    ]}
                    title="Biblioteca de Prompts"
                    description="Gerenciamento de prompts de IA — dados do banco de dados"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Prompt
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    {categoryCards.length > 0 && (
                        <SectionCards
                            cards={categoryCards}
                            activeId={selectedCategory}
                            onSelect={setSelectedCategory}
                            className="mb-6"
                        />
                    )}

                    <FiltersBar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        searchPlaceholder="Buscar prompts..."
                        className="mb-4"
                    />

                    <SplitView
                        isLoading={isPending && prompts.length === 0}
                        isEmpty={prompts.length === 0}
                        emptyState={
                            <EmptyState
                                variant="empty"
                                title="Nenhum prompt encontrado"
                                description="Crie seu primeiro prompt ou execute o seed"
                                action={{ label: "Criar Prompt", onClick: handleCreate }}
                            />
                        }
                        list={
                            <div>
                                {prompts.map((prompt) => (
                                    <SplitViewListItem
                                        key={prompt.id}
                                        title={prompt.name}
                                        subtitle={prompt.slug}
                                        meta={`v${prompt.version}`}
                                        isActive={selectedPrompt?.id === prompt.id}
                                        onClick={() => handleSelectPrompt(prompt)}
                                    />
                                ))}
                            </div>
                        }
                        detail={
                            selectedPrompt ? (
                                <SplitViewDetail>
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-semibold">{selectedPrompt.name}</h2>
                                                <Badge variant="outline">v{selectedPrompt.version}</Badge>
                                                <Badge className={selectedPrompt.isActive ? "bg-status-success/10 text-status-success" : "bg-muted"}>
                                                    {selectedPrompt.isActive ? "ATIVO" : "INATIVO"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selectedPrompt.slug}</p>
                                        </div>
                                        <Button size="sm" className="gap-2" onClick={handleSave} disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input
                                                    value={editedPrompt.name || ""}
                                                    onChange={(e) => setEditedPrompt({ ...editedPrompt, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Categoria</Label>
                                                <Input
                                                    value={editedPrompt.category || ""}
                                                    onChange={(e) => setEditedPrompt({ ...editedPrompt, category: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Model</Label>
                                                <Input
                                                    value={editedPrompt.model || ""}
                                                    onChange={(e) => setEditedPrompt({ ...editedPrompt, model: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Max Tokens</Label>
                                                <Input
                                                    type="number"
                                                    value={editedPrompt.maxTokens || 0}
                                                    onChange={(e) => setEditedPrompt({ ...editedPrompt, maxTokens: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Temperature</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={editedPrompt.temperature || 0}
                                                    onChange={(e) => setEditedPrompt({ ...editedPrompt, temperature: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>System Prompt</Label>
                                            <Textarea
                                                rows={6}
                                                className="font-mono text-sm"
                                                value={editedPrompt.systemPrompt || ""}
                                                onChange={(e) => setEditedPrompt({ ...editedPrompt, systemPrompt: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>User Template</Label>
                                            <Textarea
                                                rows={6}
                                                className="font-mono text-sm"
                                                value={editedPrompt.userTemplate || ""}
                                                onChange={(e) => setEditedPrompt({ ...editedPrompt, userTemplate: e.target.value })}
                                            />
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
