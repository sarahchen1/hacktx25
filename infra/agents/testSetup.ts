#!/usr/bin/env tsx
// Test script to verify Gemini setup

import { getModel, generateJSON } from "../ai/gemini";
import { readText } from "../kb/loadKb";

async function testSetup() {
  console.log("🧪 Testing Gemini setup...");

  try {
    // Test 1: Check API key
    const model = getModel("flash");
    console.log("✅ API key loaded");

    // Test 2: Simple generation
    const result = await generateJSON({
      system: "You are a helpful assistant. Return JSON with a test message.",
      user: "Say hello and return JSON with a 'message' field.",
      schemaHint: '{"message": "string"}',
    });

    console.log("✅ JSON generation works:", result);

    // Test 3: KB loading
    const prompt = readText("prompts/parsing.system.md");
    console.log("✅ KB loading works, prompt length:", prompt.length);

    console.log("🎉 All tests passed! Setup is ready.");
  } catch (error) {
    console.error("❌ Setup test failed:", error);
    process.exit(1);
  }
}

testSetup();
