"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function SessionSync() {
  const { data: session, status } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const setIsLoadingUser = useUserStore((state) => state.setIsLoadingUser);

  useEffect(() => {
    if (status === "loading") {
      setIsLoadingUser(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      setUser({
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      });
    } else {
      // Session resolved but no user
      setIsLoadingUser(false);
    }
  }, [session, status, setUser, setIsLoadingUser]);

  return null;
}
