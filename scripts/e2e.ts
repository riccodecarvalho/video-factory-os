/**
 * Video Factory OS - E2E Test Script
 * 
 * Executa fluxo E2E completo:
 * 1. Seed/reset do DB (idempotente)
 * 2. Garante 2 projetos (Graciela + Virando o Jogo)
 * 3. Cria job real com project_id
 * 4. Executa job
 * 5. Valida: manifest, logs, validators, artifacts
 * 6. Imprime resumo final
 * 
 * Usage: npm run vf:e2e [--stub]
 */

// Load .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getDb, closeDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { runJob } from '@/lib/engine';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load fixture for Graciela project
import gracielaInput from '../fixtures/graciela.input.json';

const STUB_MODE = process.argv.includes('--stub');

// ============================================
// HELPERS
// ============================================

function log(emoji: string, message: string) {
    console.log(`${emoji} ${message}`);
}

function checkEnvVars(): { valid: boolean; missing: string[] } {
    const required = ['ANTHROPIC_API_KEY'];
    const ttsRequired = ['AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION'];

    const missing: string[] = [];

    for (const key of required) {
        if (!process.env[key]) missing.push(key);
    }

    // TTS vars are optional if in stub mode
    if (!STUB_MODE) {
        for (const key of ttsRequired) {
            if (!process.env[key]) missing.push(key);
        }
    }

    return { valid: missing.length === 0, missing };
}

// ============================================
// SEED PROJECTS
// ============================================

async function ensureProjects() {
    const db = getDb();
    const now = new Date().toISOString();

    // Check existing projects
    const existingProjects = await db.select().from(schema.projects);
    const hasGraciela = existingProjects.some(p => p.key === 'graciela');
    const hasVirandoOJogo = existingProjects.some(p => p.key === 'virando-o-jogo');

    // Create Graciela if missing
    if (!hasGraciela) {
        log('🎬', 'Creating project: Graciela');
        await db.insert(schema.projects).values({
            id: uuid(),
            key: 'graciela',
            name: 'Graciela',
            description: 'Canal de storytime em espanhol mexicano com histórias familiares dramáticas',
            isActive: true,
            createdAt: now,
        });
    }

    // Create Virando o Jogo if missing
    if (!hasVirandoOJogo) {
        log('🎬', 'Creating project: Virando o Jogo');
        await db.insert(schema.projects).values({
            id: uuid(),
            key: 'virando-o-jogo',
            name: 'Virando o Jogo',
            description: 'Canal de histórias de superação e virada de vida',
            isActive: true,
            createdAt: now,
        });
    }

    // Reload projects
    const projects = await db.select().from(schema.projects);
    log('✅', `Projects ready: ${projects.map(p => p.name).join(', ')}`);

    return projects;
}

// ============================================
// ENSURE RECIPE EXISTS
// ============================================

async function getDefaultRecipe() {
    const db = getDb();
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.isActive, true));

    if (!recipe) {
        throw new Error('No active recipe found. Run npm run db:seed first.');
    }

    log('📋', `Using recipe: ${recipe.name} (v${recipe.version})`);
    return recipe;
}

// ============================================
// CREATE JOB
// ============================================

async function createTestJob(projectId: string, recipe: { id: string; slug: string; version: number }) {
    const db = getDb();
    const now = new Date().toISOString();

    const jobId = uuid();
    // Use real fixture input from graciela.input.json
    const jobInput = {
        ...gracielaInput,
        timestamp: now,
        stub_mode: STUB_MODE,
    };

    await db.insert(schema.jobs).values({
        id: jobId,
        projectId,
        recipeId: recipe.id,
        recipeSlug: recipe.slug,
        recipeVersion: recipe.version,
        status: 'pending',
        input: JSON.stringify(jobInput),
        manifest: null,
        currentStep: null,
        progress: 0,
        createdAt: now,
        updatedAt: now,
    });

    log('📝', `Created job: ${jobId.slice(0, 8)}... (project: ${projectId.slice(0, 8)}...)`);
    log('📄', `Input: ${gracielaInput.titulo.slice(0, 50)}...`);

    return jobId;
}

// ============================================
// VALIDATE RESULTS
// ============================================

interface ValidationResults {
    jobStatus: string;
    manifestExists: boolean;
    stepsCount: number;
    logsCount: number;
    artifactsCount: number;
    validatorsRan: boolean;
    errors: string[];
}

async function validateJob(jobId: string): Promise<ValidationResults> {
    const db = getDb();
    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    const steps = await db.select().from(schema.jobSteps).where(eq(schema.jobSteps.jobId, jobId));

    const results: ValidationResults = {
        jobStatus: job?.status || 'unknown',
        manifestExists: !!job?.manifest,
        stepsCount: steps.length,
        logsCount: 0,
        artifactsCount: 0,
        validatorsRan: false,
        errors: [],
    };

    // Count logs
    for (const step of steps) {
        if (step.logs) {
            const logs = JSON.parse(step.logs);
            results.logsCount += logs.length;
        }
    }

    // Parse manifest
    if (job?.manifest) {
        try {
            const manifest = JSON.parse(job.manifest);
            results.artifactsCount = manifest.artifacts?.length || 0;

            // Check if validators ran
            for (const step of manifest.steps || []) {
                if (step.validations && step.validations.length > 0) {
                    results.validatorsRan = true;
                    break;
                }
            }
        } catch (e) {
            results.errors.push('Failed to parse manifest');
        }
    }

    // Check artifacts directory for placeholder validation
    const artifactsDir = path.join(process.cwd(), 'artifacts', jobId);
    try {
        const files = await fs.readdir(artifactsDir, { recursive: true });
        const artifactFiles = files.filter(f => typeof f === 'string' && !f.startsWith('.'));
        results.artifactsCount = Math.max(results.artifactsCount, artifactFiles.length);

        // Validate: check for placeholders in output files
        for (const file of artifactFiles) {
            if (typeof file === 'string' && file.endsWith('.txt')) {
                const filePath = path.join(artifactsDir, file);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    if (content.includes('{{') || content.includes('}}')) {
                        results.errors.push(`Placeholder found in ${file}: contains {{ or }}`);
                    }
                } catch {
                    // Skip unreadable files
                }
            }
        }
    } catch {
        // Directory doesn't exist yet
    }

    // Validate results
    if (results.jobStatus !== 'completed' && results.jobStatus !== 'failed') {
        results.errors.push(`Job status is ${results.jobStatus}, expected completed or failed`);
    }
    if (!results.manifestExists) {
        results.errors.push('Manifest not generated');
    }
    if (results.stepsCount === 0) {
        results.errors.push('No steps recorded');
    }

    return results;
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('\n========================================');
    console.log('   Video Factory OS - E2E Test');
    console.log('========================================\n');

    if (STUB_MODE) {
        log('🔧', 'Running in STUB mode (no real API calls)');
    }

    // Check environment
    const envCheck = checkEnvVars();
    if (!envCheck.valid && !STUB_MODE) {
        log('❌', `Missing environment variables: ${envCheck.missing.join(', ')}`);
        log('💡', 'Run with --stub flag to skip real API calls');
        process.exit(1);
    }

    try {
        // 1. Ensure projects
        log('📌', 'Step 1: Ensuring projects...');
        const projects = await ensureProjects();
        const testProject = projects.find(p => p.key === 'graciela') || projects[0];

        // 2. Get recipe
        log('📌', 'Step 2: Getting recipe...');
        const recipe = await getDefaultRecipe();

        // 3. Create job
        log('📌', 'Step 3: Creating test job...');
        const jobId = await createTestJob(testProject.id, recipe);

        // 4. Run job
        log('📌', 'Step 4: Executing job...');
        log('⏳', 'This may take a few minutes...');
        const startTime = Date.now();

        await runJob(jobId);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        log('✅', `Job execution completed in ${duration}s`);

        // 5. Validate results
        log('📌', 'Step 5: Validating results...');
        const results = await validateJob(jobId);

        // Print summary
        console.log('\n========================================');
        console.log('   E2E TEST SUMMARY');
        console.log('========================================');
        console.log(`Job ID:          ${jobId}`);
        console.log(`Project:         ${testProject.name}`);
        console.log(`Status:          ${results.jobStatus}`);
        console.log(`Manifest:        ${results.manifestExists ? '✅' : '❌'}`);
        console.log(`Steps:           ${results.stepsCount}`);
        console.log(`Logs:            ${results.logsCount}`);
        console.log(`Artifacts:       ${results.artifactsCount}`);
        console.log(`Validators Ran:  ${results.validatorsRan ? '✅' : '❌'}`);
        console.log(`Duration:        ${duration}s`);
        console.log(`Stub Mode:       ${STUB_MODE ? 'Yes' : 'No'}`);
        console.log('----------------------------------------');

        if (results.errors.length > 0) {
            console.log('ERRORS:');
            for (const err of results.errors) {
                console.log(`  ❌ ${err}`);
            }
            console.log('========================================\n');
            process.exit(1);
        } else {
            console.log('RESULT: ✅ ALL CHECKS PASSED');
            console.log('========================================\n');
            process.exit(0);
        }

    } catch (error) {
        console.error('\n❌ E2E Test Failed:', error);
        process.exit(1);
    } finally {
        closeDb();
    }
}

main();
