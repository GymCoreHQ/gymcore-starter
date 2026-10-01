# Site Editor and theme upgrade acceptance

The isolated browser acceptance test exercises actual WordPress Site Editor saves and the standard administrator theme ZIP replacement flow. It does not write template or Global Styles customizations through PHP, REST helpers, or editor-store dispatches.

## Verified flow

1. Install and activate a synthetic previous theme ZIP (version 0.0.9) on a new fictional single-site Playground instance.
2. Open the front-page template in the Site Editor, replace its heading with “Example editor customization survives upgrades,” and save using the editor toolbar.
3. Select the bundled Light style variation and save through the Custom Styles confirmation dialog.
4. Reload the Site Editor and visit the frontend, verifying the saved heading and white Light background.
5. Use Appearance → Add Themes → Upload Theme, select the current installable ZIP, verify the 0.0.9 → 0.1.0 comparison, and choose “Replace installed with uploaded.”
6. Verify the success screen, theme version, unchanged native template and Global Styles IDs/content hashes, unchanged original published page content, and all 29 installed theme files against the uploaded ZIP.
7. Reload the Site Editor and frontend again and verify the saved heading and Light styling survive replacement.

The test contains 15 assertions. Browser JavaScript exceptions fail the test. Browser, server, and disposable-directory cleanup are attempted independently; any cleanup error also fails the test.

## Recorded baseline local result

Passed **15/15** assertions on 2026-10-01T05:48:16.743Z (process exit 0), with zero browser JavaScript exceptions and zero cleanup errors. Runtime: WordPress 7.1.2, PHP 8.3.32, Chrome 154.0.8037.58, Playwright 1.58.2, Playground CLI 3.1.52. CI bundled Chromium remains a separate execution result.

- Tested theme ZIP SHA-256: `3ec0fcc09f3e8663b51094e31371deba86084f8f8edf0817e81d0481af761f73` (29 files).
- Test harness SHA-256: `10fed75fc6133f23baf12278794e7f4f7e6d79ac2ee086a5890d1ad675358ae8`.
- Template record ID 7 and Global Styles record ID 6 retained identical content hashes before and after the upgrade.
- Original published page content remained unchanged; every installed theme file matched the uploaded package.

## Reproduce

```sh
npm ci
python3 tools/package.py
npx playwright install chromium
node tests/editor-upgrade.mjs
```

The default listener is restricted to loopback port 9497; use `GCS_TEST_PORT` to choose another isolated port. The runner uses bundled Playwright Chromium by default. `GCS_BROWSER_CHANNEL=chrome` optionally selects an installed Chrome for local acceptance. `GCS_WP_VERSION` selects the WordPress version, defaulting to 7.1.2; PHP is 8.3.

Ignored evidence is written to `test-results/editor-upgrade/report.json` and six screenshots: `editor-before-upgrade.png`, `front-before-upgrade.png`, `upgrade-confirmation.png`, `upgrade-success.png`, `editor-after-upgrade.png`, and `front-after-upgrade.png`. The report records package hashes, native record IDs/hashes, browser/runtime versions, UI-generated REST route statuses, and cleanup errors. No credentials or request headers are included in that report.

## Boundaries

The synthetic previous package changes only the current theme’s version header to 0.0.9. This proves preservation through WordPress’s normal package replacement mechanism; it does not represent an actual published historical release or establish compatibility with hypothetical older template schemas.

This is single-site English WordPress Playground with PHP-WASM/SQLite. It does not cover native PHP/MySQL, multisite, remote automatic updates, failed-upgrade rollback, child themes, or third-party editor extensions. UI coverage is one front-page heading and one bundled Global Styles variation, not every template and editor control. Selecting Light demonstrates that saved Global Styles render after reload; the native saved record’s exact content hash provides the preservation assertion.

Only disposable package copies are mounted. PHP initializes the fictional site and performs read-only verification after UI edits; the actual customizations and replacement use browser controls. No existing site, database, production credentials, or source theme mount is used.

## CI save readiness investigation

The Linux run `36943084544` against commit `3ef4d36ec624fc2826aca3f441dd3f537abd072c` failed at the initial toolbar Save locator after 30 seconds. Its report recorded only the installation assertion, no browser JavaScript exceptions, and no template REST write. The log does not establish whether the toolbar was still mounting, absent, or exposed under another accessible name. This failure is not an editor-save acceptance pass.

The runner now waits separately for the initial Editor top bar and its Save button to be visible before editing the heading, each bounded at 120 seconds like initial canvas readiness. It still performs the same actual UI edits, save confirmation, reload, native ZIP replacement, and all 15 acceptance assertions. It does not substitute a REST/PHP write or another locator for the required Save control.

On failure in the fictional Site Editor, the printed report includes the failure phase, up to 20,000 characters of the document ARIA snapshot, and bounded visible button/region/frame state. These read-only diagnostics help distinguish hydration from a changed accessible name in CI without requiring downloaded screenshots; no request headers, cookies, or personal browser profiles are captured. Screenshot and independent cleanup behavior remain in place.

`node --check tests/editor-upgrade.mjs` passed. A local Chromium 145 replay could initialize the isolated fixture on port 9497 but the browser process closed at launch before any editor interaction; it therefore neither reproduces nor resolves the Linux Save failure. A new Linux CI run remains necessary to validate the readiness change or obtain the added diagnostics. The earlier baseline result above does not certify this revised harness.

The revised harness then passed all 15 assertions in a fresh installed-Chrome 154.0.8037.58 replay at 2026-10-01T23:58:02.516Z (WordPress 7.1.2, PHP 8.3.32, exit 0, no cleanup errors). The local pass does not settle the Linux-specific failure; CI remains the next verification.
