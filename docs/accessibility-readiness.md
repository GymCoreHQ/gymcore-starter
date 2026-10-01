# Accessibility review and remaining release work

Review date: 2026-10-01 (UTC). This is an engineering review, not a WCAG conformance statement or approval for WordPress.org's `accessibility-ready` tag. That tag is deliberately absent.

## Reproduce the isolated review

```sh
npm ci
npx playwright install chromium
node tests/accessibility-review.mjs
```

The default port is 9491; `GCS_TEST_PORT` overrides it. `GCS_WP_VERSION` defaults to 7.1.2. Playwright's installed Chromium is the default browser. `GCS_BROWSER_CHANNEL=chrome` selects installed Chrome; `GCS_CHROME_PATH` can select an explicit executable. The harness runs fresh WordPress/PHP-WASM with SQLite, binds to 127.0.0.1, mounts only this theme, and creates fictional content in its own disposable runtime. It does not mount or reset an existing site. It removes its runtime on ordinary completion and stores reports/screenshots in ignored `test-results/accessibility/`.

The report records actual WordPress, PHP, and browser versions, computed palette background, rendered template identifier, selected axe rule violations/incomplete checks, horizontal overflow, headings/landmarks, and keyboard focus evidence. It fails for unexpected palette, wrong template, missing/multiple main headings or main landmarks, overflow, selected axe violations, failed keyboard behavior, failed persistence, or runtime errors. `progress.json` is intermediate evidence; `report.json` is the final run.

## Coverage

Eight shipped templates: front page, posts home, index fallback, ordinary page, single post with comments, category archive, search results, and 404. A fixture-only hierarchy filter reaches index without changing source templates. A fixture-only response header proves the selected template.

Each template runs in the default dark palette and actual saved Light palette, at 1280×900 and 390×844, a 640×450 reduced-width layout, and 1280×900 with CSS zoom set to 2. The last two are **200% layout/zoom simulations**, not native Chrome zoom controls. Page and single-post fixtures include long headings, long prose, links, a disclosure, and a 324-character unbroken reference. The single-post template includes a fictional approved comment and its comment form.

Keyboard events exercise the native skip link, first tab sequence and visible focus styles, mobile navigation reached by Tab/opened with Enter, six Tab steps within its modal, Escape closing/restoring focus, and disclosure Enter/Space toggling. The skip check verifies that the next Tab starts inside main: browsers can move the sequential-focus starting point to a fragment without leaving `document.activeElement` on the main element. These are scripted keyboard checks reviewed through browser evidence, **not a human screen-reader session**.

Axe scans run with the navigation overlay closed. The open menu receives dedicated keyboard, settled-background, focus-outline width, and focus-contrast checks plus screenshots; this does not replace a full assistive-technology review.

A separate native WordPress API test creates a saved `wp_template`, retains Global Styles, switches to another installed theme and back, and compares saved template/global-styles/published-content values. This proves limited database persistence across theme reactivation. It does **not** prove interactive Site Editor saving, ZIP upgrades, migrations, or preservation across changed theme source files.

## Findings and final results

Final run began **2026-10-01T05:04:51.640Z** and exited **0**. Runtime: **WordPress 7.1.2, PHP 8.3.32 (Playground WASM/SQLite), Chrome 154.0.8037.58, Playwright 1.58.2, axe-core 4.11.1**. It includes the long-word wrapping and native Navigation overlay fixes.

| Check | Observed result |
| --- | --- |
| Eight templates × two palettes × four layout/zoom conditions | 64 conditions; 0 failed |
| Selected axe WCAG 2 A/AA, 2.1 AA, and 2.2 AA rules | 0 violations; 2 incomplete contrast checks retained below |
| Horizontal overflow, actual template identity, one main landmark and one H1 | Passed all 64 conditions |
| Dark/light × desktop/mobile scripted keyboard sessions | 4 conditions; 0 failed |
| Mobile navigation focus | Enter opens; six Tab steps stay inside; Escape closes and restores focus |
| Skip links and disclosures | Next Tab begins inside main; Enter expands and Space collapses details |
| Settled mobile menu focus outline | 3px; dark 9.29:1 and light 7.09:1 contrast against overlay |
| Native saved template / Global Styles / published content | All preserved through Twenty Twenty-Five → GymCore Starter reactivation; saved template source is `custom` |
| Front-end runtime errors | 0 |

The two incomplete axe results are `color-contrast` on the single-post `#comment` textarea at CSS zoom 2, once per palette. Axe reports that it cannot determine the background because the control is partially obscured. A separate light-mode browser inspection scrolled the textarea into view: all nine interior hit-test points resolved to the textarea, black text on white measured 21:1, and keyboard typing succeeded. No comment was submitted. The retained screenshot and `comment-inspection.json` support that narrow observation; they do not erase the automated incomplete results or establish dark-mode/native-zoom coverage for that follow-up.

Final machine evidence is `test-results/accessibility/report.json`; representative full-page, zoom, skip-focus, and settled-menu screenshots are alongside it. These ignored files are local/CI artifacts, not packaged theme content. Earlier `initial-fixture-report.json`, `before-wrap-fix-report.json`, and `before-overlay-fix-report.json` are historical debugging evidence and must not be presented as the final run. Visual review sampled the homepage, long-content page, menu, and comment control; the DOM/axe matrix covers all eight templates.

An initial hyphenated reference wrapped at natural break opportunities; the stronger unbroken reference exposed page/single horizontal overflow. The theme now applies `overflow-wrap:anywhere` to `.wp-block-post-content` alongside its existing title wrapping. This preserves content instead of hiding overflow. The core Navigation overlay initially used its default light surface while the dark theme retained a light-blue focus outline. The header now assigns native `overlayBackgroundColor: base` and `overlayTextColor: contrast` attributes, and the harness checks the settled overlay background plus at least a 2px outline with 3:1 contrast.

The first fixture attempted to save Light styles without an administrator context, so the theme taxonomy was not associated with the new Global Styles post. Those preliminary “light” captures actually used dark colors and are excluded from Light coverage. The corrected fixture creates the native styles record as the disposable administrator and asserts the computed background before every scan.

## Remaining manual checks before an accessibility-ready claim

- Use real screen readers, at least VoiceOver/Safari and NVDA/Firefox or Chrome, to inspect landmarks, headings, navigation names/states, focus movement, search and comment forms, validation/errors, and reading order on all templates. No actual screen reader was used in this review.
- Use native browser zoom at 200% and 400%, 320 CSS-pixel reflow, text-only resize, and WCAG text-spacing overrides. CSS zoom/reduced viewport evidence is a useful regression check, not a replacement for these interactions.
- Manually inspect keyboard behavior in Safari and Firefox, reverse-Tab, customized multi-level navigation, touch targets, forced-colors/high-contrast modes, user-added logo/media alt text, pagination, no-result search, protected posts, and third-party form/integration blocks. The supplied default navigation contains only Home.
- A subsequent [actual Site Editor and ZIP upgrade check](editor-upgrade-readiness.md) covers a saved heading and Light styles on a synthetic prior version. Broader controls and actual historical-release migrations remain pending; the original API persistence result alone does not establish them.
- Review the final published content and plugin combinations. Editors can change contrast, headings, labels, links, navigation, and media; author choices can invalidate theme-default results.
- Provide the required public accessibility statement and complete the current WordPress accessibility-ready review before adding its tag. Automated zero findings do not establish WCAG conformance.

## Official guidance consulted

Checked 2026-10-01:

- [WordPress accessibility-ready requirements](https://make.wordpress.org/themes/handbook/review/accessibility/required/) — keyboard, semantics, names/labels, contrast, resizing, and other release criteria.
- [W3C understanding resize text, SC 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) — text enlargement to 200% without loss of content/functionality.
- [W3C understanding reflow, SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — distinguish viewport reflow from other magnification checks.

## Linux Chromium CI follow-up

The first remote run on Chromium **145.0.7632.6** found four archive overflow conditions (mobile and CSS zoom 200%, both palettes), while all keyboard and axe checks passed. This differs from the local Chrome 154 result above. The archive's native Query Title was omitted from the existing long-title wrapping rule. The candidate now includes `.wp-block-query-title` in that rule and emits overflowing element details on test failure. The complete CI matrix must pass on the corrected head before review readiness; no overflow assertion was removed or relaxed.
