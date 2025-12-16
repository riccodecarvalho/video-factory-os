"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout";
import {
    Save,
    Loader2,
    History,
    Clock,
    FileText,
    Check,
    Download,
    RotateCcw,
    Star,
} from "lucide-react";
import {
    getScriptVersions,
    getCurrentScriptVersion,
    createScriptVersion,
    updateScriptVersion,
    setCurrentVersion,
    approveVersion,
    exportScript,
} from "./actions";

type ScriptVersion = Awaited<ReturnType<typeof getScriptVersions>>[0];

// Words per minute for estimates
const WPM = 150;

export default function ScriptStudioPage() {
    const params = useParams();
    const jobId = params.id as string;

    const [versions, setVersions] = useState<ScriptVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<ScriptVersion | null>(null);
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [showHistory, setShowHistory] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load versions
    useEffect(() => {
        loadVersions();
    }, [jobId]);

    const loadVersions = () => {
        startTransition(async () => {
            const [allVersions, current] = await Promise.all([
                getScriptVersions(jobId),
                getCurrentScriptVersion(jobId),
            ]);
            setVersions(allVersions);

            // Select current or latest version
            const versionToSelect = current || allVersions[0];
            if (versionToSelect) {
                setSelectedVersion(versionToSelect);
                setContent(versionToSelect.content);
            }
            setHasChanges(false);
        });
    };

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        setHasChanges(newContent !== selectedVersion?.content);
    };

    const handleSaveNewVersion = () => {
        startTransition(async () => {
            await createScriptVersion({
                jobId,
                content,
                createdBy: 'human',
                setAsCurrent: true,
            });
            loadVersions();
        });
    };

    const handleSelectVersion = (version: ScriptVersion) => {
        setSelectedVersion(version);
        setContent(version.content);
        setHasChanges(false);
    };

    const handleSetCurrent = (versionId: string) => {
        startTransition(async () => {
            await setCurrentVersion(versionId);
            loadVersions();
        });
    };

    const handleApprove = (versionId: string) => {
        startTransition(async () => {
            await approveVersion(versionId);
            loadVersions();
        });
    };

    const handleExport = async (format: 'txt' | 'srt') => {
        if (!selectedVersion) return;

        const result = await exportScript(selectedVersion.id, format);
        if (!result) return;

        // Create download
        const blob = new Blob([result.content], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Calculate live metrics
    const metrics = useMemo(() => {
        const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const characterCount = content.length;
        const estimatedDurationSec = Math.round((wordCount / WPM) * 60);
        const minutes = Math.floor(estimatedDurationSec / 60);
        const seconds = estimatedDurationSec % 60;
        return { wordCount, characterCount, estimatedDuration: `${minutes}:${String(seconds).padStart(2, '0')}` };
    }, [content]);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <PageHeader
                    breadcrumb={[
                        { label: "Jobs", href: "/jobs" },
                        { label: jobId.slice(0, 8), href: `/jobs/${jobId}` },
                        { label: "Script Studio" },
                    ]}
                    title="Script Studio"
                    description="Editor de roteiro com versionamento"
                    actions={
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowHistory(!showHistory)}
                            >
                                <History className="w-4 h-4 mr-2" />
                                Histórico ({versions.length})
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={handleSaveNewVersion}
                                disabled={isPending || !hasChanges}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Nova Versão
                            </Button>
                        </div>
                    }
                />

                <div className="flex-1 flex">
                    {/* Main Editor */}
                    <div className="flex-1 p-6">
                        {/* Metrics Bar */}
                        <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>{metrics.wordCount} palavras</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>~{metrics.estimatedDuration} (150 WPM)</span>
                            </div>
                            {selectedVersion && (
                                <div className="flex items-center gap-2">
                                    <Badge variant={selectedVersion.isCurrent ? "default" : "outline"}>
                                        v{selectedVersion.version}
                                    </Badge>
                                    {selectedVersion.isApproved && (
                                        <Badge className="bg-green-500/10 text-green-600">
                                            <Check className="w-3 h-3 mr-1" />
                                            Aprovado
                                        </Badge>
                                    )}
                                    {hasChanges && (
                                        <Badge variant="secondary">
                                            Não salvo
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Editor */}
                        <Textarea
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Digite ou cole seu roteiro aqui..."
                            className="min-h-[calc(100vh-280px)] font-mono text-sm resize-none"
                        />

                        {/* Export buttons */}
                        <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => handleExport('txt')}>
                                <Download className="w-4 h-4 mr-2" />
                                Export TXT
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleExport('srt')}>
                                <Download className="w-4 h-4 mr-2" />
                                Export SRT
                            </Button>
                        </div>
                    </div>

                    {/* History Sidebar */}
                    {showHistory && (
                        <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
                            <h3 className="text-sm font-semibold mb-4">Histórico de Versões</h3>

                            <div className="space-y-2">
                                {versions.map((version) => (
                                    <div
                                        key={version.id}
                                        onClick={() => handleSelectVersion(version)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedVersion?.id === version.id
                                            ? "bg-primary/5 border-primary"
                                            : "bg-background hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">v{version.version}</span>
                                                {version.isCurrent && (
                                                    <Badge className="text-xs">Atual</Badge>
                                                )}
                                                {version.isApproved && (
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                )}
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {version.createdBy === 'ai' ? 'IA' : 'Manual'}
                                            </Badge>
                                        </div>

                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div>{version.wordCount || 0} palavras</div>
                                            <div>{new Date(version.createdAt).toLocaleString('pt-BR')}</div>
                                        </div>

                                        {selectedVersion?.id === version.id && (
                                            <div className="flex gap-1 mt-2 pt-2 border-t">
                                                {!version.isCurrent && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSetCurrent(version.id);
                                                        }}
                                                    >
                                                        <RotateCcw className="w-3 h-3 mr-1" />
                                                        Tornar Atual
                                                    </Button>
                                                )}
                                                {!version.isApproved && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApprove(version.id);
                                                        }}
                                                    >
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Aprovar
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {versions.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        Nenhuma versão salva ainda.
                                        <br />
                                        <span className="text-xs">Edite o roteiro e salve uma nova versão.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
