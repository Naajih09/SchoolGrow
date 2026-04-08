export function requireSchoolId(schoolId: string | null | undefined) {
  if (!schoolId) {
    throw new Error("School context is required for this operation.");
  }

  return schoolId;
}

export function filterBySchoolId<T extends { school_id: string }>(rows: T[], schoolId: string) {
  return rows.filter((row) => row.school_id === schoolId);
}

