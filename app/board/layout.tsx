"use client";

/**
 * Board Layout
 * 
 * Layout compartilhado para /board/*
 * Inclui Sidebar + ToastProvider para consistência com o resto do app.
 */

import { SuspenseSidebar } from "@/components/layout/SuspenseSidebar";
import { ToastProvider } from "@/components/ui/use-toast";

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-background">
                <SuspenseSidebar />
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        </ToastProvider>
    );
}
