/**
 * Artifact Cache
 * 
 * Cache por hash para evitar reprocessamento de steps idênticos.
 * Suporta cache local (filesystem) e pode ser estendido para remote.
 * 
 * Fase 3: Cache e Artefatos
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';

// ===========================================
// TYPES
// ===========================================

export interface CacheEntry {
    hash: string;
    outputPath: string;
    createdAt: string;
    expiresAt?: string;
    sizeBytes: number;
    metadata?: Record<string, unknown>;
}

export interface CacheConfig {
    /** Cache directory */
    cacheDir: string;
    /** Max cache size in bytes (0 = unlimited) */
    maxSizeBytes?: number;
    /** TTL in seconds (0 = no expiry) */
    ttlSeconds?: number;
    /** Enable cache */
    enabled: boolean;
}

export interface CacheStats {
    totalEntries: number;
    totalSizeBytes: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
}

// ===========================================
// ARTIFACT CACHE
// ===========================================

export class ArtifactCache {
    private config: CacheConfig;
    private index: Map<string, CacheEntry> = new Map();
    private stats = { hitCount: 0, missCount: 0 };
    private indexPath: string;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            cacheDir: config.cacheDir ?? path.join(process.cwd(), '.cache', 'artifacts'),
            maxSizeBytes: config.maxSizeBytes ?? 10 * 1024 * 1024 * 1024, // 10GB default
            ttlSeconds: config.ttlSeconds ?? 7 * 24 * 60 * 60, // 7 days default
            enabled: config.enabled ?? true,
        };

        this.indexPath = path.join(this.config.cacheDir, 'cache-index.json');
        this.ensureCacheDir();
        this.loadIndex();
    }

    /**
     * Generate hash for inputs
     */
    hash(inputs: unknown): string {
        const content = JSON.stringify(inputs, Object.keys(inputs as object).sort());
        return createHash('sha256').update(content).digest('hex').slice(0, 16);
    }

    /**
     * Check if cached artifact exists
     */
    has(hash: string): boolean {
        if (!this.config.enabled) return false;

        const entry = this.index.get(hash);
        if (!entry) return false;

        // Check if expired
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
            this.delete(hash);
            return false;
        }

        // Check if file still exists
        if (!existsSync(entry.outputPath)) {
            this.delete(hash);
            return false;
        }

        return true;
    }

    /**
     * Get cached artifact path
     */
    get(hash: string): string | null {
        if (!this.has(hash)) {
            this.stats.missCount++;
            return null;
        }

        this.stats.hitCount++;
        return this.index.get(hash)!.outputPath;
    }

    /**
     * Store artifact in cache
     */
    set(hash: string, sourcePath: string, metadata?: Record<string, unknown>): string {
        if (!this.config.enabled) return sourcePath;

        const ext = path.extname(sourcePath);
        const cachedPath = path.join(this.config.cacheDir, 'files', `${hash}${ext}`);

        // Ensure files directory exists
        const filesDir = path.dirname(cachedPath);
        if (!existsSync(filesDir)) {
            mkdirSync(filesDir, { recursive: true });
        }

        // Copy file to cache
        copyFileSync(sourcePath, cachedPath);

        const stat = statSync(cachedPath);
        const now = new Date();

        const entry: CacheEntry = {
            hash,
            outputPath: cachedPath,
            createdAt: now.toISOString(),
            expiresAt: this.config.ttlSeconds
                ? new Date(now.getTime() + this.config.ttlSeconds * 1000).toISOString()
                : undefined,
            sizeBytes: stat.size,
            metadata,
        };

        this.index.set(hash, entry);
        this.saveIndex();

        // Check if we need to evict old entries
        this.maybeEvict();

        return cachedPath;
    }

    /**
     * Delete cached artifact
     */
    delete(hash: string): boolean {
        const entry = this.index.get(hash);
        if (!entry) return false;

        // Delete file if exists
        if (existsSync(entry.outputPath)) {
            const fs = require('fs');
            try {
                fs.unlinkSync(entry.outputPath);
            } catch {
                // Ignore delete errors
            }
        }

        this.index.delete(hash);
        this.saveIndex();
        return true;
    }

    /**
     * Clear all cache
     */
    clear(): void {
        const hashes = Array.from(this.index.keys());
        for (const hash of hashes) {
            this.delete(hash);
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        let totalSizeBytes = 0;

        Array.from(this.index.values()).forEach((entry) => {
            totalSizeBytes += entry.sizeBytes;
        });

        const total = this.stats.hitCount + this.stats.missCount;

        return {
            totalEntries: this.index.size,
            totalSizeBytes,
            hitCount: this.stats.hitCount,
            missCount: this.stats.missCount,
            hitRate: total > 0 ? this.stats.hitCount / total : 0,
        };
    }

    /**
     * Get or compute artifact
     */
    async getOrCompute<T>(
        hash: string,
        compute: () => Promise<{ outputPath: string; result: T }>,
        metadata?: Record<string, unknown>
    ): Promise<{ outputPath: string; result: T; fromCache: boolean }> {
        // Check cache
        const cached = this.get(hash);
        if (cached) {
            return {
                outputPath: cached,
                result: (metadata as unknown) as T, // Best effort, caller should handle
                fromCache: true,
            };
        }

        // Compute
        const { outputPath, result } = await compute();

        // Cache result
        const cachedPath = this.set(hash, outputPath, metadata);

        return {
            outputPath: cachedPath,
            result,
            fromCache: false,
        };
    }

    // ===========================================
    // PRIVATE METHODS
    // ===========================================

    private ensureCacheDir(): void {
        if (!existsSync(this.config.cacheDir)) {
            mkdirSync(this.config.cacheDir, { recursive: true });
        }
    }

    private loadIndex(): void {
        if (!existsSync(this.indexPath)) return;

        try {
            const content = readFileSync(this.indexPath, 'utf-8');
            const data = JSON.parse(content);
            this.index = new Map(Object.entries(data.entries || {}));
            this.stats = data.stats || { hitCount: 0, missCount: 0 };
        } catch {
            this.index = new Map();
        }
    }

    private saveIndex(): void {
        const data = {
            entries: Object.fromEntries(this.index),
            stats: this.stats,
            updatedAt: new Date().toISOString(),
        };

        writeFileSync(this.indexPath, JSON.stringify(data, null, 2));
    }

    private maybeEvict(): void {
        if (!this.config.maxSizeBytes) return;

        const stats = this.getStats();
        if (stats.totalSizeBytes <= this.config.maxSizeBytes) return;

        // Sort by creation date, evict oldest first
        const entries = Array.from(this.index.entries())
            .sort((a, b) =>
                new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime()
            );

        let currentSize = stats.totalSizeBytes;
        const targetSize = this.config.maxSizeBytes * 0.8; // Clean to 80%

        for (const [hash, entry] of entries) {
            if (currentSize <= targetSize) break;

            this.delete(hash);
            currentSize -= entry.sizeBytes;
        }
    }
}

// ===========================================
// SINGLETON
// ===========================================

let cacheInstance: ArtifactCache | null = null;

/**
 * Get global artifact cache
 */
export function getArtifactCache(config?: Partial<CacheConfig>): ArtifactCache {
    if (!cacheInstance) {
        cacheInstance = new ArtifactCache(config);
    }
    return cacheInstance;
}

/**
 * Generate hash for render inputs
 */
export function hashRenderInputs(inputs: {
    audioPath?: string;
    backgroundPath?: string;
    preset?: string;
    format?: string;
}): string {
    return getArtifactCache().hash(inputs);
}
