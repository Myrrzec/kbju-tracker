import { useEffect, useRef, useState } from "react";

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Returns 0 for the first paint, then `value`, so a CSS transition can grow from empty. */
export function useEntered(value: number): number {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return shown;
}

/** Eases a number from its previous value to the new one. */
export function useCountUp(value: number, duration = 1200): number {
  const [shown, setShown] = useState(0);
  const current = useRef(0);
  const reduce = prefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const from = current.current;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const next = from + (value - from) * (1 - Math.pow(1 - t, 4));
      current.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);

  return reduce ? value : shown;
}

/** True once `active` has stayed true for `ms`, e.g. to explain a slow server start. */
export function useDelayedFlag(active: boolean, ms = 4000): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setOn(true), ms);
    return () => {
      clearTimeout(id);
      setOn(false);
    };
  }, [active, ms]);
  return active && on;
}
