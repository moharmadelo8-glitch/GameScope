# GameScope
**Know What Your Device Can Play.** A no-account, static web app that compares your PC, Android phone, iPhone or console with documented game requirements.

## Features
Expanded CPU/GPU catalog, searchable phone suggestions, simplified device setup with optional fields · Device selection (PC, Android, iPhone, 10 consoles) · compatibility engine with 4 statuses and a per-check breakdown · search and genre/platform/price/status filters · game details · favorites and recently viewed · multiple saved devices · device comparison with Chart.js · JSON export of reports and devices, JSON import · English/Arabic with RTL · light/dark themes · built-in self-tests (Settings).

## Data honesty
`data/games.json` is **illustrative sample data, not yet verified**. Missing data is shown as "Insufficient Data". No FPS or benchmark is ever estimated. CPU/GPU "tiers" are coarse project-defined classes, not benchmarks.

## Run locally
```
python -m http.server 8000   # then open http://localhost:8000
```
`fetch` needs HTTP; opening index.html via file:// will not load the JSON.

## Deploy
Push to GitHub, then Settings → Pages → deploy from the main branch root.

## Stack
HTML5, CSS3, vanilla ES6+, JSON, LocalStorage, Chart.js (CDN).

## Screenshots
Add screenshots to `assets/images/` and link them here.

## Contributing
Fork, branch, open a PR. For data changes, cite an official source URL and update the date. Keep the code dependency-free.

## License
MIT
