import { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    /** Breadcrumb items */
    breadcrumb?: BreadcrumbItem[];
    /** Page title */
    title: string;
    /** Page description */
    description?: string;
    /** Action buttons (right side) */
    actions?: ReactNode;
    /** Additional content below title (tabs, filters) */
    children?: ReactNode;
    className?: string;
}

/**
 * PageHeader - Cabeçalho padrão de página
 * 
 * Pattern 4pice: breadcrumb + título + descrição + ações
 * Densidade: compacta, hierarquia por tipografia
 */
export function PageHeader({
    breadcrumb,
    title,
    description,
    actions,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("border-b bg-card", className)}>
            {/* Breadcrumb row */}
            {breadcrumb && breadcrumb.length > 0 && (
                <div className="px-6 pt-4">
                    <Breadcrumb items={breadcrumb} />
                </div>
            )}

            {/* Title + Actions row */}
            <div className="flex items-start justify-between px-6 py-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {/* Children (tabs, filters, etc) */}
            {children && <div className="px-6 pb-4">{children}</div>}
        </div>
    );
}
