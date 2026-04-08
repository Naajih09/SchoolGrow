import { supabase } from "@/services/supabase";
import { createMockId, insertMockRow, readMockDb, updateMockRow } from "@/services/mock-db";
import { requireSchoolId } from "@/services/tenant";
import type { Result, ResultStatus, SchoolClass, Student, Subject } from "@/types";

export type ResultSlip = {
  schoolId: string;
  schoolName: string;
  student: Student;
  classRecord: SchoolClass | null;
  term: string;
  session: string;
  items: Array<{
    subject: Subject | null;
    score: number;
    grade: string;
  }>;
  total: number;
  average: number;
  resultStatus: ResultStatus;
  resultId: string;
};

export async function listResults(schoolId: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data, error } = await supabase.from("results").select("*").eq("school_id", tenantId).order("created_at", {
      ascending: false,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as Result[];
  }

  return readMockDb().results.filter((item) => item.school_id === tenantId);
}

export async function upsertResult(
  schoolId: string,
  input: Omit<Result, "id" | "school_id" | "created_at" | "status"> & Partial<Pick<Result, "id" | "status">>,
) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const payload = {
      ...input,
      school_id: tenantId,
      status: input.status ?? "draft",
      created_at: new Date().toISOString(),
    };
    const query = input.id
      ? supabase.from("results").update(payload).eq("id", input.id).eq("school_id", tenantId)
      : supabase.from("results").insert(payload);
    const { data, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return data as Result;
  }

  if (input.id) {
    updateMockRow("results", input.id, (row) => ({ ...row, ...input, school_id: tenantId }));
    return readMockDb().results.find((item) => item.id === input.id)!;
  }

  const record: Result = {
    id: createMockId("result"),
    school_id: tenantId,
    created_at: new Date().toISOString(),
    status: input.status ?? "draft",
    student_id: input.student_id,
    class_id: input.class_id,
    subject_id: input.subject_id,
    score: input.score,
    term: input.term,
    session: input.session,
    uploaded_by: input.uploaded_by,
  };

  return insertMockRow("results", record);
}

export async function approveResult(schoolId: string, resultId: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data, error } = await supabase
      .from("results")
      .update({ status: "approved" })
      .eq("id", resultId)
      .eq("school_id", tenantId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Result;
  }

  updateMockRow("results", resultId, (row) => ({ ...row, status: "approved" }));
  return readMockDb().results.find((item) => item.id === resultId)!;
}

export async function rejectResult(schoolId: string, resultId: string) {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data, error } = await supabase
      .from("results")
      .update({ status: "draft" })
      .eq("id", resultId)
      .eq("school_id", tenantId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Result;
  }

  updateMockRow("results", resultId, (row) => ({ ...row, status: "draft" }));
  return readMockDb().results.find((item) => item.id === resultId)!;
}

export async function getResultSlipByResultId(schoolId: string, resultId: string): Promise<ResultSlip | null> {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data: result, error: resultError } = await supabase
      .from("results")
      .select("*")
      .eq("school_id", tenantId)
      .eq("id", resultId)
      .maybeSingle();

    if (resultError || !result) {
      return null;
    }

    const { data: student } = await supabase.from("students").select("*").eq("id", result.student_id).eq("school_id", tenantId).maybeSingle();
    const { data: school } = await supabase.from("schools").select("*").eq("id", tenantId).maybeSingle();
    const { data: classRecord } = await supabase.from("classes").select("*").eq("id", result.class_id).eq("school_id", tenantId).maybeSingle();

    if (!student || !school) {
      return null;
    }

    const { data: records } = await supabase
      .from("results")
      .select("*")
      .eq("school_id", tenantId)
      .eq("student_id", student.id)
      .eq("session", result.session)
      .eq("term", result.term);

    if (!records || records.length === 0) {
      return null;
    }

    const subjectIds = records.map((item) => item.subject_id);
    const { data: subjects } = await supabase.from("subjects").select("*").eq("school_id", tenantId).in("id", subjectIds);

    const items = records.map((item) => {
      const subject = subjects?.find((entry) => entry.id === item.subject_id) ?? null;
      return {
        subject,
        score: item.score,
        grade: gradeFromScore(item.score),
      };
    });

    const total = records.reduce((sum, item) => sum + Number(item.score), 0);
    const average = total / records.length;

    return {
      schoolId: tenantId,
      schoolName: school.name,
      student,
      classRecord: classRecord ?? null,
      term: result.term,
      session: result.session,
      items,
      total,
      average,
      resultStatus: records.some((entry) => entry.status === "draft") ? "draft" : "approved",
      resultId: result.id,
    };
  }

  const db = readMockDb();
  const result = db.results.find((item) => item.id === resultId && item.school_id === tenantId);
  if (!result) {
    return null;
  }

  const student = db.students.find((item) => item.id === result.student_id && item.school_id === tenantId);
  const school = db.schools.find((item) => item.id === tenantId);
  const classRecord = db.classes.find((item) => item.id === result.class_id && item.school_id === tenantId) ?? null;
  if (!student || !school) {
    return null;
  }

  const records = db.results.filter(
    (item) => item.school_id === tenantId && item.student_id === student.id && item.session === result.session && item.term === result.term,
  );

  const items = records.map((record) => {
    const subject = db.subjects.find((item) => item.id === record.subject_id && item.school_id === tenantId) ?? null;
    return {
      subject,
      score: record.score,
      grade: gradeFromScore(record.score),
    };
  });

  const total = records.reduce((sum, record) => sum + record.score, 0);
  const average = total / records.length;

  return {
    schoolId: tenantId,
    schoolName: school.name,
    student,
    classRecord,
    term: result.term,
    session: result.session,
    items,
    total,
    average,
    resultStatus: records.some((entry) => entry.status === "draft") ? "draft" : "approved",
    resultId: result.id,
  };
}

export async function searchResultByAdmissionNumber(
  schoolId: string,
  admissionNumber: string,
  session: string,
  term: string,
): Promise<ResultSlip | null> {
  const tenantId = requireSchoolId(schoolId);

  if (supabase) {
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("school_id", tenantId)
      .eq("admission_number", admissionNumber)
      .maybeSingle();

    if (studentError || !student) {
      return null;
    }

    const { data: school } = await supabase.from("schools").select("*").eq("id", tenantId).maybeSingle();
    if (!school) {
      return null;
    }

    const { data: classRecord } = await supabase.from("classes").select("*").eq("id", student.class_id).eq("school_id", tenantId).maybeSingle();
    const { data: resultRows, error: resultsError } = await supabase
      .from("results")
      .select("*")
      .eq("school_id", tenantId)
      .eq("student_id", student.id)
      .eq("session", session)
      .eq("term", term);

    if (resultsError || !resultRows || resultRows.length === 0) {
      return null;
    }

    const subjectIds = resultRows.map((item) => item.subject_id);
    const { data: subjects } = await supabase.from("subjects").select("*").eq("school_id", tenantId).in("id", subjectIds);

    const items = resultRows.map((record) => {
      const subject = subjects?.find((item) => item.id === record.subject_id) ?? null;
      return {
        subject,
        score: record.score,
        grade: gradeFromScore(record.score),
      };
    });

    const total = resultRows.reduce((sum, record) => sum + Number(record.score), 0);
    const average = total / resultRows.length;

    return {
      schoolId: tenantId,
      schoolName: school.name,
      student,
      classRecord: classRecord ?? null,
      term,
      session,
      items,
      total,
      average,
      resultStatus: resultRows.some((record) => record.status === "draft") ? "draft" : "approved",
      resultId: resultRows[0].id,
    };
  }

  const db = readMockDb();
  const school = db.schools.find((item) => item.id === tenantId);
  const student = db.students.find(
    (item) => item.school_id === tenantId && item.admission_number.toLowerCase() === admissionNumber.toLowerCase(),
  );

  if (!school || !student) {
    return null;
  }

  const classRecord = db.classes.find((item) => item.id === student.class_id && item.school_id === tenantId) ?? null;
  const records = db.results.filter(
    (item) => item.school_id === tenantId && item.student_id === student.id && item.session === session && item.term === term,
  );

  if (records.length === 0) {
    return null;
  }

  const items = records.map((record) => {
    const subject = db.subjects.find((item) => item.id === record.subject_id && item.school_id === tenantId) ?? null;
    return {
      subject,
      score: record.score,
      grade: gradeFromScore(record.score),
    };
  });

  const total = records.reduce((sum, record) => sum + record.score, 0);
  const average = total / records.length;

  return {
    schoolId: tenantId,
    schoolName: school.name,
    student,
    classRecord,
    term,
    session,
    items,
    total,
    average,
    resultStatus: records.some((record) => record.status === "draft") ? "draft" : "approved",
    resultId: records[0].id,
  };
}

function gradeFromScore(score: number) {
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}
