import { supabase } from "@/services/supabase";
import { createMockId, insertMockRow, readMockDb, removeMockRow, updateMockRow } from "@/services/mock-db";
import { requireSchoolId } from "@/services/tenant";
import type { Student } from "@/types";

export async function listStudents(schoolId: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data, error } = await supabase.from("students").select("*").eq("school_id", tenantId).order("created_at", {
      ascending: false,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as Student[];
  }

  return readMockDb().students.filter((item) => item.school_id === tenantId);
}

export async function upsertStudent(
  schoolId: string,
  input: Omit<Student, "id" | "school_id" | "created_at"> & Partial<Pick<Student, "id">>,
) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const payload = {
      ...input,
      school_id: tenantId,
    };
    const query = input.id
      ? supabase.from("students").update(payload).eq("id", input.id).eq("school_id", tenantId)
      : supabase.from("students").insert({ ...payload, created_at: new Date().toISOString() });
    const { data, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return data as Student;
  }

  if (input.id) {
    updateMockRow("students", input.id, (row) => ({
      ...row,
      ...input,
      school_id: tenantId,
    }));
    return readMockDb().students.find((item) => item.id === input.id)!;
  }

  const record: Student = {
    id: createMockId("student"),
    school_id: tenantId,
    created_at: new Date().toISOString(),
    first_name: input.first_name,
    last_name: input.last_name,
    admission_number: input.admission_number,
    class_id: input.class_id,
    gender: input.gender,
    date_of_birth: input.date_of_birth,
    guardian_name: input.guardian_name,
    guardian_phone: input.guardian_phone,
  };

  return insertMockRow("students", record);
}

export async function deleteStudent(schoolId: string, id: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { error } = await supabase.from("students").delete().eq("id", id).eq("school_id", tenantId);
    if (error) throw new Error(error.message);
    return;
  }

  removeMockRow("students", id);
}

