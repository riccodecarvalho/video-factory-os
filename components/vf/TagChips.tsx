"use client";

import { cn } from "@/lib/utils";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagChipsProps {
    tags: string[];
    onRemove?: (tag: string) => void;
    onAdd?: (tag: string) => void;
    editable?: boolean;
    variant?: "default" | "secondary" | "outline";
    size?: "sm" | "md";
    className?: string;
}

/**
 * TagChips - Tags como badges clicáveis e editáveis
 * 
 * Features:
 * - Display de tags como chips
 * - Remoção com X (se editable)
 * - Adicionar novas tags (se editable)
 * - Variantes visuais
 */
export function TagChips({
    tags,
    onRemove,
    onAdd,
    editable = false,
    variant = "secondary",
    size = "md",
    className,
}: TagChipsProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTag, setNewTag] = useState("");

    const handleAddTag = () => {
        if (newTag.trim() && onAdd) {
            onAdd(newTag.trim());
            setNewTag("");
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        } else if (e.key === "Escape") {
            setIsAdding(false);
            setNewTag("");
        }
    };

    const sizeClasses = size === "sm" ? "text-xs h-5 px-1.5" : "text-xs h-6 px-2";

    return (
        <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
            {tags.map((tag, index) => (
                <Badge
                    key={`${tag}-${index}`}
                    variant={variant}
                    className={cn(
                        sizeClasses,
                        "font-normal",
                        editable && onRemove && "pr-1"
                    )}
                >
                    {tag}
                    {editable && onRemove && (
                        <button
                            onClick={() => onRemove(tag)}
                            className="ml-1 hover:text-destructive transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </Badge>
            ))}

            {editable && onAdd && (
                <>
                    {isAdding ? (
                        <div className="flex items-center gap-1">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => {
                                    if (!newTag.trim()) {
                                        setIsAdding(false);
                                    }
                                }}
                                placeholder="Nova tag..."
                                className="h-6 w-24 text-xs"
                                autoFocus
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleAddTag}
                                className="h-6 w-6 p-0"
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsAdding(true)}
                            className={cn(sizeClasses, "gap-1 text-muted-foreground hover:text-foreground")}
                        >
                            <Plus className="w-3 h-3" />
                            Adicionar
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
