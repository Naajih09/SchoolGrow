import type { Result, School, SchoolClass, Student, Subject, Teacher, Profile } from "@/types";

const storageKey = "schoolgrow.mock-db";

type MockDatabase = {
  schools: School[];
  profiles: Profile[];
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  results: Result[];
};

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const seed: MockDatabase = {
  schools: [
    {
      id: "school_demo_1",
      name: "Sunrise Academy",
      logo_url: null,
      primary_color: "#0f766e",
      created_at: now(),
    },
  ],
  profiles: [
    {
      id: "profile_owner_1",
      school_id: "school_demo_1",
      full_name: "Platform Owner",
      role: "super_admin",
      email: "owner@schoolgrow.app",
      created_at: now(),
    },
    {
      id: "profile_admin_1",
      school_id: "school_demo_1",
      full_name: "Admin User",
      role: "school_admin",
      email: "admin@sunrise.edu",
      created_at: now(),
    },
    {
      id: "profile_teacher_1",
      school_id: "school_demo_1",
      full_name: "Teacher User",
      role: "teacher",
      email: "teacher@sunrise.edu",
      created_at: now(),
    },
  ],
  classes: [
    { id: "class_1", school_id: "school_demo_1", name: "JSS 1" },
    { id: "class_2", school_id: "school_demo_1", name: "JSS 2" },
  ],
  subjects: [
    { id: "subject_1", school_id: "school_demo_1", name: "Mathematics" },
    { id: "subject_2", school_id: "school_demo_1", name: "English" },
    { id: "subject_3", school_id: "school_demo_1", name: "Basic Science" },
  ],
  teachers: [
    {
      id: "teacher_1",
      school_id: "school_demo_1",
      name: "Teacher User",
      email: "teacher@sunrise.edu",
      assigned_classes: ["class_1"],
      assigned_subjects: ["subject_1", "subject_2"],
    },
  ],
  students: [
    {
      id: "student_1",
      school_id: "school_demo_1",
      first_name: "Ada",
      last_name: "Okafor",
      admission_number: "SUN-001",
      class_id: "class_1",
      gender: "Female",
      date_of_birth: "2012-05-14",
      guardian_name: "Nkechi Okafor",
      guardian_phone: "+2348000000001",
      created_at: now(),
    },
    {
      id: "student_2",
      school_id: "school_demo_1",
      first_name: "Daniel",
      last_name: "Ibrahim",
      admission_number: "SUN-002",
      class_id: "class_1",
      gender: "Male",
      date_of_birth: "2011-11-02",
      guardian_name: "Musa Ibrahim",
      guardian_phone: "+2348000000002",
      created_at: now(),
    },
  ],
  results: [
    {
      id: "result_1",
      school_id: "school_demo_1",
      student_id: "student_1",
      class_id: "class_1",
      subject_id: "subject_1",
      score: 84,
      term: "First",
      session: "2025/2026",
      uploaded_by: "teacher_1",
      status: "approved",
      created_at: now(),
    },
    {
      id: "result_2",
      school_id: "school_demo_1",
      student_id: "student_1",
      class_id: "class_1",
      subject_id: "subject_2",
      score: 76,
      term: "First",
      session: "2025/2026",
      uploaded_by: "teacher_1",
      status: "draft",
      created_at: now(),
    },
    {
      id: "result_3",
      school_id: "school_demo_1",
      student_id: "student_2",
      class_id: "class_1",
      subject_id: "subject_1",
      score: 68,
      term: "First",
      session: "2025/2026",
      uploaded_by: "teacher_1",
      status: "approved",
      created_at: now(),
    },
  ],
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function loadDb(): MockDatabase {
  if (!canUseStorage()) {
    return structuredClone(seed);
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    window.localStorage.setItem(storageKey, JSON.stringify(seed));
    return structuredClone(seed);
  }

  return JSON.parse(raw) as MockDatabase;
}

function saveDb(db: MockDatabase) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey, JSON.stringify(db));
}

export function readMockDb() {
  return loadDb();
}

export function setMockTable<K extends keyof MockDatabase>(table: K, rows: MockDatabase[K]) {
  const db = loadDb();
  db[table] = rows;
  saveDb(db);
}

export function insertMockRow<K extends keyof MockDatabase>(table: K, row: MockDatabase[K][number]) {
  const db = loadDb();
  db[table] = [...db[table], row] as MockDatabase[K];
  saveDb(db);
  return row;
}

export function updateMockRow<K extends keyof MockDatabase>(
  table: K,
  idValue: string,
  updater: (row: MockDatabase[K][number]) => MockDatabase[K][number],
) {
  const db = loadDb();
  db[table] = db[table].map((row) => (row.id === idValue ? updater(row) : row)) as MockDatabase[K];
  saveDb(db);
}

export function removeMockRow<K extends keyof MockDatabase>(table: K, idValue: string) {
  const db = loadDb();
  db[table] = db[table].filter((row) => row.id !== idValue) as MockDatabase[K];
  saveDb(db);
}

export function createMockId(prefix: string) {
  return id(prefix);
}
