"use client";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout";
import { JobCard, JobCardSkeleton, MetricCard, StatusBadge } from "@/components/vf";
import { Plus, Zap, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

/**
 * Dashboard - "Control Room"
 * 
 * Mostra: métricas, lista de jobs recentes, ações rápidas
 */

// Dados de exemplo (em produção viriam do DB)
const mockJobs = [
    {
        id: "job_01HXYZ123ABC",
        title: "El secreto que mi suegra guardó por 30 años",
        recipe: "Graciela YouTube Long",
        status: "running" as const,
        progress: 45,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: "job_02HXYZ456DEF",
        title: "La herencia que destruyó a mi familia",
        recipe: "Graciela YouTube Long",
        status: "completed" as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: "job_03HXYZ789GHI",
        title: "Cuando descubrí que mi esposo tenía otra vida",
        recipe: "Graciela YouTube Long",
        status: "failed" as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
];

export default function DashboardPage() {
    const isLoading = false;

    return (
        <AppShell>
            <div className="container py-8">
                {/* Hero Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Video Factory OS</h1>
                        <p className="text-muted-foreground mt-1">
                            Control Room — Visão geral da produção
                        </p>
                    </div>
                    <Link href="/jobs/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Produção
                        </Button>
                    </Link>
                </div>

                {/* Metrics */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <MetricCard
                        label="Em Produção"
                        value={1}
                        icon={<Zap className="h-4 w-4" />}
                    />
                    <MetricCard
                        label="Concluídos Hoje"
                        value={5}
                        icon={<Clock className="h-4 w-4" />}
                    />
                    <MetricCard
                        label="Taxa Sucesso"
                        value="92%"
                    />
                    <MetricCard
                        label="Custo Hoje"
                        value="$12.45"
                        icon={<DollarSign className="h-4 w-4" />}
                    />
                </div>

                {/* Recent Jobs */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Jobs Recentes</h2>
                        <Link href="/jobs" className="text-sm text-primary hover:underline">
                            Ver todos →
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <JobCardSkeleton />
                            <JobCardSkeleton />
                            <JobCardSkeleton />
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {mockJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    id={job.id}
                                    title={job.title}
                                    recipe={job.recipe}
                                    status={job.status}
                                    progress={job.progress}
                                    createdAt={job.createdAt}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
