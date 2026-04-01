import { useEffect, useRef, useState } from "react";

/**
 * Lightweight engagement proxy: tab visibility + active time.
 * Replace or combine with facial affect / gaze models when integrated.
 */
export function useEngagementTracker(active: boolean) {
  const [score, setScore] = useState(0.65);
  const visibleMs = useRef(0);
  const hiddenMs = useRef(0);
  const last = useRef<number | null>(null);
  const raf = useRef<number>();

  useEffect(() => {
    if (!active) return;

    visibleMs.current = 0;
    hiddenMs.current = 0;
    last.current = null;
    setScore(0.65);

    const tick = () => {
      const now = performance.now();
      if (last.current != null) {
        const dt = now - last.current;
        if (document.visibilityState === "visible") visibleMs.current += dt;
        else hiddenMs.current += dt;
      }
      last.current = now;
      const total = visibleMs.current + hiddenMs.current;
      const ratio = total > 0 ? visibleMs.current / total : 1;
      setScore(0.35 + 0.65 * ratio);
      raf.current = requestAnimationFrame(tick);
    };
    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);

    const onVis = () => {
      last.current = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active]);

  return score;
}
