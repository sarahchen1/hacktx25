import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, TABLES } from "@/lib/supabase/schema";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";
import { UICopy } from "@/packages/openledger-core/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gate = searchParams.get("gate");

    if (!gate) {
      return NextResponse.json(
        createErrorResponse("Gate parameter is required"),
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const policy = await db.getUICopy(gate);
        if (policy) {
          return NextResponse.json(createApiResponse(policy.ui_copy));
        }
      }
    } catch (error) {
      console.warn("Supabase ui-copy fetch failed, using mock data:", error);
    }

    // Fallback to mock data
    const mockPath =
      gate === "txn_category"
        ? MOCK_PATHS.UI_COPY_TXN_CATEGORY
        : MOCK_PATHS.UI_COPY_ACCT_PROFILE;

    const mockCopy = await fetchMockData<UICopy>(mockPath);
    return NextResponse.json(createApiResponse(mockCopy));
  } catch (error) {
    return NextResponse.json(createErrorResponse("Failed to fetch UI copy"), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const uiCopy: UICopy = await request.json();

    if (!uiCopy.gate || !uiCopy.headline || !uiCopy.body) {
      return NextResponse.json(createErrorResponse("Invalid UI copy data"), {
        status: 400,
      });
    }

    const supabase = createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("ui_copy")
          .upsert({
            ...uiCopy,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (data && !error) {
          return NextResponse.json(createApiResponse(data));
        }
      }
    } catch (error) {
      console.warn("Supabase ui-copy update failed:", error);
    }

    // Return the data even if Supabase failed
    return NextResponse.json(createApiResponse(uiCopy));
  } catch (error) {
    return NextResponse.json(createErrorResponse("Failed to update UI copy"), {
      status: 500,
    });
  }
}
