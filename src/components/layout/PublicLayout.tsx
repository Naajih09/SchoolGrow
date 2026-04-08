import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/store/school.store";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/result-checker", label: "Result Checker" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const schoolName = useSchoolStore((state) => state.schoolName);

  return (
    <div className="min-h-screen">
      <header className="page-shell sticky top-0 z-20">
        <div className="glass-panel flex flex-col gap-4 rounded-3xl px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              SG
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-950">SchoolGrow</div>
              <div className="text-xs text-slate-500">{schoolName ?? "Multi-tenant result platform"}</div>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm transition ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="page-shell pb-10">
        <div className="glass-panel rounded-3xl px-5 py-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>SchoolGrow SaaS scaffold</span>
            <Badge>Tenant isolation ready</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}

