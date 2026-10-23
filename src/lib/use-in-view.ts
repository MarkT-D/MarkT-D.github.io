"use client";

import { useEffect, useRef, useState } from "react";

/** True while the element is on screen. Loops only run while someone can see them. */
export function useInView<T extends Element>(margin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin, threshold: 0.15 });
    io.observe(node);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * A step counter that advances every `ms` while visible and wraps at `steps`.
 * Under reduced motion it parks on the last step, so the finished picture shows.
 */
export function useLoop(steps: number, ms: number, active: boolean) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced) { setStep(steps - 1); return; }
    if (!active) return;
    const id = setInterval(() => setStep((s) => (s + 1) % steps), ms);
    return () => clearInterval(id);
  }, [active, ms, steps, reduced]);
  return step;
}
