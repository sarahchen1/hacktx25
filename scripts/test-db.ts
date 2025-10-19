import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function testDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Test basic connection
    console.log("Testing database connection...");
    const { data, error } = await supabase
      .schema("app")
      .from("projects")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Database connection failed:", error);
      return;
    }

    console.log("✅ Database connection successful");

    // Test if policy_documents table exists
    console.log("Testing policy_documents table...");
    const { data: policyData, error: policyError } = await supabase
      .schema("app")
      .from("policy_documents")
      .select("count")
      .limit(1);

    if (policyError) {
      console.error("❌ policy_documents table does not exist:", policyError.message);
      console.log("You need to apply the migration: infra/supabase/002_add_policy_documents.sql");
    } else {
      console.log("✅ policy_documents table exists");
    }

  } catch (error) {
    console.error("Database test failed:", error);
  }
}

testDatabase();
