import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "Video Factory OS",
    description: "Sistema de produção de vídeos por pipeline",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
                <div className="min-h-screen bg-background text-foreground">
                    {children}
                </div>
            </body>
        </html>
    );
}
