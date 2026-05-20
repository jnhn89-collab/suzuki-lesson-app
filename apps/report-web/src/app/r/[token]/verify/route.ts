import { NextRequest, NextResponse } from "next/server";
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

  const { birthYYMMDD, phoneLast4, pin } = parsed.data;
  const isDemo =
    token === "demo-token" &&
    birthYYMMDD === "160101" &&
    phoneLast4 === "1234" &&
    pin === "1234";

  if (!isDemo) {
    return redirectToError(request, token);
  }

  const response = NextResponse.redirect(new URL(`/r/${token}/view`, request.url), 303);
  response.cookies.set("parent_report_demo", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: `/r/${token}`,
  });

  return response;
}

function redirectToError(request: NextRequest, token: string) {
  return NextResponse.redirect(new URL(`/r/${token}?error=1`, request.url), 303);
}

