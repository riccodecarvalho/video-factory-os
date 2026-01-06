'use client';

import { useState } from 'react';

interface TabInformacoesProps {
    job: Record<string, unknown>;
    isEditable: boolean;
    onUpdate: (config: Record<string, unknown>) => void;
    loading: boolean;
}

const LANGUAGES = [
    { value: 'pt-BR', label: '🇧🇷 Português' },
    { value: 'es-ES', label: '🇪🇸 Español' },
    { value: 'en-US', label: '🇺🇸 English' },
];

const DURATIONS = [
    { value: 'short', label: 'Curto (~12 min)' },
    { value: 'medium', label: 'Médio (~25 min)' },
    { value: 'long', label: 'Longo (~45 min)' },
];

const STORY_TYPES = [
    { value: 'historia_geral', label: 'História Geral' },
    { value: 'drama', label: 'Drama' },
    { value: 'misterio', label: 'Mistério' },
];

const VISUAL_MODES = [
    { value: 'automatic', label: 'Automático' },
    { value: 'manual_upload', label: 'Upload Manual' },
    { value: 'manual_ai_single', label: 'IA Manual' },
    { value: 'manual_ai_batch', label: 'IA Batch' },
];

export function TabInformacoes({ job, isEditable, onUpdate, loading }: TabInformacoesProps) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        language: job.language as string || 'pt-BR',
        durationPreset: job.durationPreset as string || 'medium',
        storyType: job.storyType as string || 'historia_geral',
        visualMode: job.visualMode as string || 'automatic',
        imagesCount: job.imagesCount as number || 6,
        captionsEnabled: job.captionsEnabled as boolean ?? true,
        zoomEnabled: job.zoomEnabled as boolean ?? true,
    });

    const handleSave = () => {
        onUpdate(form);
        setEditing(false);
    };

    if (!isEditable && !editing) {
        return (
            <div className="p-4 space-y-4">
                <InfoRow label="Idioma" value={LANGUAGES.find(l => l.value === job.language)?.label || job.language as string} />
                <InfoRow label="Duração" value={DURATIONS.find(d => d.value === job.durationPreset)?.label || job.durationPreset as string} />
                <InfoRow label="Tipo" value={STORY_TYPES.find(s => s.value === job.storyType)?.label || job.storyType as string} />
                <InfoRow label="Visual" value={VISUAL_MODES.find(v => v.value === job.visualMode)?.label || job.visualMode as string} />
                <InfoRow label="Imagens" value={`${job.imagesCount || 6}`} />
                <InfoRow label="Legendas" value={job.captionsEnabled ? 'Sim' : 'Não'} />
                <InfoRow label="Zoom" value={job.zoomEnabled ? 'Sim' : 'Não'} />

                <div className="pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground space-y-1">
                        <div>Criado: {formatDate(job.createdAt as string)}</div>
                        <div>Atualizado: {formatDate(job.updatedAt as string)}</div>
                        {typeof job.startedAt === 'string' && <div>Iniciado: {formatDate(job.startedAt)}</div>}
                        {typeof job.completedAt === 'string' && <div>Concluído: {formatDate(job.completedAt)}</div>}
                    </div>
                </div>

                <p className="text-xs text-muted-foreground italic">
                    Configurações só podem ser editadas antes da execução
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {!editing ? (
                <>
                    <InfoRow label="Idioma" value={LANGUAGES.find(l => l.value === job.language)?.label || job.language as string} />
                    <InfoRow label="Duração" value={DURATIONS.find(d => d.value === job.durationPreset)?.label || job.durationPreset as string} />
                    <InfoRow label="Tipo" value={STORY_TYPES.find(s => s.value === job.storyType)?.label || job.storyType as string} />
                    <InfoRow label="Visual" value={VISUAL_MODES.find(v => v.value === job.visualMode)?.label || job.visualMode as string} />
                    <InfoRow label="Imagens" value={`${job.imagesCount || 6}`} />
                    <InfoRow label="Legendas" value={job.captionsEnabled ? 'Sim' : 'Não'} />
                    <InfoRow label="Zoom" value={job.zoomEnabled ? 'Sim' : 'Não'} />

                    <button
                        onClick={() => setEditing(true)}
                        className="w-full py-2 text-sm border border-border rounded hover:bg-muted"
                    >
                        Editar Configurações
                    </button>
                </>
            ) : (
                <>
                    <SelectField
                        label="Idioma"
                        value={form.language}
                        options={LANGUAGES}
                        onChange={v => setForm({ ...form, language: v })}
                    />
                    <SelectField
                        label="Duração"
                        value={form.durationPreset}
                        options={DURATIONS}
                        onChange={v => setForm({ ...form, durationPreset: v })}
                    />
                    <SelectField
                        label="Tipo de História"
                        value={form.storyType}
                        options={STORY_TYPES}
                        onChange={v => setForm({ ...form, storyType: v })}
                    />
                    <SelectField
                        label="Modo Visual"
                        value={form.visualMode}
                        options={VISUAL_MODES}
                        onChange={v => setForm({ ...form, visualMode: v })}
                    />

                    {form.visualMode === 'automatic' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Imagens: {form.imagesCount}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={form.imagesCount}
                                onChange={e => setForm({ ...form, imagesCount: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.captionsEnabled}
                                onChange={e => setForm({ ...form, captionsEnabled: e.target.checked })}
                            />
                            Legendas
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.zoomEnabled}
                                onChange={e => setForm({ ...form, zoomEnabled: e.target.checked })}
                            />
                            Efeito de Zoom
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditing(false)}
                            className="flex-1 py-2 text-sm border border-border rounded hover:bg-muted"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================================
// Helper Components
// ============================================================================

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleString('pt-BR');
    } catch {
        return dateStr;
    }
}
