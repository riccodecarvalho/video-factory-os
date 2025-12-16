"use server";

/**
 * Script Studio Actions - Server Actions para versionamento de roteiros
 */

import { getDb, schema } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// Words per minute for duration estimation
const WPM = 150;

function calculateMetrics(content: string) {
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characterCount = content.length;
    const estimatedDurationSec = Math.round((wordCount / WPM) * 60);
    return { wordCount, characterCount, estimatedDurationSec };
}

// ============================================
// SCRIPT VERSIONS
// ============================================

export async function getScriptVersions(jobId: string) {
    const db = getDb();
    return db.select()
        .from(schema.scriptVersions)
        .where(eq(schema.scriptVersions.jobId, jobId))
        .orderBy(desc(schema.scriptVersions.version));
}

export async function getScriptVersion(id: string) {
    const db = getDb();
    const [version] = await db.select()
        .from(schema.scriptVersions)
        .where(eq(schema.scriptVersions.id, id));
    return version;
}

export async function getCurrentScriptVersion(jobId: string) {
    const db = getDb();
    const [version] = await db.select()
        .from(schema.scriptVersions)
        .where(and(
            eq(schema.scriptVersions.jobId, jobId),
            eq(schema.scriptVersions.isCurrent, true)
        ));
    return version;
}

export async function createScriptVersion(data: {
    jobId: string;
    content: string;
    createdBy?: 'ai' | 'human';
    notes?: string;
    setAsCurrent?: boolean;
}) {
    const db = getDb();
    const now = new Date().toISOString();

    // Get next version number
    const versions = await db.select()
        .from(schema.scriptVersions)
        .where(eq(schema.scriptVersions.jobId, data.jobId))
        .orderBy(desc(schema.scriptVersions.version));

    const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;

    // Calculate metrics
    const metrics = calculateMetrics(data.content);

    // If setting as current, unset previous current
    if (data.setAsCurrent) {
        await db.update(schema.scriptVersions)
            .set({ isCurrent: false })
            .where(eq(schema.scriptVersions.jobId, data.jobId));
    }

    const newVersion = {
        id: uuid(),
        jobId: data.jobId,
        version: nextVersion,
        content: data.content,
        ...metrics,
        createdBy: data.createdBy || 'human',
        notes: data.notes,
        isCurrent: data.setAsCurrent ?? false,
        isApproved: false,
        createdAt: now,
    };

    await db.insert(schema.scriptVersions).values(newVersion);
    return newVersion;
}

export async function updateScriptVersion(id: string, data: Partial<{
    content: string;
    notes: string;
    isApproved: boolean;
}>) {
    const db = getDb();

    const updateData: Record<string, unknown> = { ...data };

    // Recalculate metrics if content changed
    if (data.content) {
        const metrics = calculateMetrics(data.content);
        Object.assign(updateData, metrics);
    }

    await db.update(schema.scriptVersions)
        .set(updateData)
        .where(eq(schema.scriptVersions.id, id));
}

export async function setCurrentVersion(id: string) {
    const db = getDb();

    // Get the version to find its jobId
    const [version] = await db.select()
        .from(schema.scriptVersions)
        .where(eq(schema.scriptVersions.id, id));

    if (!version) return;

    // Unset all current for this job
    await db.update(schema.scriptVersions)
        .set({ isCurrent: false })
        .where(eq(schema.scriptVersions.jobId, version.jobId));

    // Set this one as current
    await db.update(schema.scriptVersions)
        .set({ isCurrent: true })
        .where(eq(schema.scriptVersions.id, id));
}

export async function approveVersion(id: string) {
    const db = getDb();
    await db.update(schema.scriptVersions)
        .set({ isApproved: true })
        .where(eq(schema.scriptVersions.id, id));
}

export async function deleteScriptVersion(id: string) {
    const db = getDb();

    // Delete scene markers first
    await db.delete(schema.sceneMarkers)
        .where(eq(schema.sceneMarkers.scriptVersionId, id));

    // Delete version
    await db.delete(schema.scriptVersions)
        .where(eq(schema.scriptVersions.id, id));
}

// ============================================
// SCENE MARKERS
// ============================================

export async function getSceneMarkers(scriptVersionId: string) {
    const db = getDb();
    return db.select()
        .from(schema.sceneMarkers)
        .where(eq(schema.sceneMarkers.scriptVersionId, scriptVersionId))
        .orderBy(schema.sceneMarkers.sceneNumber);
}

export async function createSceneMarker(data: {
    scriptVersionId: string;
    sceneNumber: number;
    title?: string;
    startLine?: number;
    endLine?: number;
    startChar?: number;
    endChar?: number;
    notes?: string;
    color?: string;
}) {
    const db = getDb();
    const now = new Date().toISOString();

    const newMarker = {
        id: uuid(),
        ...data,
        createdAt: now,
    };

    await db.insert(schema.sceneMarkers).values(newMarker);
    return newMarker;
}

export async function updateSceneMarker(id: string, data: Partial<{
    title: string;
    startLine: number;
    endLine: number;
    notes: string;
    color: string;
}>) {
    const db = getDb();
    await db.update(schema.sceneMarkers)
        .set(data)
        .where(eq(schema.sceneMarkers.id, id));
}

export async function deleteSceneMarker(id: string) {
    const db = getDb();
    await db.delete(schema.sceneMarkers)
        .where(eq(schema.sceneMarkers.id, id));
}

// ============================================
// UTILITY
// ============================================

export async function compareVersions(versionId1: string, versionId2: string) {
    const [v1, v2] = await Promise.all([
        getScriptVersion(versionId1),
        getScriptVersion(versionId2),
    ]);

    if (!v1 || !v2) return null;

    return {
        v1: {
            version: v1.version,
            wordCount: v1.wordCount,
            characterCount: v1.characterCount,
            estimatedDurationSec: v1.estimatedDurationSec,
            content: v1.content,
        },
        v2: {
            version: v2.version,
            wordCount: v2.wordCount,
            characterCount: v2.characterCount,
            estimatedDurationSec: v2.estimatedDurationSec,
            content: v2.content,
        },
        diff: {
            wordCountDelta: (v2.wordCount || 0) - (v1.wordCount || 0),
            characterCountDelta: (v2.characterCount || 0) - (v1.characterCount || 0),
            durationDelta: (v2.estimatedDurationSec || 0) - (v1.estimatedDurationSec || 0),
        },
    };
}

export async function exportScript(versionId: string, format: 'txt' | 'srt' = 'txt') {
    const version = await getScriptVersion(versionId);
    if (!version) return null;

    if (format === 'txt') {
        return {
            filename: `script-v${version.version}.txt`,
            content: version.content,
            mimeType: 'text/plain',
        };
    }

    // SRT format (basic - one subtitle block)
    if (format === 'srt') {
        const lines = version.content.split('\n').filter(l => l.trim());
        let srtContent = '';
        const msPerWord = (60 / WPM) * 1000;
        let currentMs = 0;

        lines.forEach((line, index) => {
            const wordCount = line.trim().split(/\s+/).length;
            const durationMs = wordCount * msPerWord;
            const startTime = formatSrtTime(currentMs);
            const endTime = formatSrtTime(currentMs + durationMs);

            srtContent += `${index + 1}\n`;
            srtContent += `${startTime} --> ${endTime}\n`;
            srtContent += `${line.trim()}\n\n`;

            currentMs += durationMs;
        });

        return {
            filename: `script-v${version.version}.srt`,
            content: srtContent,
            mimeType: 'text/srt',
        };
    }

    return null;
}

function formatSrtTime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}
