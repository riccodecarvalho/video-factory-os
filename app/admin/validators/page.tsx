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
import { Plus, Save, Loader2, ShieldCheck, AlertTriangle, Ban } from "lucide-react";
import { getValidators, getValidatorTypes, updateValidator, createValidator } from "../actions";

type Validator = Awaited<ReturnType<typeof getValidators>>[0];

const typeIcons: Record<string, typeof ShieldCheck> = {
    all: ShieldCheck,
    forbidden_patterns: Ban,
    required_patterns: ShieldCheck,
    min_words: AlertTriangle,
};

export default function AdminValidatorsPage() {
    const [validators, setValidators] = useState<Validator[]>([]);
    const [types, setTypes] = useState<Record<string, number>>({});
    const [selectedType, setSelectedType] = useState("all");
    const [selected, setSelected] = useState<Validator | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Validator>>({});

    useEffect(() => {
        loadData();
    }, [selectedType, searchValue]);

    const loadData = () => {
        startTransition(async () => {
            const [data, typesData] = await Promise.all([
                getValidators(searchValue, selectedType),
                getValidatorTypes(),
            ]);
            setValidators(data);
            setTypes(typesData);
        });
    };

    const handleSelect = (item: Validator) => {
        setSelected(item);
        setEdited(item);
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updateValidator(selected.id, edited);
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newItem = await createValidator();
            loadData();
            setSelected(newItem as Validator);
            setEdited(newItem);
        });
    };

    const typeCards = Object.entries(types).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : id.replace(/_/g, " "),
        count,
        icon: typeIcons[id] || ShieldCheck,
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Validators" }]}
                    title="Validators"
                    description="Regras de validação para roteiros e conteúdo"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Validator
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    {typeCards.length > 0 && (
                        <SectionCards cards={typeCards} activeId={selectedType} onSelect={setSelectedType} className="mb-6" />
                    )}

                    <FiltersBar searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Buscar..." className="mb-4" />

                    <SplitView
                        isLoading={isPending && validators.length === 0}
                        isEmpty={validators.length === 0}
                        emptyState={<EmptyState variant="empty" title="Nenhum validator" action={{ label: "Criar", onClick: handleCreate }} />}
                        list={
                            <div>
                                {validators.map((item) => (
                                    <SplitViewListItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={item.slug}
                                        meta={item.severity || ""}
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
                                            <Label>Descrição</Label>
                                            <Textarea value={edited.description || ""} onChange={(e) => setEdited({ ...edited, description: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Config (JSON)</Label>
                                            <Textarea
                                                rows={4}
                                                className="font-mono text-sm"
                                                value={edited.config || ""}
                                                onChange={(e) => setEdited({ ...edited, config: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Error Message</Label>
                                            <Input value={edited.errorMessage || ""} onChange={(e) => setEdited({ ...edited, errorMessage: e.target.value })} />
                                        </div>
                                        <div className="flex items-center gap-2 pt-4">
                                            <Badge className={selected.severity === "error" ? "bg-status-error/10 text-status-error" : "bg-status-warning/10 text-status-warning"}>
                                                {selected.severity?.toUpperCase()}
                                            </Badge>
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
