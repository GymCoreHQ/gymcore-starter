# Agent visual and keyboard accessibility review

Reviewed 2026-10-01 on an isolated fictional WordPress 7.1.2/PHP 8.3.32 Playground site, Chrome 154.0.8037.58, Playwright 1.58.2, loopback port 9499. This is an **agent-directed visual review of rendered screenshots and actual browser keyboard events**. It is not a human accessibility audit, screen-reader session, or accessibility certification.

No application defect was identified within this representative scope. This supplements the broader automated matrix in [accessibility-readiness.md](accessibility-readiness.md); it does not convert automated coverage into human testing.

## Observations

| Representative check | Method and observed result |
| --- | --- |
| Desktop front-page focus order | Tab reached Skip to content, site title, Home, Explore the programs, the three FAQ summaries, then Plan your visit. Visible 3px focus outlines were inspected. No positive-tabindex ordering or unexpected jump was observed in this path. |
| Skip link | Tab, Enter, Tab moved into the main content and reached Explore the programs. The focused skip link was visible at the top of the page. |
| FAQ disclosure | Reached the first summary using Tab, expanded with Enter, and collapsed with Space. The expanded answer and summary outline were visually inspected. |
| Mobile navigation dialog | At 390px, Tab reached Open menu; Enter opened it and focused Home. Repeated Tab cycled Home/Close menu, Shift+Tab traversed backward, and Escape closed the dialog and returned focus to Open menu. The focused Home outline was visually clear. |
| Search form | On the 404 page, Tab reached the search input; typed Accessibility using keyboard events and pressed Enter. The resulting URL was `/?s=Accessibility`, with heading “Search results for: ‘Accessibility’.” |
| Comment form | On the fictional single post, keyboard traversal reached comment, Name, Email, Website, consent checkbox, and Post Comment in order. Typed a fictional draft, toggled the checkbox with Space, and activated submit with Enter while required fields were empty. Browser validation returned focus to Name; no comment was submitted. Labels, required markers, input contrast, and focused Name were visually inspected. This does not establish screen-reader announcement quality. |
| Narrow reflow | At a 320px viewport, both dark and Light front pages had `scrollWidth === innerWidth === 320`. Full-page screenshots showed wrapped headings, stacked program columns, readable paragraphs, and visible CTAs without clipped content. This is viewport reflow, not browser zoom. |
| Light mobile focus | At 320px, the menu opened with Enter; focused Home had a visible blue 3px outline against white. Escape returned focus to Open menu. |
| Reduced motion | Browser media preference was set to `reduce`; the page reported the matching media query, `scroll-behavior: auto`, and zero active animations at the sampled settled front-page state. Navigation remained operable. No animation-heavy third-party content was present. |
| RTL interaction simulation | Set the current page’s HTML direction to RTL and added the body RTL class, keeping English fictional content. At 320px the menu opened with Enter, Tab reached Close menu, Escape restored Open menu focus, and document width remained 320px. This checks direction-sensitive interaction only; it does not replace the separately recorded official Arabic locale tests or a linguistic review. |
| Content and image alternatives | The starter’s heading hierarchy and visible CTA/disclosure wording were understandable in context. Copy explicitly asks site owners to replace fictional starter text. No images were present in the sampled front page, so meaningful editorial alt-text quality for future uploaded images remains untested. |

The menu screenshots capture a viewport-height overlay. A full-page screenshot may include underlying document content below that viewport; this is not evidence that the open menu exposes those lower controls to keyboard focus.

## Contrast spot checks

Computed colors were captured from the actual focused elements and rendered page, then compared using the WCAG relative-luminance formula. These are representative solid-color pairs, not a claim covering arbitrary user customizations.

| Pair | Ratio |
| --- | --- |
| Dark text `#f5f7fc` on `#10151f` | 17.05:1 |
| Dark focus `#91baff` against `#10151f` | 9.29:1 |
| Light focus `#224dc8` against white | 7.09:1 |
| White button text on `#224dc8` | 7.09:1 |
| Black comment-entry text on white | 21:1 |

The comment-field text was also visually inspected after typing; this supplements the automated contrast checks that marked empty textareas as requiring review.

## Evidence and reproduction

Ignored local evidence is in `test-results/manual-accessibility/`: `evidence.json` records executed keyboard sequences and observed focus/DOM values; screenshots include `desktop-skip.png`, `desktop-cta-focus.png`, `desktop-details-open.png`, `mobile-menu-focus.png`, `search-focus.png`, `comment-focus.png`, `comment-validation.png`, `dark-320.png`, `light-320.png`, `light-menu.png`, and `rtl-simulation-menu.png`. An isolated interactive runner (`session.mjs`) and unsuccessful native-zoom experiment (`zoom.mjs`, `zoom-extension/`) are retained there as local evidence, not production code or CI tests.

For a repeat review, initialize a new Playground instance with `tests/accessibility-fixture.php`, using a disposable theme mount and a unique loopback port. Open the routes emitted by that fixture. Follow the keyboard paths in the table without mouse clicks or programmatic focus assignment; capture each focused state. Select the Light variation in the disposable fixture, set browser reduced-motion emulation, and repeat at 320px/390px. Inspect screenshots and focus values together. Existing automated regression coverage remains in `tests/accessibility-review.mjs`; duplicating it as another CI matrix was unnecessary for this bounded exploratory review.

## Native zoom experiment and remaining limits

A bounded experiment attempted a new disposable Chromium persistent profile and local-only Manifest V3 extension using `chrome.tabs.setZoom`/`getZoom`, following the official [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom) and [Playwright extension guidance](https://playwright.dev/docs/chrome-extensions) (consulted 2026-10-01). The installed Chrome cannot use that documented extension-loading path; bundled Chromium was absent. An isolated download under `/tmp` reached completion of the download but did not finish installation within the bounded experiment. A single launch found the framework missing from the incomplete installation. The installer was stopped. **No native browser zoom result is claimed.** Previous CSS-zoom and viewport simulations remain distinct evidence.

Remaining acceptance requires a human keyboard/visual review, actual screen-reader testing (including form errors, dialog announcements, and reading order), and native browser UI/engine zoom testing at 200%/400%. This review does not cover every template/control, keyboard-only Site Editor dialogs, WooCommerce checkout, arbitrary third-party forms, multilingual comprehension, operating-system high-contrast settings, or all browser/assistive-technology combinations. Separate tests may cover parts of those areas without replacing those remaining human checks.
