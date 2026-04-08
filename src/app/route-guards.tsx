import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types";

export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireRole({ children, roles }: { children: ReactNode; roles: Role[] }) {
  const session = useAuthStore((state) => state.session);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(session.profile.role)) {
    return <Navigate to={session.profile.role === "teacher" ? "/teacher" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}
