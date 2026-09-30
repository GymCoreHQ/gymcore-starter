# Optional canonical GymCore integration

This test accepts a separately authorized Git checkout of GymCore. No GymCore implementation, private Git history, credentials, media, or licensed package is included in this starter. The harness exports the supplied plugin’s committed Git tree into temporary storage **outside this repository**, mounts that disposable copy, and removes it on normal completion. It does not modify the original source.

```sh
GCS_CANONICAL_PLUGIN_PATH=/path/to/authorized/gym-core \
  node tests/canonical-integration.mjs
```

The host must have Composer and native PHP available. The harness installs only production dependencies from the committed Composer lockfile inside scratch, with Composer scripts and plugins disabled; it does not copy development dependencies. `GCS_COMPOSER_BINARY` optionally selects the Composer executable. `GCS_WP_VERSION`, `GCS_PHP_VERSION`, and `GCS_TEST_PORT` optionally override the defaults (7.1.2, 8.3, and 9486). The harness downloads official WooCommerce 11.1.2. It starts a new Playground SQLite/PHP-WASM site with synthetic content; it never connects to an existing WordPress database.

Before activation, the harness records the external checkout's Git SHA and uses `git archive` to export that exact committed plugin subtree; uncommitted worktree changes are not included. Its local must-use test fixture blocks WordPress outbound HTTP with a real `WP_Error`, disables automatic cron execution, and short-circuits outgoing email. It does not intercept licensing with successful responses, supply license keys, change cached license state, register substitute GymCore classes, override capabilities, or enable entitlement bypasses. A feature denied by the unlicensed state remains denied and is reported as a blocker.

## Source inspection before activation

Inspected baseline: `a27215de100171400a76cd9da51cf2b92c169fcd` (2026-09-30).

- Actual plugin version 1.0.0; headers require WordPress 7.0, PHP 8.0, and WooCommerce 10.3. Its WooCommerce tested-up-to header is 10.9; testing 11.1.2 here does not rewrite that upstream claim.
- Bootstrap requires WooCommerce and loads the Composer autoloader before its normal provider registration.
- The default Schedule provider registers the public `gym_class` post type and `gym_program` taxonomy. Location taxonomy comes from the normal location provider.
- Activation creates plugin tables, capabilities, defaults, maintenance schedules, and potentially a hidden Comp Membership product. All such writes are confined to the disposable database.
- An empty install's license manager naturally returns an inactive state. The harness checks that state rather than fabricating an active license.

## Verified result

Runtime results are recorded in ignored `test-results/canonical-integration.json`, with separate activation and verification output files. The test performs real activation, then a fresh request through the normal bootstrap, inspects post type/taxonomy/meta registration, and—only if normal administrator capabilities allow it—creates a fictional program, room, and weekly class through WordPress APIs. It checks that the starter renders the filtered class and excludes it when changed to draft.

Executed on 2026-09-30 against the exact baseline above: **WordPress 7.1.2 / PHP 8.3.32 / WooCommerce 11.1.2 / Gym Core 1.0.0**, using Playground CLI 3.1.52 and a production-only Composer install. All **13 assertions passed** (two activation checks plus eleven fresh-request schema, capability, licensing, and rendering checks). Both requests reported no PHP stderr and no final database error; no outbound WordPress HTTP request was attempted.

The real class registration exposes REST base `classes`, taxonomies `gym_location` and `gym_program`, and eight registered metadata fields: instructor, capacity, public trial capacity, day of week, start time, end time, recurrence, and status (all prefixed `_gym_class_`). The fictional class rendered with both taxonomy filters and the Monday filter, then disappeared after its status changed to draft.

The license remained **inactive / invalid**, with no stored key and no bypass constant. This verifies the normally registered public schedule schema and starter adapter on an unlicensed fresh install; it does not establish access to paid capabilities. No licensed capabilities were activated or simulated.

This optional test is not an entitlement, booking, billing, payment, messaging, attendance, native MySQL/MariaDB, or full GymCore certification. SQLite's final empty error field is not a full database-engine compatibility claim. The harness exits unsuccessfully for a fixture blocker as well as any failed assertion, so a denied fixture cannot be reported as a successful integration.
