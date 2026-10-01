# Publication audit

Checked 2026-10-01 UTC against committed starter baseline `b69040f42013586dac004dccf42fd850dd511e46`, then independently rechecked the corrected working-tree packages below. The history audit covers that committed baseline; the later package audit includes the two readme corrections before commit. This reviewer inspected the new native-directory reports but did not execute their runtime run. This is not directory approval. Publication intent has been expressed; the destination and submitting account remain to be resolved. No upload, visibility change, account action or publication occurred.

## Official requirements refreshed

- [Theme requirements](https://make.wordpress.org/themes/handbook/review/required/): GPL-compatible resources with attribution, presentation-only functionality, valid block-theme files, keyboard access/focus/skip navigation, accurate metadata, and permitted onboarding. Only WordPress.org-hosted plugins may be recommended. The accessibility-ready tag adds requirements; baseline accessibility rules apply without that tag.
- [Plugin guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/): secure, readable, GPL-compatible source; truthful functionality and dependencies; no unsolicited tracking or remote executable code; respect ownership and marks.
- [Readme requirements](https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/): real contributor usernames, matching version/stable tag, concise description, descriptive tags, and accurate compatibility. Core reads minimum WP/PHP requirements from the main plugin header. `Tested up to: 7.1` represents the tested 7.1.2 release.
- [Plugin assets](https://developer.wordpress.org/plugins/wordpress-org/plugin-assets/): display icons, banners and screenshots are optional directory artwork, separate from runtime packages. Their absence does not block this initial submission.
- [Naming/account FAQ](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/): brand-first naming and submitting-account authority need resolution. A previous information-API 404 is not a reservation or permission to use a mark.
- [WordPress download](https://wordpress.org/download/) still offers **7.1.2**; [WooCommerce](https://wordpress.org/plugins/woocommerce/) still lists **11.1.2**, WP 7.0+/PHP 7.4+. This starter declares PHP 8.3+, independently of WooCommerce's lower minimum. Existing reports retain their exact tested PHP patches; no new patch-level compatibility claim is made here.

All linked pages above were opened on this audit date. Installed `wp-block-themes` and `wp-plugin-development` skills and repository instructions informed the review.

## Original baseline package evidence

| ZIP at this baseline | Files | SHA-256 |
| --- | ---: | --- |
| `gymcore-starter-0.1.0.zip` | 29 | `3ec0fcc09f3e8663b51094e31371deba86084f8f8edf0817e81d0481af761f73` |
| `gymcore-starter-kit-0.1.0.zip` | 12 | `c1618da9380db4b45eefc3d7bc55ce592a3f6131d3aa7ce1b4fde9535315fbdb` |

Independently recomputed hashes, matched every archive member to `dist/manifest.json`, checked ZIP CRCs, and compared every member byte-for-byte with `git show HEAD:<source path>`. All matched. These hashes cease to describe the final candidate if a readme or other packaged file changes; rebuild and recheck then.

## Corrected candidate package evidence

The parent subsequently corrected the theme's private-plugin mention and translation-review wording, and the plugin's 104-site test scope. Independently reviewed the exact readme diff, recomputed the following ZIP hashes, verified their manifest hashes and complete member lists, checked CRCs, and compared every member against the current working-tree source. All matched; these are working-tree comparisons, not a claim of committed-head equality.

| Corrected ZIP | Files | SHA-256 |
| --- | ---: | --- |
| `gymcore-starter-0.1.0.zip` | 29 | `9d3ccda89e72988c46ffee8cd269ba254992c7174c60aaad8cd557627ef7ff10` |
| `gymcore-starter-kit-0.1.0.zip` | 12 | `37b186f4ba78dbb9a1a27256aa2feb3452f4a40e0f492184f65556e2f0fd78e8` |

The newly inspected `test-results/directory-native/report.json` names these exact hashes and records completed MySQL execution, both exits 0, zero plugin errors, one unsuppressed loader warning and one Theme Check INFO. `enabled-checks.json` lists 29 static and five runtime checks, early CLI initialization, WordPress 7.1.2, PHP 8.5.7, MySQL 8.4.11, Plugin Check 2.1.0 and Theme Check 20260901. The report confirms removal of its own `gcs-release-check-9uj8p4sl` container and scratch; `runtime-cleanup.json` records no temporary `gcsr_` tables and no cache drop-in. These are independently inspected runner records, not a separate Docker inspection by this reviewer.

Both packages declare version 0.1.0, WP 7.0, PHP 8.3, GPLv2-or-later, and their matching slug/text domain. The plugin stable tag is 0.1.0 and has three descriptive tags. Both use the previously verified contributor `slash1andy`; the [public profile](https://profiles.wordpress.org/slash1andy/) links that GitHub identity, but authenticated submission access is separate. No false required WooCommerce or GymCore dependency is declared.

Resource inventory: original PHP/JS/CSS, block/theme JSON, templates, patterns, plain-text readmes, GPL LICENSE, extraction POT files, and one theme screenshot. The screenshot is the previously visually reviewed 1200×900 fictional Example Academy rendering. There are no bundled customer media, fonts, runtime third-party libraries or GymCore product binaries. System fonts and WordPress-provided editor packages are used. POT translator/team placeholders are template metadata, not real contacts. The three LICENSE files match GPL v2 text (SHA-256 `edaef632cbb643e4e7a221717a6c441a4c1a7c918e6e4d56debc3d8739b233f6`); headers permit later versions. The [source audit](source-audit.md) records excluded assets and separately obtained dependency provenance. License text matching does not independently establish authorship rights.

## Translation-loader warning disposition

The existing exact-package native report records 29 static plus five runtime Plugin Check checks, zero errors and one unsuppressed `load_plugin_textdomainFound` warning. Theme Check reports one informational matching-domain notice. These are existing runtime results, not rerun by this audit.

Keep the plugin's `init`-priority-0 custom catalog registration and `/languages` metadata. The [official function reference](https://developer.wordpress.org/reference/functions/load_plugin_textdomain/) does **not** deprecate the function: its current implementation registers a custom path for just-in-time translation loading; its deprecated second argument is correctly passed `false`. The [internationalization handbook](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) still documents this API on `init` and explains why directory-hosted language packs usually need no manual call. Existing private PHP/JS catalog tests establish the intended fallback behavior.

Disposition: explained warning retained, no suppression or functionality removal. Do not report “zero findings,” imply directory acceptance, or replace it with internal registry access merely to evade the checker. If a reviewer requests a change, preserve directory-pack behavior and private PHP/JS catalogs, including multisite, and rerun focused locale checks. The warning alone is not documented as an automatic rejection.

## Repository-history disclosure review

The checkout was initially shallow. An authorized fetch of **this starter repository only** completed, and `git rev-parse --is-shallow-repository` became `false`. All locally reachable refs contain 13 commits and 158 distinct file blobs. No upstream HMA/GymCore history was fetched. The oldest starter commits are the initial repository and sanitized implementation; the only binary path across those revisions is the fictional theme screenshot.

A scan of all 158 blobs found no AWS access-key, GitHub-token, private-key, or live-payment-secret signatures. Contact-pattern hits were dependency-author metadata in `composer.lock` and POT placeholders. This bounded heuristic plus source inspection is not proof against every possible secret or data type. Git author/committer attribution also becomes public with repository visibility and is separate from install ZIP contents. GitHub-hosted issue/PR discussions, artifacts and settings are outside this local Git audit.

**Private-context disclosure exists:** README and provenance/integration/release documents name the source project, private source paths, source commit hashes, upstream integration behavior and licensing discrepancies. `tools/audit.py` names prohibited source/provider patterns. These are audit evidence and development context, not discovered passwords, member records or copied production databases. They are excluded from installable ZIPs. Making GitHub public would expose these documents and historical versions. Owner acceptance of that disclosure is distinct from a secrets scan. Deleting current text would not remove earlier revisions. Do not rewrite or purge history without explicit coordination; WordPress.org ZIP submission does not require publishing this history.

## Scoped corrections and remaining decisions

1. **Theme directory — corrected:** the packaged-readme sentence describing the optional private starter plugin was removed. Separate repository integration guidance remains. This avoids ambiguity under the actual plugin-recommendation rule without removing features.
2. **Truthful readmes — corrected:** the plugin now states the actual 104-site fixture scope and retains untested routing/database/network qualifications; the theme makes translation review conditional on shipping translations. Adjust “private review candidate” only when the release destination/state is actually decided. These are documentation corrections, not new runtime capabilities.
3. **Owner decisions:** resolve WordPress.org versus public GitHub versus both; submitting account/access; name/mark authority and final artifact/provenance acceptance. For public GitHub, resolve the history disclosure above and separately inspect hosted discussions/artifacts. No repeat authorization is needed for ordinary private preparation.
4. **Final verification:** record new native-zoom/screen-reader work with its actual scope when available; do not claim human certification or accessibility-ready status. After packaged edits, rebuild, rehash, scan, and run affected directory checks on those bytes. Directory reviewers still control acceptance.

No new historical migration, paid-module entitlement, live gateway, translated-language pack or optional artwork is required merely to ship this initial English starter within its existing advertised scope. Do not broaden claims without the corresponding evidence. The mandatory security, ownership, metadata and accessibility rules remain in force.
