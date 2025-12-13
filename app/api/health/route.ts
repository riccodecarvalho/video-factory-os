import { NextResponse } from "next/server";

/**
 * Health Check API
 * 
 * GET /api/health
 * Retorna status do sistema
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "0.1.0",
        services: {
            database: "pending", // TODO: verificar conexão DB
            llm: "pending",      // TODO: verificar API key
            tts: "pending",      // TODO: verificar Azure
        },
    });
}
