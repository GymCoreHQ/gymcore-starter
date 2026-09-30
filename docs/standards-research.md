# WordPress standards research and release gates

Research date: **2026-09-30 (UTC)**. This is a research checklist, not certification or a test report. No runtime tests were performed by the standards audit. Record actual versions and results separately; never populate `Tested up to` from this proposed matrix alone.

## Verified upstream versions

| Component | Official page observed on research date | Implication |
| --- | --- | --- |
| WordPress | **7.1.2**, [download](https://wordpress.org/download/) | Current stable target; resolve and pin the downloaded build. |
| WooCommerce | **11.1.2**, dated 2026-09-22; requires WordPress **7.0+**, PHP **7.4+**; tested up to WP 7.1.2, [directory listing](https://wordpress.org/plugins/woocommerce/) | Optional integration target. Upstream minimum is not this starter's support promise. |
| Gutenberg plugin | **24.1.0**, requires WP 7.0/PHP 7.4, [directory listing](https://wordpress.org/plugins/gutenberg/) | Optional forward-compatibility lane only. Core already contains stable editor features; standalone Gutenberg exposes experimental features. |
| PHP | **8.5.11**, **8.4.26**, **8.3.35**, **8.2.34**, [PHP release page](https://www.php.net/) | 8.6.0 RC2 is prerelease, not a production target. |
| PHP support | 8.4/8.5 active; 8.2/8.3 security-only, [support table](https://www.php.net/supported-versions.php) | 8.2 security support ends 2026-12-31; prefer PHP 8.3+ for this new starter. |

WordPress recommends PHP **8.3+**, MySQL **8.0+** or MariaDB **10.11+**, and HTTPS. Its legacy compatibility floor is not a recommended production environment. [Hosting requirements](https://wordpress.org/about/requirements/).

The observed release dates agree with the supplied environment date. Recheck immediately before any public release. A downloadable artifact that resolves to another version must be reported by its actual runtime version, not relabeled to match this table.

## Theme directory gates

The [Theme Review required rules](https://make.wordpress.org/themes/handbook/review/required/) require:

- GPL-compatible contents and an asset list with source, copyright and license; permission to redistribute the design.
- Presentation only: no custom blocks, post types, roles, shortcodes or other plugin functionality.
- Required block-theme files: `style.css`, `readme.txt`, `theme.json`, `templates/index.html`; complete, correctly closed block markup.
- Accurate headers, slug-matching text domain, translatable strings, unique prefixes, no deprecated APIs or runtime notices.
- Keyboard focus, keyboard-operable controls and a skip mechanism. Core supplies block-theme skip links for the `main` landmark.
- No unsolicited remote resources, tracking, activation redirects, automatic plugin installation or bundled plugin ZIPs. Theme recommendations may reference only WordPress.org-hosted plugins.
- **No demo imports in theme onboarding.** Put any optional importer in the companion plugin.
- Clean packages without repository metadata, server configuration, dumps, hidden files or nested ZIPs. Include original sources for minified files.
- Nonadvertising screenshot, 4:3, maximum 1200×900. Do not claim `accessibility-ready` without its additional review.

## Plugin directory gates

[Detailed Plugin Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/) require GPL-compatible code and assets, human-readable source/build access, complete working functionality, secure behavior, honest claims and respect for names and trademarks. Do not include undisclosed tracking, fetch executable code from third parties, hijack the dashboard, add public credits without consent, or repackage libraries provided by WordPress. Trialware is prohibited; paid services have specific allowed conditions. External services must be documented. Keep optional integrations honest and preserve GymCore entitlement checks. This repository's private review state does not establish directory approval.

Use [plugin header fields](https://developer.wordpress.org/plugins/plugin-basics/header-requirements/) accurately. `Requires Plugins` is for required WordPress.org plugin slugs, not optional integrations or arbitrary private URLs. A companion whose base features work without WooCommerce should feature-detect WooCommerce rather than falsely require it. Confirm final directory slug/account ownership before filling contributor metadata.

## Native editor and data architecture

- Use `theme.json` **version 3**, editable global styles, template parts and native block templates. The [living reference](https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/theme-json-living/) identifies v3 as latest. The [intro page](https://developer.wordpress.org/themes/global-settings-and-styles/introduction-to-theme-json/) still describes v2; prefer the living reference and validate against the target released WordPress schema. Avoid copying trunk-only properties into stable packages.
- Register custom blocks in the plugin using `block.json`, server-side registration, unique namespace, translated labels and declared script/style dependencies. [Block metadata](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/) identifies **apiVersion 3** as latest. Validate edit/save round trips and editor iframe styling.
- Store site content with WordPress content APIs and settings with the [Settings API](https://developer.wordpress.org/plugins/settings/settings-api/). Expose normal page/editor/admin controls; document any extension requiring code.
- Treat [nonces](https://developer.wordpress.org/plugins/security/nonces/) as CSRF checks, never authorization. Pair them with capabilities; sanitize inputs and escape outputs. Opt-in demo setup/reset must identify only its own objects, preserve user edits, and handle repeated requests safely.
- If WooCommerce orders are ever touched, use WooCommerce CRUD/data APIs, not post tables/meta. Follow the [HPOS recipe book](https://developer.woocommerce.com/docs/features/orders/high-performance-order-storage/recipe-book/) and declare feature compatibility only after verifying it. Do not add compatibility declarations merely to satisfy a checklist.

## Proposed matrix — all pending until recorded elsewhere

| Lane | Exact proposed environment | Required coverage |
| --- | --- | --- |
| Current baseline | WP 7.1.2 / PHP 8.3.35 / no Woo or GymCore | Theme-alone render, plugin activation, editor/save/reload, native settings, demo import/reset, uninstall preservation |
| Current commerce | WP 7.1.2 / PHP 8.3.35 / Woo 11.1.2 | Graceful optional integration, shop/cart/checkout/account presentation; HPOS on and legacy storage if order code exists |
| New PHP | WP 7.1.2 / PHP 8.4.26 and 8.5.11 / Woo 11.1.2 | Warnings/deprecations, integration and rendering smoke tests |
| Declared minimum | Exact minimum WP/PHP selected in package headers / Woo absent | Every base feature; add exact compatible Woo version only if commerce support at that minimum is promised |
| Editor preview | WP 7.1.2 / PHP 8.3.35 / Gutenberg 24.1.0 | Advisory editor compatibility; no requirement to install Gutenberg |
| Data/hosting | MySQL 8.0 and MariaDB 10.11 | Installation, CRUD, setup/reset/uninstall; Playground SQLite alone cannot establish these results |
| GymCore | Exact licensed development release, recorded at runtime | Integration and entitlement-present/absent behavior with synthetic data; never production credentials |

For Playground, report the embedded **actual PHP patch**, WP version, database adapter, Woo version and CLI version. A PHP minor selection is not evidence of the latest patch. Unavailable matrix lanes remain explicit release blockers.

## Verification required before public release

These are project acceptance gates, not claims of work completed:

1. Theme Check, Plugin Check, WordPress coding standards and relevant static analysis; inspect all findings rather than treating installation as a pass.
2. Functional/security tests for malformed input, unauthorized users, missing/expired nonces, repeat imports, partial failures, edited demo preservation and uninstall. No reset may delete unrelated objects.
3. Browser checks at mobile/tablet/desktop sizes, keyboard-only navigation, visible focus, contrast, 200% zoom, reduced motion and screen-reader landmarks; editor/frontend parity and long/empty content.
4. Native customization proof: logo, navigation, colors, typography, patterns, page copy and settings survive updates without source edits.
5. Exact dependency/version inventory, license/provenance review, scans of repository **and installable archives** for private identifiers, secrets, real media, history and deploy hooks.
6. Package install/update/uninstall on fresh isolated sites; preserve content and user settings across upgrade/deactivation. Declare and test any optional destructive cleanup separately.
7. Re-read current directory rules, verify naming/account rights and replace any unsupported marketing claims. Public publication/submission requires a separate authorized release action.

Local workflow consulted: `~/.agents/skills/woocommerce-plugin-dev/SKILL.md` and `~/.codex/AGENTS.md`. No personal skill catalog was found under the searched global `~/.agents/skills/personal` or `~/.codex/skills/personal` locations; repository-specific catalogs must be checked by the implementation owner.
