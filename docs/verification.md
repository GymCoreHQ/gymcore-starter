# Verification status — 2026-09-30

This is a private review candidate. See [runtime report](runtime-report.md) for the precise tested matrix, commands, browser results and limitations. Official-current-version research is separate from runtime evidence: Playground's PHP builds do not equal every latest php.net patch.

## Static and package checks

- PHP and JavaScript syntax checks passed for distributable code.
- WordPress Coding Standards 3.4.1 / PHP_CodeSniffer 3.13.6 passed with no errors or warnings. Narrow documented exceptions cover WordPress asset metadata filenames and bounded/canonical metadata queries.
- Distribution allowlist, JSON versions and source-site/credential-signature scanner passed. Manual independent review covered settings/input/output, nonces/capabilities, ownership markers, public data boundaries, source provenance and archive manifests.
- Composer audit returned no advisories or abandoned packages. npm installation audit returned zero vulnerabilities after a development-only `qs` 6.16.0 override fixed three transitive moderate Playground/Express findings. No npm/composer runtime dependencies ship in the ZIPs.
- GPL text was independently checked: official GPL v2 text is bundled consistently with GPL-2.0-or-later declarations. No original-source images/fonts/logos are redistributed. Theme screenshot is generated locally from fictional example content.
- ZIPs are reproducibly generated with fixed timestamps and an explicit file policy. `dist/manifest.json` records every entry and SHA-256. The artifact directory and test data are gitignored; users can reproduce ZIPs from the source tree.

## Scope limits

The schedule tests use clearly identified synthetic contract fixtures. They do not establish compatibility with every actual GymCore release or licensed feature. WooCommerce coverage demonstrates activation/coexistence only. No commerce, booking, subscriptions, financial, entitlement, multisite or production-database certification is asserted.

The core-only theme and draft setup require no GymCore installation. The dynamic timetable is an optional schema adapter requiring the real product's published class content. Unsupported one-time/custom recurrence and exceptions are documented, not silently presented as a full booking calendar.

Applicable GymCore repository/design/WooCommerce skills, WooCommerce architecture/coding/security/testing/API/UX references, global instructions and source plugin CLAUDE instructions were reviewed. The parent supplied the canonical WordPress router, project triage, block-theme, patterns, block-development, plugin-development, directory-guideline and Playground skills; these and their relevant references were reviewed before finalization. Their deterministic detectors identify the one block theme and one custom block in this multi-package layout.

Final public release remains gated by [release-checklist.md](release-checklist.md), including fresh official directory-tool/manual reviews and the owner's explicit publication authorization. Do not infer public-readiness from a private repository or a passing smoke suite.

## Follow-up verification

See [multisite lifecycle](multisite.md), [translation readiness](translation-review.md), and [authorized canonical integration](canonical-integration.md) for the additional scoped checks and explicit remaining limits. These extend the original baseline above; they do not certify directory acceptance or full commerce/entitlement compatibility.

The authorized native MySQL follow-up also completed: Plugin Check 2.1.0 on WordPress 7.1.2 / PHP 8.5.7 / MySQL 8.4.11 selected 29 static and 5 runtime checks with early initialization and returned zero findings. This supersedes the original environment blocker; see translation-review.md for exact command, isolation, cleanup and remaining manual release gates.
