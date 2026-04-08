import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolStore } from "@/store/school.store";

const adminNav = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/schools", label: "Schools" },
  { to: "/dashboard/students", label: "Students" },
  { to: "/dashboard/teachers", label: "Teachers" },
  { to: "/dashboard/classes", label: "Classes" },
  { to: "/dashboard/subjects", label: "Subjects" },
  { to: "/dashboard/results", label: "Results" },
];

const teacherNav = [
  { to: "/teacher", label: "Overview" },
  { to: "/teacher/upload", label: "Upload" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const schoolName = useSchoolStore((state) => state.schoolName);
  const role = session?.profile.role ?? "school_admin";
  const navItems = role === "teacher" ? teacherNav : role === "super_admin" ? adminNav : adminNav.filter((item) => item.to !== "/dashboard/schools");

  const handleSignOut = async () => {
    await signOut();
    useAuthStore.getState().signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <div className="page-shell grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel rounded-3xl p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              SG
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-950">SchoolGrow</div>
              <div className="text-xs text-slate-500">{schoolName ?? "Tenant workspace"}</div>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <Badge>{role}</Badge>
            <Badge className="bg-teal-50 text-teal-700">School scoped</Badge>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 space-y-3">
            <Link to="/result-checker">
              <Button variant="outline" className="w-full">
                Public Result Checker
              </Button>
            </Link>
            <Button variant="ghost" className="w-full" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </aside>
        <main className="pb-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">SchoolGrow</div>
              <h1 className="text-3xl font-semibold text-slate-950">Tenant dashboard</h1>
            </div>
            <Badge className="bg-slate-950 text-white">{schoolName ?? "No school selected"}</Badge>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
