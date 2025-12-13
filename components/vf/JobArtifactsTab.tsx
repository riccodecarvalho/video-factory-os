"use client";

/**
 * JobArtifactsTab - Lista artifacts gerados pelo job
 * 
 * Mostra por step:
 * - Nome, tipo, path, created_at
 * - Ações: Copy path, Open (se local)
 */

import * as React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    FileAudio,
    FileVideo,
    FileText,
    File,
    Copy,
    ExternalLink,
    Check,
    FolderOpen,
} from "lucide-react";

interface Artifact {
    id?: string;
    uri: string;
    type: string;
    stepKey?: string;
    createdAt?: string;
    size?: number;
    hash?: string;
}

interface ManifestWithArtifacts {
    artifacts?: Artifact[];
    steps?: Array<{
        key: string;
        artifacts?: Artifact[];
    }>;
}

interface JobArtifactsTabProps {
    manifest: ManifestWithArtifacts | null;
    jobId: string;
    className?: string;
}

const TypeIcon: Record<string, typeof File> = {
    audio: FileAudio,
    video: FileVideo,
    text: FileText,
    json: FileText,
};

function getIcon(type: string) {
    return TypeIcon[type] || File;
}

function formatBytes(bytes?: number): string {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getArtifactUrl(uri: string, jobId: string): string {
    // Convert local paths to API URLs
    // Input: ./artifacts/{jobId}/{stepKey}/file.mp3
    // Output: /api/artifacts/{jobId}/{stepKey}/file.mp3
    if (uri.startsWith('./artifacts/')) {
        return `/api/artifacts/${uri.replace('./artifacts/', '')}`;
    }
    if (uri.startsWith('artifacts/')) {
        return `/api/artifacts/${uri.replace('artifacts/', '')}`;
    }
    // If it's already a URL or external, return as-is
    return uri;
}

function ArtifactRow({ artifact, jobId }: { artifact: Artifact; jobId: string }) {
    const [copied, setCopied] = useState(false);
    const Icon = getIcon(artifact.type);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(artifact.uri);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filename = artifact.uri.split("/").pop() || artifact.uri;
    const viewUrl = getArtifactUrl(artifact.uri, jobId);
    const downloadUrl = `${viewUrl}?download=true`;
    const isLocalArtifact = artifact.uri.startsWith('./') || artifact.uri.startsWith('artifacts/');

    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
            <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{filename}</p>
                <p className="text-xs text-muted-foreground truncate">{artifact.uri}</p>
            </div>

            <Badge variant="outline" className="text-xs flex-shrink-0">
                {artifact.type}
            </Badge>

            {artifact.size && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatBytes(artifact.size)}
                </span>
            )}

            <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopy}
                    title="Copy path"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-status-success" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>

                {isLocalArtifact ? (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                            title="View"
                        >
                            <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                            title="Download"
                        >
                            <a href={downloadUrl} download>
                                <FolderOpen className="h-4 w-4" />
                            </a>
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                    >
                        <a href={artifact.uri} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}

function StepArtifactsCard({
    stepKey,
    artifacts,
    jobId,
}: {
    stepKey: string;
    artifacts: Artifact[];
    jobId: string;
}) {
    if (artifacts.length === 0) return null;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize flex items-center justify-between">
                    {stepKey.replace(/_/g, " ")}
                    <Badge variant="secondary" className="text-xs">
                        {artifacts.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {artifacts.map((artifact, idx) => (
                    <ArtifactRow key={artifact.id || idx} artifact={artifact} jobId={jobId} />
                ))}
            </CardContent>
        </Card>
    );
}

export function JobArtifactsTab({ manifest, jobId, className }: JobArtifactsTabProps) {
    if (!manifest) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <p>Manifest não disponível</p>
            </div>
        );
    }

    // Group artifacts by step
    const artifactsByStep: Record<string, Artifact[]> = {};

    // From manifest.artifacts (global list)
    if (manifest.artifacts) {
        manifest.artifacts.forEach((artifact) => {
            const step = artifact.stepKey || "unknown";
            if (!artifactsByStep[step]) artifactsByStep[step] = [];
            artifactsByStep[step].push(artifact);
        });
    }

    // From manifest.steps[].artifacts
    if (manifest.steps) {
        manifest.steps.forEach((step) => {
            if (step.artifacts && step.artifacts.length > 0) {
                if (!artifactsByStep[step.key]) artifactsByStep[step.key] = [];
                artifactsByStep[step.key].push(...step.artifacts);
            }
        });
    }

    const steps = Object.keys(artifactsByStep);
    const totalArtifacts = Object.values(artifactsByStep).flat().length;

    if (steps.length === 0 || totalArtifacts === 0) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum artifact gerado</p>
                <p className="text-xs mt-1">
                    Artifacts são salvos em ./artifacts/{jobId}/
                </p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {totalArtifacts} artifact{totalArtifacts !== 1 ? "s" : ""} gerado
                    {totalArtifacts !== 1 ? "s" : ""}
                </p>
                <Badge variant="outline">./artifacts/{jobId}/</Badge>
            </div>

            <div className="space-y-4">
                {steps.map((stepKey) => (
                    <StepArtifactsCard
                        key={stepKey}
                        stepKey={stepKey}
                        artifacts={artifactsByStep[stepKey]}
                        jobId={jobId}
                    />
                ))}
            </div>
        </div>
    );
}
