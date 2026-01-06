'use client';

import { useState, useEffect } from 'react';
import { getJobArtifacts } from '../../actions';

interface TabOutlineProps {
    jobId: string;
}

interface OutlineItem {
    actNumber: number;
    title: string;
    summary: string;
}

export function TabOutline({ jobId }: TabOutlineProps) {
    const [outline, setOutline] = useState<OutlineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadOutline() {
            try {
                const artifacts = await getJobArtifacts(jobId, 'outline');

                if (!artifacts || artifacts.length === 0) {
                    setOutline([]);
                    return;
                }

                // Get latest outline artifact
                const latest = artifacts[0];

                // Parse outline from metadata or content
                if (latest.metadata) {
                    try {
                        const meta = JSON.parse(latest.metadata);
                        if (meta.outline && Array.isArray(meta.outline)) {
                            setOutline(meta.outline);
                            return;
                        }
                    } catch {
                        // Fall through to empty state
                    }
                }

                setOutline([]);
            } catch (err) {
                setError('Erro ao carregar outline');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadOutline();
    }, [jobId]);

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 text-sm">
                {error}
            </div>
        );
    }

    if (outline.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-muted-foreground text-sm">
                    Outline será gerado após a criação do roteiro
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            {outline.map((item, index) => (
                <div
                    key={index}
                    className="p-3 border border-border rounded-lg"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">
                            Ato {item.actNumber}
                        </span>
                        <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                        {item.summary}
                    </p>
                </div>
            ))}
        </div>
    );
}
