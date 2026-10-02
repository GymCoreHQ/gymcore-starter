# Native browser zoom acceptance

**Passed 16/16 conditions** on 2026-10-01T15:10:59.910Z, process exit 0, with zero browser/runtime errors and zero cleanup errors. Tested WordPress 7.1.2, PHP 8.3.32, Playwright 1.58.2, and official Chromium/Chrome for Testing **145.0.7632.6** on macOS ARM64.

This closes the representative native browser-engine zoom gap left by the earlier [manual accessibility review](manual-accessibility-review.md). It is API-controlled browser page zoom in a disposable profile, not CSS zoom, a viewport-only simulation, a human browser-menu session, or screen-reader testing.

## Evidence

`tests/native-zoom.mjs` creates a fresh loopback WordPress fixture and an isolated Chromium persistent profile. A temporary Manifest V3 extension is restricted to the loopback host. Its service worker calls `chrome.tabs.setZoom` and independently reads `chrome.tabs.getZoom` after navigation. No existing browser profile, personal settings, security preferences, or production site is used.

| Requested page zoom | Browser-reported factor | CSS viewport width | Device-pixel ratio | CSS `zoom` |
| --- | --- | --- | --- | --- |
| Baseline | 1 (default profile) | 1280px | 1 | 1 |
| 200% | 2 | 640px | 2 | 1 |
| 400% | 3.9999999999999996 | 320px | 4 | 1 |

The factor assertion permits only a 0.0001 floating-point tolerance. Independent viewport and device-pixel-ratio checks verify that native zoom took effect; no CSS zoom is applied.

Both dark and Light palettes were tested at both zoom levels across the front page, long-content page, category archive, and single post with comments: **2 × 2 × 4 = 16 conditions**. All had document width equal to the viewport width, including long unbroken fictional content and the category heading. Every condition verified that the first Tab reached Skip to content and that activating it moved the next keyboard stop into main content.

At 400%, the responsive menu was reached using Tab, opened with Enter, contained forward/reverse Tab focus, and returned focus to its opener after Escape in both palettes. At both zoom levels, comment controls were reached using keyboard events, a fictional draft was typed, Post Comment was reached, and submitting with missing required details returned focus to Name. No comment was submitted.

An agent visually inspected representative 200%/400% screenshots of the front page, menu focus, and comment field. Text and focus outlines were legible in the sampled regions; controls remained visible through native scrolling. This is a representative agent visual review, not an exhaustive manual certification.

## Reproduce

```sh
npm ci
npx playwright install chromium
node tests/native-zoom.mjs
```

Default loopback port: 9499 (`GCS_TEST_PORT` override). Optional `GCS_CHROMIUM_PATH` selects an explicitly supplied Chromium executable; it does not reuse that browser’s profile. Default execution uses Playwright’s bundled Chromium channel, which supports the documented extension-loading flow.

The local installer’s Node archive extraction stalled. The already downloaded official ZIP was preserved and extracted with macOS `ditto` into a separate disposable directory; the test then used `GCS_CHROMIUM_PATH` to that executable. Download source: `https://cdn.playwright.dev/builds/cft/145.0.7632.6/mac-arm64/chrome-mac-arm64.zip`; downloaded archive SHA-256: `3dbf04e28a02079148e9c7417840a0c1d3903361eceeee7e7eb59ef77021bdb2`.

Ignored evidence is stored in `test-results/native-zoom/report.json` and palette/zoom/template screenshots. Viewport screenshots use DevTools `Page.captureScreenshot` with `fromSurface:false`, which preserves the zoomed browser view. Initial Playwright full-page captures clipped native-zoom content; those were replaced by a complete passing replay using the corrected capture method. CDP is used only for screenshots, not to set zoom.

Tested harness SHA-256: `d8264f5652496f37f140975389eff6ccfc454b5c41d0cde1a62cd04d43b45120`.

## Scope and remaining limits

This establishes representative native Chromium engine zoom, reflow, and keyboard operability. It does not establish browser-menu keyboard shortcuts, Firefox/Safari behavior, OS display magnification, assistive-technology speech, or every Site Editor/WooCommerce/third-party control. Human and screen-reader review remain separate criteria. The fixture uses Playground PHP-WASM/SQLite, English fictional content, and default theme controls.

Implementation follows the official [Chrome Tabs zoom API](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom) and [Playwright extension testing guidance](https://playwright.dev/docs/chrome-extensions), consulted 2026-10-01. The latter requires a persistent Chromium context and documents the Chromium channel for headless extension testing.
