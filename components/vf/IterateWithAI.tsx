"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface IterateWithAIProps {
    placeholder?: string;
    onIterate: (instruction: string) => void;
    isLoading?: boolean;
    suggestions?: string[];
    className?: string;
}

/**
 * IterateWithAI - Input field for iterating on AI-generated content
 * 
 * Features:
 * - Text input for custom instructions
 * - Quick suggestion buttons
 * - Loading state
 */
export function IterateWithAI({
    placeholder = "Tente algo mais dramático...",
    onIterate,
    isLoading = false,
    suggestions = [],
    className,
}: IterateWithAIProps) {
    const [instruction, setInstruction] = useState("");

    const handleSubmit = () => {
        if (instruction.trim() && !isLoading) {
            onIterate(instruction.trim());
            setInstruction("");
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        if (!isLoading) {
            onIterate(suggestion);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Default suggestions if none provided
    const displaySuggestions = suggestions.length > 0 ? suggestions : [
        "Mais dramático",
        "Mais curto",
        "Mais emocional",
        "Mais SEO",
    ];

    return (
        <div className={cn("space-y-3", className)}>
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                Iterar com IA
            </div>

            {/* Input */}
            <div className="relative">
                <Textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="min-h-[60px] pr-12 resize-none"
                    rows={2}
                />
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!instruction.trim() || isLoading}
                    className="absolute right-2 bottom-2 h-8 w-8 p-0"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2">
                {displaySuggestions.map((suggestion, i) => (
                    <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                        className="text-xs h-7"
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>
        </div>
    );
}
