"use client";

import { Button } from "@/components/ui/button";
import {
    JobCard,
    JobCardSkeleton,
    MetricCard,
    StatusBadge,
    type PipelineStep
} from "@/components/vf";
import { Plus, Zap, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

/**
 * Dashboard - "Control Room"
 * 
 * Mostra: métricas, lista de jobs, ações rápidas
 */

// Dados de exemplo (em produção viriam do DB)
const mockJobs = [
    {
        id: "job_01HXYZ123ABC",
        title: "El secreto que mi suegra guardó por 30 años",
        recipe: "Graciela YouTube Long",
        status: "running" as const,
        progress: 45,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30min ago
        steps: [
            { key: "title", label: "Title", status: "success" as const },
            { key: "brief", label: "Brief", status: "success" as const },
            { key: "script", label: "Script", status: "running" as const },
            { key: "ssml", label: "SSML", status: "pending" as const },
            { key: "tts", label: "TTS", status: "pending" as const },
            { key: "render", label: "Render", status: "pending" as const },
        ] satisfies PipelineStep[],
    },
    {
        id: "job_02HXYZ456DEF",
        title: "La herencia que destruyó a mi familia",
        recipe: "Graciela YouTube Long",
        status: "success" as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
        steps: [
            { key: "title", label: "Title", status: "success" as const },
            { key: "brief", label: "Brief", status: "success" as const },
            { key: "script", label: "Script", status: "success" as const },
            { key: "ssml", label: "SSML", status: "success" as const },
            { key: "tts", label: "TTS", status: "success" as const },
            { key: "render", label: "Render", status: "success" as const },
        ] satisfies PipelineStep[],
    },
    {
        id: "job_03HXYZ789GHI",
        title: "Cuando descubrí que mi esposo tenía otra vida",
        recipe: "Graciela YouTube Long",
        status: "failed" as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h ago
        steps: [
            { key: "title", label: "Title", status: "success" as const },
            { key: "brief", label: "Brief", status: "success" as const },
            { key: "script", label: "Script", status: "failed" as const },
            { key: "ssml", label: "SSML", status: "pending" as const },
            { key: "tts", label: "TTS", status: "pending" as const },
            { key: "render", label: "Render", status: "pending" as const },
        ] satisfies PipelineStep[],
    },
];

export default function DashboardPage() {
    return (
        <div className="container py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Production Floor</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie sua fábrica de vídeos
                    </p>
                </div>
                <Link href="/jobs/new">
                    <Button size="lg" className="gap-2">
                        <Plus className="h-5 w-5" />
                        Nova Produção
                    </Button>
                </Link>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <MetricCard
                    label="Jobs Hoje"
                    value={12}
                    icon={Zap}
                    trend={{ value: 20, label: "vs ontem" }}
                />
                <MetricCard
                    label="Tempo Médio"
                    value="32"
                    unit="min"
                    icon={Clock}
                    trend={{ value: -8, label: "mais rápido" }}
                />
                <MetricCard
                    label="Custo Estimado"
                    value="$4.50"
                    icon={DollarSign}
                    trend={{ value: 5 }}
                />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Filtrar:</span>
                <StatusBadge status="running" showIcon={false} />
                <StatusBadge status="success" showIcon={false} />
                <StatusBadge status="failed" showIcon={false} />
                <StatusBadge status="pending" showIcon={false} />
            </div>

            {/* Jobs List */}
            <div className="grid gap-4">
                {mockJobs.map((job) => (
                    <JobCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        recipe={job.recipe}
                        status={job.status}
                        progress={job.progress}
                        steps={job.steps}
                        createdAt={job.createdAt}
                        onClick={() => console.log('View job:', job.id)}
                        onRetry={() => console.log('Retry:', job.id)}
                        onPreview={() => console.log('Preview:', job.id)}
                        onDownload={() => console.log('Download:', job.id)}
                    />
                ))}
            </div>

            {/* Loading Example */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Loading State</h2>
                <div className="grid gap-4">
                    <JobCardSkeleton />
                </div>
            </div>
        </div>
    );
}
