import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolStore } from "@/store/school.store";

export function AppProviders({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session);
  const setSchool = useSchoolStore((state) => state.setSchool);

  useEffect(() => {
    if (session) {
      setSchool({
        currentSchoolId: session.school.id,
        schoolName: session.school.name,
        primaryColor: session.school.primary_color,
      });
      return;
    }

    setSchool({
      currentSchoolId: null,
      schoolName: null,
      primaryColor: null,
    });
  }, [session, setSchool]);

  return <>{children}</>;
}

