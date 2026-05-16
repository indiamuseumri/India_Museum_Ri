import { useEffect, useRef, useState } from "react";

/**
 * useIntersection
 * ───────────────
 * Observes a DOM element and returns `true` once it enters the viewport.
 * Used to trigger scroll-reveal animations across multiple section components.
 *
 * @param threshold — fraction of element visibility required (0–1, default 0.15)
 */
export function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
