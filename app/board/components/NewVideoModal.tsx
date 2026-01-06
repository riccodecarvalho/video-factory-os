'use client';

import { useState } from 'react';
import { createJobFromBoard } from '../actions';
import { useToast } from '@/components/ui/use-toast';

interface NewVideoModalProps {
    onClose: () => void;
    onCreated: () => void;
}

type CreationMode =
    | 'select'           // Tela inicial
    | 'without_model'    // Criar Vídeo Sem Modelo (completo)
    | 'from_url'         // Modelar Vídeo (URL) - stub
    | 'from_template'    // Usar Modelo Salvo - stub
    | 'custom_script'    // Roteiro Personalizado - stub
    | 'video_only';      // Gerar Apenas Vídeo - stub

const CREATION_OPTIONS = [
    {
        id: 'without_model' as const,
        label: 'Criar Vídeo Sem Modelo',
        description: 'Gera roteiro, narração e vídeo do zero',
        icon: '✨',
        implemented: true,
    },
    {
        id: 'from_url' as const,
        label: 'Modelar Vídeo (URL)',
        description: 'Usa vídeo do YouTube como referência',
        icon: '🔗',
        implemented: false,
    },
    {
        id: 'from_template' as const,
        label: 'Usar Modelo Salvo',
        description: 'Aplica configurações de um modelo',
        icon: '📋',
        implemented: false,
    },
    {
        id: 'custom_script' as const,
        label: 'Roteiro Personalizado',
        description: 'Fornece seu próprio roteiro',
        icon: '📝',
        implemented: false,
    },
    {
        id: 'video_only' as const,
        label: 'Gerar Apenas Vídeo',
        description: 'Usa áudio e imagens prontas',
        icon: '🎬',
        implemented: false,
    },
];

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
    const [mode, setMode] = useState<CreationMode>('select');
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

    const handleOptionSelect = (optionId: CreationMode) => {
        const option = CREATION_OPTIONS.find(o => o.id === optionId);
        if (!option?.implemented) {
            toast({
                title: 'Em breve',
                description: 'Essa opção ainda não está disponível',
            });
            return;
        }
        setMode(optionId);
    };

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
                    <div className="flex items-center gap-2">
                        {mode !== 'select' && (
                            <button
                                onClick={() => setMode('select')}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ←
                            </button>
                        )}
                        <h2 className="text-lg font-semibold">
                            {mode === 'select' ? 'Novo Vídeo' : getModeName(mode)}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                {mode === 'select' ? (
                    <SelectModeScreen onSelect={handleOptionSelect} />
                ) : mode === 'without_model' ? (
                    <CreateWithoutModelForm
                        form={form}
                        setForm={setForm}
                        loading={loading}
                        onSubmit={handleSubmit}
                        onCancel={() => setMode('select')}
                    />
                ) : (
                    <StubScreen mode={mode} onBack={() => setMode('select')} />
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Sub-components
// ============================================================================

function SelectModeScreen({ onSelect }: { onSelect: (mode: CreationMode) => void }) {
    return (
        <div className="p-4 space-y-3">
            {CREATION_OPTIONS.map(option => (
                <button
                    key={option.id}
                    onClick={() => onSelect(option.id)}
                    className={`
            w-full p-4 rounded-lg border text-left transition-all
            ${option.implemented
                            ? 'border-border hover:border-primary hover:bg-muted/50'
                            : 'border-border/50 opacity-60 cursor-not-allowed'
                        }
          `}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                {option.label}
                                {!option.implemented && (
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                        Em breve
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {option.description}
                            </div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}

interface FormData {
    title: string;
    language: string;
    durationPreset: string;
    storyType: string;
    visualMode: string;
    imagesCount: number;
    imagesLoop: boolean;
    captionsEnabled: boolean;
    zoomEnabled: boolean;
}

function CreateWithoutModelForm({
    form,
    setForm,
    loading,
    onSubmit,
    onCancel,
}: {
    form: FormData;
    setForm: (f: FormData) => void;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}) {
    return (
        <form onSubmit={onSubmit} className="p-4 space-y-4">
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
                    onClick={onCancel}
                    className="flex-1 py-2 border border-border rounded-md text-sm hover:bg-muted"
                >
                    Voltar
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
    );
}

function StubScreen({ mode, onBack }: { mode: CreationMode; onBack: () => void }) {
    const labels: Record<string, { title: string; message: string }> = {
        from_url: {
            title: 'Modelar Vídeo (URL)',
            message: 'Extração automática ainda não disponível. Preencha os dados manualmente.',
        },
        from_template: {
            title: 'Usar Modelo Salvo',
            message: 'Biblioteca de modelos em desenvolvimento.',
        },
        custom_script: {
            title: 'Roteiro Personalizado',
            message: 'Importação de roteiro ainda não disponível.',
        },
        video_only: {
            title: 'Gerar Apenas Vídeo',
            message: 'Upload de áudio e imagens ainda não disponível.',
        },
    };

    const info = labels[mode] || { title: mode, message: 'Em desenvolvimento' };

    return (
        <div className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
            <p className="text-muted-foreground text-sm mb-6">{info.message}</p>
            <button
                onClick={onBack}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
            >
                Voltar
            </button>
        </div>
    );
}

function getModeName(mode: CreationMode): string {
    const names: Record<CreationMode, string> = {
        select: 'Novo Vídeo',
        without_model: 'Criar Vídeo Sem Modelo',
        from_url: 'Modelar Vídeo (URL)',
        from_template: 'Usar Modelo Salvo',
        custom_script: 'Roteiro Personalizado',
        video_only: 'Gerar Apenas Vídeo',
    };
    return names[mode];
}
