import { useEffect, RefObject } from "react";

export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  ignoredRefs: Array<RefObject<HTMLElement | null> | null> = []
) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      if (ref.current && ref.current.contains(target)) {
        return;
      }

      for (const ignoredRef of ignoredRefs) {
        if (ignoredRef?.current && ignoredRef.current.contains(target)) {
          return;
        }
      }

      handler();
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, ignoredRefs]);
};