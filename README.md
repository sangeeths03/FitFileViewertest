[![ActionLint](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/ActionLint.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/ActionLint.yml)
[![CodeQL](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/github-code-scanning/codeql)
[![Dependabot Updates](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependabot/dependabot-updates)
[![Dependency Review](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependency-review.yml)
[![Deploy static content to Pages](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/static.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/static.yml)
[![ESLint](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/eslint.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/eslint.yml)
[![GitHub Pages - Generate XML sitemap](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/sitemap.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/sitemap.yml)
[![Mark stale issues and pull requests](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/stale.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/stale.yml)
[![Microsoft Defender for DevOps](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/defender.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/defender.yml)
[![OSSAR](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/ossar.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/ossar.yml)
[![OSV-Scanner](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/osv-scanner.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/osv-scanner.yml)
[![pages-build-deployment](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/pages/pages-build-deployment)
[![Scorecard supply-chain security](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/scorecards.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/scorecards.yml)

# Fit File Viewer README

Open `.fit` files and visualize their data using maps, tables, and charts. This standalone application provides an intuitive interface for exploring `.fit` file data.

![Map](electron-app/screenshots/map.png)

![Table](electron-app/screenshots/data.png)

![Charts](electron-app/screenshots/chart.png)

## How to Install

1. Download the latest release from the [Releases Page](https://github.com/Nick2bad4u/FitFileViewer/releases).
2. Extract the downloaded archive.
3. Run the executable file to launch the application.

## How to Use

1. Open the application.
2. Drag and drop a `.fit` file into the application window.
3. Explore the data using the provided maps, tables, and charts.

## Development

To set up the development environment:

```bash
rm -rf node_modules out
npm install
npm run compile
npm run package
```

To build the standalone application:

```bash
npm run build
```

## Credits

This project uses the following libraries and tools:

- [Electron](https://www.electronjs.org/) (MIT license)
- [ThomasCamminady](https://github.com/thomascamminady/fit-viewer) (MIT license)
- [Garmin FIT JavaScript SDK](https://github.com/garmin/fit-javascript-sdk) (FIT Protocol License Agreement - This project complies with the terms of the FIT Protocol License Agreement.)
- [Leaflet.js](https://leafletjs.com) (BSD-2-Clause license)
- [Vega-Lite](https://vega.github.io/vega-lite/) (BSD-3-Clause license)
- [Vega-Embed](https://github.com/vega/vega-embed) (BSD-3-Clause license)
