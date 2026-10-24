"use client";

import { useEffect, useRef, useState } from "react";

/** True while the element is on screen. Loops only run while someone can see them. */
export function useInView<T extends Element>(margin = "0px 0px -10% 0px", once = false) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      // A one-shot reveal (a chart drawing in) stays drawn once it has been seen.
      if (once && e.isIntersecting) io.disconnect();
    }, { rootMargin: margin, threshold: 0.15 });
    io.observe(node);
    return () => io.disconnect();
  }, [margin, once]);
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

/** True after the first client render. Scenes drawn from floating-point maths render only then, so server and browser never disagree. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Seconds into a loop of `loop` seconds, advancing every frame while `running`.
 * Starts where it last stopped; under reduced motion it stays at `still`.
 */
export function useSceneClock(loop: number, running: boolean, still: number) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(still);
  const offset = useRef(0);
  useEffect(() => {
    if (!running || reduced) return;
    const start = performance.now() - offset.current * 1000;
    let frame = requestAnimationFrame(function tick(now) {
      // rAF can stamp a frame slightly before `start`; keep the clock inside [0, loop).
      const s = ((((now - start) / 1000) % loop) + loop) % loop;
      offset.current = s;
      setT(s);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [running, reduced, loop]);
  return reduced ? still : t;
}
