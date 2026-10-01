# WordPress.org metadata preparation

Checked 2026-10-01 against official sources below. Current main is `b69040f42013586dac004dccf42fd850dd511e46`; private PR #3 at `6755b6ee2197af37afad68a6a164c52809e42302` contains the readme corrections and verification already prepared. This document adds no submission, release, account creation or visibility change.

Andrew selected the GymCoreHQ GitHub organization and a new GymCore WordPress.org account as intended destinations. He will create the account. Andrew separately confirmed his existing WordPress.org username is `slash1andy`. Both primary headers now use `Author: GymCoreHQ (slash1andy)` to retain organization branding and add his username as requested. Both readmes retain `Contributors: slash1andy`. The future organization account is still uncreated and unnamed; it is not listed or inferred.

## Field mapping for the confirmed account

| Location | Field | Correct interpretation and applied value |
| --- | --- | --- |
| Theme `style.css` | `Author` | Individual or organization display name; WordPress.org recommends its theme author's username. Applied `GymCoreHQ (slash1andy)`, preserving branding while identifying the confirmed user. |
| Theme `readme.txt` | `Contributors` | Exactly one WordPress.org username: `slash1andy`. Do not append a second organization account here. The eventual submitting account must be resolved before upload. |
| Plugin main PHP header | `Author` | Display name; multiple names may be comma-separated. Applied `GymCoreHQ (slash1andy)`; a username is permitted but not mandatory in this display field. |
| Plugin `readme.txt` | `Contributors` | Case-sensitive WordPress.org usernames, comma-separated if multiple actual contributors are credited. Retained confirmed `slash1andy`; no uncreated organization account is listed. |
| Both primary headers | `Author URI` | Optional. A verified public author/project website or the confirmed account's actual WordPress.org profile is appropriate. Left absent because optional; no guessed URI or new external URL is introduced. |
| Both packages | Copyright statements | Keep the actual rights-holder attribution. Changing an account/header is not a copyright transfer. |

Readme contributors do not grant directory ownership, SVN commit rights, or submission access. Profile display names and account usernames are different. Authentication and owner/committer management happen through WordPress.org, outside these ZIPs.

## Current fields and format

| Item | Theme | Plugin |
| --- | --- | --- |
| Display name | GymCore Starter | GymCore Starter Kit |
| Directory and text domain | `gymcore-starter` | `gymcore-starter-kit` |
| Version | `0.1.0` in style header/readme | `0.1.0` in PHP header; readme `Stable tag: 0.1.0` |
| WordPress minimum | `7.0` | `7.0` in PHP header and readme |
| Tested up to | `7.1` | `7.1` in readme |
| PHP minimum | `8.3` | `8.3` in PHP header and readme |
| License | GPL v2 or later, full LICENSE included | GPL v2 or later, full LICENSE included |
| Domain path | `/languages` | `/languages` |
| Readme short description | 129 characters | 84 characters |

Both descriptions are below the 150-character readme limit. Header/readme names match. License spellings (`GNU General Public License v2 or later`, `GPL-2.0-or-later`, `GPLv2 or later`) express the same permission; no cosmetic rewrite of valid declarations is required. The license URI is HTTPS and links the included GPL v2 text; later-version permission remains explicit.

`Tested up to: 7.1` reflects actual WordPress 7.1.2 tests, not a promise about untested future versions. The minimum 7.0/PHP 8.3 combination has runtime evidence. Preserve these values unless a new version is actually tested. The plugin minimums are read from its PHP header, not merely the readme. A theme does not need a plugin-style `Stable tag`.

The selected slugs match package folders and translation domains. Directory availability/assignment is not guaranteed by correct formatting; recheck at submission. If a directory assigns a different slug, update the folder, text domains, metadata and packaging consistently, then rerun translation and installation checks.

`Theme URI` and `Plugin URI` are optional; omission is preferable to an inaccessible private repository or nonexistent listing. No invented directory URL is needed. Do not add an external `Update URI` for the WordPress.org submission candidate. `Network: true` is inappropriate because this plugin supports ordinary site activation. Do not add `Requires Plugins: woocommerce` or a private GymCore slug: neither is a mandatory dependency of the starter's independent draft setup; its optional schedule integration already describes its missing-dependency state honestly.

Theme tags describe existing features and omit `accessibility-ready`. Plugin tags are three descriptive terms, within the directory's one-to-five limit. This plugin includes setup functionality and is not submitted as a Block Directory-only plugin.

## Narrow corrections and genuine remaining gates

PR #3 already removes the theme readme's incidental reference to an unlisted plugin, accurately records tested 104-site scope, and makes translation review conditional on shipping translations. Those fixes are on the reviewed branch, not yet on main. No additional malformed header or missing mandatory metadata field was found in this pass; the confirmed personal account is now applied while the planned organization account remains pending.

The supplied username was checked against its public profile. Rebuild the ZIPs and rerun affected checks for the header changes. If an Author URI is added later, permit only that specifically reviewed metadata URL in the sanitization audit; its current URL allowlist intentionally permits only schema/license hosts. Do not weaken the audit to allow arbitrary URLs.

The rebuilt username-header ZIPs were checked on 2026-10-01 using WordPress 7.1.2, native PHP 8.5.7, MySQL 8.4.11, Plugin Check 2.1.0 and Theme Check 20260901. Theme SHA-256: `7cb7ae3de0d710aed9aa967c18b3155265b16d0d68ef63ac5f1b217c925fbe7c` (29 files). Plugin SHA-256: `c9e9598a8077bafb190ff48ff3b58d2ad11806b3469298c8c9a3c538bc046d09` (12 files). Both checks exited 0 and the disposable container/scratch were removed. Source/package audit and WPCS passed.

The current ZIPs have native Plugin Check zero errors with one unsuppressed private-catalog loader warning and Theme Check one matching-domain INFO. These are not directory certification. Keep the warning explanation; do not remove working translation support only to hide it. Actual assistive-technology acceptance, account/authentication, final naming/rights confirmation and directory review remain distinct. Private Git history contains source-project audit context: publication destinations do not authorize making that history public, and no visibility change is included here.

## Official sources consulted

- [Theme required headers, readme, licensing and plugin recommendations](https://make.wordpress.org/themes/handbook/review/required/)
- [Theme stylesheet metadata](https://developer.wordpress.org/themes/core-concepts/main-stylesheet/)
- [Permitted theme tags](https://make.wordpress.org/themes/handbook/review/required/theme-tags/)
- [Plugin header fields](https://developer.wordpress.org/plugins/plugin-basics/header-requirements/)
- [Plugin readme contributor, version and tag rules](https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/)
- [Plugin directory guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)
- [Confirmed personal account profile](https://profiles.wordpress.org/slash1andy/)

Read on 2026-10-01. The raw sample plugin readme endpoint did not load in the browser tool; the official handbook's documented format was available. No unavailable validator response is claimed as a pass.
