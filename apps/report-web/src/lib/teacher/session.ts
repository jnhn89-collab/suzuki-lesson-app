import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TeacherProfile = {
  id: string;
  email: string;
  name: string;
  studioName: string;
};

export type TeacherContext =
  | { status: "missing_env" }
  | { status: "signed_out" }
  | {
      status: "ready";
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      user: User;
      profile: TeacherProfile;
    };

export async function getTeacherContext(): Promise<TeacherContext> {
  if (!hasSupabaseEnv()) {
    return { status: "missing_env" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "signed_out" };
  }

  const profile = await ensureTeacherProfile(supabase, user);
  return { status: "ready", supabase, user, profile };
}

export async function requireTeacherContext() {
  const context = await getTeacherContext();
  if (context.status === "missing_env") {
    redirect("/teacher?setup=missing-env");
  }
  if (context.status === "signed_out") {
    redirect("/teacher/login");
  }
  return context;
}

export async function ensureTeacherProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  user: User,
): Promise<TeacherProfile> {
  const { data: existing } = await supabase
    .from("teacher_profiles")
    .select("id,email,name,studio_name")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      studioName: existing.studio_name,
    };
  }

  const name = String(user.user_metadata?.name ?? "").trim();
  const studioName = String(user.user_metadata?.studioName ?? "").trim();
  const email = user.email ?? "";

  const { data: created, error } = await supabase
    .from("teacher_profiles")
    .upsert({
      id: user.id,
      email,
      name,
      studio_name: studioName,
    })
    .select("id,email,name,studio_name")
    .single();

  if (error) {
    throw new Error(`Teacher profile setup failed: ${error.message}`);
  }

  return {
    id: created.id,
    email: created.email,
    name: created.name,
    studioName: created.studio_name,
  };
}
