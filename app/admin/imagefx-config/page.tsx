"use client";

/**
 * ImageFX Configuration Page
 * 
 * Permite configurar cookies do ImageFX para geração de imagens.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Cookie,
    Save,
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    Trash2,
    Info
} from "lucide-react";

const STORAGE_KEY = "imagefx_cookies";
// Lista expandida de cookies que indicam autenticação válida do Google
const VALID_COOKIE_PATTERNS = [
    "__Secure-1PSID",
    "__Secure-3PSID",
    "Secure-next-auth",
    "__Host-next-auth",
    "SAPISID",
    "SID=",
    "HSID=",
    "csrf-token=",
    "labs.google"
];

export default function ImageFXConfigPage() {
    const [cookies, setCookies] = useState("");
    const [saved, setSaved] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Load saved cookies on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCookies = localStorage.getItem(STORAGE_KEY);
            if (savedCookies) {
                setCookies(savedCookies);
                validateCookies(savedCookies);
            }
        }
    }, []);

    const validateCookies = (value: string) => {
        // Conta quantos padrões válidos foram encontrados
        const matchCount = VALID_COOKIE_PATTERNS.filter(pattern => value.includes(pattern)).length;
        // Precisa ter pelo menos 2 padrões para ser considerado válido
        const isOk = matchCount >= 2;
        setIsValid(isOk);
        return isOk;
    };

    const handleSave = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, cookies);
            validateCookies(cookies);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleClear = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
            setCookies("");
            setIsValid(null);
        }
    };

    const handleChange = (value: string) => {
        setCookies(value);
        if (value.length > 100) {
            validateCookies(value);
        } else {
            setIsValid(null);
        }
    };

    return (
        <div className="container py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Cookie className="h-8 w-8 text-orange-500" />
                    Configuração ImageFX
                </h1>
                <p className="text-muted-foreground mt-2">
                    Configure os cookies do Google ImageFX para geração de imagens
                </p>
            </div>

            {/* Instructions */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Como obter os cookies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Acesse <a href="https://labs.google/fx" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                            labs.google/fx <ExternalLink className="h-3 w-3" />
                        </a></li>
                        <li>Faça login com sua conta Google</li>
                        <li>Instale a extensão <strong>Cookie Editor</strong> no seu navegador</li>
                        <li>Clique no ícone da extensão e exporte todos os cookies como <strong>Header String</strong></li>
                        <li>Cole o conteúdo no campo abaixo</li>
                    </ol>

                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <strong>Importante:</strong> Os cookies expiram após ~24 horas. Você precisará atualizar periodicamente.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cookies Input */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Cookies do ImageFX</span>
                        {isValid !== null && (
                            <Badge variant={isValid ? "default" : "destructive"}>
                                {isValid ? (
                                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Válido</>
                                ) : (
                                    <><AlertTriangle className="h-3 w-3 mr-1" /> Inválido</>
                                )}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Cole o header string exportado do Cookie Editor
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="__Secure-1PSID=...; __Secure-3PSID=...; ..."
                        value={cookies}
                        onChange={(e) => handleChange(e.target.value)}
                        className="min-h-[200px] font-mono text-xs"
                    />

                    <div className="flex gap-3">
                        <Button onClick={handleSave} disabled={!cookies.trim()}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Cookies
                        </Button>
                        <Button variant="outline" onClick={handleClear} disabled={!cookies.trim()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Limpar
                        </Button>
                        {saved && (
                            <span className="text-green-600 flex items-center gap-1 text-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                Salvo com sucesso!
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Status */}
            {isValid && (
                <div className="flex items-start gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong className="text-green-800 dark:text-green-300">Pronto para usar</strong>
                        <p className="text-sm text-green-700 dark:text-green-400">
                            Os cookies estão configurados. O step &quot;Gerar Imagens&quot; usará esses cookies automaticamente.
                        </p>
                    </div>
                </div>
            )}

            {isValid === false && (
                <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong className="text-red-800 dark:text-red-300">Cookies inválidos</strong>
                        <p className="text-sm text-red-700 dark:text-red-400">
                            Os cookies parecem estar incompletos. Verifique se você exportou todos os cookies do ImageFX.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
