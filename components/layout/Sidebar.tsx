"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Play,
    Settings,
    FileText,
    BookOpen,
    Server,
    ShieldCheck,
    ChevronRight,
    Settings2,
    Building2,
    Mic,
    Video,
    ChefHat,
    FolderOpen,
    Library,
} from "lucide-react";

// Main navigation (top level)
const navigation = [
    {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        name: "Produção",
        href: "/jobs",
        icon: Play,
        children: [
            { name: "Todos os Jobs", href: "/jobs" },
            { name: "Produção (Automático)", href: "/jobs/new" },
            { name: "Produção (Wizard)", href: "/wizard" },
        ],
    },
];

// Projects section - Hub central de configuração por projeto (ADR-010)
const projectsNavigation = [
    { name: "Projects", href: "/admin/projects", icon: Building2, description: "Hub de configuração" },
];

// Configurações Globais - itens comuns a todos os projetos
// Configurações Globais - itens comuns a todos os projetos
const configNavigation = [
    { name: "Integrações", href: "/admin/providers", icon: Server, description: "IA e Voz" },
    { name: "Vozes Disponíveis", href: "/admin/presets?type=voice", icon: Mic, description: "Presets de Voz" },
    { name: "Resoluções", href: "/admin/presets?type=video", icon: Video, description: "Presets de Vídeo" },
    { name: "ImageFX", href: "/admin/imagefx-config", icon: Settings, description: "Cookies Google" },
];

// Avançado - configuração de pipelines e templates
const advancedNavigation = [
    { name: "Fluxos de Produção", href: "/admin/recipes", icon: ChefHat, description: "Pipelines" },
    { name: "Prompts Globais", href: "/admin/prompts", icon: FileText, description: "Templates de IA" },
    { name: "Knowledge Base", href: "/admin/knowledge-base", icon: BookOpen, description: "Documentos" },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";

        // Parse href for path and query
        const [itemPath, itemQuery] = href.split("?");
        const currentType = searchParams.get("type");

        // Match path first
        if (!pathname.startsWith(itemPath)) return false;

        // If href has query params, they must match
        if (itemQuery) {
            const expectedType = new URLSearchParams(itemQuery).get("type");
            return currentType === expectedType;
        }

        // No query in href means no query should be in URL for this path
        return !currentType;
    };

    const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ElementType } }) => (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <item.icon className="w-4 h-4" />
            {item.name}
        </Link>
    );

    const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Icon className="w-3 h-3" />
            {label}
        </div>
    );

    return (
        <aside
            className={cn(
                "w-64 bg-card border-r flex flex-col h-screen sticky top-0",
                className
            )}
        >
            {/* Logo */}
            <div className="h-14 flex items-center px-4 border-b">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-lg">Video Factory</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
                {/* Main Navigation */}
                <div className="space-y-1">
                    {navigation.map((item) => (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive(item.href)
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                            {/* Children */}
                            {item.children && isActive(item.href) && (
                                <div className="ml-7 mt-1 space-y-1">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                                                pathname === child.href
                                                    ? "text-primary font-medium"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <ChevronRight className="w-3 h-3" />
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Projects Section - CONFIGURAÇÃO */}
                <div className="mt-6">
                    <SectionHeader icon={FolderOpen} label="Projetos" />
                    <div className="space-y-1">
                        {projectsNavigation.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </div>
                </div>

                {/* Configurações Globais */}
                <div className="mt-6">
                    <SectionHeader icon={Settings} label="Configurações" />
                    <div className="space-y-1">
                        {configNavigation.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </div>
                </div>

                {/* Avançado */}
                <div className="mt-6">
                    <SectionHeader icon={Library} label="Avançado" />
                    <div className="space-y-1">
                        {advancedNavigation.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </div>
                </div>
            </nav>
        </aside>
    );
}
