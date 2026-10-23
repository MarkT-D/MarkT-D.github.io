/**
 * The paper menu in the "before" picture.
 *
 * Written for this picture and nothing else. It is deliberately *not* the demo
 * restaurant's menu: showing the same dishes being photographed and then
 * appearing on the phone made the page read as a trick rather than as a before
 * and after. This is a different fictional trattoria, so the point being made —
 * "a printed menu goes in" — stands on its own.
 *
 * Left in Italian on purpose. It is a photograph of a physical menu, and the
 * whole argument of the page is that you photograph the one you already have,
 * in whatever language it was printed in, and get four out.
 *
 * Inline SVG rather than a photograph: no asset, no network, sharp at any size,
 * and the same technique the grain texture already uses. System serifs only —
 * an SVG loaded through `<img>` cannot reach the page's webfonts, and a printed
 * trattoria menu is set in a serif anyway.
 */

const W = 640;
const H = 900;

const PAPER = "#F6F1E7";
const INK = "#2A2018";
const FADE = "#7A6A58";

const SERIF = "Georgia, 'Times New Roman', serif";

const NAME = "Osteria del Ponte";
const PLACE = "Vicolo dei Lanzi 3 · Firenze";

const COURSES: { heading: string; rows: [string, string, string][] }[] = [
  {
    heading: "Antipasti",
    rows: [
      ["Fiori di zucca fritti", "ripieni di ricotta e acciuga", "9,00"],
      ["Carpaccio di manzo", "rucola, scaglie di grana, limone", "13,50"],
      ["Crostini toscani", "fegatini, burro, capperi", "8,00"],
      ["Insalata di mare tiepida", "polpo, gamberi, sedano, olio nuovo", "15,00"],
    ],
  },
  {
    heading: "Primi",
    rows: [
      ["Pappardelle al cinghiale", "ragù bianco, ginepro, vino rosso", "16,00"],
      ["Gnocchi al gorgonzola", "noci tostate, pere", "13,00"],
      ["Spaghetti alle vongole", "aglio, prezzemolo, peperoncino", "17,50"],
      ["Ribollita della casa", "cavolo nero, fagioli, pane raffermo", "11,00"],
    ],
  },
  {
    heading: "Secondi",
    rows: [
      ["Costoletta alla milanese", "burro chiarificato, spicchio di limone", "24,00"],
      ["Polpo alla griglia", "crema di ceci, rosmarino", "23,50"],
      ["Petto d'anatra all'arancia", "cicoria ripassata", "26,00"],
      ["Peposo dell'Impruneta", "pepe nero, chianti, purè", "22,00"],
    ],
  },
  {
    heading: "Dolci",
    rows: [
      ["Torta caprese", "cioccolato fondente, mandorle", "7,50"],
      ["Sorbetto al limone", "basilico fresco", "6,00"],
      ["Cantucci e vin santo", "", "7,00"],
    ],
  },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSvg(): string {
  const parts: string[] = [];
  let y = 172;

  for (const course of COURSES) {
    parts.push(
      `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="20" font-style="italic" fill="${FADE}" letter-spacing="2.5">${escapeXml(course.heading)}</text>`,
      `<line x1="204" y1="${y + 13}" x2="${W - 204}" y2="${y + 13}" stroke="${FADE}" stroke-width="0.6" opacity="0.5"/>`
    );
    y += 44;

    for (const [name, note, price] of course.rows) {
      parts.push(
        `<text x="64" y="${y}" font-family="${SERIF}" font-size="16.5" fill="${INK}">${escapeXml(name)}</text>`,
        `<text x="${W - 64}" y="${y}" text-anchor="end" font-family="${SERIF}" font-size="16.5" fill="${INK}">${escapeXml(price)}</text>`,
        // The leader a printed menu uses to carry the eye across to the price.
        `<line x1="64" y1="${y + 4}" x2="${W - 64}" y2="${y + 4}" stroke="${FADE}" stroke-width="0.7" stroke-dasharray="1 4" opacity="0.42"/>`
      );
      y += 18;
      if (note) {
        parts.push(
          `<text x="64" y="${y}" font-family="${SERIF}" font-size="12" font-style="italic" fill="${FADE}">${escapeXml(note)}</text>`
        );
      }
      y += 26;
    }
    y += 14;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="${PAPER}"/>
<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.06"/>
<text x="${W / 2}" y="84" text-anchor="middle" font-family="${SERIF}" font-size="29" letter-spacing="4.5" fill="${INK}">${escapeXml(NAME.toUpperCase())}</text>
<text x="${W / 2}" y="110" text-anchor="middle" font-family="${SERIF}" font-size="11.5" letter-spacing="2.5" fill="${FADE}">${escapeXml(PLACE.toUpperCase())}</text>
<line x1="${W / 2 - 40}" y1="130" x2="${W / 2 + 40}" y2="130" stroke="${FADE}" stroke-width="1"/>
${parts.join("\n")}
</svg>`;
}

/** Data URI, safe to hand to an `<img src>`. */
export const PAPER_MENU_SRC = `data:image/svg+xml,${encodeURIComponent(buildSvg())}`;
