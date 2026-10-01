# GymCore Starter

A WordPress block theme and optional companion plugin for building a martial arts school site with GymCore. **Private review candidate, version 0.1.0.** This is not a WordPress.org release or an assertion of directory approval.

The reusable layout ideas come from the HMA site. The implementation starts with clean history and fresh, generic content: no customer records, source-site media, branding, credentials, deployment configuration, license exemptions or bundled GymCore product code.

## Install

1. Run `python3 tools/package.py`, or use the privately supplied ZIPs and compare `dist/manifest.json` hashes.
2. Upload `gymcore-starter-0.1.0.zip` through **Appearance → Themes → Add New → Upload Theme**, then activate.
3. Open **Appearance → Editor**. Edit the Front Page template, header, footer and Styles. Set your name in **Settings → General**, upload your own Site Logo, and review Navigation (the initial Home link is ready for your own menu items).
4. Optionally upload `gymcore-starter-kit-0.1.0.zip` through **Plugins → Add New**. Activation imports nothing.
5. Optionally use **Settings → GymCore Starter** to create four fictional drafts. Review and replace all example text before publishing. Existing content, homepage settings, menus and operational data remain untouched.
6. For a live timetable, install and configure your independently obtained, authorized GymCore package. Add the **Weekly class schedule** block in the page or site editor, choose program/location/day filters, and verify output against GymCore's Classes screen.

The theme and draft setup need only WordPress. The schedule needs GymCore's public class content. WooCommerce is optional for the starter; GymCore itself may require it. Products, checkout, subscriptions, bookings, members and licenses belong to their owning plugins. The starter never grants a paid feature or substitutes for a license.

## What is included

| Package | Contents | Native editing surface |
| --- | --- | --- |
| Theme | Eight templates, header/footer, ten patterns, dark/light styles, responsive core navigation | Site Editor, Global Styles, Navigation, Site Logo |
| Companion | Weekly schedule API v3 block, fictional draft setup, conservative removal, uninstall preference | Block inspector, Settings API, Pages |
| Development | Reproducible ZIP builder, allowlist/sanitization audit, WordPress coding standards, disposable WordPress tests, least-privilege CI | Local commands and pull-request CI |

The homepage's default copy lives in **Site Editor → Templates → Front Page**. To use a normal Page as the homepage, replace that template's main contents with a Post Content block and select the static page in **Settings → Reading**. This is an editor operation, not a source change.

## Development

Target: WordPress 7.0+, PHP 8.3+. See [verified versions and limits](docs/verification.md); minimum headers are design targets until their matrix passes.

```sh
npm ci --ignore-scripts
composer install --no-interaction --prefer-dist
python3 tools/audit.py
composer lint
npx playwright install chromium
GCS_BROWSER_TESTS=1 npm run test:wordpress
python3 tools/package.py
```

Playground downloads official WordPress/PHP resources into isolated test directories. It is a disposable SQLite/WASM test environment, not production MySQL parity. No production database, secrets or live store are needed. Optional WooCommerce tests and matrix controls are documented in [verification](docs/verification.md).

## Guides

- [Setup, customization and extension](docs/customization.md)
- [Architecture and lifecycle](docs/architecture.md)
- [HMA feature map and provenance](docs/source-audit.md)
- [Schedule contract and limitations](docs/schedule-adapter.md)
- [Current standards research](docs/standards-research.md)
- [Release candidate verification and submission handoff](docs/release-readiness.md)
- [Release checklist](docs/release-checklist.md)
- [Security reporting](SECURITY.md)

Code is GPL-2.0-or-later; see [LICENSE](LICENSE). The original source-site images, fonts and logos are deliberately excluded. Names and trademarks remain their owners' property. No automated deployment, privileged workflow or WordPress.org publishing is configured.

Additional verification: [multisite](docs/multisite.md), [translation readiness](docs/translation-review.md), and [optional canonical GymCore integration](docs/canonical-integration.md).

Expanded checks: `npm run test:minimum`, `npm run test:network-scale`, `npm run test:accessibility`, and `npm run test:locale` (GNU gettext required). Native fixture requirements for `test:commerce` and `test:directory` are documented in their reports. These commands use fictional isolated data and never authorize publication.
