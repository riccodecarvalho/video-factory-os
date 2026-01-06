'use client';

import { useState } from 'react';
import { createJobFromBoard } from '../actions';
import { useToast } from '@/components/ui/use-toast';

interface NewVideoModalProps {
    onClose: () => void;
    onCreated: () => void;
}

const LANGUAGES = [
    { value: 'pt-BR', label: '🇧🇷 Português (Brasil)' },
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
    { value: 'automatic', label: 'Automático (IA gera imagens)' },
    { value: 'manual_upload', label: 'Upload Manual' },
    { value: 'manual_ai_single', label: 'IA Manual (uma por vez)' },
    { value: 'manual_ai_batch', label: 'IA Manual (em lote)' },
];

export function NewVideoModal({ onClose, onCreated }: NewVideoModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [form, setForm] = useState({
        title: '',
        language: 'pt-BR',
        durationPreset: 'medium',
        storyType: 'historia_geral',
        visualMode: 'automatic',
        imagesCount: 6,
        imagesLoop: false,
        captionsEnabled: true,
        zoomEnabled: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) {
            toast({
                title: 'Título obrigatório',
                description: 'Digite um título para o vídeo',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            await createJobFromBoard(form);
            toast({
                title: 'Vídeo criado!',
                description: 'Card adicionado à coluna "Vídeos a Fazer"',
            });
            onCreated();
        } catch (error) {
            toast({
                title: 'Erro ao criar vídeo',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Novo Vídeo</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Título</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Ex: A Vingança do Fantasma"
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>

                    {/* Language */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Idioma</label>
                        <select
                            value={form.language}
                            onChange={e => setForm({ ...form, language: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Duração</label>
                        <select
                            value={form.durationPreset}
                            onChange={e => setForm({ ...form, durationPreset: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            {DURATIONS.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Story Type */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo de História</label>
                        <select
                            value={form.storyType}
                            onChange={e => setForm({ ...form, storyType: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            {STORY_TYPES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Visual Mode */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Modo Visual</label>
                        <select
                            value={form.visualMode}
                            onChange={e => setForm({ ...form, visualMode: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            {VISUAL_MODES.map(v => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Images Count (only for automatic) */}
                    {form.visualMode === 'automatic' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Quantidade de Imagens: {form.imagesCount}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={form.imagesCount}
                                onChange={e => setForm({ ...form, imagesCount: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="imagesLoop"
                                    checked={form.imagesLoop}
                                    onChange={e => setForm({ ...form, imagesLoop: e.target.checked })}
                                />
                                <label htmlFor="imagesLoop" className="text-sm">
                                    Repetir última imagem
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Finishing Options */}
                    <div className="border-t border-border pt-4">
                        <h3 className="text-sm font-medium mb-2">Acabamento</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="captionsEnabled"
                                    checked={form.captionsEnabled}
                                    onChange={e => setForm({ ...form, captionsEnabled: e.target.checked })}
                                />
                                <label htmlFor="captionsEnabled" className="text-sm">
                                    Legendas Automáticas
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="zoomEnabled"
                                    checked={form.zoomEnabled}
                                    onChange={e => setForm({ ...form, zoomEnabled: e.target.checked })}
                                />
                                <label htmlFor="zoomEnabled" className="text-sm">
                                    Efeito de Zoom
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-border rounded-md text-sm hover:bg-muted"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? 'Criando...' : 'Criar Vídeo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
