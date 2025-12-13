"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    Copy,
    Trash2,
    Eye,
} from "lucide-react";

/**
 * Admin/Prompts - Biblioteca de Prompts
 * 
 * Pattern 4pice: SectionCards + SplitView
 * Benchmark: Tela "Biblioteca de Prompts" do 4pice Studio
 */

// Mock data para prompts
const mockPrompts = [
    {
        id: "1",
        slug: "channel-analysis",
        name: "Channel Analysis",
        description: "Analisa canal completo baseado nos dados dos vídeos",
        category: "analysis",
        version: 16,
        tokens: 8000,
        isActive: true,
        edgeFunction: "analyze-channel-with-ai",
        usedIn: ["CanalCuradoDetails.tsx", "BatchAnalysis"],
        lastUpdated: "2025-12-12",
    },
    {
        id: "2",
        slug: "channel-dna-extractor",
        name: "Channel DNA Extractor",
        description: "Extrai DNA do canal",
        category: "analysis",
        version: 2,
        tokens: 8192,
        isActive: true,
        edgeFunction: "extract-channel-dna",
        lastUpdated: "2025-12-10",
    },
    {
        id: "3",
        slug: "video-analysis",
        name: "Video Analysis",
        description: "Análise de vídeo individual",
        category: "analysis",
        version: 4,
        tokens: 4086,
        isActive: true,
        edgeFunction: "analyze-video-with-ai",
        lastUpdated: "2025-12-08",
    },
    {
        id: "4",
        slug: "script-generator",
        name: "Script Generator",
        description: "Gera roteiro completo para vídeos",
        category: "scripts",
        version: 12,
        tokens: 12000,
        isActive: true,
        edgeFunction: "generate-script",
        lastUpdated: "2025-12-11",
    },
    {
        id: "5",
        slug: "content-recommendations",
        name: "Content Recommendations",
        description: "Gera recomendações de conteúdo",
        category: "generation",
        version: 4,
        tokens: 4096,
        isActive: true,
        edgeFunction: "generate-content-recommendations",
        lastUpdated: "2025-12-09",
    },
    {
        id: "6",
        slug: "description-generator",
        name: "Description Generator",
        description: "Gera descrições para vídeos",
        category: "generation",
        version: 4,
        tokens: 2048,
        isActive: false,
        edgeFunction: "generate-descriptions",
        lastUpdated: "2025-12-05",
    },
];

// Categorias
const categories = [
    { id: "all", label: "Todos", count: mockPrompts.length, icon: FileText },
    { id: "analysis", label: "Analysis", count: mockPrompts.filter(p => p.category === "analysis").length, icon: BarChart3 },
    { id: "generation", label: "Generation", count: mockPrompts.filter(p => p.category === "generation").length, icon: Sparkles },
    { id: "scripts", label: "Scripts", count: mockPrompts.filter(p => p.category === "scripts").length, icon: Code },
    { id: "tools", label: "Tools", count: 0, icon: Wrench },
];

export default function AdminPromptsPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedPrompt, setSelectedPrompt] = useState<typeof mockPrompts[0] | null>(null);
    const [searchValue, setSearchValue] = useState("");

    // Filter prompts
    const filteredPrompts = mockPrompts.filter((prompt) => {
        const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
        const matchesSearch = prompt.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            prompt.slug.toLowerCase().includes(searchValue.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/* Page Header */}
                <PageHeader
                    breadcrumb={[
                        { label: "Admin", href: "/admin" },
                        { label: "Prompts" },
                    ]}
                    title="Biblioteca de Prompts"
                    description="Gerenciamento completo de prompts de IA"
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                Knowledge Base
                            </Button>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Novo Prompt
                            </Button>
                        </div>
                    }
                />

                {/* Content */}
                <div className="flex-1 p-6">
                    {/* Section Cards */}
                    <SectionCards
                        cards={categories}
                        activeId={selectedCategory}
                        onSelect={setSelectedCategory}
                        className="mb-6"
                    />

                    {/* Filters */}
                    <FiltersBar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        searchPlaceholder="Buscar prompts..."
                        className="mb-4"
                    />

                    {/* Split View */}
                    <SplitView
                        isEmpty={filteredPrompts.length === 0}
                        emptyState={
                            <EmptyState
                                variant="no-results"
                                title="Nenhum prompt encontrado"
                                description="Tente ajustar os filtros ou criar um novo prompt"
                                action={{
                                    label: "Criar Prompt",
                                    onClick: () => console.log("create"),
                                }}
                            />
                        }
                        list={
                            <div>
                                {filteredPrompts.map((prompt) => (
                                    <SplitViewListItem
                                        key={prompt.id}
                                        title={prompt.name}
                                        subtitle={prompt.slug}
                                        meta={`v${prompt.version}`}
                                        isActive={selectedPrompt?.id === prompt.id}
                                        onClick={() => setSelectedPrompt(prompt)}
                                    />
                                ))}
                            </div>
                        }
                        detail={
                            selectedPrompt ? (
                                <SplitViewDetail>
                                    {/* Prompt Header */}
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
                                        <Button size="sm" className="gap-2">
                                            <Save className="w-4 h-4" />
                                            Salvar
                                        </Button>
                                    </div>

                                    {/* Description */}
                                    <p className="text-muted-foreground mb-6">
                                        {selectedPrompt.description}
                                    </p>

                                    {/* Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Edge Function</p>
                                            <code className="text-sm font-mono">{selectedPrompt.edgeFunction}</code>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Max Tokens</p>
                                            <p className="text-sm font-mono">{selectedPrompt.tokens.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Categoria</p>
                                            <p className="text-sm capitalize">{selectedPrompt.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Última Atualização</p>
                                            <p className="text-sm">{selectedPrompt.lastUpdated}</p>
                                        </div>
                                    </div>

                                    {/* Prompt Content Placeholder */}
                                    <div className="border rounded-lg">
                                        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                                            <span className="text-sm font-medium">System Prompt</span>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-4 font-mono text-sm text-muted-foreground min-h-[200px]">
                                            {/* Placeholder for actual prompt content */}
                                            <p className="text-muted-foreground/50">
                                                [Conteúdo do prompt será carregado do banco de dados]
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-6 pt-6 border-t">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Copy className="w-4 h-4" />
                                            Duplicar
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </Button>
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
