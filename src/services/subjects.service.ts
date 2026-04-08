import { supabase } from "@/services/supabase";
import { createMockId, insertMockRow, readMockDb, removeMockRow, updateMockRow } from "@/services/mock-db";
import { requireSchoolId } from "@/services/tenant";
import type { Subject } from "@/types";

export async function listSubjects(schoolId: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data, error } = await supabase.from("subjects").select("*").eq("school_id", tenantId).order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as Subject[];
  }

  return readMockDb().subjects.filter((item) => item.school_id === tenantId);
}

export async function upsertSubject(
  schoolId: string,
  input: Omit<Subject, "id" | "school_id"> & Partial<Pick<Subject, "id">>,
) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const payload = { ...input, school_id: tenantId };
    const query = input.id
      ? supabase.from("subjects").update(payload).eq("id", input.id).eq("school_id", tenantId)
      : supabase.from("subjects").insert(payload);
    const { data, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return data as Subject;
  }

  if (input.id) {
    updateMockRow("subjects", input.id, (row) => ({ ...row, name: input.name }));
    return readMockDb().subjects.find((item) => item.id === input.id)!;
  }

  const record: Subject = { id: createMockId("subject"), school_id: tenantId, name: input.name };
  return insertMockRow("subjects", record);
}

export async function deleteSubject(schoolId: string, id: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { error } = await supabase.from("subjects").delete().eq("id", id).eq("school_id", tenantId);
    if (error) throw new Error(error.message);
    return;
  }

  removeMockRow("subjects", id);
}

