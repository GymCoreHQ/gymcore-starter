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
Activation creates no content. Settings → GymCore Starter offers an explicit, idempotent import of four fictional draft pages. Review them before publishing. An explicit removal action moves only still-draft imported pages to Trash; published content is preserved.

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
Deactivation retains everything. By default uninstall retains settings and content. An explicit uninstall preference removes only settings/import bookkeeping; pages always remain. The dynamic schedule block requires the plugin and must be replaced or removed before uninstalling. Multisite network-wide lifecycle handling is not certified.

= Does reset delete published content? =
No. Only matching imported drafts can move to Trash, with a nonce, capability checks and confirmation. WordPress Trash must be enabled. Restore drafts from Pages → Trash. Repeating setup never overwrites imported pages.

== Changelog ==

= 0.1.0 =
* Initial private review candidate.
