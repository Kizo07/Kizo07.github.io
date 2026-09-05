# Kanav Mehta — Portfolio Site

Personal website of **Kanav Mehta**, Quantitative AI Researcher at QuantLink AI.
Live at [kizo07.github.io](https://kizo07.github.io).

The site tells the story of a quant/AI research career — factor engines,
ML strategy research, derivatives analytics, and NLP market signals — with
links to public GitHub repositories and strategy tearsheets.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home — hero, QuantLink spotlight, experience ledger, selected work |
| `projects/` | Project index + case-study detail pages |
| `blogs/` | Research notes (factor modeling, risk design, numerical methods) |
| `tearsheets/` | quantstats strategy tearsheets |
| `assets/` | `site.css` design system + `site.js` interactions |
| `images/` | Portrait and static images |

## Tech

- Static HTML/CSS/JS — no build step, deployable on GitHub Pages as-is.
- Cyan Matrix design system in `assets/site.css`: near-black surfaces, electric
  cyan accents, illuminated frames, and a cool blue/white light theme.
- Fonts: Space Grotesk, Inter, IBM Plex Mono via Google Fonts.
- Existing Mantine controls share the site's tokens through
  `assets/mantine-app.js` and `assets/vendor/mantine-overrides.css`.
- Decorative digital rain in `assets/matrix.js` spans the site on one
  viewport-sized canvas, softened behind reading areas. It renders at up to
  20fps, pauses in hidden tabs, and respects reduced-motion settings.
  Its fixed pause/play control remembers the preference across pages.
- Theme preference persists in `localStorage` (dark default).

## Local preview

```bash
python -m http.server 8000
# open http://localhost:8000
```

## License

The design and written content are © Kanav Mehta. The underlying Jekyll-era
scaffolding from the original template remains under its [MIT license](LICENSE).
