import { AlertTriangle, Copy, Terminal, Search, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ErrorDetailProps {
    error: string | object | null;
}

export function ErrorDetail({ error }: ErrorDetailProps) {
    if (!error) return null;

    let parsedError: any = { message: "Erro desconhecido", code: "UNKNOWN_ERROR" };

    // Tentar fazer parse se for string
    if (typeof error === "string") {
        try {
            parsedError = JSON.parse(error);
        } catch {
            parsedError = { message: error, code: "RUNTIME_ERROR" };
        }
    } else {
        parsedError = error;
    }

    // Normalizar a estrutura
    const errorMessage = parsedError.message || parsedError.error?.message || JSON.stringify(parsedError);
    const errorCode = parsedError.code || parsedError.error?.code || "GENERIC_FAILURE";
    const errorDetails = parsedError.details || parsedError.stack || parsedError.stderr;

    // Detectar tipo de erro para cor/ícone
    const isQuota = errorCode.includes("QUOTA") || errorCode.includes("RATE_LIMIT") || errorMessage.toLowerCase().includes("limit");
    const isAuth = errorCode.includes("AUTH") || errorCode.includes("KEY");
    const isTimeout = errorCode.includes("TIMEOUT");

    // Copy to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(parsedError, null, 2));
    };

    return (
        <Card className="border-destructive/50 bg-destructive/5 overflow-hidden">
            <CardHeader className="pb-3 bg-destructive/10 border-b border-destructive/20">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/20 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-destructive">
                                Falha na Execução
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-mono border-destructive/40 text-destructive/80">
                                    {errorCode}
                                </Badge>
                                {isQuota && (
                                    <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                        Cota Excedida
                                    </Badge>
                                )}
                                {isAuth && (
                                    <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                                        Autenticação
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar JSON
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {/* Mensagem Principal */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Mensagem</h4>
                    <p className="text-base font-medium leading-relaxed">{errorMessage}</p>
                </div>

                {/* Sugestão de Ação (Heurística básica) */}
                {isQuota && (
                    <div className="bg-background/50 border rounded-lg p-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-yellow-600 mb-1">
                            <Search className="h-3 w-3" />
                            Sugestão de Resolução
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Parece que você atingiu um limite de uso da API. Verifique seu painel de faturamento no provedor ou aguarde alguns minutos antes de tentar novamente.
                        </p>
                    </div>
                )}

                {isTimeout && (
                    <div className="bg-background/50 border rounded-lg p-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 mb-1">
                            <Clock className="h-3 w-3" />
                            Sugestão de Resolução
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            O processo demorou mais que o esperado. Tente reduzir o tamanho do input ou verifique se o serviço externo está operando normalmente.
                        </p>
                    </div>
                )}

                {/* Detalhes Técnicos (Colapsável ou Scroll) */}
                {errorDetails && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 mt-4 uppercase tracking-wider">
                            <Terminal className="h-3 w-3" />
                            Log Técnico / Stack Trace
                        </h4>
                        <div className="bg-black/90 rounded-md p-4 font-mono text-xs text-red-300 overflow-x-auto max-h-64 shadow-inner border border-destructive/20">
                            <pre className="whitespace-pre-wrap break-all">
                                {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
