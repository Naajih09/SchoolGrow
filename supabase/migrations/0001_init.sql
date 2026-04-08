create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  primary_color text,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('super_admin', 'school_admin', 'teacher', 'student')),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  unique (school_id, name)
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  unique (school_id, name)
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  email text not null,
  assigned_classes text[] not null default '{}',
  assigned_subjects text[] not null default '{}'
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  admission_number text not null,
  class_id uuid not null references classes(id) on delete restrict,
  gender text not null,
  date_of_birth date not null,
  guardian_name text not null,
  guardian_phone text not null,
  created_at timestamptz not null default now(),
  unique (school_id, admission_number)
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  subject_id uuid not null references subjects(id) on delete restrict,
  score numeric not null check (score >= 0 and score <= 100),
  term text not null,
  session text not null,
  uploaded_by uuid not null references profiles(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'approved')),
  created_at timestamptz not null default now()
);

alter table schools enable row level security;
alter table profiles enable row level security;
alter table classes enable row level security;
alter table subjects enable row level security;
alter table teachers enable row level security;
alter table students enable row level security;
alter table results enable row level security;

create policy "schools tenant read" on schools for select using (true);
create policy "schools tenant insert" on schools for insert with check (coalesce(auth.jwt() ->> 'role', '') = 'super_admin');
create policy "schools tenant update" on schools for update using (coalesce(auth.jwt() ->> 'role', '') = 'super_admin') with check (coalesce(auth.jwt() ->> 'role', '') = 'super_admin');
create policy "schools tenant delete" on schools for delete using (coalesce(auth.jwt() ->> 'role', '') = 'super_admin');
create policy "profiles tenant read" on profiles for select using (school_id::text = auth.jwt() ->> 'school_id');
create policy "profiles tenant insert" on profiles for insert with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "profiles tenant update" on profiles for update using (school_id::text = auth.jwt() ->> 'school_id') with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "classes tenant read" on classes for all using (school_id::text = auth.jwt() ->> 'school_id');
create policy "classes tenant insert" on classes for insert with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "classes tenant update" on classes for update using (school_id::text = auth.jwt() ->> 'school_id') with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "classes tenant delete" on classes for delete using (school_id::text = auth.jwt() ->> 'school_id');
create policy "subjects tenant read" on subjects for all using (school_id::text = auth.jwt() ->> 'school_id');
create policy "subjects tenant insert" on subjects for insert with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "subjects tenant update" on subjects for update using (school_id::text = auth.jwt() ->> 'school_id') with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "subjects tenant delete" on subjects for delete using (school_id::text = auth.jwt() ->> 'school_id');
create policy "teachers tenant read" on teachers for all using (school_id::text = auth.jwt() ->> 'school_id');
create policy "teachers tenant insert" on teachers for insert with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "teachers tenant update" on teachers for update using (school_id::text = auth.jwt() ->> 'school_id') with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "teachers tenant delete" on teachers for delete using (school_id::text = auth.jwt() ->> 'school_id');
create policy "students tenant read" on students for all using (school_id::text = auth.jwt() ->> 'school_id');
create policy "students tenant insert" on students for insert with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "students tenant update" on students for update using (school_id::text = auth.jwt() ->> 'school_id') with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "students tenant delete" on students for delete using (school_id::text = auth.jwt() ->> 'school_id');
create policy "results tenant read" on results for all using (school_id::text = auth.jwt() ->> 'school_id');
create policy "results tenant insert" on results for insert with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "results tenant update" on results for update using (school_id::text = auth.jwt() ->> 'school_id') with check (school_id::text = auth.jwt() ->> 'school_id');
create policy "results tenant delete" on results for delete using (school_id::text = auth.jwt() ->> 'school_id');
