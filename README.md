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
- Design system in `assets/site.css` (CSS custom properties, dark/light themes).
- Fonts: Fraunces, Inter, IBM Plex Mono via Google Fonts.
- Theme preference persists in `localStorage` (dark default).

## Local preview

```bash
python -m http.server 8000
# open http://localhost:8000
```

## License

The design and written content are © Kanav Mehta. The underlying Jekyll-era
scaffolding from the original template remains under its [MIT license](LICENSE).
