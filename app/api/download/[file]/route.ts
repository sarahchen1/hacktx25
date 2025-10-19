import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  try {
    const params = await context.params;
    const fileName = params.file;
    const allowedFiles = ["evidence", "audit", "receipt", "qa"];

    if (!allowedFiles.includes(fileName)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), ".out", `${fileName}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}.json"`,
      },
    });
  } catch (error) {
    console.error("Download failed:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
