"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Lays its child out at a fixed width and scales it down to the space it has,
 * so a scene with HTML labels keeps its proportions on a phone instead of
 * reflowing. Below `minScale` it stops shrinking and scrolls sideways
 * instead, because a scene too small to read is worse than one to swipe.
 */
export function Fit({ width, minScale = 0, children }: { width: number; minScale?: number; children: React.ReactNode }) {
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

  const scaled = scale < 1;
  return (
    <>
      <div ref={outer} className={scrolls ? "relative w-full overflow-x-auto overflow-y-hidden" : "relative w-full"} style={{ height: height !== undefined && scrolls ? height + 8 : height }}>
        <div style={scrolls ? { width: width * scale, height } : undefined}>
          <div
            ref={inner}
            style={scaled ? { width, transform: `scale(${scale})`, transformOrigin: "0 0", position: "absolute", left: 0, top: 0 } : undefined}
          >
            {children}
          </div>
        </div>
      </div>
      {scrolls && <p className="mt-1 text-[12px] text-muted-foreground">Swipe sideways to see it all →</p>}
    </>
  );
}
