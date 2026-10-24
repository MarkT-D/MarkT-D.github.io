import cactus from "@/lib/cactus.json";
import { cn } from "@/lib/utils";

/** The cactus in its pot, as pixel art: one rect per run of a colour. The terminal's logo and the site's. */
const PIXELS: Record<string, string> = {
  o: "#1f5a36", g: "#3fa96a", l: "#7fd8a2", s: "#e3f5ea",
  f: "#f27d9b", y: "#f6c453", r: "#d9967a", R: "#a8654b", p: "#b9785c", P: "#8e5640",
};

export function Cactus({ className }: { className?: string }) {
  const rects: React.ReactNode[] = [];
  cactus.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w++;
      if (PIXELS[c]) rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={w + 0.04} height={1.04} fill={PIXELS[c]} />);
      x += w;
    }
  });
  return <svg viewBox={`0 0 ${cactus[0].length} ${cactus.length}`} className={cn("h-full w-auto", className)} shapeRendering="crispEdges" aria-hidden>{rects}</svg>;
}
