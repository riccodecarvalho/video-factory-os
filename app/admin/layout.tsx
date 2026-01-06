"use client";

/**
 * Admin Layout
 * 
 * Layout compartilhado para todas as páginas /admin/*
 * Inclui a Sidebar para navegação consistente.
 */

import { SuspenseSidebar } from "@/components/layout/SuspenseSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <SuspenseSidebar />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}
