export type Role = "super_admin" | "school_admin" | "teacher" | "student";

export type ResultStatus = "draft" | "approved";

export interface School {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  school_id: string;
  full_name: string;
  role: Role;
  email: string;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
  gender: string;
  date_of_birth: string;
  guardian_name: string;
  guardian_phone: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  name: string;
  email: string;
  assigned_classes: string[];
  assigned_subjects: string[];
}

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
}

export interface Result {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  score: number;
  term: string;
  session: string;
  uploaded_by: string;
  status: ResultStatus;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  profile: Profile;
  school: School;
}

