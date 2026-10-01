# Release candidate verification

This branch continues from owner-merged main `43fb95aae56ee2554d8aa598daa1f6f304f469ed`. It prepares a private submission candidate; it does not publish a release or claim WordPress.org approval.

## Changes

Private theme/plugin catalogs now use normal WordPress loading hooks, including editor JavaScript translations. Both packages include reproducible POT templates and instructions, not fabricated translated languages. Visual checks found and fixed unbroken-text overflow, mobile-menu focus contrast and WooCommerce floating-label contrast. The theme uses scoped wrapping, native Navigation overlay palette controls, and dark floating labels against WooCommerce’s default white control surfaces; payment-option labels remain untouched. Readmes now describe actual cleanup behavior and screenshot resources. Contributor metadata is supported by the official WordPress.org profile linking to the verified GitHub identity.

## Evidence index

- [Current directory requirements and submission assets](submission-readiness.md)
- [Locale and RTL runtime verification](locale-readiness.md)
- [Keyboard, layout and accessibility review](accessibility-readiness.md)
- [Expanded commerce verification](commerce-readiness.md)
- [Site Editor saves and packaged upgrade preservation](editor-upgrade-readiness.md)
- [104-site pagination and exception restoration](network-scale.md)
- [Final native directory checks and exact minimum WordPress](directory-readiness.md)
- [Authorized canonical GymCore schedule integration](canonical-integration.md)

Reports distinguish automated browser keyboard/DOM checks from an actual human screen-reader assessment; synthetic translated markers from reviewed translations; and offline fictional checkout from paid provider or licensed-feature coverage. Current upstream PHP patches are documented separately from exact installed test runtimes.

## Submission handoff

Run `python3 tools/package.py` after the checks. Upload candidates are the two separate installable ZIPs in `dist/`; `dist/manifest.json` records hashes and every entry. The theme contains its fictional screenshot. Plugin directory icon/banner/screenshots are optional and are not used to imply additional features. No database, runtime dependencies, credentials, source history or synthetic catalog binaries enter the packages.

Before actual submission, the owner must approve the chosen submitting account/access, name/mark and final redistribution provenance, final artifact hashes and public publication. Slug lookup is not a reservation. Paid provider accounts, purchases and agreements require separate authorization. Remaining technical limits are maintained in [release checklist](release-checklist.md); none is silently waived by passing local checks.

## Automated directory result

After coordinated Docker recovery, the final ZIPs passed native MySQL Plugin Check (29 static plus five runtime checks) with zero errors and one unsuppressed warning about the intentional private-catalog loader. Theme Check passed the final CSS-adjusted theme with one matching-text-domain INFO. Exact versions, artifact hashes, initial failed attempts and successful cleanup are in directory-readiness.md. The loader warning remains a manual directory-review decision; no check pass implies WordPress.org acceptance.
