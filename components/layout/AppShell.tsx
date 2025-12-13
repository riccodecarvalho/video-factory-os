import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BreadcrumbItem } from "./Breadcrumb";
import { cn } from "@/lib/utils";

interface AppShellProps {
    children: ReactNode;
    breadcrumb?: BreadcrumbItem[];
    title?: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

/**
 * AppShell - Layout principal do Video Factory OS
 * 
 * Estrutura:
 * +------------------+--------------------------------------------------+
 * |  SIDEBAR (256px) |  HEADER (h-14)                                   |
 * |  bg-card         |  border-b                                        |
 * |  border-r        +--------------------------------------------------+
 * |                  |                                                  |
 * |  Logo            |  MAIN CONTENT                                    |
 * |                  |  p-6 max-w-7xl mx-auto                           |
 * |  Navigation      |                                                  |
 * |  - Groups        |                                                  |
 * |  - Items         |                                                  |
 * |                  |                                                  |
 * +------------------+--------------------------------------------------+
 */
export function AppShell({
    children,
    breadcrumb,
    title,
    description,
    actions,
    className,
}: AppShellProps) {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header
                    breadcrumb={breadcrumb}
                    title={title}
                    description={description}
                    actions={actions}
                />

                {/* Content */}
                <main className={cn("flex-1 p-6", className)}>
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
