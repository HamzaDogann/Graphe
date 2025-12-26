"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function SessionSync() {
  const { data: session } = useSession();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      });
    }
  }, [session, setUser]);

  return null;
}
