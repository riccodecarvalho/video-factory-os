"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface FilterChip {
    id: string;
    label: string;
    isActive?: boolean;
}

interface FiltersBarProps {
    /** Filter chips/tabs */
    filters?: FilterChip[];
    /** Active filter */
    activeFilter?: string;
    /** Filter change callback */
    onFilterChange?: (id: string) => void;
    /** Search value */
    searchValue?: string;
    /** Search change callback */
    onSearchChange?: (value: string) => void;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Additional actions (right side) */
    actions?: ReactNode;
    className?: string;
}

/**
 * FiltersBar - Barra de filtros e busca
 * 
 * Pattern 4pice: chips/tabs + campo de busca
 */
export function FiltersBar({
    filters,
    activeFilter,
    onFilterChange,
    searchValue = "",
    onSearchChange,
    searchPlaceholder = "Buscar...",
    actions,
    className,
}: FiltersBarProps) {
    const [localSearch, setLocalSearch] = useState(searchValue);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
        onSearchChange?.(value);
    };

    const clearSearch = () => {
        setLocalSearch("");
        onSearchChange?.("");
    };

    return (
        <div className={cn("flex items-center justify-between gap-4", className)}>
            {/* Left: Filters */}
            <div className="flex items-center gap-2">
                {filters?.map((filter) => {
                    const isActive = filter.isActive || filter.id === activeFilter;
                    return (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange?.(filter.id)}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {filter.label}
                        </button>
                    );
                })}
            </div>

            {/* Right: Search + Actions */}
            <div className="flex items-center gap-2">
                {onSearchChange && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={localSearch}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="pl-9 pr-8 w-64"
                        />
                        {localSearch && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                    </div>
                )}
                {actions}
            </div>
        </div>
    );
}
