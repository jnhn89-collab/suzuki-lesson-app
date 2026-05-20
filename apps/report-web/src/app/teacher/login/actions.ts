"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { teacherAuthSchema } from "@/lib/report/schema";
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
    redirect("/teacher/login?error=signin");
  }

  await ensureTeacherProfile(supabase, data.user);
  redirect("/teacher");
}

export async function signUpTeacherAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/teacher/login?error=missing-env");
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
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name ?? "",
        studioName: parsed.data.studioName ?? "",
      },
    },
  });

  if (error || !data.user) {
    redirect("/teacher/login?error=signup");
  }

  if (data.session) {
    await ensureTeacherProfile(supabase, data.user);
    redirect("/teacher");
  }

  redirect("/teacher/login?notice=confirm-email");
}

export async function signOutTeacherAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/teacher/login");
}
