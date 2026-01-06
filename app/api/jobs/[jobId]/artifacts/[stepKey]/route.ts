import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string; stepKey: string }> }
) {
    const { jobId, stepKey } = await params;

    // List of possible artifact files to look for
    const possibleFiles = ["output.txt", "scenes.json", "output.json"];

    let artifactPath = "";
    let found = false;

    for (const file of possibleFiles) {
        const path = join(process.cwd(), "artifacts", jobId, stepKey, file);
        if (existsSync(path)) {
            artifactPath = path;
            found = true;
            break;
        }
    }

    if (!found) {
        return NextResponse.json(
            { error: "Artifact not found" },
            { status: 404 }
        );
    }

    try {
        const content = await readFile(artifactPath, "utf-8");
        return new NextResponse(content, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });
    } catch (error) {
        console.error("Error reading artifact:", error);
        return NextResponse.json(
            { error: "Failed to read artifact" },
            { status: 500 }
        );
    }
}
