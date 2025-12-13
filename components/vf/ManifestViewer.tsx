"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

interface ManifestViewerProps {
    manifest: Record<string, unknown> | null;
    maxHeight?: string;
    className?: string;
}

export function ManifestViewer({
    manifest,
    maxHeight = "400px",
    className,
}: ManifestViewerProps) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const handleCopy = () => {
        if (manifest) {
            navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!manifest) {
        return (
            <div className={cn("border rounded-lg p-4", className)}>
                <p className="text-sm text-muted-foreground text-center">
                    Manifest não disponível ainda
                </p>
            </div>
        );
    }

    return (
        <div className={cn("border rounded-lg", className)}>
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 text-sm font-medium"
                >
                    {expanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                    Manifest
                </button>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        v{(manifest as { version?: string }).version || "1.0.0"}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 px-2"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-status-success" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {expanded && (
                <ScrollArea style={{ maxHeight }}>
                    <pre className="p-4 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(manifest, null, 2)}
                    </pre>
                </ScrollArea>
            )}
        </div>
    );
}
