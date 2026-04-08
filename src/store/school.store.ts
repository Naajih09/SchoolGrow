import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SchoolState {
  currentSchoolId: string | null;
  schoolName: string | null;
  primaryColor: string | null;
  setSchool: (school: SchoolState) => void;
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      currentSchoolId: null,
      schoolName: null,
      primaryColor: null,
      setSchool: (school) => set(school),
    }),
    {
      name: "schoolgrow.school",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

