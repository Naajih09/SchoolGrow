import { supabase } from "@/services/supabase";
import { createMockId, insertMockRow, readMockDb, removeMockRow, updateMockRow } from "@/services/mock-db";
import { requireSchoolId } from "@/services/tenant";
import type { SchoolClass } from "@/types";

export async function listClasses(schoolId: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data, error } = await supabase.from("classes").select("*").eq("school_id", tenantId).order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as SchoolClass[];
  }

  return readMockDb().classes.filter((item) => item.school_id === tenantId);
}

export async function upsertClass(
  schoolId: string,
  input: Omit<SchoolClass, "id" | "school_id"> & Partial<Pick<SchoolClass, "id">>,
) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const payload = { ...input, school_id: tenantId };
    const query = input.id
      ? supabase.from("classes").update(payload).eq("id", input.id).eq("school_id", tenantId)
      : supabase.from("classes").insert(payload);
    const { data, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return data as SchoolClass;
  }

  if (input.id) {
    updateMockRow("classes", input.id, (row) => ({ ...row, name: input.name }));
    return readMockDb().classes.find((item) => item.id === input.id)!;
  }

  const record: SchoolClass = { id: createMockId("class"), school_id: tenantId, name: input.name };
  return insertMockRow("classes", record);
}

export async function deleteClass(schoolId: string, id: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { error } = await supabase.from("classes").delete().eq("id", id).eq("school_id", tenantId);
    if (error) throw new Error(error.message);
    return;
  }

  removeMockRow("classes", id);
}

