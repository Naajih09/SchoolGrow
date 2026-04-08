import { Suspense, lazy } from "react";
import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { RequireAuth, RequireRole } from "./route-guards";
import type { Role } from "@/types";

const LandingPage = lazy(() => import("@/features/public/LandingPage"));
const AboutPage = lazy(() => import("@/features/public/AboutPage"));
const ContactPage = lazy(() => import("@/features/public/ContactPage"));
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const AdminDashboardPage = lazy(() => import("@/features/dashboard/AdminDashboardPage"));
const TeacherDashboardPage = lazy(() => import("@/features/dashboard/TeacherDashboardPage"));
const SchoolsPage = lazy(() => import("@/features/schools/SchoolsPage"));
const StudentsPage = lazy(() => import("@/features/students/StudentsPage"));
const TeachersPage = lazy(() => import("@/features/teachers/TeachersPage"));
const ClassesPage = lazy(() => import("@/features/classes/ClassesPage"));
const SubjectsPage = lazy(() => import("@/features/subjects/SubjectsPage"));
const ResultsPage = lazy(() => import("@/features/results/ResultsPage"));
const ResultCheckerPage = lazy(() => import("@/features/results/ResultCheckerPage"));
const ResultPrintPage = lazy(() => import("@/features/results/ResultPrintPage"));
const TeacherUploadPage = lazy(() => import("@/features/results/TeacherUploadPage"));

function Loader() {
  return (
    <div className="page-shell">
      <div className="glass-panel rounded-3xl p-6 text-sm text-slate-600">Loading...</div>
    </div>
  );
}

function withLayout(element: ReactElement, layout: "public" | "dashboard" = "public") {
  const wrapped = layout === "dashboard" ? <DashboardLayout>{element}</DashboardLayout> : <PublicLayout>{element}</PublicLayout>;
  return <Suspense fallback={<Loader />}>{wrapped}</Suspense>;
}

function protectedDashboard(element: ReactElement, roles: Role[]) {
  return (
    <RequireAuth>
      <RequireRole roles={roles}>{withLayout(element, "dashboard")}</RequireRole>
    </RequireAuth>
  );
}

export function RouterProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={withLayout(<LandingPage />)} />
        <Route path="/about" element={withLayout(<AboutPage />)} />
        <Route path="/contact" element={withLayout(<ContactPage />)} />
        <Route path="/result-checker" element={withLayout(<ResultCheckerPage />)} />
        <Route path="/result-checker/print/:resultId" element={withLayout(<ResultPrintPage />)} />
        <Route path="/login" element={withLayout(<LoginPage />)} />
        <Route path="/dashboard" element={protectedDashboard(<AdminDashboardPage />, ["super_admin", "school_admin"])} />
        <Route path="/dashboard/schools" element={protectedDashboard(<SchoolsPage />, ["super_admin"])} />
        <Route path="/dashboard/students" element={protectedDashboard(<StudentsPage />, ["super_admin", "school_admin"])} />
        <Route path="/dashboard/teachers" element={protectedDashboard(<TeachersPage />, ["super_admin", "school_admin"])} />
        <Route path="/dashboard/classes" element={protectedDashboard(<ClassesPage />, ["super_admin", "school_admin"])} />
        <Route path="/dashboard/subjects" element={protectedDashboard(<SubjectsPage />, ["super_admin", "school_admin"])} />
        <Route path="/dashboard/results" element={protectedDashboard(<ResultsPage />, ["super_admin", "school_admin"])} />
        <Route path="/teacher" element={protectedDashboard(<TeacherDashboardPage />, ["teacher"])} />
        <Route path="/teacher/upload" element={protectedDashboard(<TeacherUploadPage />, ["teacher"])} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
