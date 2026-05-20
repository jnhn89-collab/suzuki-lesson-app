"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parentAccessSchema } from "@/lib/report/schema";

export type ParentAccessState = {
  message: string | null;
};

export async function verifyParentAccess(
  _prevState: ParentAccessState,
  formData: FormData,
): Promise<ParentAccessState> {
  const parsed = parentAccessSchema.safeParse({
    token: formData.get("token"),
    birthYYMMDD: formData.get("birthYYMMDD"),
    phoneLast4: formData.get("phoneLast4"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return { message: "입력값을 확인해 주세요." };
  }

  const { token, birthYYMMDD, phoneLast4, pin } = parsed.data;
  const isDemo = token === "demo-token" && birthYYMMDD === "160101" && phoneLast4 === "1234" && pin === "1234";

  if (!isDemo) {
    return { message: "입력값을 확인해 주세요." };
  }

  const cookieStore = await cookies();
  cookieStore.set("parent_report_demo", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: `/r/${token}`,
  });

  redirect(`/r/${token}/view`);
}

