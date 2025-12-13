"use server";

/**
 * Video Factory OS - Audit Service
 * 
 * Registra eventos de auditoria para rastreabilidade de mudanças no Admin.
 */

import { getDb, schema } from "@/lib/db";
import { v4 as uuid } from "uuid";

export interface AuditEventInput {
    actor?: string;
    action: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    scope?: "global" | "project";
    projectId?: string;
    before?: unknown;
    after?: unknown;
    metadata?: Record<string, unknown>;
}

/**
 * Registra um evento de auditoria no banco de dados.
 */
export async function recordAuditEvent(input: AuditEventInput): Promise<string> {
    const db = getDb();
    const id = uuid();
    const now = new Date().toISOString();

    await db.insert(schema.auditEvents).values({
        id,
        createdAt: now,
        actor: input.actor || "admin",
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        scope: input.scope,
        projectId: input.projectId,
        beforeJson: input.before ? JSON.stringify(input.before) : null,
        afterJson: input.after ? JSON.stringify(input.after) : null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    });

    return id;
}

/**
 * Helper para criar audit event simplificado (CRUD padrão)
 */
export async function auditCrud(
    action: "created" | "updated" | "deleted",
    entityType: string,
    entityId: string,
    entityName: string,
    before?: unknown,
    after?: unknown
): Promise<string> {
    return recordAuditEvent({
        action,
        entityType,
        entityId,
        entityName,
        before,
        after,
    });
}

/**
 * Helper para audit de binding changes
 */
export async function auditBinding(
    action: "binding.set" | "binding.reset" | "binding.removed",
    bindingId: string,
    recipeId: string,
    stepKey: string,
    slot: string,
    scope: "global" | "project",
    projectId?: string,
    before?: unknown,
    after?: unknown
): Promise<string> {
    return recordAuditEvent({
        action,
        entityType: "binding",
        entityId: bindingId,
        entityName: `${stepKey}.${slot}`,
        scope,
        projectId,
        before,
        after,
        metadata: { recipeId, stepKey, slot },
    });
}

/**
 * Query audit events (para UI futura)
 */
export async function getAuditEvents(options?: {
    entityType?: string;
    entityId?: string;
    limit?: number;
}) {
    const db = getDb();

    // Query básica - em produção usar where conditions
    const events = await db
        .select()
        .from(schema.auditEvents)
        .orderBy(schema.auditEvents.createdAt)
        .limit(options?.limit || 100);

    return events;
}
