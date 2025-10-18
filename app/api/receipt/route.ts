import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";
import { Receipt } from "@/packages/openledger-core/types";
import {
  signReceipt,
  generateCommitHash,
  generateEvidenceHash,
} from "@/packages/openledger-core/receipts/sign";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get("latest") === "true";

    const supabase = createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        let query = supabase
          .from("receipts")
          .select("*")
          .order("timestamp", { ascending: false });

        if (latest) {
          query = query.limit(1);
        }

        const { data, error } = await query;

        if (data && !error) {
          return NextResponse.json(createApiResponse(latest ? data[0] : data));
        }
      }
    } catch (error) {
      console.warn("Supabase receipt fetch failed, using mock data:", error);
    }

    // Fallback to mock data
    const mockReceipt = await fetchMockData<Receipt>(MOCK_PATHS.RECEIPT_LATEST);
    return NextResponse.json(createApiResponse(mockReceipt));
  } catch (error) {
    return NextResponse.json(createErrorResponse("Failed to fetch receipt"), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gate, choice } = await request.json();

    if (!gate || typeof choice !== "boolean") {
      return NextResponse.json(createErrorResponse("Invalid gate or choice"), {
        status: 400,
      });
    }

    const supabase = createClient();

    // Generate receipt data
    const commit = generateCommitHash();
    const timestamp = new Date().toISOString();

    // Get evidence for hash generation (mock for now)
    const evidence = [
      {
        file: "app/api/transactions/route.ts",
        line: 15,
        endpoint: "GET /api/transactions",
        fields: ["amount", "merchant", "category"],
      },
    ];
    const evidence_hash = generateEvidenceHash(evidence);

    const receiptData = {
      gate,
      choice,
      commit,
      timestamp,
      evidence_hash,
    };

    const signature = signReceipt(receiptData);

    const receipt: Receipt = {
      id: `receipt-${Date.now()}`,
      ...receiptData,
      signature,
    };

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("receipts")
          .insert({
            ...receipt,
            user_id: user.id,
            created_at: timestamp,
          })
          .select()
          .single();

        if (data && !error) {
          return NextResponse.json(createApiResponse(data));
        }
      }
    } catch (error) {
      console.warn("Supabase receipt insert failed:", error);
    }

    // Return the receipt even if Supabase failed
    return NextResponse.json(createApiResponse(receipt));
  } catch (error) {
    return NextResponse.json(createErrorResponse("Failed to create receipt"), {
      status: 500,
    });
  }
}
