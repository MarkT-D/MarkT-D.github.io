/**
 * The shared machining of the device family.
 *
 * Four cases — phone, tablet, laptop, watch — have to read as one lineup, and
 * what makes them a lineup is not their outlines but their surface: the same
 * brushed rail, the same specular edge, the same weight of shadow. Those live
 * here rather than in each frame, so a change to the material changes all four
 * at once instead of drifting three ways.
 *
 * Everything is expressed against `--foreground`, never a fixed grey, so the
 * cases stay metal on the light page and on the dark one.
 */

/** The rail itself. Two light bands off one diagonal is what reads as milled
 *  aluminium; a flat grey border reads as a rectangle. */
export const RAIL =
  "bg-[linear-gradient(150deg,var(--rail-hi),var(--rail-lo)_28%,var(--rail-hi)_46%,var(--rail-lo)_72%,var(--rail-hi))] [--rail-hi:color-mix(in_oklab,var(--foreground)_26%,transparent)] [--rail-lo:color-mix(in_oklab,var(--foreground)_11%,transparent)]";

/** The hairline where the rail turns over — the case's own outline. */
export const RAIL_EDGE = "border border-foreground/20";

/** Weight on the page: one long soft cast plus a tight contact shadow. A single
 *  shadow either floats without touching down or sits without lifting. */
export const CASE_SHADOW =
  "shadow-[0_44px_80px_-32px_rgba(0,0,0,0.42),0_10px_26px_-12px_rgba(0,0,0,0.28)]";

/** Lighter cast for the small cases, which would otherwise look dropped. */
export const CASE_SHADOW_SM =
  "shadow-[0_24px_44px_-22px_rgba(0,0,0,0.38),0_6px_14px_-8px_rgba(0,0,0,0.22)]";

/** Hardware buttons on the rail. */
export const BUTTON = "absolute bg-foreground/30";

/** The glass itself, before any screen content. */
export const SCREEN = "relative overflow-hidden bg-card";

/**
 * A single travelling highlight across the glass, so a screen full of flat UI
 * still reads as something under a pane. Opt-in: on a screen the reader is
 * meant to *use*, a highlight sweeping over the text is a distraction.
 */
export const SHEEN =
  "animate-sheen absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/10";
