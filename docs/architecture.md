# Architecture and lifecycle

## Ownership boundaries

The theme contains only core block markup, translated patterns, theme.json v3 styles and minimal theme metadata. It does not register content types, endpoints, blocks, settings or business logic. No remote fonts, images or scripts are loaded. System fonts avoid redistributing assets with unclear provenance.

The companion plugin registers its one dynamic block via block.json API 3 and a PHP render callback. Its unbundled editor script uses WordPress-provided packages; all source is shipped. `includes/schedule.php` reads published active public recurring classes and public taxonomy names. It never reads users, attendance, bookings, leads, orders, credentials or licensing metadata. The installed GymCore code owns its schema and entitlements. The class existence check and viewable CPT check prevent the adapter from creating a substitute product. Future changes to GymCore's class schema require adapter tests and a new release.

The companion also declares published pages containing the weekly schedule block for GymCore's signed-out offline app; the theme intentionally ships no PWA functionality. See [offline app schedule](offline-app.md).

The schedule lists recurring weekly times, not date-specific availability, booking inventory, cancellations, exceptions, instructor names or entitlement-controlled member schedules. Counts apply to the rendered weekly classes after filtering and validation. One-time/custom recurrence classes are deliberately absent. See the schema note for the exact source baseline and filters.

## Trust boundaries

Setup uses WordPress pages, post meta and options. Import requires `manage_options` and `edit_pages`; removal requires `manage_options`, `delete_pages`, individual `delete_post` capability, matching import token, draft status and enabled WordPress Trash. Both browser actions verify action-specific nonces; removal additionally requires an explicit checkbox. Neither operation is exposed to unauthenticated requests. Options use the native Settings API and its capability/nonce enforcement.

The setup lock uses atomic `add_option`, and `finally` releases it. Interrupted requests can leave a lock; an administrator must first verify no request is active, then use `wp option delete gcs_setup_lock` to resume. This deliberate fail-closed developer exception avoids automatic timeout races. Partial imports recover known pages; manifest IDs are never overwritten. Setup never changes roles, capabilities, homepage, menus, products, published pages, or GymCore records.

Import metadata: `gcs_demo_manifest` stores a generated ownership token and page IDs; each created page gets `_gcs_demo_token`/`_gcs_demo_key`. `gcs_setup_lock` is temporary. `gcs_options` stores only the uninstall preference. No telemetry or external service communication is implemented.

## Upgrade, reset, deactivation, uninstall

Upgrades replace package files only. Back up files/database first; WordPress user-edited `wp_template`, `wp_template_part` and `wp_global_styles` records override theme defaults. Export Site Editor customizations before resetting them. There is no automatic migration or rewritten content.

Removing demo drafts moves matching still-draft pages to Trash, including author edits, after explicit acknowledgement. WordPress's configured Trash retention eventually deletes trash; restore anything wanted through Pages → Trash. Published/private/scheduled/unrelated pages are preserved. The manifest remains so import does not silently create duplicates. To start over without source edits, restore and edit drafts or create new pages normally.

Deactivation retains all data. Default uninstall also retains all content and settings. If the administrator has opted in, uninstall removes only the three named options. No pages, post meta, users, terms, uploads or GymCore data are deleted. A reinstall with a deleted manifest can create new drafts, explicitly stated in the UI. Replace/remove dynamic blocks before uninstalling the companion because their render callback will no longer be available.

Multisite network-wide lifecycle and full MySQL deployment parity are release gates. No network-wide activation or cleanup is certified. Each single-site database is handled independently.
