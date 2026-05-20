import { NextRequest, NextResponse } from "next/server";
import { isDemoPortalAccess } from "@/lib/demo";
import { getPortalSessionCookieName, verifyParentPortalAccess } from "@/lib/portal/service";
import { parentAccessSchema } from "@/lib/report/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const formData = await request.formData();
  const parsed = parentAccessSchema.safeParse({
    token,
    birthYYMMDD: formData.get("birthYYMMDD"),
    phoneLast4: formData.get("phoneLast4"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return redirectToError(request, token);
  }

  const response = NextResponse.redirect(new URL(`/p/${token}/reports`, request.url), 303);
  if (isDemoPortalAccess(parsed.data)) {
    response.cookies.set("parent_portal_demo", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: `/p/${token}`,
    });

    return response;
  }

  const verified = await verifyParentPortalAccess(parsed.data);
  if (!verified.ok) {
    return redirectToError(request, token);
  }

  response.cookies.set(getPortalSessionCookieName(), verified.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: verified.maxAge,
    path: `/p/${token}`,
  });

  return response;
}

function redirectToError(request: NextRequest, token: string) {
  return NextResponse.redirect(new URL(`/p/${token}?error=1`, request.url), 303);
}
