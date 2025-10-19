import { runParsingAgent } from "./parsingAgent";
import { runAuditAgent } from "./auditAgent";
import { runAnswerAgent } from "./answerAgent";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Usage: tsx infra/agents/runAll.ts <repoUrl>");

  console.log("🚀 Starting OpenLedger agent pipeline...");
  console.log(`📦 Repository: ${repoUrl}`);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Ensure output directory exists
  const outDir = path.join(process.cwd(), ".out");
  fs.mkdirSync(outDir, { recursive: true });

  try {
    // Step 1: Parse repository
    console.log("\n1️⃣ Parsing repository...");
    const evidence = await runParsingAgent({ repoUrl });
    console.log(`✅ Found ${evidence.artifacts?.length || 0} artifacts`);

    // Step 2: Load previous evidence for drift detection
    console.log("\n2️⃣ Loading previous evidence for drift detection...");
    const prevPath = path.join(outDir, "evidence.json");
    const previousEvidence = fs.existsSync(prevPath)
      ? JSON.parse(fs.readFileSync(prevPath, "utf8"))
      : null;

    // Step 3: Audit compliance and detect drift
    console.log("\n3️⃣ Auditing compliance and detecting drift...");
    const audit = await runAuditAgent({ 
      evidence, 
      previousEvidence 
    });
    console.log(`✅ Compliance score: ${audit.compliance_score || 0}/100`);
    console.log(`✅ Drift events detected: ${audit.drift_events?.length || 0}`);

    // Step 4: Store policies in Supabase
    console.log("\n4️⃣ Storing policies in database...");
    try {
      // Check if we have the required environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("⚠️ Missing Supabase environment variables, skipping database storage");
        console.warn("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
      } else {
        // Get or create a default project for this repo
        const { data: projects } = await supabase
          .schema("app")
          .from("projects")
          .select("id")
          .eq("repo_url", repoUrl)
          .limit(1);

        let projectId;
        if (projects && projects.length > 0) {
          projectId = projects[0].id;
        } else {
          // Create a new project
          const { data: newProject, error: projectError } = await supabase
            .schema("app")
            .from("projects")
            .insert({
              name: `Project for ${repoUrl}`,
              repo_url: repoUrl,
              owner_id: "00000000-0000-0000-0000-000000000000" // Default owner
            })
            .select("id")
            .single();

          if (projectError) throw projectError;
          projectId = newProject.id;
        }

        // Store current policy if found
        if (audit.current_policy?.content) {
          const { error: currentError } = await supabase
            .schema("app")
            .from("policy_documents")
            .upsert({
              project_id: projectId,
              type: "current",
              title: "Current Privacy Policy",
              content: audit.current_policy.content,
              file_path: audit.current_policy.file_path,
              compliance_score: audit.current_policy.compliance_score,
              status: "active"
            });
          
          if (currentError) {
            console.warn("⚠️ Failed to store current policy:", currentError.message);
          } else {
            console.log("✅ Current policy stored");
          }
        }

        // Store new policy if generated
        if (audit.new_policy?.content) {
          const { error: newError } = await supabase
            .schema("app")
            .from("policy_documents")
            .upsert({
              project_id: projectId,
              type: "new",
              title: "New Privacy Policy (Pending Approval)",
              content: audit.new_policy.content,
              compliance_score: audit.new_policy.compliance_score,
              changes_summary: audit.new_policy.changes_summary,
              requires_approval: audit.new_policy.requires_approval,
              status: "pending"
            });
          
          if (newError) {
            console.warn("⚠️ Failed to store new policy:", newError.message);
          } else {
            console.log("✅ New policy stored");
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to store policies in database:", error);
    }

    // Step 5: Generate Q&A
    console.log("\n5️⃣ Generating sample Q&A...");
    const qa = await runAnswerAgent({
      question: "How do you use my data?",
      policyMarkdown: audit.new_policy?.content || audit.current_policy?.content || "",
      evidence,
    });
    console.log(`✅ Answer generated`);

    // Step 6: Write results
    console.log("\n6️⃣ Writing results to .out/...");
    fs.writeFileSync(prevPath, JSON.stringify(evidence, null, 2));
    fs.writeFileSync(
      path.join(outDir, "audit.json"),
      JSON.stringify(audit, null, 2)
    );
    fs.writeFileSync(path.join(outDir, "qa.json"), JSON.stringify(qa, null, 2));

    console.log("\n✨ DONE: wrote .out/{evidence,audit,qa}.json and stored policies in database");
  } catch (error) {
    console.error("\n❌ Pipeline failed:", error);

    // Write error state to output
    const errorState = {
      error: true,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(
      path.join(outDir, "error.json"),
      JSON.stringify(errorState, null, 2)
    );

    throw error;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
