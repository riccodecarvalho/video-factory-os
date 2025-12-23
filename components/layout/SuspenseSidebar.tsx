"use client";

import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarSkeleton } from "./SidebarSkeleton";

/**
 * SuspenseSidebar - Sidebar wrapped in Suspense boundary
 * 
 * Use this component instead of Sidebar directly in pages
 * to prevent useSearchParams() hydration errors during build.
 */
export function SuspenseSidebar() {
    return (
        <Suspense fallback={<SidebarSkeleton />}>
            <Sidebar />
        </Suspense>
    );
}
