import { supabase } from "@/services/supabase";
import { createMockId, insertMockRow, readMockDb, removeMockRow, updateMockRow } from "@/services/mock-db";
import { requireSchoolId } from "@/services/tenant";
import type { Teacher } from "@/types";

export async function listTeachers(schoolId: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data, error } = await supabase.from("teachers").select("*").eq("school_id", tenantId).order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as Teacher[];
  }

  return readMockDb().teachers.filter((item) => item.school_id === tenantId);
}

export async function upsertTeacher(
  schoolId: string,
  input: Omit<Teacher, "id" | "school_id"> & Partial<Pick<Teacher, "id">>,
) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const payload = { ...input, school_id: tenantId };
    const query = input.id
      ? supabase.from("teachers").update(payload).eq("id", input.id).eq("school_id", tenantId)
      : supabase.from("teachers").insert(payload);
    const { data, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return data as Teacher;
  }

  if (input.id) {
    updateMockRow("teachers", input.id, (row) => ({ ...row, ...input, school_id: tenantId }));
    return readMockDb().teachers.find((item) => item.id === input.id)!;
  }

  const record: Teacher = {
    id: createMockId("teacher"),
    school_id: tenantId,
    name: input.name,
    email: input.email,
    assigned_classes: input.assigned_classes,
    assigned_subjects: input.assigned_subjects,
  };

  return insertMockRow("teachers", record);
}

export async function deleteTeacher(schoolId: string, id: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { error } = await supabase.from("teachers").delete().eq("id", id).eq("school_id", tenantId);
    if (error) throw new Error(error.message);
    return;
  }

  removeMockRow("teachers", id);
}

