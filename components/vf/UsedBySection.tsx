"use client";

/**
 * UsedBySection - Mostra quais execution bindings referenciam uma entidade
 * 
 * Usado em Admin para Providers, Prompts, Presets, Validators, KB
 */

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    Globe,
    Building2,
    ArrowRight,
    Link as LinkIcon,
} from "lucide-react";

interface Binding {
    id: string;
    scope: string;
    projectId: string | null;
    recipeId: string;
    stepKey: string;
    slot: string;
    recipeName?: string;
    projectName?: string | null;
}

interface UsedBySectionProps {
    entityId: string;
    entityType: string;
    getUsedBy: (targetId: string) => Promise<Binding[]>;
    className?: string;
}

export function UsedBySection({
    entityId,
    entityType,
    getUsedBy,
    className,
}: UsedBySectionProps) {
    const [bindings, setBindings] = useState<Binding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await getUsedBy(entityId);
                setBindings(data);
            } catch (e) {
                console.error("Failed to load used by:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [entityId, getUsedBy]);

    if (loading) {
        return (
            <Card className={cn(className)}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Used By</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (bindings.length === 0) {
        return (
            <Card className={cn("opacity-75", className)}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Used By
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Nenhum binding referencia este {entityType}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Used By
                    <Badge variant="secondary" className="ml-auto">
                        {bindings.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {bindings.map((binding) => (
                    <Link
                        key={binding.id}
                        href={`/admin/execution-map?recipe=${binding.recipeId}&step=${binding.stepKey}`}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                    >
                        {binding.scope === "project" ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                                {binding.recipeName || "Recipe"} → {binding.stepKey}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {binding.slot} • {binding.scope}
                                {binding.projectName && ` (${binding.projectName})`}
                            </p>
                        </div>

                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
