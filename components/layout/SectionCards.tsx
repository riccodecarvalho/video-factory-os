import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionCard {
    id: string;
    label: string;
    count: number;
    icon?: LucideIcon;
    isActive?: boolean;
}

interface SectionCardsProps {
    cards: SectionCard[];
    onSelect?: (id: string) => void;
    activeId?: string;
    className?: string;
}

/**
 * SectionCards - Grid de cards com contadores
 * 
 * Pattern 4pice: cards de categoria (Todos, Analysis, Generation, etc)
 * Active state: border-primary/50 bg-primary/5
 */
export function SectionCards({
    cards,
    onSelect,
    activeId,
    className,
}: SectionCardsProps) {
    return (
        <div className={cn("grid gap-4", className)} style={{
            gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, minmax(0, 1fr))`
        }}>
            {cards.map((card) => {
                const isActive = card.isActive || card.id === activeId;
                const Icon = card.icon;

                return (
                    <button
                        key={card.id}
                        onClick={() => onSelect?.(card.id)}
                        className="text-left"
                    >
                        <Card
                            className={cn(
                                "transition-all cursor-pointer",
                                isActive
                                    ? "border-primary/50 bg-primary/5"
                                    : "hover:border-primary/30"
                            )}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {card.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <span className="text-3xl font-bold">{card.count}</span>
                            </CardContent>
                        </Card>
                    </button>
                );
            })}
        </div>
    );
}
