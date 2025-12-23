"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SuspenseSidebar } from "@/components/layout/SuspenseSidebar";
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
    Download,
} from "lucide-react";
import { ContextBanner } from "@/components/ui/ContextBanner";
import { LineNumberedTextarea } from "@/components/ui/LineNumberedTextarea";
import {
    getPrompts,
    getPromptCategories,
    updatePrompt,
    createPrompt,
} from "../actions";
import { getUsedBy } from "../execution-map/actions";
import { UsedBySection } from "@/components/vf";

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
    const [versionFilter, setVersionFilter] = useState<"all" | "v1" | "v2+" | "inactive">("all");
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

    const handleDownload = () => {
        if (!selectedPrompt) return;
        const content = `# SYSTEM PROMPT\n${selectedPrompt.systemPrompt || ""}\n\n---\n\n# USER TEMPLATE\n${selectedPrompt.userTemplate}`;
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedPrompt.slug}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Build category cards
    const categoryCards = Object.entries(categories).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.charAt(0).toUpperCase() + id.slice(1),
        count,
        icon: categoryIcons[id] || FileText,
    }));

    // Filter prompts by version
    const filteredPrompts = prompts.filter(prompt => {
        if (versionFilter === "all") return true;
        if (versionFilter === "v1") return prompt.version === 1;
        if (versionFilter === "v2+") return prompt.version >= 2;
        if (versionFilter === "inactive") return !prompt.isActive;
        return true;
    });

    // Status badge helper
    const getStatusBadge = (prompt: Prompt) => {
        if (!prompt.isActive) {
            return (
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">INATIVO</Badge>
                </div>
            );
        }
        return (
            <div className="flex gap-2">
                <Badge className="bg-green-600 hover:bg-green-700">ATIVO</Badge>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-background">
            <SuspenseSidebar />

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
                        actions={
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={versionFilter === "all" ? "default" : "outline"}
                                    onClick={() => setVersionFilter("all")}
                                >
                                    Todos
                                </Button>
                                <Button
                                    size="sm"
                                    variant={versionFilter === "v2+" ? "default" : "outline"}
                                    onClick={() => setVersionFilter("v2+")}
                                    className={versionFilter === "v2+" ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    v2+ (Novos)
                                </Button>
                                <Button
                                    size="sm"
                                    variant={versionFilter === "v1" ? "default" : "outline"}
                                    onClick={() => setVersionFilter("v1")}
                                >
                                    v1
                                </Button>
                                <Button
                                    size="sm"
                                    variant={versionFilter === "inactive" ? "default" : "outline"}
                                    onClick={() => setVersionFilter("inactive")}
                                    className={versionFilter === "inactive" ? "bg-muted-foreground" : ""}
                                >
                                    Inativos
                                </Button>
                            </div>
                        }
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
                                {filteredPrompts.map((prompt) => (
                                    <div
                                        key={prompt.id}
                                        className={`
                                            ${!prompt.isActive ? "opacity-50 bg-muted/30" : ""}
                                            ${prompt.version >= 2 && prompt.isActive ? "border-l-4 border-green-500" : ""}
                                        `}
                                    >
                                        <SplitViewListItem
                                            title={prompt.name}
                                            subtitle={
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1 py-0">v{prompt.version}</Badge>
                                                    <span className="text-xs text-muted-foreground">{prompt.slug}</span>
                                                </div>
                                            }
                                            meta={getStatusBadge(prompt)}
                                            isActive={selectedPrompt?.id === prompt.id}
                                            onClick={() => handleSelectPrompt(prompt)}
                                        />
                                    </div>
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
                                        <Button size="sm" variant="outline" className="gap-2" onClick={handleDownload} title="Download .md">
                                            <Download className="w-4 h-4" />
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
                                            <Label>System Prompt (com números de linha)</Label>
                                            <LineNumberedTextarea
                                                rows={10}
                                                value={editedPrompt.systemPrompt || ""}
                                                onChange={(e) => setEditedPrompt({ ...editedPrompt, systemPrompt: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>User Template (com números de linha)</Label>
                                            <LineNumberedTextarea
                                                rows={10}
                                                value={editedPrompt.userTemplate || ""}
                                                onChange={(e) => setEditedPrompt({ ...editedPrompt, userTemplate: e.target.value })}
                                            />
                                        </div>

                                        {/* Used By Section */}
                                        <UsedBySection
                                            entityId={selectedPrompt.id}
                                            entityType="prompt"
                                            getUsedBy={getUsedBy}
                                            className="mt-6"
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
