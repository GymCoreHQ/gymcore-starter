# Release gate

This repository is a private review candidate. A green local check or private push is not authorization to publish. Consult verification.md for what actually ran.

## Before any public release

- [ ] Human review of branding, name availability, authorship and GPL redistribution authority; retain source attribution/provenance.
- [x] Refreshed official directory requirements for this candidate; see submission-readiness.md.
- [ ] Repeat version/rule checks on actual submission day.
- [x] Original merged candidate passed native PHP/MySQL Plugin Check; historical evidence is in translation-review.md.
- [x] This candidate has current static Plugin Check and Theme Check results; see directory-readiness.md for the intentional private-catalog warning and exact package hashes.
- [x] Final-package native MySQL Plugin Check (29 static + five runtime checks) and Theme Check completed after recovery; exact evidence is in directory-readiness.md.
- [ ] Resolve the intentional private-catalog loader warning with the final directory submission approach.
- [ ] Complete manual directory review and repeat official checks on submission-day versions.
- [x] Historical merged-package native MySQL 8.4.11 / PHP 8.5.7 Plugin Check fixture completed; this is not a current-package runtime pass.
- [ ] Keep compatibility claims limited to the pinned verified matrix; additional named versions require the bounded checks in remaining-acceptance.md.
- [x] Real authorized GymCore activation and canonical published weekly class/taxonomy rendering checked against committed source a27215de on WordPress7.1.2/PHP8.3.32/WooCommerce11.1.2. See canonical-integration.md.
- [ ] Do not advertise untested paid GymCore modules. Their exact build, legitimate test entitlement and named workflow are required only before adding that optional claim; see remaining-acceptance.md.
- [x] Scoped WooCommerce 11.1.2 product/shop/account rendering, native Cart/Checkout blocks and offline guest orders in HPOS/legacy storage; see commerce-readiness.md.
- [x] Native MariaDB managed-stock browser checkout in HPOS and legacy storage: 30 PHP assertions, four progression checks and ten page visits; see commerce-readiness.md.
- [ ] Keep real provider/extension claims excluded until a named authorized sandbox workflow passes; no live financial transactions are required for this starter release.
- [x] Eight-template/two-palette scripted keyboard, layout and automated accessibility regression; exact evidence and incomplete checks are in accessibility-readiness.md.
- [x] Representative agent-operated keyboard and visual review: focus/order, menu/dialog return, search/comment controls, 320px dark/light reflow, reduced-motion sample and RTL-direction interaction; see manual-accessibility-review.md for exact limits.
- [ ] Actual screen-reader/browser review and native browser UI zoom at 200%/400%; neither is inferred from screenshots, CSS zoom or viewport sizing. Do not add accessibility-ready until its complete review.
- [x] Actual Site Editor heading/Light styles save and reload, standard ZIP replacement, native content/ID preservation and installed-file verification on a synthetic prior version; see editor-upgrade-readiness.md.
- [ ] Broader Theme Unit Test content and editor/frontend parity. No earlier public starter release exists; a named historical migration requires exact prior artifacts as described in remaining-acceptance.md.
- [x] Two-site multisite activation, site-isolated setup/reset, capabilities and per-site opt-in uninstall:21 assertions pass. See multisite.md.
- [x] A real 104-site network passed 211 checks across the 100-site cleanup boundary, including exception context restoration.
- [ ] Subdomains/domain mapping, multi-network and native database multisite coverage; hosting-scale performance.
- [x] Translation extraction and synthetic MO/Jed JSON format checks. See translation-review.md.
- [x] Official Arabic/German core locales, synthetic private PHP/JS catalog loading and RTL/LTR browser/editor smoke pass; see locale-readiness.md.
- [ ] Before shipping any additional locale, obtain reviewed real translations and linguistic review for that locale. English-only initial release does not require invented translations; broader RTL/assistive-technology limits remain documented.
- [ ] Fresh secret, source-site residue, dependency/license and packaged-ZIP review; ensure dev/source repositories never enter artifacts.
- [ ] Run CI remotely and resolve failures. Require review before merge; no automatic deployment or publication.
- [ ] Owner approves visibility change, final slug and WordPress.org submission. Neither is part of the current authorization.

Known deliberate exclusions: source-site media/fonts/logos, operational data, marketing claims, CRM/SMS integrations, source-site PWA cache, tracking, entitlement bypasses, provider deployment scripts, public leaderboards and automatic content seeding. These must not be reintroduced casually.

## Plugin guideline desk review

The current source was reviewed against all 18 directory guidelines; this is a desk review, not directory acceptance.

| Guidelines | Current disposition |
| --- | --- |
| 1 license, 4 readable source | GPL2-or-later declarations and matching license text; all runtime source shipped; no third-party runtime bundles |
| 2 developer responsibility, 16 completeness | Owner support/release responsibility remains; code is a private candidate with explicit test gaps |
| 3 stable SVN, 14 SVN releases, 15 versions | Consistent 0.1.0 package versions; no SVN submission; increment on future releases |
| 5 trialware, 6 serviceware | No starter license gate, expiration, trial timer or remote service. Optional separately installed GymCore data dependency remains honestly documented |
| 7 data collection, 8 remote code | No telemetry, external data transmission, remote executable code or external runtime assets |
| 9 conduct, 10 external links, 11 dashboard, 12 readme | No forced credit links, activation redirect, admin advertisement, spam or unrelated dashboard replacement |
| 13 bundled libraries | Uses WordPress-provided editor packages; developer dependencies excluded from installable archives |
| 17 trademarks, 18 directory discretion | GymCoreHQ organization verified; final name/trademark authorization and directory discretion remain human submission gates |
