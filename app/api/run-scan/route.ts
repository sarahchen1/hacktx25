import { NextRequest, NextResponse } from "next/server";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@/lib/supabase/server";
import fs from "node:fs/promises";
import path from "node:path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    // Try to parse as JSON first, fall back to form data
    let repo: string | null = null;
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      repo = body.repoUrl || body.repo;
    } else {
      const formData = await request.formData();
      repo = formData.get("repo") as string;
    }

    if (!repo || typeof repo !== "string") {
      return NextResponse.json(
        { error: "Missing repository URL" },
        { status: 400 }
      );
    }

    // Validate GitHub/GitLab URL
    if (!repo.match(/^https?:\/\/(github\.com|gitlab\.com)\//)) {
      return NextResponse.json(
        { error: "Invalid repository URL. Must be a GitHub or GitLab URL." },
        { status: 400 }
      );
    }

    // Extract repo name from URL for project name
    const repoName = repo.split("/").slice(-1)[0].replace(".git", "");

    // Create or update project
    // Note: Supabase client uses schema.table notation
    const { data: existingProject } = await supabase
      .schema("app")
      .from("projects")
      .select("id")
      .eq("owner_id", user.id)
      .eq("repo_url", repo)
      .single();

    let projectId: string;

    if (existingProject) {
      projectId = existingProject.id;
      console.log(`Using existing project: ${projectId}`);
    } else {
      const { data: newProject, error: projectError } = await supabase
        .schema("app")
        .from("projects")
        .insert({
          owner_id: user.id,
          name: repoName,
          repo_url: repo,
        })
        .select("id")
        .single();

      if (projectError || !newProject) {
        console.error("Failed to create project:", projectError);
        return NextResponse.json(
          {
            error: "Failed to create project record",
            details: projectError?.message || "Unknown error",
            code: projectError?.code,
          },
          { status: 500 }
        );
      }

      projectId = newProject.id;
      console.log(`Created new project: ${projectId}`);
    }

    // Run the scan with a 5-minute timeout
    const timeout = 5 * 60 * 1000; // 5 minutes
    const command = `npm run agents:all ${repo}`;

    console.log(`Starting scan for project ${projectId}: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout,
        cwd: process.cwd(),
      });

      console.log("Scan output:", stdout);
      if (stderr) console.error("Scan errors:", stderr);

      // Read the generated evidence from .out/evidence.json
      const outDir = path.join(process.cwd(), ".out");
      const evidencePath = path.join(outDir, "evidence.json");
      const auditPath = path.join(outDir, "audit.json");

      try {
        // Save evidence to database
        const evidenceData = await fs.readFile(evidencePath, "utf-8");
        const evidence = JSON.parse(evidenceData);

        const { error: scanError } = await supabase
          .schema("app")
          .from("scans")
          .insert({
            project_id: projectId,
            commit_sha: "latest", // You can extract from git if needed
            evidence: evidence,
          });

        if (scanError) {
          console.error("Failed to save scan results:", scanError);
        } else {
          console.log("Saved scan results to database");
        }

        // Optionally save audit results to audit_logs
        try {
          const auditData = await fs.readFile(auditPath, "utf-8");
          const audit = JSON.parse(auditData);

          await supabase
            .schema("app")
            .from("audit_logs")
            .insert({
              project_id: projectId,
              agent: "audit",
              input: { repo_url: repo },
              output: audit,
              status: "completed",
            });

          console.log("Saved audit results to database");
        } catch (auditError) {
          console.warn("Could not save audit results:", auditError);
        }
      } catch (fileError) {
        console.warn("Could not read scan results from .out/:", fileError);
      }

      return NextResponse.json({
        success: true,
        message: "Scan completed successfully",
        projectId: projectId,
        output: stdout,
      });
    } catch (error: any) {
      console.error("Scan failed:", error);

      // Check if it was a timeout
      if (error.killed || error.signal === "SIGTERM") {
        return NextResponse.json(
          { error: "Scan timed out after 5 minutes" },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: "Scan failed", details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Request handling failed:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get("repo");

  if (!repo) {
    return NextResponse.json(
      { error: "Missing repo parameter" },
      { status: 400 }
    );
  }

  // Validate GitHub URL
  if (!repo.match(/^https?:\/\/(github\.com|gitlab\.com)\//)) {
    return NextResponse.json(
      { error: "Invalid repository URL" },
      { status: 400 }
    );
  }

  // Run the scan with a 5-minute timeout
  const timeout = 5 * 60 * 1000;
  const command = `npm run agents:all ${repo}`;

  console.log(`Starting scan (API): ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      cwd: process.cwd(),
    });

    return NextResponse.json({
      success: true,
      message: "Scan completed successfully",
      output: stdout,
    });
  } catch (error: any) {
    console.error("Scan failed:", error);

    if (error.killed || error.signal === "SIGTERM") {
      return NextResponse.json(
        { error: "Scan timed out after 5 minutes" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Scan failed", details: error.message },
      { status: 500 }
    );
  }
}
