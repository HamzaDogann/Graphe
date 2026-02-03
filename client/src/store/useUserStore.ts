import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface User {
  id: string;
  name: string | null; 
  email: string;
  image?: string | null;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "UserStore" }
  )
);