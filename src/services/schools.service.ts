import { supabase } from "@/services/supabase";
import { createMockId, insertMockRow, readMockDb } from "@/services/mock-db";
import type { School } from "@/types";

export async function listSchools() {
  if (supabase) {
    const { data, error } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as School[];
  }

  return readMockDb().schools;
}

export async function createSchool(input: Pick<School, "name" | "logo_url" | "primary_color">) {
  if (supabase) {
    const { data, error } = await supabase.from("schools").insert(input).select("*").single();
    if (error) throw new Error(error.message);
    return data as School;
  }

  const school: School = {
    id: createMockId("school"),
    created_at: new Date().toISOString(),
    name: input.name,
    logo_url: input.logo_url,
    primary_color: input.primary_color,
  };

  return insertMockRow("schools", school);
}

