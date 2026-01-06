'use client';

import { useState, useEffect } from 'react';
import { getJobArtifacts } from '../../actions';

interface TabRoteiroProps {
    jobId: string;
}

export function TabRoteiro({ jobId }: TabRoteiroProps) {
    const [script, setScript] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadScript() {
            try {
                const artifacts = await getJobArtifacts(jobId, 'script');

                if (!artifacts || artifacts.length === 0) {
                    setScript(null);
                    return;
                }

                // Get latest script artifact
                const latest = artifacts[0];

                // Script content would be loaded from file path
                // For now, show placeholder with path info
                setScript(`Roteiro: ${latest.filename}\n\nCarregando conteúdo de: ${latest.path}`);
            } catch (err) {
                setError('Erro ao carregar roteiro');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadScript();
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

    if (!script) {
        return (
            <div className="p-6 text-center">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-muted-foreground text-sm">
                    Roteiro será gerado quando o job avançar para a coluna &quot;Roteiro&quot;
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Toolbar */}
            <div className="flex justify-end gap-2 mb-3">
                <button className="px-3 py-1 text-xs border border-border rounded hover:bg-muted">
                    📋 Copiar
                </button>
                <button className="px-3 py-1 text-xs border border-border rounded hover:bg-muted">
                    ⬇ Download
                </button>
            </div>

            {/* Script Content */}
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {script}
            </div>
        </div>
    );
}
