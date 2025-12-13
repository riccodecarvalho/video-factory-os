"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Info, AlertTriangle, Bug } from "lucide-react";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    stepKey?: string;
}

interface LogsViewerProps {
    logs: LogEntry[];
    maxHeight?: string;
    autoScroll?: boolean;
    className?: string;
}

const levelIcons: Record<LogLevel, typeof Info> = {
    info: Info,
    warn: AlertTriangle,
    error: AlertCircle,
    debug: Bug,
};

const levelColors: Record<LogLevel, string> = {
    info: "text-blue-500",
    warn: "text-status-warning",
    error: "text-status-error",
    debug: "text-muted-foreground",
};

function formatTimestamp(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function LogsViewer({
    logs,
    maxHeight = "300px",
    autoScroll = true,
    className,
}: LogsViewerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    return (
        <div className={cn("border rounded-lg", className)}>
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                <h3 className="text-sm font-medium">Logs</h3>
                <Badge variant="outline" className="text-xs">
                    {logs.length} entradas
                </Badge>
            </div>

            <ScrollArea
                ref={scrollRef}
                className="font-mono text-xs"
                style={{ maxHeight }}
            >
                <div className="p-2 space-y-1">
                    {logs.map((log, index) => {
                        const Icon = levelIcons[log.level] || Info;
                        const colorClass = levelColors[log.level] || "";

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-2 py-1 px-2 rounded hover:bg-muted/50",
                                    log.level === "error" && "bg-status-error/5"
                                )}
                            >
                                <Icon className={cn("w-3 h-3 mt-0.5 shrink-0", colorClass)} />
                                <span className="text-muted-foreground shrink-0">
                                    {formatTimestamp(log.timestamp)}
                                </span>
                                {log.stepKey && (
                                    <span className="text-primary shrink-0">[{log.stepKey}]</span>
                                )}
                                <span className="flex-1">{log.message}</span>
                            </div>
                        );
                    })}

                    {logs.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                            Nenhum log disponível
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
