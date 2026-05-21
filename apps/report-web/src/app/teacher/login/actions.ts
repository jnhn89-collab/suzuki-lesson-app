"use server";

import { redirect } from "next/navigation";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { teacherAuthSchema } from "@/lib/report/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureTeacherProfile } from "@/lib/teacher/session";

export async function signInTeacherAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/teacher/login?error=missing-env");
  }

  const parsed = teacherAuthSchema.pick({ email: true, password: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/teacher/login?error=input");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    redirect(`/teacher/login?error=${encodeURIComponent(toAuthErrorCode(error?.message, "signin"))}`);
  }

  await ensureTeacherProfile(supabase, data.user);
  redirect("/teacher");
}

export async function signUpTeacherAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/teacher/login?error=missing-env");
  }
  if (!hasSupabaseAdminEnv()) {
    redirect("/teacher/login?error=missing-service-role");
  }

  const parsed = teacherAuthSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    studioName: formData.get("studioName"),
  });

  if (!parsed.success) {
    redirect("/teacher/login?error=input");
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      name: parsed.data.name ?? "",
      studioName: parsed.data.studioName ?? "",
    },
  });

  if (createError) {
    const code = toAuthErrorCode(createError.message, "signup");
    if (code === "email-already-exists") {
      const signedIn = await signInAndEnsureProfile(supabase, parsed.data.email, parsed.data.password);
      if (signedIn) redirect("/teacher");
    }
    redirect(`/teacher/login?error=${encodeURIComponent(code)}`);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    redirect(`/teacher/login?error=${encodeURIComponent(toAuthErrorCode(error?.message, "signin-after-signup"))}`);
  }

  await ensureTeacherProfile(supabase, data.user);
  redirect("/teacher");
}

export async function signOutTeacherAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/teacher/login");
}

async function signInAndEnsureProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return false;
  await ensureTeacherProfile(supabase, data.user);
  return true;
}

function toAuthErrorCode(message: string | undefined, fallback: string) {
  const normalized = String(message ?? "").toLowerCase();
  if (normalized.includes("already") || normalized.includes("registered")) return "email-already-exists";
  if (normalized.includes("password")) return "weak-password";
  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "invalid-credentials";
  }
  if (normalized.includes("email")) return "email-auth-error";
  return fallback;
}
