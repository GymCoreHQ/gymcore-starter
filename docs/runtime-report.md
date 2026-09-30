# Runtime verification — 2026-09-30

Tests run against fresh WordPress Playground CLI 3.1.52 instances with its SQLite integration and WebAssembly PHP. All databases and runtime caches were isolated in disposable workspace directories. Only this starter's theme/plugin sources were mounted; no existing WordPress site, production credentials, HMA data, or licensed GymCore product was loaded.

| WordPress reported by runtime | PHP reported by runtime | WooCommerce | Checks | Result |
| --- | --- | --- | --- | --- |
| 7.0.6 | 8.3.32 | absent | 49 | Pass |
| 7.1.2 | 8.3.32 | absent | 57 | Pass, including actual uninstall entrypoint |
| 7.1.2 | 8.5.8 | absent | 49 | Pass |
| 7.1.2 | 8.3.32 | 11.1.2 official package | 51 | Pass: activation and coexistence only |

Each row ran fresh instances with `EMPTY_TRASH_DAYS=30` and `0`. Requesting Playground `--wp=7.0` resolved to **7.0.6**, not 7.0.0. No separate Gutenberg plugin was installed; editor coverage uses WordPress's bundled editor. This is a finite smoke matrix, not verification on every WordPress/PHP combination or a MySQL/MariaDB production host.

## Covered behavior

- Theme and plugin activate; activation creates no pages.
- Metadata registers the dynamic schedule block; missing GymCore shows an unavailable state.
- Anonymous and subscriber users cannot import or reset; administrators can create four draft pages.
- Import is idempotent. Reset preserves published, unrelated, and ownership-mismatched pages, trashes only owned drafts, is idempotent, and retains the manifest to avoid repeat-import duplicates.
- Trash disabled: reset refuses permanent deletion and preserves drafts.
- Explicit **contract fixtures** for GymCore's public class schema exercise active/published/weekly/valid-time/password visibility, day and taxonomy filters, truthful counts/empty states, and raw malicious-title escaping. Fixtures are not a replacement for testing the actual licensed GymCore product and do not bypass entitlements.
- PHP block parser/serializer round-trip.
- Actual Chromium browser smoke at 1200×900 and 390×844, native mobile menu open/Escape close, horizontal overflow detection, front-end JavaScript errors, axe-core WCAG 2 A/AA and 2.1 AA smoke.
- Authenticated import request missing nonce receives HTTP 403. Actual Gutenberg `wp.blocks.createBlock`, serialize and parse preserve schedule attributes and report a valid block.

## Browser and review-tool results

Final run used Chrome **154.0.8037.58**, Playwright **1.58.2**, and axe-core **4.11.1**. Both viewports passed with zero selected-rule axe violations, no horizontal overflow, no front-end JavaScript errors, and one visible native Home link. Mobile navigation opened and closed with Escape. Missing-nonce import returned 403; actual Gutenberg editor block serialization was valid and preserved `day` and `programId`. The screenshot was regenerated at 1200×900 from the final padded header/footer with fictional Example Academy branding.

An initial desktop list-structure finding was traced to the native page-list fallback nesting a `ul` directly within a `ul`. An explicit native Home Link block avoids the problematic fallback while leaving navigation fully editable in the Site Editor. The final rerun passed.

**Official Theme Check 20260901 passed.** Its only remaining message is informational: the sole text domain is `gymcore-starter`, matching the theme slug. It initially required the `Tested up to` style header; this was corrected and rechecked.

**Official Plugin Check 2.1.0 is not a passing result.** Its runtime preparation attempted `wp_pc_*` database table cloning and failed on Playground SQLite (`Could not insert post into the database`). A safe static-only retry hit PHP-WASM `RuntimeError: unreachable`; the stalled disposable process was stopped. Full PCP must run on native PHP and MySQL/MariaDB before directory submission. The reusable optional directory helper now runs Theme Check only and explicitly reports PCP as not run, rather than repeatedly invoking an incompatible runtime.

Official tool sources downloaded on 2026-09-30: [Theme Check](https://wordpress.org/plugins/theme-check/) and [Plugin Check](https://wordpress.org/plugins/plugin-check/). Successful machine-readable matrix/browser/Theme Check results are retained under ignored `test-results/`; the report above is the versioned summary.

## Reproduction

```sh
npm ci
npm run test:wordpress
GCS_WP_VERSION=7.0 GCS_PHP_VERSION=8.3 npm run test:wordpress
GCS_WP_VERSION=7.1.2 GCS_PHP_VERSION=8.5 npm run test:wordpress
GCS_WOO_TESTS=1 npm run test:wordpress
npx playwright install chromium
GCS_BROWSER_TESTS=1 npm run test:wordpress
```

On a workstation with installed Chrome, `GCS_BROWSER_CHANNEL=chrome` uses that browser. CI can omit the channel and use Playwright's installed Chromium. `GCS_SCREENSHOT=1` regenerates the theme's 1200×900 screenshot from the disposable fictional example site. `GCS_TRASH_MODES=30` limits a follow-up browser run to one instance. `GCS_TEST_PORT` overrides the default local port 9483. The optional `GCS_REVIEW_TOOLS_PATH` points to a directory containing the unpacked official `theme-check` plugin folder and runs Theme Check. PCP is deliberately excluded after the limitations recorded above. Network access is needed for official runtime/plugin downloads; browser launch and local listening need appropriate executor permissions.

Machine-readable outputs are written under ignored `test-results/`. The harness redirects Playground's process-local cache base to its disposable directory without changing `HOME`; it removes that directory on ordinary completion. It does not run against or reset any existing site.

## Remaining release gates

Actual authorized GymCore integration, licensed capabilities/entitlements, real WooCommerce product/cart/checkout/order/payment flows, MySQL/MariaDB, multisite, screen-reader/manual keyboard coverage of all templates, translated/RTL content, full native Plugin Check, and final Theme/Plugin Directory review remain separate gates. Axe smoke does not establish WCAG conformance. WooCommerce activation/coexistence is not payment or commerce certification. The final WP7.1.2/PHP8.3.32 run exercises the actual uninstall entrypoint twice: default retains options/manifest/content; opt-in removes starter options only and preserves content. Earlier minimum/PHP8.5/WooCommerce matrix runs predate those four additional assertions and retain their precise 49/51 counts.

## CI portability correction

The first remote run passed WordPress assertions but could not find Playwright Chromium because the isolated Playground homedir also changed the browser-cache lookup. The harness now resolves Playwright before changing the process-local Playground cache base. No system HOME setting is changed. CI uses the official checkout v7.0.1 commit pin and cancels superseded branch runs; final remote outcomes are reported with the PR.
