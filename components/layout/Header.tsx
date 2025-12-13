import { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";
import { cn } from "@/lib/utils";

interface HeaderProps {
    breadcrumb?: BreadcrumbItem[];
    title?: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export function Header({
    breadcrumb,
    title,
    description,
    actions,
    className,
}: HeaderProps) {
    return (
        <header className={cn("border-b bg-card", className)}>
            {/* Top bar with breadcrumb */}
            <div className="h-14 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    {breadcrumb && <Breadcrumb items={breadcrumb} />}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {/* Page title section (optional) */}
            {title && (
                <div className="px-6 py-4 border-t">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            )}
        </header>
    );
}
