# Mark Temchenko · portfolio

My portfolio site: case studies of the LLM and ML systems I've built, how I build them, and short engineering notes.

**Stack:** Next.js 16 (static export) · React 19 · TypeScript · Tailwind CSS v4. Deployed to GitHub Pages by `.github/workflows/pages.yml`.

```bash
npm install
npm run dev     # http://localhost:3100
npm run build   # static site in out/
```

The visual language (palette, device frames, motion) comes from Pesto, a restaurant platform I build. Every demo on the page runs on invented data; no client data is shown.

`scripts/uganda-dots.mjs` turns Natural Earth's 1:50m Uganda into the dot map used in the TRAC FM case study. It runs once and its output is committed.
