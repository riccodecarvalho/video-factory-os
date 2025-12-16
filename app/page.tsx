import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout";
import { JobCard, MetricCard } from "@/components/vf";
import { Plus, Zap, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { getJobs, getJobStatusCounts } from "@/app/jobs/actions";

/**
 * Dashboard - "Control Room"
 * 
 * Mostra: métricas reais, lista de jobs recentes, ações rápidas
 */

export default async function DashboardPage() {
    // Buscar dados reais do banco
    const [jobs, statusCounts] = await Promise.all([
        getJobs(),
        getJobStatusCounts()
    ]);

    // Pegar os 6 jobs mais recentes
    const recentJobs = jobs.slice(0, 6);

    // Calcular jobs concluídos hoje
    const today = new Date().toISOString().split("T")[0];
    const completedToday = jobs.filter(j =>
        j.status === "completed" &&
        j.completedAt?.startsWith(today)
    ).length;

    // Calcular taxa de sucesso (evitar divisão por zero)
    const totalFinished = statusCounts.completed + statusCounts.failed;
    const successRate = totalFinished > 0
        ? Math.round((statusCounts.completed / totalFinished) * 100)
        : 100;

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
                        value={statusCounts.running}
                        icon={<Zap className="h-4 w-4" />}
                    />
                    <MetricCard
                        label="Concluídos Hoje"
                        value={completedToday}
                        icon={<Clock className="h-4 w-4" />}
                    />
                    <MetricCard
                        label="Taxa Sucesso"
                        value={`${successRate}%`}
                        icon={<CheckCircle className="h-4 w-4" />}
                    />
                    <MetricCard
                        label="Falhados"
                        value={statusCounts.failed}
                        icon={<XCircle className="h-4 w-4" />}
                    />
                </div>

                {/* Recent Jobs */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Jobs Recentes</h2>
                        <Link href="/jobs" className="text-sm text-primary hover:underline">
                            Ver todos ({statusCounts.all}) →
                        </Link>
                    </div>

                    {recentJobs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Nenhum job criado ainda.</p>
                            <Link href="/jobs/new">
                                <Button variant="outline" className="mt-4">
                                    Criar primeiro job
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {recentJobs.map((job) => {
                                const input = JSON.parse(job.input || "{}");
                                return (
                                    <JobCard
                                        key={job.id}
                                        id={job.id}
                                        title={input.title || input.idea || job.recipeSlug || "Sem título"}
                                        recipe={job.recipeSlug || "Receita"}
                                        status={job.status as "pending" | "running" | "completed" | "failed" | "cancelled"}
                                        progress={job.progress || 0}
                                        createdAt={job.createdAt || ""}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}

