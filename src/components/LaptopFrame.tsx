import { cn } from "@/lib/utils";
import { CASE_SHADOW, RAIL, RAIL_EDGE, SCREEN, SHEEN } from "./frame";

/**
 * The laptop in the family: lid, then the hinge chin and a deck that reads as
 * seen from slightly above.
 *
 * The deck is a hair wider than the lid and tapers inward — that mismatch is
 * the only thing that says "this is a solid object at an angle" rather than
 * two stacked rectangles, and it costs one clip-path.
 */
export function LaptopFrame({
  children,
  className,
  screenClassName,
  sheen = false,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
  sheen?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn("relative rounded-t-[1.05rem] p-[6px] pb-0", RAIL, RAIL_EDGE, "border-b-0", CASE_SHADOW)}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-t-[1.05rem] bg-gradient-to-br from-white/30 via-transparent to-transparent dark:from-white/10"
        />

        <div className={cn(SCREEN, "rounded-t-[0.72rem]", screenClassName)}>
          {/* Camera housing, cut into the top bezel. */}
          <span
            aria-hidden
            className="absolute left-1/2 top-0 z-20 h-[9px] w-[15%] min-w-[42px] -translate-x-1/2 rounded-b-[6px] bg-neutral-900"
          >
            <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-700" />
          </span>

          {children}

          {sheen && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-[0.72rem]">
              <div className={SHEEN} />
            </div>
          )}
        </div>
      </div>

      {/* Hinge chin and deck. */}
      <div
        aria-hidden
        className={cn("relative -mx-[1.6%] h-3.5 w-[103.2%] rounded-b-[0.5rem]", RAIL, RAIL_EDGE, "border-t-0")}
        style={{ clipPath: "polygon(0 0, 100% 0, 98.4% 100%, 1.6% 100%)" }}
      >
        <span className="absolute inset-x-0 top-0 h-px bg-foreground/15" />
        {/* Finger slot. */}
        <span className="absolute left-1/2 top-0 h-[5px] w-[14%] -translate-x-1/2 rounded-b-[4px] bg-foreground/[0.14]" />
      </div>
    </div>
  );
}
