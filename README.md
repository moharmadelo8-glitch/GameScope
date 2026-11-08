# GameScope
**Know What Your Device Can Play.** A no-account, static web app that compares your PC, Android phone, iPhone or console with documented game requirements.

## Features
Expanded Intel/AMD CPU and NVIDIA/AMD/Intel GPU catalog, Android brand/model/chipset suggestions, chipset-aware mobile checks, simplified device setup, publisher-linked game requirements, device-specific game filtering and compatibility sorting · Device selection (PC, Android, iPhone, 10 consoles) · compatibility engine with 4 statuses and a per-check breakdown · search and genre/platform/price/status filters · game details · favorites and recently viewed · multiple saved devices · corrected device comparison with distinct-device selection, platform-aware game availability, specification breakdown and Chart.js chart · JSON export of reports and devices, JSON import · English/Arabic with RTL · light/dark themes · built-in self-tests (Settings).

## Data honesty
Game requirements link to publisher/developer support pages where available. A few older entries still need source verification. Missing requirements are shown as "Insufficient Data". No FPS or benchmark is ever estimated. CPU/GPU "tiers" are coarse project-defined classes, not benchmarks.

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

## Roadmap\nSee [ROADMAP.md](ROADMAP.md) for planned features such as an upgrade advisor, PC build planner, verified benchmark library, Algerian price guide and offline PWA support. These are ideas for future releases, not current features.\n\n## Contributing
Fork, branch, open a PR. For data changes, cite an official source URL and update the date. Keep the code dependency-free.

## License
MIT
