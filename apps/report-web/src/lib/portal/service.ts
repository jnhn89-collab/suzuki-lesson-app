import { cookies } from "next/headers";
import { getDemoPortalData } from "@/lib/demo";
import { hasSupabaseEnv } from "@/lib/env";
import type { ParentPortalSummary } from "@/lib/report/types";

export async function getParentPortalSummary(token: string): Promise<ParentPortalSummary | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("parent_portal_demo")?.value;

  if (token === "demo-portal" && sessionToken === token) {
    return getDemoPortalData();
  }

  if (!hasSupabaseEnv()) return null;

  // Supabase-backed portal loading is intentionally kept behind this boundary.
  // The next implementation step will validate the HttpOnly portal session,
  // fetch the linked student, and return all published reports for that student.
  return null;
}

export async function getParentPortalReport(token: string, reportId: string) {
  const summary = await getParentPortalSummary(token);
  if (!summary) return null;
  return summary.reports.find((report) => report.id === reportId) ?? null;
}

