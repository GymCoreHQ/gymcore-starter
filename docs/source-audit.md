# Source and integration audit

Audited 2026-09-30. This is a source inspection, not a runtime compatibility or legal clearance certificate. Paths below are relative to the private source checkout and are evidence pointers only; private repository history, source checkouts, operational records, and source assets must not be packaged.

## Baseline and source boundaries

- HMA source: main snapshot `c8a8b8f`, including the later header-logo correction (#107). Both #106 and #107 were verified merged through the GitHub API; comparison of their merge commits verifies the baseline includes #106.
- GymCore source: `a27215de100171400a76cd9da51cf2b92c169fcd`.
- Reviewed global agent instructions and the plugin's `CLAUDE.md`; the latter is partly stale (it describes some now-implemented modules as future), so source takes precedence. The parent later located canonical WordPress skills and confirmed the available GymCore and WooCommerce reference skill paths; implementation owner reviewed them before finalization. No implementation files were modified in this audit.

## Feature map and disposition

| HMA source evidence | Reusable intent | Safe starter treatment |
| --- | --- | --- |
| `wp-content/themes/haanpaa/theme.json`, `templates/*.html`, `parts/*.html` | Block-theme typography, spacing, page layouts, shared header/footer and conversion sections | Reauthor neutral global styles and core-block templates; native Site Logo, Site Title, Navigation, Home Link and editable blocks. Do not reproduce custom hard-coded logo markup. |
| Site kit `patterns/hero-headline.php`, `cta-banner.php`, `about.php`, `values.php`, `faq.php`, `programs-accordion.php`, `coaches-strip.php` | Hero, programs, values, FAQ and team storytelling | Native editable patterns with explicitly fictional or instructional copy; native Details for FAQ. No real biographies, images, claims or offers. |
| Site kit `patterns/schedule-week.php`, `schedule-grid.php` | Class discovery by day/program/location | Document actual GymCore ownership. Avoid copying snapshot-rendered PHP patterns; use optional live integration only after real-data-schema verification. |
| Site kit `patterns/reviews.php`, `includes/class-cpts.php` | Testimonials and location metadata | GymCore owns testimonial and trial-lead post types. Do not re-register them. No fabricated endorsements or seeded real records. |
| Site kit `patterns/lead-capture.php`, `free-trial.php`, `includes/class-jetpack-crm.php`, `class-sms.php` | Trial lead collection and provider integration | Delegate to GymCore's verified public UI/API; do not copy custom CRM/SMS handlers, credentials, consent copy or provider routing. |
| Site kit `includes/class-seeder.php` and activation hook in main PHP | Initial content setup | Replace with opt-in, capability-checked, nonced, idempotent setup; preserve existing pages/settings. Cleanup is explicit and limited to still-draft pages with matching ownership markers; the confirmation clearly includes edits to those drafts. |
| Site kit `includes/class-template-part-parity.php`, `class-rendered-header-parity.php` | Fix older stored templates/header overlays | Lessons for regression tests only. Do not transplant site-specific fingerprint repair, forced template rewriting or output replacement. Site Editor changes must remain authoritative. |
| Site kit `includes/class-interactivity.php`, `class-woopay-asset-policy.php` | Interactivity and commerce asset compatibility fixes | Retain regression objectives. Do not copy broad buffering, script stripping or vendor-specific suppression without a independently reproducible need. |
| Site kit `includes/class-schema.php`, `class-page-meta.php` | Structured data and metadata | Omit hard-coded business facts and SEO duplication; use native content and an optional established SEO plugin. |
| Theme PWA assets, rewrite helpers and alternative legacy theme | Offline experience and prior design experiments | Exclude service worker, manifest, cached content, URL rewriting and legacy design assets. |

“Reusable” means design intent or a separately reviewed code fragment, not blanket permission to copy a directory.

## Verified integration surface

GymCore core declares `Requires Plugins: woocommerce` and GPL-2.0-or-later in `wp-content/plugins/gym-core/gym-core.php`. A starter that merely demonstrates optional integrations should activate without either dependency and show an honest missing-dependency state. Do not instantiate internal services, synthesize license status or change entitlement checks.

### Native blocks

Core exposes `gym/targeted-content` through `gym-core/src/blocks/targeted-content/block.json` and `src/Gamification/TargetedContent.php`. It uses block API v3. Attributes include `program`, `minBelt`, `location`, `membersOnly`, `foundationsOnly`, `loggedIn`, `minClasses`, `minStreak`, and `fallback`.

The separate `gymcore-blocks` plugin registers **four** blocks from `build/<slug>/block.json` (`src/Plugin.php`); the source directory alone is not installable:

| Block | Attributes from `src/<slug>/block.json` | Qualification |
| --- | --- | --- |
| `gymcore/class-schedule` | `locationId`, `maxItems` | Source schema mismatch described below; do not promise a functioning recurring schedule. |
| `gymcore/member-leaderboard` | `rankBy` (attendance/rank), `maxItems`, `locationId` | Renders member display names; exclude from public starter defaults pending explicit privacy/consent review. |
| `gymcore/testimonials` | `maxItems`, `autoplay` | Queries `hp_testimonial`; only owner-approved published testimonials should be shown. |
| `gymcore/trial-signup` | `locationId`, `buttonLabel`, `successMessage` | Delegates to `gym/v1/trial` by default, with `gymcore_trial_signup` and WP REST nonces; endpoint and nonce-action filters exist. Do not bypass the controller's validation/consent workflow. |

**Observed upstream limitations:** `class-schedule/render.php` compares `_gym_class_start_time` as a future DATETIME, but `gym-core/src/Schedule/ClassPostType.php:209` defines start/end times as `H:i` and a separate weekly recurrence/day. Its instructor value is a user ID, yet the block prints the raw value. This source contract does not prove a correct schedule. The render files also buffer output and `return ob_get_clean()`; metadata `render:file` requires emitted output under WordPress's wrapper, so verify output in real WordPress before enabling examples. These are upstream source observations, not changes made by this audit.

### Shortcodes

Use `shortcode_exists()` and a fixed allowlist before rendering optional examples. Do not accept arbitrary executable shortcode strings from an unaudited setting. Registered source APIs are:

- `gym_member_greeting`, `gym_progress_card`, `gym_targeted`, `gym_targeted_content`: `gym-core/src/Gamification/TargetedContent.php:128`.
- `gym_pause_membership`: `src/Member/MemberPauseTab.php:64`; membership action, not a marketing CTA.
- `gym_referral_code`, `gym_referral_leaderboard`: `src/Referrals/ReferralDashboardWidget.php:55`.
- `gym_member_badges`: `src/Member/PublicBadgeProfile.php:32`; defaults to current user but permits an explicit user ID. Do not seed other people's IDs.
- `gym_wall_of_champions`: `src/Member/WallOfChampions.php:30`; publishes member achievements; not enabled by default in a sanitized starter.
- `gym_technique_videos`: `src/VideoLibrary/VideoShortcode.php:37`; keep existing member access checks.

Registration in source is not proof of an enabled module or active entitlement. A runtime demonstration must exercise the real dependency bootstrap under its ordinary licensing state.

## License and provenance disposition

| Material | Evidence | Disposition |
| --- | --- | --- |
| HMA active theme PHP/CSS/templates | `themes/haanpaa/style.css` declares GPL-2.0-or-later | Potentially reusable with provenance and original notices preserved where copying; prefer neutral reimplementation. Header declaration does not establish asset provenance. |
| HMA site kit | Main plugin PHP declares GPL-2.0-or-later | Same treatment; proprietary business data embedded in code remains excluded. |
| GymCore core | Main PHP header declares GPL2-or-later but the source LICENSE text is GPL3; upstream consistency needs review | Reference as separately obtained dependency, not bundled private source/history. |
| GymCore Blocks | `composer.json` declares GPL-2.0-or-later; PHP plugin header lacks License field | License declaration exists, but packaging/header/compiled-build and runtime issues remain. Do not bundle it merely to demonstrate APIs. |
| Logos, icon PNG/SVG, photographs, instructor/program/design preview artwork | Present under both theme asset directories; no per-asset license/provenance manifest found in the inspected theme material | Exclude all. Brand rights and likeness rights are not established by a GPL code header. |
| Remote typefaces | Active theme CSS/PHP loads Google Fonts | Exclude remote font requests and copied font binaries. System fonts avoid external requests and font-license uncertainty. |
| Vendored Composer/npm dependencies | Many component licenses, not a single blanket source license | Do not copy vendor/node_modules. New build dependencies require lockfiles and an independently reviewed production artifact inventory. |

No images, fonts, commercial plugin packages or copied operational content are cleared by this audit. A distribution should contain its own GPL license text and explicit third-party inventory, even when the inventory says no bundled third-party runtime assets.

## Mandatory exclusions and release review

Exclude **all** HMA mu-plugins, including the license-exemption implementation, egress customization, imported-history and attendance-display customizations. Exclude business-policy filters in the site-kit bootstrap, real location defaults, cancellation policy, brand voice/name settings, data exports, production media, deployment workflows/scripts, host settings, telemetry/marketing tags, credentials, environment files and git history. Do not include operational docs in source citations or test fixtures.

Before pushing the separate clean repository, scan both tracked text and final ZIP manifests for source brand names, real contact/location/domain/ID patterns, credentials, provider deployment files, remote requests, member records and license-exemption hooks. A text scan cannot clear binary assets; use an explicit allowlist or ship none. Review generated archives independently from the source tree. Record actual runtime dependency versions and tests; none were executed by this source-only audit.
