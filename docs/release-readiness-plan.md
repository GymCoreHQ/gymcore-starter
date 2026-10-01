# Release-readiness scope

Baseline: merged main `43fb95aae56ee2554d8aa598daa1f6f304f469ed`. Work remains on an isolated branch in the private repository. Existing HMA and marketing work is outside scope.

The goal is a concrete, reviewable candidate consisting of separate installable theme/plugin ZIPs, deterministic manifests, corrected directory metadata, translation templates, executable regression checks and precise release gates. Native WordPress remains the editing and settings interface. No public visibility change, WordPress.org upload, SVN publication, deployment, license bypass or purchase is authorized.

Verification tracks:

- Refresh official directory requirements and review author identity, package/readme/screenshot and license provenance.
- Exercise all templates and both palettes with keyboard, accessibility-tree/DOM checks, reflow and automated accessibility tools. Distinguish browser automation from a human assistive-technology assessment.
- Install real WordPress language packs; prove theme/plugin PHP and editor JavaScript loading using clearly identified test-only catalogs. Check RTL rendering. Do not ship fabricated translations as supported languages.
- Exercise fictional WooCommerce product/cart/checkout/account flows and order storage using supported APIs and an offline gateway. Paid provider features remain gated unless separate legitimate access is available.
- Exercise a real 104-site network, per-site opt-in cleanup across the 100-site boundary and exception restoration. No production-performance claim follows from a local finite fixture.
- Repeat final package audits, WordPress regression checks and official directory checks. Independently review the final commit and leave its PR ready with checks passing.

Evidence belongs in repository docs with exact runtime versions, package hashes and limits. Synthetic fixture data, downloaded third-party/private dependencies, databases, credentials and raw browser artifacts stay outside distributable packages. Delete only task-owned disposable Docker resources. Owner account, name/mark and publication approvals remain explicit final gates.
