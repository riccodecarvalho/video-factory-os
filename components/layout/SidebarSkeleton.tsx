"use client";

import { cn } from "@/lib/utils";

interface SidebarSkeletonProps {
    className?: string;
}

/**
 * SidebarSkeleton - Fallback loading state for Sidebar
 * 
 * Used as Suspense fallback to prevent useSearchParams() hydration errors
 */
export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
    return (
        <aside
            className={cn(
                "w-64 bg-card border-r flex flex-col h-screen sticky top-0",
                className
            )}
        >
            {/* Logo Skeleton */}
            <div className="h-14 flex items-center px-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                    <div className="w-24 h-5 rounded bg-muted animate-pulse" />
                </div>
            </div>

            {/* Navigation Skeleton */}
            <nav className="flex-1 overflow-y-auto p-3">
                {/* Main links */}
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2"
                        >
                            <div className="w-4 h-4 rounded bg-muted animate-pulse" />
                            <div className="w-20 h-4 rounded bg-muted animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Section: Projetos */}
                <div className="mt-6">
                    <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-3 h-3 rounded bg-muted animate-pulse" />
                        <div className="w-16 h-3 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="space-y-2 mt-1">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                <div className="w-4 h-4 rounded bg-muted animate-pulse" />
                                <div className="w-24 h-4 rounded bg-muted animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Biblioteca */}
                <div className="mt-6">
                    <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-3 h-3 rounded bg-muted animate-pulse" />
                        <div className="w-16 h-3 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="space-y-2 mt-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                <div className="w-4 h-4 rounded bg-muted animate-pulse" />
                                <div className="w-20 h-4 rounded bg-muted animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Footer Skeleton */}
            <div className="p-3 border-t">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-4 h-4 rounded bg-muted animate-pulse" />
                    <div className="w-24 h-4 rounded bg-muted animate-pulse" />
                </div>
            </div>
        </aside>
    );
}
