=== GymCore Starter Kit ===
Contributors: slash1andy
Tags: blocks, schedule, starter
Requires at least: 7.0
Tested up to: 7.1
Requires PHP: 8.3
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Optional draft-page setup and a weekly class schedule block for sites using GymCore.

== Description ==
Activation creates no content. Settings → GymCore Starter offers an explicit, idempotent import of four fictional draft pages. Review them before publishing. With explicit confirmation, removal moves only matching imported drafts, including your edits to those drafts, to Trash. Published and unrelated content is preserved.

The weekly schedule block reads published active classes from an independently installed GymCore plugin. It does not create classes, bookings, members, products, orders or licenses. It works without GymCore with a neutral empty state. WooCommerce is not required by this plugin; install it separately if your GymCore package or store needs it.

No third-party services, tracking, remote fonts, credentials, or customer data are bundled or transmitted. GymCore itself has separate requirements and terms; this plugin never grants entitlements. This is a private review candidate, not a WordPress.org release or compliance certification.

== Installation ==
1. Upload the gymcore-starter-kit folder or ZIP through Plugins → Add New.
2. Activate. Optionally open Settings → GymCore Starter.
3. Insert the Weekly class schedule block in the page or site editor.
4. Configure your authorized GymCore installation and review the schedule before publishing.

== Frequently Asked Questions ==

= Is the theme required? =
No. The block and optional draft setup can be used with another theme.

= What happens on deactivation or uninstall? =
Deactivation retains everything. By default uninstall retains settings and content. An explicit uninstall preference removes only settings/import bookkeeping; pages always remain. Reinstalling after deleting the import record can create new drafts. The dynamic schedule block requires the plugin and must be replaced or removed before uninstalling.

= Does it support multisite? =
Setup and removal operate per site. Network uninstall checks each site's own cleanup preference and always preserves pages. The two-site lifecycle regression passes on WordPress 7.1.2, PHP 8.3.32, and SQLite/WASM. Large networks, multi-network setups, domain mapping, subdomain routing, and native-database network workflows remain unverified. Very large networks may need an adequate execution time limit for uninstall.

= Does reset delete published content? =
No. Only matching imported drafts, including edits to them, can move to Trash, with a nonce, capability checks and explicit confirmation. WordPress Trash must be enabled. Restore drafts from Pages → Trash. Repeating setup never overwrites imported pages.

== Resources and release status ==

Copyright (C) 2026 GymCoreHQ. Original runtime source is GPL-2.0-or-later;
LICENSE contains the license text. No third-party runtime assets are bundled.
The plugin uses editor packages supplied by WordPress. GymCore is obtained
separately and is not included in this package.

Authenticated WordPress.org submission access, name ownership, and submission
review remain owner release gates. Public contributor identity alone does not
establish submission permissions or authorize publication.

== Changelog ==

= 0.1.0 =
* Initial private review candidate.
