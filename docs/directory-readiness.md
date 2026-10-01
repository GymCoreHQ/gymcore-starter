# Directory verification for the release-readiness branch

This report concerns a private review candidate. Automated tool passes do not authorize publication or guarantee WordPress.org acceptance. Submission-day official requirements and manual review still apply.

## Exact minimum WordPress archive

On 2026-10-01, `node tests/directory-native-minimum.mjs` ran the existing core integration suite against the exact official `https://wordpress.org/wordpress-7.0.zip` archive. The runtime reported **WordPress 7.0 / PHP 8.3.32**, with **29/29 assertions** using Trash enabled and **28/28** with Trash disabled. The 57 checks cover activation, default no-content behavior, block metadata, optional-dependency fallback, importer/reset capabilities and ownership, schedule contract filtering/escaping/counts, serialization and uninstall preservation.

The archive URL is deliberate: Playground's `wp: '7.0'` resolves to the latest maintenance version in that branch, which is not an exact 7.0 baseline. The wrapper asserts the actual reported version and binds the disposable listener to **127.0.0.1:9496**. It calls the existing test runner without altering application code and retains `test-results/directory-exact-minimum.json`. The schedule schema in this test is an explicitly synthetic contract fixture, not the GymCore product or entitlement evidence.

This establishes the WordPress 7.0 baseline with PHP **8.3.32**, not PHP 8.3.0. It does not establish every PHP 8.3 patch, native database parity, commerce or browser behavior on that baseline.

## Repeatable native directory checks

`python3 tests/directory-native.py` requires an already-authorized Docker daemon and the approved official MySQL image, native PHP, official WP-CLI, and cached WordPress/Theme Check/Plugin Check sources. It does not install Docker or alter existing resources. Optional `GCS_NATIVE_PHP`, `GCS_WP_CLI_PHAR`, `GCS_WORDPRESS_CACHE` and `GCS_CHECK_TOOLS` select the local tools/cache paths.

The harness verifies each packaged ZIP member against current source before installation; creates a new `gcs-release-check-*` scratch directory and uniquely named container; uses **127.0.0.1:19494**, a **1 GiB database tmpfs**, and generated disposable credentials; and copies only WordPress core and official checker sources. It never copies an existing wp-config.php or database. WordPress outbound HTTP/email and automatic cron are disabled. The installable packages are extracted from their final ZIPs, not loaded from a live site.

Plugin Check is initialized early through its `cli.php`. A read-only observer records the selected checks and runtime versions. The PHP error mask excludes only `E_DEPRECATED` dependency notices; no Plugin Check result filters or check exclusions are applied. Theme Check runs through its official CLI command. Sanitized reports stay under ignored `test-results/directory-native/`. The finally block removes only the task-owned container and scratch tree, including generated credentials.

The final recovered native MySQL result at the end of this report supersedes earlier startup blockers and package snapshots. Earlier attempts below are retained as chronology.

## Initial failed MySQL attempt (cleanup resolved)

The first repeat attempt on 2026-10-01 did **not reach WordPress installation or official checks**: Docker startup timed out after 120 seconds. A scoped inspection briefly reported the task container `gcs-release-check-dzhpxeqi` running/starting; the Docker socket subsequently disappeared. An immediate request to remove only that task container failed because the daemon was unavailable. The generated scratch directory and local credential file were removed. After executor/Docker recovery, the exited task container was independently identified and `docker rm --volumes gcs-release-check-dzhpxeqi` succeeded. The initial cleanup blocker is resolved. No existing containers, databases or volumes were modified. This attempt is not a check pass or a package certification.

## Native fallback results and explained warning

With Docker unstable, `GCS_NATIVE_DATABASE=sqlite python3 tests/directory-native.py` created a separate fresh native-PHP fixture using only official SQLite Database Integration source from the prior tool cache. It copied no prior database or configuration. **WordPress 7.1.2 / native PHP 8.5.7 / Plugin Check 2.1.0 / Theme Check 20260901** ran on the current packaged source. The compatibility version returned by `$wpdb->db_version()` in this SQLite fixture is not a real MySQL server version.

Plugin Check exited **0 with one WARNING and no error findings**. The unsuppressed warning is `PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound` at the private catalog loader. The official sniff explains that WordPress.org automatically loads language packs under the plugin slug. The explicit `load_plugin_textdomain()` API here registers locally bundled private translation catalogs; removing that behavior would break the stated private-package translation path. Keep this distinction for manual directory review. No source/check suppression or warning filter was added, and exit 0 is not described as zero findings.

This fallback intentionally did not load Plugin Check's early bootstrap. At the `after_wp_load` observation point there was no runner; the normal CLI command creates it later, and `CLI_Runner::allow_runtime_checks()` excludes runtime checks when not initialized early. The static check count was not directly observed in this run. It does **not** replace the desired final-package **29 static + 5 runtime** native MySQL check.

Theme Check exited **0**, with one **INFO** confirming the theme's single text domain matches `gymcore-starter`. There were no required/error findings in the final frozen-package run. Both checker stderr files were empty. The scratch directory, generated credentials and SQLite database were deleted. Reports are in ignored `test-results/directory-native-sqlite/`.

## MySQL retry cleanup and remaining gate

The second own fixture, `gcs-release-check-4hxmk07u`, started but never became healthy. After repeated failed readiness probes, its task-only Python process was interrupted to stop further probing. Docker initially refused removal because the container's process was a zombie; the runner's final cleanup retry succeeded, and a separate `docker inspect` returned **no such object**. Both task containers and all local scratch/configuration credentials are now removed. No Docker restart or changes to unrelated resources were made.

The MySQL attempt ended with exit **130** before installation/checks; it is not a tool pass. Future runs use `--init`, bounded readiness probes and explicit interrupted-stage reporting. Full native MySQL checks on the final updated package remain pending; the earlier main-branch successful check is historical evidence for different package bytes.


## Final frozen-package verification — 2026-10-01

After the navigation palette and WooCommerce form-label contrast fixes, both ZIPs were rebuilt and the SQLite native checker harness was run again. It completed with **Plugin Check exit 0, zero errors and the one explained loader warning; Theme Check exit 0 and one single-text-domain INFO**. Both stderr files were empty. The run recorded `stage: completed` and `scratch_removed: true`; no Docker commands were issued in this fallback run.

| Installable artifact | SHA-256 | Files |
| --- | --- | --- |
| `gymcore-starter-0.1.0.zip` | `9ae1b24cebf4a4cc098dd6078a8006407b6db27768850737eed52e2f9f185bc4` | 29 |
| `gymcore-starter-kit-0.1.0.zip` | `c1618da9380db4b45eefc3d7bc55ce592a3f6131d3aa7ce1b4fde9535315fbdb` | 12 |

Each ZIP passed CRC inspection and every member matched the current package source before loading. `test-results/directory-native-sqlite/report.json` retains both hashes and exact findings, with `enabled-checks.json` recording versions and the lack of early runtime initialization. The standard output's warning is preserved rather than suppressed. The loader warning requires a manual directory decision; these results do not justify a zero-findings or latest-compliant claim.

## Subsequent archive-title correction

Remote Chromium 145 CI exposed narrow-layout archive overflow after the checker run above. Adding Query Title to the existing wrapping rule changes only the theme's CSS. The rebuilt theme ZIP SHA-256 is `3ec0fcc09f3e8663b51094e31371deba86084f8f8edf0817e81d0481af761f73` (29 files); the plugin ZIP remains byte-identical at `c1618da9380db4b45eefc3d7bc55ce592a3f6131d3aa7ce1b4fde9535315fbdb`. Audit, WPCS and packaging checks pass. The Theme Check result above concerns the preceding explicitly hashed theme ZIP; rerunning it on this final theme is pending the coordinated local-runtime pause. Full current-package MySQL Plugin Check remains pending too.

## Final native MySQL verification after recovery — 2026-10-01

This result supersedes the startup blockers and final-theme rerun gate above. After coordinated Docker recovery, the unchanged harness completed on the final theme ZIP `3ec0fcc09f3e8663b51094e31371deba86084f8f8edf0817e81d0481af761f73` and plugin ZIP `c1618da9380db4b45eefc3d7bc55ce592a3f6131d3aa7ce1b4fde9535315fbdb`. It verified every ZIP member against source before installation.

Actual runtime: **WordPress 7.1.2, native PHP 8.5.7, MySQL 8.4.11, Plugin Check 2.1.0, Theme Check 20260901**. The early-initialized official CLI runner selected **29 static and five runtime checks**. Plugin Check exited 0 with **zero errors and the one unsuppressed private-catalog loader warning** explained above. Theme Check exited 0 with only the matching-text-domain INFO. Both stderr files were empty.

Runtime cleanup inspection found zero temporary `wp_pc_` tables and no object-cache drop-in. The uniquely owned `gcs-release-check-y_fugp9q` container and all scratch/configuration credentials were removed (`container_removed: true`, `scratch_removed: true`). No unrelated resource was changed. Sanitized reports are in ignored `test-results/directory-native/`; checker success remains distinct from directory approval.
