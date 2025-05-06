[![ActionLint](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/ActionLint.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/ActionLint.yml)
[![Build and Release Electron App](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/Build.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/Build.yml)
[![CodeQL-Advanced](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/codeql.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/codeql.yml)
[![Dependabot Updates](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependabot/dependabot-updates)
[![Dependency Review](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/dependency-review.yml)
[![Build and Release Electron App](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/Build.yml/badge.svg)](https://github.com/Nick2bad4u/FitFileViewer/actions/workflows/Build.yml)
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

![Map](electron-app/screenshots/newMap.png)

![Table](electron-app/screenshots/newData.png)

![Charts](electron-app/screenshots/newChart.png)

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
- <a href="https://www.FitFileViewer.com/" class="italic ms-2 "><img alt="HarryOnline logo" src="data:image/png;base64,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" class="ms-2 h-3 inline-block" width="14" height="12"><span> FitFileViewer.com</span></a>
- <a href="https://www.harryonline.net/" class="italic ms-2 "><img alt="HarryOnline logo" src="data:image/png;base64,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" class="ms-2 h-3 inline-block" width="14" height="12"><span> HarryOnline</span></a>
- [Garmin FIT JavaScript SDK](https://github.com/garmin/fit-javascript-sdk) (FIT Protocol License Agreement - This project complies with the terms of the FIT Protocol License Agreement.)
- [Leaflet.js](https://leafletjs.com) (BSD-2-Clause license)
- [Vega-Lite](https://vega.github.io/vega-lite/) (BSD-3-Clause license)
- [Vega-Embed](https://github.com/vega/vega-embed) (BSD-3-Clause license)
