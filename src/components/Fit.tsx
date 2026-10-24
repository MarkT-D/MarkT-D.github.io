"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Lays its child out at a fixed width and scales it down to the space it has,
 * so a scene with HTML labels keeps its proportions on a phone instead of
 * reflowing. Below `minScale` it stops shrinking and scrolls sideways
 * instead, because a scene too small to read is worse than one to swipe.
 * Given a `focus` (an x in the scene's own pixels), the sideways view follows
 * it like a camera until the reader swipes, then leaves them alone a while.
 */
export function Fit({ width, minScale = 0, focus, follow = "smooth", children }: {
  width: number; minScale?: number;
  focus?: number; follow?: "smooth" | "instant";
  children: React.ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [scrolls, setScrolls] = useState(false);

  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const fit = Math.min(1, o.clientWidth / width);
      const s = Math.max(minScale, fit);
      setScale(s);
      setScrolls(fit < minScale);
      setHeight(s < 1 ? i.offsetHeight * s : undefined);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    measure();
    return () => ro.disconnect();
  }, [width, minScale]);

  const touched = useRef(-1e9);
  useEffect(() => {
    const o = outer.current;
    if (!o || !scrolls || focus === undefined) return;
    if (performance.now() - touched.current < 6000) return;
    const target = Math.max(0, Math.min(o.scrollWidth - o.clientWidth, focus * scale - o.clientWidth / 2));
    if (Math.abs(o.scrollLeft - target) > 2) o.scrollTo({ left: target, behavior: follow === "smooth" ? "smooth" : "auto" });
  }, [focus, scrolls, scale, follow]);
  const touch = () => { touched.current = performance.now(); };

  const scaled = scale < 1;
  return (
    <>
      <div ref={outer} onPointerDown={touch} onTouchStart={touch} onWheel={touch} className={scrolls ? "relative w-full overflow-x-auto overflow-y-hidden" : "relative w-full"} style={{ height: height !== undefined && scrolls ? height + 8 : height }}>
        <div style={scrolls ? { width: width * scale, height } : undefined}>
          <div
            ref={inner}
            style={scaled ? { width, transform: `scale(${scale})`, transformOrigin: "0 0", position: "absolute", left: 0, top: 0 } : undefined}
          >
            {children}
          </div>
        </div>
      </div>
      {scrolls && <p className="mt-1 text-[12px] text-muted-foreground">{focus === undefined ? "Swipe sideways to see it all →" : "The view follows the action. Swipe to look around."}</p>}
    </>
  );
}
