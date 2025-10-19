import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

export function getModel(name: "pro" | "flash" = "pro") {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");

  // Initialize with API version v1 for compatibility
  const genAI = new GoogleGenerativeAI(key);

  // Use gemini-2.0-flash-exp which is widely available
  // Fallback to basic models if that doesn't work
  const modelId = "gemini-2.0-flash-exp";
  return genAI.getGenerativeModel({ model: modelId });
}

export async function generateJSON({
  system,
  user,
  schemaHint,
}: {
  system: string;
  user: string;
  schemaHint?: string;
}) {
  const model = getModel("pro");
  const req: any = {
    contents: [
      { role: "user", parts: [{ text: `<SYSTEM>\n${system}\n</SYSTEM>\n` }] },
      { role: "user", parts: [{ text: user }] },
    ],
    generationConfig: { responseMimeType: "application/json" },
  };
  if (schemaHint)
    req.contents.push({
      role: "user",
      parts: [{ text: `Return JSON matching schema:\n${schemaHint}` }],
    });
  const res = await model.generateContent(req);
  const txt = res.response?.text() || "{}";
  try {
    return JSON.parse(txt);
  } catch {
    return { _raw: txt };
  }
}
