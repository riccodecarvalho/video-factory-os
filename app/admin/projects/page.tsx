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
import { Plus, Save, Loader2, Building2, Power } from "lucide-react";
import { getProjects, updateProject, createProject, toggleProjectActive } from "../actions";

type Project = Awaited<ReturnType<typeof getProjects>>[0];

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selected, setSelected] = useState<Project | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Project>>({});

    useEffect(() => {
        loadData();
    }, [searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const data = await getProjects(searchValue);
            setProjects(data);
        });
    };

    const handleSelect = (item: Project) => {
        setSelected(item);
        setEdited(item);
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updateProject(selected.id, {
                name: edited.name,
                key: edited.key,
                description: edited.description || undefined,
            });
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newItem = await createProject();
            loadData();
            setSelected(newItem as Project);
            setEdited(newItem);
        });
    };

    const handleToggleActive = () => {
        if (!selected) return;
        startTransition(async () => {
            await toggleProjectActive(selected.id, !selected.isActive);
            loadData();
            setSelected({ ...selected, isActive: !selected.isActive });
        });
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Projects" }]}
                    title="Projects"
                    description="Canais e projetos de conteúdo"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Project
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <FiltersBar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        searchPlaceholder="Buscar projects..."
                        className="mb-4"
                    />

                    <SplitView
                        isLoading={isPending && projects.length === 0}
                        isEmpty={projects.length === 0}
                        emptyState={
                            <EmptyState variant="empty" title="Nenhum project" description="Execute o seed ou crie um novo" action={{ label: "Criar", onClick: handleCreate }} />
                        }
                        list={
                            <div>
                                {projects.map((item) => (
                                    <SplitViewListItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={item.key}
                                        meta={item.isActive ? "Ativo" : "Inativo"}
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
                                            <p className="text-sm text-muted-foreground">{selected.key}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={selected.isActive ? "secondary" : "default"}
                                                onClick={handleToggleActive}
                                                disabled={isPending}
                                            >
                                                <Power className="w-4 h-4 mr-1" />
                                                {selected.isActive ? "Desativar" : "Ativar"}
                                            </Button>
                                            <Button size="sm" onClick={handleSave} disabled={isPending}>
                                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Salvar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Key</Label>
                                                <Input value={edited.key || ""} onChange={(e) => setEdited({ ...edited, key: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Descrição</Label>
                                            <Textarea
                                                value={edited.description || ""}
                                                onChange={(e) => setEdited({ ...edited, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-4">
                                            <Badge className={selected.isActive ? "bg-status-success/10 text-status-success" : "bg-muted"}>
                                                {selected.isActive ? "ATIVO" : "INATIVO"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Criado em {new Date(selected.createdAt).toLocaleDateString("pt-BR")}
                                            </span>
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
