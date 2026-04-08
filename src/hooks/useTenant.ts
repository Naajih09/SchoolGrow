import { useAuthStore } from "@/store/auth.store";
import { useSchoolStore } from "@/store/school.store";

export function useTenant() {
  const session = useAuthStore((state) => state.session);
  const school = useSchoolStore((state) => ({
    currentSchoolId: state.currentSchoolId,
    schoolName: state.schoolName,
    primaryColor: state.primaryColor,
  }));

  return {
    session,
    school,
    schoolId: session?.school.id ?? school.currentSchoolId,
    role: session?.profile.role ?? null,
  };
}

