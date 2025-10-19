// API utilities for OpenLedger

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export async function fetchWithFallback<T>(
  url: string,
  fallbackData: T,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`API call to ${url} failed, using fallback data:`, error);
    return fallbackData;
  }
}

export async function fetchMockData<T>(mockPath: string): Promise<T> {
  try {
    // Check if we're in a server context (Node.js)
    if (typeof window === "undefined") {
      // Server-side: read from filesystem
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "public", mockPath);
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } else {
      // Client-side: use fetch
      const response = await fetch(mockPath);
      if (!response.ok) {
        throw new Error(`Mock data not found: ${mockPath}`);
      }
      return await response.json();
    }
  } catch (error) {
    console.error(`Failed to load mock data from ${mockPath}:`, error);
    throw error;
  }
}

export function createApiResponse<T>(data: T, error?: string): ApiResponse<T> {
  return {
    data,
    error,
    success: !error,
  };
}

export function createErrorResponse(error: string): ApiResponse {
  return {
    error,
    success: false,
  };
}

// Common API endpoints
export const API_ENDPOINTS = {
  GATES: "/api/gates",
  UI_COPY: "/api/ui-copy",
  EVIDENCE: "/api/evidence",
  RECEIPT: "/api/receipt",
  DRIFT: "/api/drift",
  AI_CLASSIFY: "/api/ai/classify",
  AI_COPY: "/api/ai/copy",
  AI_AUDIT: "/api/ai/audit",
  AI_ANSWER: "/api/ai/answer",
} as const;

// Mock data paths
export const MOCK_PATHS = {
  GATES: "/mock/gates.json",
  UI_COPY_TXN_CATEGORY: "/mock/ui-copy-txn_category.json",
  UI_COPY_ACCT_PROFILE: "/mock/ui-copy-acct_profile.json",
  EVIDENCE: "/mock/evidence.json",
  RECEIPT_LATEST: "/mock/receipt-latest.json",
  DRIFT: "/mock/drift.json",
  DRIFT_NEW: "/mock/drift-new.json",
} as const;
