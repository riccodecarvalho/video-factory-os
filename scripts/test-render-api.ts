#!/usr/bin/env npx tsx
/**
 * Test Script: Render API Endpoints
 * 
 * Testa os endpoints da API de render.
 * 
 * Uso: npx tsx scripts/test-render-api.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    response?: unknown;
}

async function testEndpoint(
    name: string,
    method: string,
    path: string,
    body?: object
): Promise<TestResult> {
    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                name,
                passed: false,
                error: data.error || `HTTP ${response.status}`,
                response: data,
            };
        }

        return {
            name,
            passed: data.success !== false,
            response: data,
        };
    } catch (err) {
        return {
            name,
            passed: false,
            error: (err as Error).message,
        };
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('TEST: Render API Endpoints');
    console.log('='.repeat(60));
    console.log(`Target: ${BASE_URL}`);
    console.log('');

    const results: TestResult[] = [];

    // Test 1: Worker Status
    console.log('▶ Testing GET /api/render/worker/status...');
    results.push(await testEndpoint(
        'Worker Status',
        'GET',
        '/api/render/worker/status'
    ));

    // Test 2: List Jobs
    console.log('▶ Testing GET /api/render/jobs...');
    results.push(await testEndpoint(
        'List Jobs',
        'GET',
        '/api/render/jobs'
    ));

    // Test 3: Submit Job (will fail without real audio, but tests endpoint)
    console.log('▶ Testing POST /api/render/jobs...');
    const submitResult = await testEndpoint(
        'Submit Job',
        'POST',
        '/api/render/jobs',
        {
            jobId: `test-${Date.now()}`,
            recipeSlug: 'graciela',
            format: 'longform',
            audioDurationSec: 10,
        }
    );
    results.push(submitResult);

    // Test 4: Get Job (may fail if job doesn't exist)
    const testJobId = 'test-nonexistent';
    console.log(`▶ Testing GET /api/render/jobs/${testJobId}...`);
    results.push(await testEndpoint(
        'Get Job (404 expected)',
        'GET',
        `/api/render/jobs/${testJobId}`
    ));

    // Test 5: Retry Job (should fail, job doesn't exist)
    console.log(`▶ Testing POST /api/render/jobs/${testJobId}/retry...`);
    results.push(await testEndpoint(
        'Retry Job (404 expected)',
        'POST',
        `/api/render/jobs/${testJobId}/retry`,
        {}
    ));

    // Print Results
    console.log('');
    console.log('='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    for (const result of results) {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.name}`);

        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }

        if (result.name.includes('expected') && !result.passed) {
            // Expected failure
            passed++;
        } else if (result.passed) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log('');
    console.log(`Total: ${passed} passed, ${failed} failed`);
    console.log('');

    if (failed > 0) {
        console.log('⚠️  Some tests failed. Make sure the dev server is running:');
        console.log('   npm run dev');
        process.exit(1);
    } else {
        console.log('✅ All API endpoints are responding correctly!');
    }
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
