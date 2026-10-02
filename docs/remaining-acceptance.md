# Bounded remaining acceptance criteria

This document separates checks for the shipped starter from optional integrations and claims. It does not grant publication permission or assert WordPress.org acceptance.

## Historical upgrades

The starter is an unreleased 0.1.0 candidate with a clean repository history. There is no identified earlier public starter release to migrate. A real Site Editor test already saves a template heading and Light Global Styles, replaces a synthetic 0.0.9 package with the actual 0.1.0 ZIP through WordPress administration, and verifies record IDs/content hashes, published content, and all installed files. See [editor upgrade evidence](editor-upgrade-readiness.md).

An unspecified historical migration is therefore **not an open prerequisite for this initial release**. Before claiming compatibility with a particular existing installation, obtain its exact prior theme/plugin ZIPs and version numbers plus a sanitized fixture of its custom templates/styles/settings. Required assertions are: replacement succeeds; user-edited templates/styles and ordinary published content remain unchanged; existing options retain their meaning; and any documented migration runs once without affecting unrelated content. Do not import HMA production data or run a generic reset to obtain that fixture. For the next starter release, retain the published 0.1.0 packages as its real upgrade baseline.

## GymCore compatibility and licensing

The only shipped GymCore adapter is the optional public weekly schedule. Its verified canonical baseline is Gym Core 1.0.0 at `a27215de100171400a76cd9da51cf2b92c169fcd`, with WooCommerce 11.1.2, WordPress 7.1.2 and PHP 8.3.32. Thirteen assertions exercised real activation, ordinary administrator capabilities, the registered class/taxonomy schema, filtering, and exclusion of draft classes. The license remained inactive; no entitlement was substituted. See [canonical integration](canonical-integration.md).

The starter does not bundle separately obtained GymCore binaries or claim verification of every paid module. **Paid-module coverage is not required to describe this tested public schedule adapter accurately.** If an owner wants a paid module advertised or demonstrated, the prerequisite is a legitimately obtained exact plugin/module build, an authorized nonproduction entitlement for that build, and a named workflow. That workflow must pass through its ordinary UI/API with access allowed for the entitled fixture user and denied for a non-entitled fixture user. Record the exact version, capability/role, expected output and any external side effect; keep private binaries and license material outside this repository. No purchase, license activation or live provider action is authorized by these test reports.

For a broader schedule compatibility claim, name the minimum and current GymCore releases to support, provide their authorized packages, and rerun the existing 13-assertion harness on each. The present evidence supports the pinned baseline only; an unbounded promise to support every GymCore release is not a release gate.

## Commerce and providers

Current verified scope is WooCommerce 11.1.2, native Cart/Checkout blocks, both HPOS and legacy order storage, and fictional offline check-payment orders on hold. Managed inventory is verified on MariaDB; no money moved. See [commerce evidence](commerce-readiness.md).

Real gateways, subscriptions, refunds, taxes, shipping and other extensions are not starter features and are not prerequisites for the documented offline coexistence claim. To add a specific integration claim, first name the extension and version, obtain its authorized package and provider sandbox/test-mode account where needed, then verify its named success/failure/permission workflow without real charges or messages. Do not enable live credentials or infer compatibility from a plain WooCommerce checkout pass.

## Accessibility and languages

Keep automated axe, scripted keyboard interactions, agent visual observations and actual assistive-technology testing distinct. The current representative review is recorded separately; none establishes full WCAG conformance or the WordPress `accessibility-ready` tag. Baseline directory requirements for keyboard access, skip links, visible focus and other required accessibility behavior still apply regardless of any optional tag or claim.

For a screen-reader claim, a tester must use a supported reader/browser combination and record landmarks, heading order, link/control names, navigation dialog announcements and focus restoration, form labels/errors, and the schedule's reading order on the representative pages. No screen-reader pass may be inferred from DOM roles or screenshots. Representative native Chromium zoom now passes 16 conditions at 200% and 400%; see [native zoom evidence](native-zoom-readiness.md). Actual screen-reader acceptance remains separate; see [reader fixture and local access limitation](screen-reader-readiness.md). Other browser/RTL specifics remain bounded by their reports.

English strings and real POT templates ship. Synthetic Arabic/German markers prove catalog loading and layout only. There is no requirement to invent translations for initial English release. Before shipping a particular language, obtain a reviewed translation for that locale and have a fluent reviewer verify terminology, plural forms, truncation, directionality, links and form instructions using that real catalog.

## Directory and owner decisions

- Decide whether the publicly submitted plugin should retain the documented private-catalog loading API; Plugin Check reports one unsuppressed discouraged-function warning. Recheck the resulting package if that decision changes code.
- Confirm the submitting WordPress.org account, GymCore name/mark rights and redistribution provenance; public profile identity and organization access do not substitute for this approval.
- Repeat official directory checks and current version/rule review on the actual submission date, using the exact final package hashes.
- Obtain explicit approval for public repository visibility, a public release or WordPress.org submission. None has occurred.

No remaining item authorizes use of real customer records, entitlement bypasses, live financial transactions or automatic publication.
