'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

// ============================================================================
// Toast Variants (mapeados para event_type do DarkFlow)
// ============================================================================

type ToastVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

const VARIANT_STYLES: Record<ToastVariant, string> = {
    default: 'bg-card border border-border text-foreground',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-black',
    destructive: 'bg-red-600 text-white',
    info: 'bg-blue-500 text-white',
};

const VARIANT_DESCRIPTION_STYLES: Record<ToastVariant, string> = {
    default: 'text-muted-foreground',
    success: 'text-green-100',
    warning: 'text-yellow-900/70',
    destructive: 'text-red-100',
    info: 'text-blue-100',
};

// ============================================================================
// Event Type → Toast Mapping (DarkFlow)
// ============================================================================

/**
 * Mapeia event_type do job_events para toast variant e mensagem padrão
 */
export function getToastForEvent(eventType: string, payload?: Record<string, unknown>): {
    variant: ToastVariant;
    title: string;
    description?: string;
} {
    switch (eventType) {
        case 'step_started':
            return {
                variant: 'info',
                title: 'Execução iniciada',
                description: payload?.step ? `Step: ${payload.step}` : undefined,
            };
        case 'step_progress':
            return {
                variant: 'default',
                title: 'Progresso',
                description: payload?.percent ? `${payload.percent}%` : undefined,
            };
        case 'step_completed':
            return {
                variant: 'success',
                title: 'Step concluído',
                description: payload?.step ? `${payload.step}` : undefined,
            };
        case 'step_failed':
            return {
                variant: 'destructive',
                title: 'Falha na execução',
                description: payload?.error ? String(payload.error) : 'Erro desconhecido',
            };
        case 'step_skipped':
            return {
                variant: 'warning',
                title: 'Step ignorado',
                description: payload?.reason ? String(payload.reason) : undefined,
            };
        case 'job_completed':
            return {
                variant: 'success',
                title: '🎉 Job concluído!',
                description: 'Vídeo pronto para download',
            };
        case 'auto_transition':
            return {
                variant: 'info',
                title: 'Transição automática',
                description: payload?.toState ? `→ ${payload.toState}` : undefined,
            };
        case 'lock_stolen':
            return {
                variant: 'warning',
                title: 'Lock recuperado',
                description: 'Execução anterior expirou',
            };
        case 'artifact_written':
            return {
                variant: 'success',
                title: 'Arquivo gerado',
                description: payload?.filename ? String(payload.filename) : undefined,
            };
        default:
            return {
                variant: 'default',
                title: eventType,
                description: payload ? JSON.stringify(payload).slice(0, 100) : undefined,
            };
    }
}

// ============================================================================
// Toast Context and Provider
// ============================================================================

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
}

interface ToastContextType {
    toast: (options: Omit<Toast, 'id'>) => void;
    toastFromEvent: (eventType: string, payload?: Record<string, unknown>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return {
            toast: (options: Omit<Toast, 'id'>) => {
                console.log(`[Toast] ${options.title}: ${options.description}`);
            },
            toastFromEvent: (eventType: string, payload?: Record<string, unknown>) => {
                const { title, description } = getToastForEvent(eventType, payload);
                console.log(`[Toast] ${title}: ${description}`);
            },
        };
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((options: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { ...options, id }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const toastFromEvent = useCallback((eventType: string, payload?: Record<string, unknown>) => {
        const toastData = getToastForEvent(eventType, payload);
        toast(toastData);
    }, [toast]);

    return (
        <ToastContext.Provider value={{ toast, toastFromEvent }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(t => {
                    const variant = t.variant || 'default';
                    return (
                        <div
                            key={t.id}
                            className={`
                                px-4 py-3 rounded-lg shadow-lg max-w-sm 
                                animate-in slide-in-from-bottom-2
                                ${VARIANT_STYLES[variant]}
                            `}
                        >
                            <div className="font-medium text-sm">{t.title}</div>
                            {t.description && (
                                <div className={`text-xs mt-1 ${VARIANT_DESCRIPTION_STYLES[variant]}`}>
                                    {t.description}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
