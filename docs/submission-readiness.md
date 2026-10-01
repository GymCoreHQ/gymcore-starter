# Submission readiness — private preparation

Checked **2026-10-01 UTC**, starting at commit **43fb95a**. This is a desk review and submission preparation record, not approval to publish or evidence of new runtime tests. The repository, WordPress.org accounts, directory listings and visibility were not changed by this audit. Package readmes were corrected locally; no WordPress.org upload occurred.

## Official sources refreshed

| Source | Finding relevant to this candidate |
| --- | --- |
| [WordPress download](https://wordpress.org/download/) | Current stable offered: **7.1.2**. |
| [WooCommerce directory](https://wordpress.org/plugins/woocommerce/) | Current version **11.1.2**; WP 7.0+/PHP 7.4+ upstream minimum; tested up to 7.1.2. |
| [PHP releases](https://www.php.net/) | Current stable branch patches: **8.3.35**, **8.4.26**, **8.5.11**. Existing runtime evidence uses older exact patches; it must not be relabeled. |
| [Theme Review requirements](https://make.wordpress.org/themes/handbook/review/required/) | Required package files, license/asset attribution, presentation-only scope, native onboarding, accessibility basics, screenshot rules and theme metadata. |
| [Plugin Directory guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/) | Secure complete GPL-compatible product, source availability, honest dependency claims, no unsolicited tracking/remote code, respect for marks and copyright. |
| [Plugin readmes](https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/) | Contributor values are actual WordPress.org usernames; short description ≤150 characters; 1–5 descriptive tags; stable tag matches plugin release. `Tested up to: 7.1` is appropriate for tested WP 7.1.2. |
| [Plugin assets](https://developer.wordpress.org/plugins/wordpress-org/plugin-assets/) | Directory assets live alongside SVN trunk/tags, not in the installable package; supported names/dimensions are recorded below. |
| [Plugin Developer FAQ](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/) | Brand-first slugs require the official brand owner, not merely third-party permission. A GitHub organization/account does not establish WordPress.org account identity or trademark ownership. |
| [Block-specific rules](https://developer.wordpress.org/plugins/wordpress-org/block-specific-plugin-guidelines/) | This setup-plus-block plugin should use the ordinary Plugin Directory route, not claim eligibility as a block-only directory plugin. |
| [Plugin submission entry point](https://wordpress.org/plugins/developers/add/) | Actual submission is a separate owner-authorized operation. No form was submitted. |
| [WordPress.org contributor profile](https://profiles.wordpress.org/slash1andy/) | Public profile explicitly links `github.com/slash1andy` and identifies Slack Andrew W; together with the verified GitHub owner identity, this supports `Contributors: slash1andy`. It does not prove authenticated submission access. |

All URLs above were opened on the checked date. Recheck on the actual submission day; upstream versions and rules can change.

Read-only slug lookups were attempted for `gymcore-starter` (Theme Directory) and
`gymcore-starter-kit` (Plugin Directory), including the official information APIs.
The browser could not access the responses, and the local request could not resolve
the API host. **Availability is unresolved**, not confirmed free. Even a future
not-found response would not reserve a slug or establish trademark rights.

## Inspected candidate

- Theme and plugin version: **0.1.0**. Declared minimum WP **7.0**, PHP **8.3**; `Tested up to: 7.1`. The historical lower-WP run actually resolved to **7.0.6**, not 7.0.0. Minimum support needs an explicit decision/test before making a broad promise.
- Theme has the required `style.css`, `readme.txt`, `theme.json`, and `templates/index.html`. Theme functionality and plugin code are packaged separately. No runtime third-party library, font or customer-media bundle was found in the enumerated source packages.
- All three LICENSE files match reviewed GPL v2 text byte for byte: SHA-256 `edaef632cbb643e4e7a221717a6c441a4c1a7c918e6e4d56debc3d8739b233f6`. GPL-2.0-or-later declarations are consistent. Matching text alone does not prove redistribution authority.
- `theme/gymcore-starter/screenshot.png` is **1200×900**, verified with image metadata and visual inspection. It depicts fictional “Example Academy” content, with no people, customer imagery, source-site marks or advertising overlay. Recheck against the final rendered candidate after visual changes.
- Existing [source audit](source-audit.md) establishes the excluded source assets and neutral reimplementation policy. Original-code claims remain subject to owner/provenance review; do not copy private source history to prove them publicly. GymCore's own upstream license inconsistency is documented there; GymCore is a separately obtained dependency, not a bundled artifact.
- The source package builder limits files to theme/plugin trees, fixed approved file types and one top-level package folder each. No `dist/` existed at the start of this audit. Fresh archive construction, hashes and byte comparisons belong to the final review, not this desk inspection.

## Readme corrections applied

1. Added the missing theme short description, explicit resources attribution and accurate screenshot status.
2. Set `Contributors: slash1andy` in both readmes after verifying the explicit GitHub identity link on the [official WordPress.org profile](https://profiles.wordpress.org/slash1andy/). The public identity is verified; **the owner-selected submitting account, authenticated submission access and publication authorization remain separate gates**. No login or account action was performed.
3. Clarified that explicit removal includes edits to still-draft imported pages, and that deleting bookkeeping on uninstall permits a later reinstall to create new drafts.
4. Replaced the plugin's blanket multisite caveat with the narrow passing two-site matrix and remaining limitations from [multisite.md](multisite.md).
5. Kept the private-review status and existing author **GymCoreHQ**. No public URL, account, directory acceptance, broad commerce certification or accessibility-ready claim was invented.

## Gate checklist

Status incorporates linked follow-up results from this branch. Initial desk-review observations above remain historical.

| Gate | Status / action required |
| --- | --- |
| Official requirements refresh | **Done for 2026-10-01**; repeat at submission. |
| Runtime GPL texts and screenshot format | **Locally inspected**, as above. |
| Separate theme/plugin scope | Source layout supports it. Maintain presentation-only theme; no custom blocks/CPTs/shortcodes, theme demo importer, automatic install, private-plugin recommendation, remote assets or activation redirects. |
| Directory identity and names | **Contributor public identity verified** through the official linked profile. **Owner gates remain:** official GymCore name/mark ownership, current slug/name availability, selected submitting account, authenticated access and publication authorization. Organization access or a public profile does not establish these. No name is reserved. |
| Theme attribution and resources | Readme now lists the original screenshot/code resources. **Owner sign-off pending** on authorship/redistribution; preserve any discovered copied attribution. |
| Plugin source/metadata | All current JS is readable source; keep complete source available. Verify final header/readme/version/tag/text-domain parity. No artificial required Woo dependency; its base functions work without Woo or GymCore. |
| Automated directory tools | Final ZIP static Plugin Check has zero errors and one explained private-catalog warning; Theme Check has one INFO. Full current-package MySQL runtime checks remain pending Docker recovery. See [directory results](directory-readiness.md); earlier MySQL results concern different package bytes. |
| Minimum/current runtime | Exact WordPress 7.0 / PHP 8.3.32 passed 57 assertions; see [directory results](directory-readiness.md). Current supported PHP patches and broader combinations remain unverified. |
| User editing/lifecycle | Require current Site Editor save/reload, edited template/style preservation across updates, setup/reset authorization and uninstall checks. Network coverage remains scoped. |
| Integrations | Canonical authorized schedule evidence exists. Broader commerce/licensed capability claims need their own checks. Never substitute an entitlement bypass. |
| Accessibility and internationalization | Scoped [keyboard/layout checks](accessibility-readiness.md) and [official core locale/RTL/private editor catalog checks](locale-readiness.md) passed. Human screen-reader/native zoom and reviewed real translations remain pending. Do not add accessibility-ready based on these checks. |
| Clean final archives | Final archives rebuilt and independently checked: manifests, hashes, CRC, committed-source byte equality and sanitization pass; see [directory results](directory-readiness.md). No development evidence, dependency trees, database files, source history or operational config in ZIPs. |
| Publication permission | **Not granted by this work.** Owner separately approves final artifact, name, account and submission/public visibility. No SVN upload, public release or automatic publishing workflow. |

## Required and optional submission assets

| Item | Current state | Preparation required |
| --- | --- | --- |
| Theme install ZIP | Built and verified; hashes in directory-readiness.md | Include required files, full license and screenshot; record SHA-256 and exact manifest. |
| Theme screenshot | Present, 1200×900 | Final same-revision rendering/owner approval. Avoid advertising, badges or private data. |
| Theme metadata | Author/license/slugs and verified public contributor identity present | Validate current allowed tags; owner confirms submitting account and authenticated access. |
| Plugin install ZIP | Built and verified; hashes in directory-readiness.md | Keep readable runtime source and license; validate stable tag and actual minimum/tested versions. |
| Plugin icon | Not present; **optional** | If desired, original `icon-128x128.png` and `icon-256x256.png`; SVG is optional with PNG fallback. Maximum 1 MB. |
| Plugin banner | Not present; **optional** | If desired, original `banner-772x250.png`; optional `banner-1544x500.png` accompanies it. Maximum 4 MB. |
| Plugin screenshots | Not present; **recommended, not a directory prerequisite** | Capture actual fictional setup/settings and schedule editor/frontend as `screenshot-1.png`, etc., with numbered `== Screenshots ==` readme captions. Maximum 10 MB each; do not expose account details, notices containing private paths, members or credentials. |
| Asset provenance manifest | This document plus readme resources | For any new image record creator/source/license and review; no copied brand art or stock asset without clearance. |
| Translation files | Extraction evidence exists | Shipping POT is a project packaging choice, not a blanket directory admission requirement. Official Arabic/German core locales and synthetic private PHP/JS catalog loading passed; see locale-readiness.md. POT files are included through the explicit package allowlist; reviewed real translations remain pending. |

Optional plugin display assets would be staged for later SVN top-level `assets/`, never silently inserted into runtime archives. No optional artwork was generated just to imply that submission is ready.

Local skills read: `wp-block-themes` and `wp-plugin-development` under the installed canonical WordPress agent-skills catalog; repository `AGENTS.md` also applies. Runtime results cited here come from the existing versioned reports and were not rerun by this documentation audit.

## Read-only slug lookup follow-up

After executor reconnection, direct requests to the official theme/plugin information APIs returned HTTP 404 for `gymcore-starter` and `gymcore-starter-kit`. This establishes only that those exact public information lookups did not return listings at check time; it does not reserve either slug, establish approval, or prove that a pending submission cannot conflict. Final directory name acceptance remains a submission gate.
