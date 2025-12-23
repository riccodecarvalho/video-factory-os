"use client";

import { cn } from "@/lib/utils";
import { User, Skull, GraduationCap, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CharacterType = "protagonista" | "vilao" | "mentor" | "coadjuvante";

interface CharacterCardProps {
    type: CharacterType;
    nome: string;
    descricao: string;
    idade?: number;
    profissao?: string;
    className?: string;
}

const CHARACTER_CONFIG: Record<CharacterType, {
    icon: typeof User;
    label: string;
    color: string;
    bgColor: string;
}> = {
    protagonista: {
        icon: User,
        label: "Protagonista",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    vilao: {
        icon: Skull,
        label: "Vilão",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    mentor: {
        icon: GraduationCap,
        label: "Mentor",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    coadjuvante: {
        icon: Users,
        label: "Coadjuvante",
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
};

/**
 * CharacterCard - Card para personagens narrativos
 * 
 * Features:
 * - Ícone e cor por tipo de personagem
 * - Avatar com inicial
 * - Nome, descrição, idade e profissão
 */
export function CharacterCard({
    type,
    nome,
    descricao,
    idade,
    profissao,
    className,
}: CharacterCardProps) {
    const config = CHARACTER_CONFIG[type];
    const Icon = config.icon;
    const inicial = nome.charAt(0).toUpperCase();

    return (
        <div
            className={cn(
                "rounded-lg border bg-card p-4",
                className
            )}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                    className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold",
                        config.bgColor,
                        config.color
                    )}
                >
                    {inicial}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <Badge
                            variant="secondary"
                            className={cn("text-xs gap-1", config.color)}
                        >
                            <Icon className="w-3 h-3" />
                            {config.label}
                        </Badge>
                    </div>

                    {/* Nome */}
                    <h4 className="font-semibold text-foreground truncate">
                        {nome}
                    </h4>

                    {/* Descrição */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {descricao}
                    </p>

                    {/* Meta */}
                    {(idade || profissao) && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            {idade && <span>{idade} anos</span>}
                            {idade && profissao && <span>•</span>}
                            {profissao && <span>{profissao}</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * CharacterCardList - Lista de personagens
 */
export function CharacterCardList({
    characters,
    className,
}: {
    characters: CharacterCardProps[];
    className?: string;
}) {
    return (
        <div className={cn("space-y-3", className)}>
            {characters.map((char, index) => (
                <CharacterCard key={`${char.nome}-${index}`} {...char} />
            ))}
        </div>
    );
}
