'use client';

import Link from 'next/link';
import { useState } from 'react';

interface BoardTopbarProps {
    autoVideoEnabled: boolean;
    onAutoVideoToggle: (enabled: boolean) => void;
    onNewVideo: () => void;
}

export function BoardTopbar({
    autoVideoEnabled,
    onAutoVideoToggle,
    onNewVideo,
}: BoardTopbarProps) {
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [showChunksModal, setShowChunksModal] = useState(false);

    return (
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-6">
                <Link href="/" className="font-bold text-lg">
                    Video Factory
                </Link>

                <nav className="flex items-center gap-1">
                    <NavTab href="/board" active>Início</NavTab>
                    <NavTab href="/jobs">Meus Vídeos</NavTab>
                    <NavTab href="#" disabled>Tutoriais</NavTab>
                    <NavTab href="#" disabled>Thumbs</NavTab>
                    <NavTab href="#" disabled>Feedback</NavTab>
                </nav>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
                {/* Usuários (Stub) */}
                <button
                    onClick={() => setShowUsersModal(true)}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Usuários
                </button>

                {/* Chunks (Stub) */}
                <button
                    onClick={() => setShowChunksModal(true)}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Chunks
                </button>

                {/* Meus Cards (Stub) */}
                <select
                    className="px-3 py-1.5 text-sm bg-muted border border-border rounded-md"
                    defaultValue="padrao"
                >
                    <option value="padrao">Meus Cards (Padrão)</option>
                </select>

                {/* Meus Prompts */}
                <Link
                    href="/admin/prompts"
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Meus Prompts
                </Link>

                {/* Auto Vídeo Toggle */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                    <span className="text-sm">Auto Vídeo</span>
                    <button
                        onClick={() => onAutoVideoToggle(!autoVideoEnabled)}
                        className={`
              relative w-10 h-5 rounded-full transition-colors
              ${autoVideoEnabled ? 'bg-green-500' : 'bg-gray-400'}
            `}
                    >
                        <span
                            className={`
                absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform
                ${autoVideoEnabled ? 'translate-x-5' : 'translate-x-0.5'}
              `}
                        />
                    </button>
                </div>

                {/* Quota (Stub) */}
                <div className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded-md">
                    Premium 0/30
                </div>

                {/* Billing (Stub) */}
                <button className="px-3 py-1.5 text-sm bg-muted rounded-md">
                    $
                </button>

                {/* New Video CTA */}
                <button
                    onClick={onNewVideo}
                    className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                    + Novo Vídeo
                </button>
            </div>

            {/* Stubs Modals */}
            {showUsersModal && (
                <StubModal
                    title="Gerenciar Usuários"
                    message="Gerenciamento de usuários em breve"
                    onClose={() => setShowUsersModal(false)}
                />
            )}
            {showChunksModal && (
                <StubModal
                    title="Chunks de Conteúdo"
                    message="Biblioteca de chunks em desenvolvimento"
                    onClose={() => setShowChunksModal(false)}
                />
            )}
        </header>
    );
}

function NavTab({
    href,
    active,
    disabled,
    children,
}: {
    href: string;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    if (disabled) {
        return (
            <span className="px-3 py-1.5 text-sm text-muted-foreground/50 cursor-not-allowed">
                {children}
            </span>
        );
    }

    return (
        <Link
            href={href}
            className={`
        px-3 py-1.5 text-sm rounded-md transition-colors
        ${active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
      `}
        >
            {children}
        </Link>
    );
}

function StubModal({
    title,
    message,
    onClose,
}: {
    title: string;
    message: string;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
