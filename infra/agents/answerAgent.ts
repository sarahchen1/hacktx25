import { getModel } from "../ai/gemini";
import { selectKbSections, readText } from "../kb/loadKb";
import { QASchema } from "./schemas";

export async function runAnswerAgent({
  question,
  policyMarkdown,
  evidence,
}: {
  question: string;
  policyMarkdown: string;
  evidence: any;
}) {
  const model = getModel("flash");
  const sys = readText("prompts/answer.system.md");
  const kb = selectKbSections({
    file: "privacy_policies.yaml",
    keywords: [
      "rights",
      "data",
      "delete",
      "access",
      "retention",
      "opt-out",
      "opt-in",
    ],
  });

  try {
    const res = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `<SYSTEM>\n${sys}\n</SYSTEM>` }] },
        {
          role: "user",
          parts: [{ text: `KNOWLEDGE:\n${kb.slice(0, 12000)}` }],
        },
        {
          role: "user",
          parts: [{ text: `POLICY:\n${policyMarkdown.slice(0, 12000)}` }],
        },
        {
          role: "user",
          parts: [
            { text: `EVIDENCE:\n${JSON.stringify(evidence).slice(0, 12000)}` },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: `QUESTION:\n${question}\n\nReturn JSON: ${QASchema}`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    const txt = res.response?.text() || "{}";
    try {
      return JSON.parse(txt);
    } catch {
      return { answer: txt, citations: [] };
    }
  } catch (error) {
    console.error("Answer agent failed:", error);
    return {
      answer:
        "I'm sorry, I encountered an error processing your question. Please try again or contact support.",
      citations: [],
    };
  }
}
