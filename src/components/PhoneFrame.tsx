import { BatteryFull, SignalHigh, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUTTON, CASE_SHADOW, RAIL, RAIL_EDGE, SCREEN, SHEEN } from "./frame";

/**
 * The phone in the family. Screen content goes between the status bar and the
 * home indicator — start it with little or no top padding.
 *
 * Everything the case is made of is a fraction of its own width rather than a
 * fixed pixel size, because these frames appear at three very different scales:
 * around 396px where the screen is a real 390px document, and down to ~270px
 * for the small illustrations on the product pages. Hard-coded chrome survives
 * the first and wrecks the second — a 82px camera housing is a fifth of a real
 * phone's width and a third of a small one's, which is what made the little
 * phones look like toys with the wrong face printed on them.
 *
 * So the case takes a `width`, publishes it as `--pf`, and every radius,
 * bezel, button and glyph is struck off it. `RATIO` below is the one place the
 * proportions live.
 */

/** The width the ratios were measured against — a 390px screen in a 3px rail. */
const BASE_W = 396;

/** Every piece of chrome, as a fraction of the case width. */
const RATIO = {
  radius: 48 / BASE_W,
  rail: 3 / BASE_W,
  islandW: 82 / BASE_W,
  islandH: 21 / BASE_W,
  islandTop: 7 / BASE_W,
  lens: 9 / BASE_W,
  statusX: 24 / BASE_W,
  statusTop: 9 / BASE_W,
  statusBottom: 8 / BASE_W,
  clock: 10 / BASE_W,
  icon: 10 / BASE_W,
  battery: 12 / BASE_W,
  indicatorH: 4 / BASE_W,
  indicatorTop: 6 / BASE_W,
  indicatorBottom: 7 / BASE_W,
};

export function PhoneFrame({
  children,
  className,
  screenClassName,
  screenStyle,
  width,
  sheen = false,
  live = false,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
  /** Background and text colour for the whole screen, chrome included. */
  screenStyle?: React.CSSProperties;
  /**
   * Case width in CSS pixels. Omit when the screen inside sizes the phone —
   * the real 390px document does — and the chrome is drawn at its natural
   * proportions. Give it wherever the phone is an illustration at some other
   * size, so the housing, the corners and the clock shrink with the case
   * instead of staying phone-sized on a thumbnail.
   */
  width?: number;
  sheen?: boolean;
  /**
   * The screen is really being used, not looked at. Drops the sheen — a
   * highlight sweeping over text you are reading is noise — and lets the case
   * respond to focus inside it.
   */
  live?: boolean;
}) {
  // `--pf` drives the chrome; the explicit width is only set when the caller
  // asked for one, so an unconstrained frame still takes its size from the
  // document on its screen.
  const vars = { "--pf": `${width ?? BASE_W}px` } as React.CSSProperties;
  const u = (k: number) => `calc(var(--pf) * ${k})`;

  const radius = u(RATIO.radius);
  const innerRadius = `calc(${radius} - ${u(RATIO.rail)})`;

  return (
    <div className={cn("relative", className)} style={width ? { ...vars, width } : vars}>
      {/* Side hardware: action button and volume left, power right. Sized off
          the case height so they stay in proportion when it scales. */}
      <span
        aria-hidden
        className={cn(BUTTON, "-left-[2px] top-[14%] h-[3.2%] rounded-l-full")}
        style={{ width: u(RATIO.rail) }}
      />
      <span
        aria-hidden
        className={cn(BUTTON, "-left-[2px] top-[21%] h-[5.4%] rounded-l-full")}
        style={{ width: u(RATIO.rail) }}
      />
      <span
        aria-hidden
        className={cn(BUTTON, "-left-[2px] top-[28.5%] h-[5.4%] rounded-l-full")}
        style={{ width: u(RATIO.rail) }}
      />
      <span
        aria-hidden
        className={cn(BUTTON, "-right-[2px] top-[23%] h-[7.6%] rounded-r-full")}
        style={{ width: u(RATIO.rail) }}
      />

      <div
        className={cn(
          "relative",
          RAIL,
          RAIL_EDGE,
          CASE_SHADOW,
          live &&
            "transition-shadow focus-within:shadow-[0_44px_80px_-32px_rgba(0,0,0,0.5),0_0_0_3px_var(--ring)]"
        )}
        style={{ borderRadius: radius, padding: u(RATIO.rail) }}
      >
        {/* Specular run along the top-left turn of the rail. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-white/15 dark:from-white/12 dark:to-white/5"
          style={{ borderRadius: radius }}
        />

        <div
          className={cn(SCREEN, "flex flex-col", screenClassName)}
          style={{ borderRadius: innerRadius, ...screenStyle }}
        >
          {/* Status bar. The camera housing sits over it rather than beside it —
              on the real hardware the bezel is the status bar. Colours are
              inherited, not named, so the bar belongs to the screen. */}
          <div
            className="relative z-10 flex shrink-0 items-center justify-between"
            style={{
              paddingInline: u(RATIO.statusX),
              paddingTop: u(RATIO.statusTop),
              paddingBottom: u(RATIO.statusBottom),
            }}
          >
            <span className="font-semibold leading-none tabular-nums" style={{ fontSize: u(RATIO.clock) }}>
              9:41
            </span>
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              style={{
                top: u(RATIO.islandTop),
                width: u(RATIO.islandW),
                height: u(RATIO.islandH),
              }}
            >
              {/* The lens, off-centre in the housing as it is on the hardware. */}
              <span
                className="absolute top-1/2 -translate-y-1/2 rounded-full bg-neutral-800 ring-1 ring-white/10"
                style={{
                  right: u(RATIO.lens),
                  width: u(RATIO.lens),
                  height: u(RATIO.lens),
                }}
              />
            </span>
            <span
              className="flex items-center opacity-70"
              style={{ gap: u(RATIO.rail) }}
            >
              <SignalHigh style={{ width: u(RATIO.icon), height: u(RATIO.icon) }} />
              <Wifi style={{ width: u(RATIO.icon), height: u(RATIO.icon) }} />
              <BatteryFull style={{ width: u(RATIO.battery), height: u(RATIO.battery) }} />
            </span>
          </div>

          {children}

          <div
            className="flex shrink-0 justify-center"
            style={{ paddingTop: u(RATIO.indicatorTop), paddingBottom: u(RATIO.indicatorBottom) }}
          >
            <span
              aria-hidden
              className="w-[38%] rounded-full bg-current opacity-25"
              style={{ height: u(RATIO.indicatorH) }}
            />
          </div>

          {sheen && !live && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ borderRadius: innerRadius }}
            >
              <div className={SHEEN} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
