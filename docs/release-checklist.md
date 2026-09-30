# Release gate

This repository is a private review candidate. A green local check or private push is not authorization to publish. Consult verification.md for what actually ran.

## Before any public release

- [ ] Human review of branding, name availability, authorship and GPL redistribution authority; retain source attribution/provenance.
- [ ] Recheck current WordPress theme/plugin directory rules and release versions against official sources on submission day.
- [ ] Theme Check and Plugin Check on real current WordPress; review every required, recommended and manual finding.
- [ ] Confirm minimum and latest WP/PHP matrix plus actual supported GymCore and WooCommerce combinations; use MySQL/MariaDB in addition to SQLite/WASM.
- [ ] Real authorized GymCore activation, settings, class/taxonomy updates and schedule behavior. No test fixture substitutes for this.
- [ ] Review Cart/Checkout Blocks, HPOS, products and account templates with the installed commerce stack; no financial transactions against live gateways.
- [ ] Full keyboard and assistive-technology review of all templates, editor controls, long titles, pagination, comments, forms, mobile/zoom/RTL and both style variations. Do not add accessibility-ready tag until reviewed.
- [ ] Theme Unit Test data; block serialization and Site Editor saves; editor/frontend parity; user-edited template upgrade behavior.
- [ ] Multisite activation/settings/uninstall policy; currently only single-site behavior is targeted.
- [ ] Translation POT/JS JSON catalogs and locale/RTL smoke tests; final screenshot and readme/header consistency.
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
