"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LineNumberedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function LineNumberedTextarea({
    value,
    onChange,
    className,
    rows = 12,
    ...props
}: LineNumberedTextareaProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = React.useRef<HTMLDivElement>(null);

    const lines = value.split("\n");
    const lineCount = lines.length;

    // Sync scroll between line numbers and textarea
    const handleScroll = () => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    return (
        <div className="flex rounded-md border border-input bg-background overflow-hidden">
            {/* Line numbers */}
            <div
                ref={lineNumbersRef}
                className="flex-shrink-0 bg-muted/50 border-r border-input overflow-hidden select-none"
                style={{ minWidth: "3rem" }}
            >
                <div className="py-2 text-right">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div
                            key={i + 1}
                            className="px-2 text-xs text-muted-foreground font-mono leading-[1.5rem]"
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onScroll={handleScroll}
                rows={rows}
                className={cn(
                    "flex-1 resize-none bg-transparent px-3 py-2 text-sm font-mono leading-[1.5rem]",
                    "placeholder:text-muted-foreground focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
        </div>
    );
}
