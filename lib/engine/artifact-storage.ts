/**
 * Artifact Storage
 * 
 * Abstração de storage para artefatos de render.
 * Suporta filesystem local e pode ser estendido para S3/R2/MinIO.
 * 
 * Fase 3: Cache e Artefatos
 */

import { existsSync, mkdirSync, copyFileSync, statSync, readdirSync, unlinkSync } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// ===========================================
// TYPES
// ===========================================

export interface StorageConfig {
    /** Base path for storage */
    basePath: string;
    /** Storage type */
    type: 'local' | 's3' | 'r2';
    /** Max file size in bytes */
    maxFileSizeBytes?: number;
}

export interface StoredArtifact {
    id: string;
    originalName: string;
    storagePath: string;
    contentType: string;
    sizeBytes: number;
    hash: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

export interface StorageStats {
    totalArtifacts: number;
    totalSizeBytes: number;
    byType: Record<string, number>;
}

// ===========================================
// STORAGE INTERFACE
// ===========================================

export interface IStorage {
    store(filePath: string, jobId: string, name: string): Promise<StoredArtifact>;
    retrieve(id: string): Promise<string | null>;
    delete(id: string): Promise<boolean>;
    list(jobId: string): Promise<StoredArtifact[]>;
    getStats(): Promise<StorageStats>;
}

// ===========================================
// LOCAL STORAGE
// ===========================================

export class LocalStorage implements IStorage {
    private config: StorageConfig;
    private artifacts: Map<string, StoredArtifact> = new Map();

    constructor(config: Partial<StorageConfig> = {}) {
        this.config = {
            basePath: config.basePath ?? path.join(process.cwd(), 'artifacts'),
            type: 'local',
            maxFileSizeBytes: config.maxFileSizeBytes ?? 5 * 1024 * 1024 * 1024, // 5GB
        };

        this.ensureBasePath();
        this.scanExisting();
    }

    async store(
        filePath: string,
        jobId: string,
        name: string,
        metadata?: Record<string, unknown>
    ): Promise<StoredArtifact> {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stat = statSync(filePath);
        if (this.config.maxFileSizeBytes && stat.size > this.config.maxFileSizeBytes) {
            throw new Error(`File too large: ${stat.size} bytes (max ${this.config.maxFileSizeBytes})`);
        }

        const ext = path.extname(filePath);
        const hash = this.hashFile(filePath);
        const id = `${jobId}-${name}-${hash.slice(0, 8)}`;

        const jobDir = path.join(this.config.basePath, jobId);
        if (!existsSync(jobDir)) {
            mkdirSync(jobDir, { recursive: true });
        }

        const storagePath = path.join(jobDir, `${name}${ext}`);
        copyFileSync(filePath, storagePath);

        const artifact: StoredArtifact = {
            id,
            originalName: path.basename(filePath),
            storagePath,
            contentType: this.getContentType(ext),
            sizeBytes: stat.size,
            hash,
            createdAt: new Date().toISOString(),
            metadata,
        };

        this.artifacts.set(id, artifact);
        return artifact;
    }

    async retrieve(id: string): Promise<string | null> {
        const artifact = this.artifacts.get(id);
        if (!artifact) return null;

        if (!existsSync(artifact.storagePath)) {
            this.artifacts.delete(id);
            return null;
        }

        return artifact.storagePath;
    }

    async delete(id: string): Promise<boolean> {
        const artifact = this.artifacts.get(id);
        if (!artifact) return false;

        if (existsSync(artifact.storagePath)) {
            try {
                unlinkSync(artifact.storagePath);
            } catch {
                return false;
            }
        }

        this.artifacts.delete(id);
        return true;
    }

    async list(jobId: string): Promise<StoredArtifact[]> {
        return Array.from(this.artifacts.values())
            .filter(a => a.id.startsWith(jobId));
    }

    async getStats(): Promise<StorageStats> {
        const byType: Record<string, number> = {};
        let totalSizeBytes = 0;

        Array.from(this.artifacts.values()).forEach((artifact) => {
            totalSizeBytes += artifact.sizeBytes;
            byType[artifact.contentType] = (byType[artifact.contentType] || 0) + 1;
        });

        return {
            totalArtifacts: this.artifacts.size,
            totalSizeBytes,
            byType,
        };
    }

    /**
     * Get artifact by path
     */
    getByPath(storagePath: string): StoredArtifact | undefined {
        return Array.from(this.artifacts.values())
            .find(a => a.storagePath === storagePath);
    }

    // ===========================================
    // PRIVATE METHODS
    // ===========================================

    private ensureBasePath(): void {
        if (!existsSync(this.config.basePath)) {
            mkdirSync(this.config.basePath, { recursive: true });
        }
    }

    private scanExisting(): void {
        if (!existsSync(this.config.basePath)) return;

        try {
            const jobDirs = readdirSync(this.config.basePath, { withFileTypes: true })
                .filter(d => d.isDirectory())
                .map(d => d.name);

            for (const jobId of jobDirs) {
                const jobDir = path.join(this.config.basePath, jobId);
                const files = readdirSync(jobDir, { withFileTypes: true })
                    .filter(f => f.isFile())
                    .map(f => f.name);

                for (const file of files) {
                    const filePath = path.join(jobDir, file);
                    const stat = statSync(filePath);
                    const ext = path.extname(file);
                    const name = path.basename(file, ext);
                    const hash = this.hashFile(filePath);
                    const id = `${jobId}-${name}-${hash.slice(0, 8)}`;

                    this.artifacts.set(id, {
                        id,
                        originalName: file,
                        storagePath: filePath,
                        contentType: this.getContentType(ext),
                        sizeBytes: stat.size,
                        hash,
                        createdAt: stat.birthtime.toISOString(),
                    });
                }
            }
        } catch {
            // Ignore scan errors
        }
    }

    private hashFile(filePath: string): string {
        const fs = require('fs');
        const content = fs.readFileSync(filePath);
        return createHash('md5').update(content).digest('hex');
    }

    private getContentType(ext: string): string {
        const types: Record<string, string> = {
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.srt': 'text/plain',
            '.ass': 'text/plain',
            '.json': 'application/json',
            '.txt': 'text/plain',
        };

        return types[ext.toLowerCase()] || 'application/octet-stream';
    }
}

// ===========================================
// SINGLETON
// ===========================================

let storageInstance: IStorage | null = null;

/**
 * Get global storage instance
 */
export function getStorage(config?: Partial<StorageConfig>): IStorage {
    if (!storageInstance) {
        storageInstance = new LocalStorage(config);
    }
    return storageInstance;
}

/**
 * Store render output
 */
export async function storeRenderOutput(
    filePath: string,
    jobId: string,
    name: string = 'output'
): Promise<StoredArtifact> {
    return getStorage().store(filePath, jobId, name);
}

/**
 * List job artifacts
 */
export async function listJobArtifacts(jobId: string): Promise<StoredArtifact[]> {
    return getStorage().list(jobId);
}
