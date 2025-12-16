"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Plus, Save, Loader2, ShieldCheck, AlertTriangle, Ban, HelpCircle } from "lucide-react";
import { getValidators, getValidatorTypes, updateValidator, createValidator } from "../actions";

type Validator = Awaited<ReturnType<typeof getValidators>>[0];

const typeIcons: Record<string, typeof ShieldCheck> = {
    all: ShieldCheck,
    forbidden_patterns: Ban,
    required_patterns: ShieldCheck,
    min_words: AlertTriangle,
};

const TYPE_EXPLANATIONS: Record<string, { label: string; description: string; example: string }> = {
    forbidden_patterns: {
        label: "Padrões Proibidos",
        description: "Bloqueia texto que contém certos padrões (regex)",
        example: 'Ex: {"patterns": ["<[^>]+>", "\\\\*\\\\*"]} bloqueia HTML e Markdown',
    },
    required_patterns: {
        label: "Padrões Obrigatórios",
        description: "Exige que o texto contenha certos padrões",
        example: 'Ex: {"patterns": ["(voz: NARRADORA)"]} exige marcador de voz',
    },
    min_words: {
        label: "Mínimo de Palavras",
        description: "Garante quantidade mínima de palavras",
        example: 'Ex: {"minWords": 6000} para roteiros longos',
    },
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
        label: id === "all" ? "Todos" : TYPE_EXPLANATIONS[id]?.label || id.replace(/_/g, " "),
        count,
        icon: typeIcons[id] || ShieldCheck,
    }));

    const currentTypeInfo = selected?.type ? TYPE_EXPLANATIONS[selected.type] : null;

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
                    <ContextBanner
                        title="O que são Validators?"
                        description="Validators são regras automáticas que verificam a qualidade do conteúdo gerado pela IA antes de prosseguir no pipeline."
                        tips={[
                            "Padrões Proibidos: Bloqueia HTML, Markdown, SSML no roteiro bruto",
                            "Padrões Obrigatórios: Garante estrutura correta (ex: marcadores de voz)",
                            "Mínimo de Palavras: Garante que roteiros tenham tamanho adequado",
                            "Severity: 'error' bloqueia, 'warning' apenas alerta",
                        ]}
                        variant="help"
                    />

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
                                        subtitle={TYPE_EXPLANATIONS[item.type]?.label || item.type}
                                        meta={
                                            <Badge className={item.severity === "error" ? "bg-status-error/10 text-status-error" : "bg-status-warning/10 text-status-warning"}>
                                                {item.severity?.toUpperCase()}
                                            </Badge>
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
                                            <h2 className="text-xl font-semibold">{selected.name}</h2>
                                            <p className="text-sm text-muted-foreground">{selected.slug}</p>
                                        </div>
                                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar
                                        </Button>
                                    </div>

                                    {/* Type explanation */}
                                    {currentTypeInfo && (
                                        <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                                            <div className="flex items-start gap-2">
                                                <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-sm">{currentTypeInfo.label}</p>
                                                    <p className="text-sm text-muted-foreground">{currentTypeInfo.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-2 font-mono bg-background/50 p-2 rounded">
                                                        {currentTypeInfo.example}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tipo</Label>
                                                <Select
                                                    value={edited.type || ""}
                                                    onValueChange={(v) => setEdited({ ...edited, type: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="forbidden_patterns">Padrões Proibidos</SelectItem>
                                                        <SelectItem value="required_patterns">Padrões Obrigatórios</SelectItem>
                                                        <SelectItem value="min_words">Mínimo de Palavras</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Descrição</Label>
                                            <Textarea
                                                value={edited.description || ""}
                                                onChange={(e) => setEdited({ ...edited, description: e.target.value })}
                                                placeholder="Descreva o propósito deste validator..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Config (JSON)</Label>
                                            <Textarea
                                                rows={4}
                                                className="font-mono text-sm"
                                                value={edited.config || ""}
                                                onChange={(e) => setEdited({ ...edited, config: e.target.value })}
                                                placeholder={'{\n  "patterns": ["<[^>]+>"]\n}'}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Configure os padrões regex ou parâmetros para este validator
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Mensagem de Erro</Label>
                                                <Input
                                                    value={edited.errorMessage || ""}
                                                    onChange={(e) => setEdited({ ...edited, errorMessage: e.target.value })}
                                                    placeholder="Validação falhou: ..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Severity</Label>
                                                <Select
                                                    value={edited.severity || "error"}
                                                    onValueChange={(v) => setEdited({ ...edited, severity: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="error">Error (bloqueia pipeline)</SelectItem>
                                                        <SelectItem value="warning">Warning (apenas alerta)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
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
