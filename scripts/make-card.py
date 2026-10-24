"""Writes public/card: the terminal card `curl -sL markt-d.github.io/card` prints.

GitHub Pages serves a file with no extension as it is, so curl gets the raw
ANSI text. Run again after changing anything below: python3 scripts/make-card.py
"""
import pathlib

ESC = "\x1b["
RESET = ESC + "0m"
def rgb(r, g, b): return f"{ESC}38;2;{r};{g};{b}m"
BOLD, DIM = ESC + "1m", ESC + "2m"
GREEN, BRIGHT, MUTED, WHITE, AMBER = rgb(53, 128, 78), rgb(111, 211, 154), rgb(138, 148, 141), rgb(236, 240, 237), rgb(253, 188, 75)

LOGO = [
    "███╗   ███╗ █████╗ ██████╗ ██╗  ██╗",
    "████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝",
    "██╔████╔██║███████║██████╔╝█████╔╝ ",
    "██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ",
    "██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗",
    "╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝",
]
SIDE = [
    (BOLD + WHITE, "Mark Temchenko"),
    (BRIGHT, "AI Engineer · Forward Deployed"),
    (MUTED, "Barcelona · EU citizen"),
    (MUTED, ""),
    (BRIGHT, "● open to AI Engineer / FDE roles"),
    (MUTED, ""),
]
ROWS = [
    ("role", "LLM systems, from a client's problem to production"),
    ("built", "grant platform · deck generator · Pesto's menu AI"),
    ("stack", "Python · TypeScript · PyTorch · Next.js · Postgres"),
    ("langs", "ru · en (C1) · de (A1)"),
    None,
    ("mail", "mstemchenko.dev@gmail.com"),
    ("in", "linkedin.com/in/mark-the-artichoke"),
    ("gh", "github.com/MarkT-D"),
    ("web", "markt-d.github.io"),
]
W = 74  # inside the border

def grad(i, n):
    a, b = (53, 128, 78), (111, 211, 154)
    k = i / max(1, n - 1)
    return rgb(*(round(a[j] + (b[j] - a[j]) * k) for j in range(3)))

SEGS = []  # the same card as [text, hex colour, bold] runs, for the site to draw

def hexof(code):
    nums = [int(n) for n in code.replace(ESC, ";").replace("m", ";").split(";") if n.isdigit()]
    i = len(nums) - 1 - nums[::-1].index(38) if 38 in nums else -1
    return "#%02x%02x%02x" % tuple(nums[i + 2:i + 5]) if i >= 0 else "#ecf0ed"

def border(s):
    SEGS.append([[s, hexof(GREEN), False]])
    return GREEN + s + RESET

def line(parts):
    """parts: [(colour, text)]. Pads to W and draws the border."""
    text = "".join(c + s + RESET for c, s in parts)
    width = sum(len(s) for _, s in parts)
    pad = " " * (W - 2 - width)
    SEGS.append([["│ ", hexof(GREEN), False]] + [[s, hexof(c), BOLD in c] for c, s in parts if s] + [[pad + " ", "#000000", False], ["│", hexof(GREEN), False]])
    return f"{GREEN}│{RESET} {text}{pad} {GREEN}│{RESET}"

out = ["", border(f"╭{'─' * W}╮"), line([])]
for i, (logo, (c, s)) in enumerate(zip(LOGO, SIDE)):
    out.append(line([(grad(i, len(LOGO)) + BOLD, logo), ("", "   "), (c, s)]))
out.append(line([]))
out.append(border(f"├{'─' * W}┤"))
for row in ROWS:
    if row is None:
        out.append(line([(DIM + MUTED, "·" * (W - 2))]))
        continue
    k, v = row
    out.append(line([(MUTED, f"{k:<7}"), (WHITE, v)]))
out.append(line([]))
out.append(line([(DIM + MUTED, "jarvis> "), (AMBER, "candidate verified. recommendation: "), (BOLD + BRIGHT, "hire.")]))
out.append(border(f"╰{'─' * W}╯"))
out.append("")

path = pathlib.Path(__file__).resolve().parent.parent / "public" / "card"
path.write_text("\n".join(out) + "\n", encoding="utf-8")
import json
(path.parent.parent / "src" / "lib" / "card.json").write_text(json.dumps(SEGS, ensure_ascii=False), encoding="utf-8")
print("\n".join(out))
