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
  isLoadingUser: boolean;
  setUser: (user: User) => void;
  setIsLoadingUser: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      isLoadingUser: true, // Start as loading until session is resolved
      setUser: (user) => set({ user, isLoadingUser: false }),
      setIsLoadingUser: (loading) => set({ isLoadingUser: loading }),
      logout: () => set({ user: null, isLoadingUser: false }),
    }),
    { name: "UserStore" }
  )
);