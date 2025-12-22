import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

export default function ScriptStudioPage() {
    return (
        <AppShell>
            <div className="space-y-6">
                <PageHeader
                    title="Script Studio"
                    description="Editor profissional de roteiros com gestão de cenas"
                />

                <div className="grid gap-6">
                    <Card className="border-dashed border-2">
                        <CardHeader className="text-center pb-10 pt-10">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Construction className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <CardTitle>Módulo em Construção</CardTitle>
                            <CardDescription className="max-w-md mx-auto mt-2">
                                O Script Studio permitirá editar roteiros cena a cena, validando regras de tempo e estimativa de leitura em tempo real.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-10">
                            <Button variant="outline" disabled>
                                Em breve: Editor Visual v1.0
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4 opacity-50 pointer-events-none">
                        <Card>
                            <CardHeader>
                                <CardTitle>Editor de Cenas</CardTitle>
                                <CardDescription>Quebre o roteiro em blocos lógicos</CardDescription>
                            </CardHeader>
                            <CardContent className="h-32 bg-muted/20" />
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview & Validação</CardTitle>
                                <CardDescription>Estime tempo e correções de SSML</CardDescription>
                            </CardHeader>
                            <CardContent className="h-32 bg-muted/20" />
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
