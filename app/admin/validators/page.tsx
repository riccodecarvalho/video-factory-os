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
import { Plus, Save, Loader2, ShieldCheck, AlertTriangle, Ban, HelpCircle, Trash2 } from "lucide-react";
import { getValidators, getValidatorTypes, updateValidator, createValidator } from "../actions";

type Validator = Awaited<ReturnType<typeof getValidators>>[0];

const typeIcons: Record<string, typeof ShieldCheck> = {
    all: ShieldCheck,
    forbidden_patterns: Ban,
    required_patterns: ShieldCheck,
    min_words: AlertTriangle,
};

// Explicações detalhadas para cada tipo
const TYPE_INFO: Record<string, {
    label: string;
    description: string;
    howToUse: string;
    configFields: { key: string; label: string; placeholder: string; type: "text" | "number" | "array" }[];
}> = {
    forbidden_patterns: {
        label: "Padrões Proibidos",
        description: "Bloqueia roteiros que contenham certos padrões (HTML, Markdown, etc)",
        howToUse: "Use para garantir que o roteiro NÃO contenha elementos indesejados como tags HTML ou formatação Markdown",
        configFields: [
            { key: "patterns", label: "Padrões a bloquear (regex)", placeholder: "<[^>]+> (bloqueia HTML)", type: "array" },
        ],
    },
    required_patterns: {
        label: "Padrões Obrigatórios",
        description: "Exige que o roteiro contenha certos padrões",
        howToUse: "Use para garantir que o roteiro TENHA elementos obrigatórios como marcadores de voz",
        configFields: [
            { key: "patterns", label: "Padrões obrigatórios (regex)", placeholder: "(voz: NARRADORA)", type: "array" },
        ],
    },
    min_words: {
        label: "Mínimo de Palavras",
        description: "Garante que o roteiro tenha um número mínimo de palavras",
        howToUse: "Use para garantir que roteiros longos tenham tamanho adequado (ex: 6000 palavras para 30min de vídeo)",
        configFields: [
            { key: "minWords", label: "Mínimo de palavras", placeholder: "6000", type: "number" },
        ],
    },
};

// Templates prontos
const TEMPLATES = [
    {
        name: "Bloquear HTML",
        type: "forbidden_patterns",
        config: '{"patterns": ["<[^>]+>"]}',
        errorMessage: "Roteiro contém tags HTML que não são permitidas",
    },
    {
        name: "Bloquear Markdown",
        type: "forbidden_patterns",
        config: '{"patterns": ["\\\\*\\\\*", "\\\\#", "\\\\`"]}',
        errorMessage: "Roteiro contém formatação Markdown que não é permitida",
    },
    {
        name: "Exigir Marcador de Voz",
        type: "required_patterns",
        config: '{"patterns": ["\\\\(voz:"]}',
        errorMessage: "Roteiro deve conter marcadores de voz no formato (voz: NOME)",
    },
    {
        name: "Roteiro Mínimo 30min",
        type: "min_words",
        config: '{"minWords": 6000}',
        errorMessage: "Roteiro muito curto. Para 30min de vídeo, precisa de pelo menos 6000 palavras",
    },
];

export default function AdminValidatorsPage() {
    const [validators, setValidators] = useState<Validator[]>([]);
    const [types, setTypes] = useState<Record<string, number>>({});
    const [selectedType, setSelectedType] = useState("all");
    const [selected, setSelected] = useState<Validator | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [edited, setEdited] = useState<Partial<Validator>>({});
    const [configObj, setConfigObj] = useState<Record<string, unknown>>({});

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
        try {
            setConfigObj(JSON.parse(item.config || "{}"));
        } catch {
            setConfigObj({});
        }
    };

    const handleSave = () => {
        if (!selected) return;
        startTransition(async () => {
            await updateValidator(selected.id, {
                ...edited,
                config: JSON.stringify(configObj)
            });
            loadData();
        });
    };

    const handleCreate = () => {
        startTransition(async () => {
            const newItem = await createValidator();
            loadData();
            setSelected(newItem as Validator);
            setEdited(newItem);
            setConfigObj({});
        });
    };

    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        setEdited({
            ...edited,
            name: template.name,
            type: template.type,
            errorMessage: template.errorMessage,
        });
        try {
            setConfigObj(JSON.parse(template.config));
        } catch {
            setConfigObj({});
        }
    };

    const typeCards = Object.entries(types).map(([id, count]) => ({
        id,
        label: id === "all" ? "Todos" : TYPE_INFO[id]?.label || id.replace(/_/g, " "),
        count,
        icon: typeIcons[id] || ShieldCheck,
    }));

    const currentTypeInfo = edited.type ? TYPE_INFO[edited.type] : null;

    // Helpers para manipular config
    const updateConfigField = (key: string, value: unknown) => {
        setConfigObj({ ...configObj, [key]: value });
    };

    const getPatterns = (): string[] => {
        const patterns = configObj.patterns;
        if (Array.isArray(patterns)) return patterns;
        return [];
    };

    const addPattern = () => {
        const current = getPatterns();
        updateConfigField("patterns", [...current, ""]);
    };

    const updatePattern = (index: number, value: string) => {
        const current = getPatterns();
        current[index] = value;
        updateConfigField("patterns", current);
    };

    const removePattern = (index: number) => {
        const current = getPatterns();
        current.splice(index, 1);
        updateConfigField("patterns", current);
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Validators" }]}
                    title="Validators"
                    description="Regras de qualidade para roteiros"
                    actions={
                        <Button size="sm" className="gap-2" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Novo Validator
                        </Button>
                    }
                />

                <div className="flex-1 p-6">
                    <ContextBanner
                        title="Para que servem Validators?"
                        description="Validators verificam AUTOMATICAMENTE se o roteiro gerado está correto ANTES de continuar o pipeline. Se falhar, o sistema para e você pode corrigir."
                        tips={[
                            "Padrões Proibidos: Bloqueia HTML, Markdown, SSML no roteiro bruto",
                            "Padrões Obrigatórios: Garante marcadores de voz, estrutura correta",
                            "Mínimo de Palavras: Garante tamanho adequado para vídeos longos",
                            "Severity 'error' = bloqueia pipeline | 'warning' = só alerta",
                        ]}
                        variant="help"
                        defaultOpen
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
                                        subtitle={TYPE_INFO[item.type]?.label || item.type}
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

                                    {/* Templates Rápidos */}
                                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                                        <Label className="text-sm mb-2 block">⚡ Templates Prontos (clique para aplicar)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {TEMPLATES.map((t) => (
                                                <Button
                                                    key={t.name}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => applyTemplate(t)}
                                                    className="text-xs"
                                                >
                                                    {t.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome</Label>
                                                <Input value={edited.name || ""} onChange={(e) => setEdited({ ...edited, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tipo de Validação</Label>
                                                <Select
                                                    value={edited.type || ""}
                                                    onValueChange={(v) => {
                                                        setEdited({ ...edited, type: v });
                                                        setConfigObj({});
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="forbidden_patterns">🚫 Padrões Proibidos</SelectItem>
                                                        <SelectItem value="required_patterns">✅ Padrões Obrigatórios</SelectItem>
                                                        <SelectItem value="min_words">📏 Mínimo de Palavras</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Explicação do tipo */}
                                        {currentTypeInfo && (
                                            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                <div className="flex items-start gap-2">
                                                    <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-sm">{currentTypeInfo.label}</p>
                                                        <p className="text-sm text-muted-foreground">{currentTypeInfo.howToUse}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Config específica por tipo */}
                                        <div className="border-t pt-4">
                                            <Label className="mb-4 block font-medium">⚙️ Configuração</Label>

                                            {(edited.type === "forbidden_patterns" || edited.type === "required_patterns") && (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground">
                                                        Adicione os padrões (regex) que serão verificados:
                                                    </p>
                                                    {getPatterns().map((pattern, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <Input
                                                                value={pattern}
                                                                onChange={(e) => updatePattern(index, e.target.value)}
                                                                placeholder={`Ex: <[^>]+> (HTML) ou (voz: (marcador)`}
                                                                className="font-mono text-sm"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removePattern(index)}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={addPattern}>
                                                        + Adicionar Padrão
                                                    </Button>
                                                </div>
                                            )}

                                            {edited.type === "min_words" && (
                                                <div className="space-y-2">
                                                    <Label>Número mínimo de palavras</Label>
                                                    <Input
                                                        type="number"
                                                        value={String(configObj.minWords || "")}
                                                        onChange={(e) => updateConfigField("minWords", parseInt(e.target.value) || 0)}
                                                        placeholder="6000"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        💡 Referência: ~200 palavras = 1 minuto de vídeo
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Mensagem de Erro</Label>
                                            <Input
                                                value={edited.errorMessage || ""}
                                                onChange={(e) => setEdited({ ...edited, errorMessage: e.target.value })}
                                                placeholder="Mensagem exibida quando validação falha"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Severity (Gravidade)</Label>
                                            <Select
                                                value={edited.severity || "error"}
                                                onValueChange={(v) => setEdited({ ...edited, severity: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="error">🛑 Error — Bloqueia o pipeline</SelectItem>
                                                    <SelectItem value="warning">⚠️ Warning — Apenas alerta, continua</SelectItem>
                                                </SelectContent>
                                            </Select>
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
