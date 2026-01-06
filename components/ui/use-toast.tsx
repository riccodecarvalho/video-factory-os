'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

interface ToastContextType {
    toast: (options: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback when not in provider
        return {
            toast: (options: Omit<Toast, 'id'>) => {
                console.log(`[Toast] ${options.title}: ${options.description}`);
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

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Toast container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`
              px-4 py-3 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-bottom-2
              ${t.variant === 'destructive'
                                ? 'bg-red-600 text-white'
                                : 'bg-card border border-border'
                            }
            `}
                    >
                        <div className="font-medium text-sm">{t.title}</div>
                        {t.description && (
                            <div className={`text-xs mt-1 ${t.variant === 'destructive' ? 'text-red-100' : 'text-muted-foreground'}`}>
                                {t.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
