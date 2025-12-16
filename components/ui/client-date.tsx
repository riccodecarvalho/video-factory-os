"use client";

/**
 * ClientDate - Componente para renderizar datas de forma segura
 * 
 * Evita hydration errors ao renderizar datas apenas no cliente,
 * mostrando um placeholder inicial durante SSR.
 */

import { useState, useEffect } from "react";

interface ClientDateProps {
    date: string | Date;
    format?: "short" | "long" | "time";
    className?: string;
}

export function ClientDate({ date, format = "short", className }: ClientDateProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // During SSR, show a neutral placeholder
        return <span className={className}>--/--/----</span>;
    }

    const dateObj = typeof date === "string" ? new Date(date) : date;

    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
        short: {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        },
        long: {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
        time: {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        },
    };

    return (
        <span className={className}>
            {dateObj.toLocaleString("pt-BR", formatOptions[format])}
        </span>
    );
}
