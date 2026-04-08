import { supabase } from "@/services/supabase";
import { readMockDb } from "@/services/mock-db";
import type { AuthSession, Role } from "@/types";

async function loadSupabaseSession(email: string) {
  if (!supabase) return null;

  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData.user) return null;

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
  if (profileError || !profile) return null;

  const { data: school } = await supabase.from("schools").select("*").eq("id", profile.school_id).maybeSingle();
  if (!school) return null;

  return {
    user: { id: authData.user.id, email: authData.user.email ?? email },
    profile,
    school,
  } satisfies AuthSession;
}

export async function signIn(email: string, password: string, role: Role): Promise<AuthSession> {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }

    const session = await loadSupabaseSession(data.user.email ?? email);
    if (!session) {
      throw new Error("Profile or school record not found for this account.");
    }

    return session;
  }

  const db = readMockDb();
  const profile =
    db.profiles.find((item) => item.email === email && item.role === role) ??
    db.profiles.find((item) => item.email === email) ??
    db.profiles[0];
  const school = db.schools.find((item) => item.id === profile.school_id) ?? db.schools[0];

  return {
    user: {
      id: profile.id,
      email: profile.email,
    },
    profile,
    school,
  };
}

export async function signOut() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }
}

