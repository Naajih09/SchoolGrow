import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthSession } from "@/types";

interface AuthState {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      signOut: () => set({ session: null }),
    }),
    {
      name: "schoolgrow.auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

