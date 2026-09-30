# Independent pre-push review

Reviewed 2026-09-30 by a separate source/security reviewer. **No unresolved security, sanitization, license-text or packaging blocker identified for private review.** This is not authorization or certification for public release or WordPress.org submission.

## Scope and evidence

- Inspected the 62 staged candidate files, including package locks, CI, tests, documentation, theme, companion plugin and generated screenshot. No source checkout/history, runtime directory, vendor tree, production data or deployment configuration is staged.
- Independently scanned staged bytes for credential signatures, private registry/local path residues and known source-site contacts/locations/domains. Only deliberate banned-pattern definitions in `tools/audit.py` matched; no unexplained hit remains.
- Resolved an initial license-text mismatch: all three LICENSE files now contain identical official GPL v2 text consistent with GPL-2.0-or-later declarations. SHA-256: `edaef632cbb643e4e7a221717a6c441a4c1a7c918e6e4d56debc3d8739b233f6`.
- Package locks use public npm/Composer source, registry, homepage and funding URLs; no private proxy URL or authentication token detected. Development dependencies are not shipped in installable ZIPs.
- Reviewed the fictional screenshot visually. No original source-site logo, imagery, people, records or locations are present.
- Ran the distribution audit: 36 files, zero errors. Source and heuristic scans complement review; they are not a guarantee against every possible defect.

## Security boundaries reviewed

Import requires administrator settings and page-edit capabilities, an action-specific browser nonce, and atomic setup locking. It creates fictional drafts only, records generated ownership markers, resumes partial work and never overwrites existing content or changes homepage/navigation settings.

Reset requires administrator settings/page-delete capabilities, an action-specific nonce and explicit acknowledgement. Each page must remain a draft, match the import ownership token and pass the individual deletion capability check. Trash must be enabled. Edited imported drafts are included only with the explicit disclosed confirmation. Published, unrelated and ownership-mismatched content is preserved; the manifest remains to prevent duplicate setup.

Uninstall checks the WordPress uninstall context and removes only its own bookkeeping when the saved preference opts in; content always remains. The schedule adapter reads only published active, unprotected, valid weekly classes after checking the actual GymCore class and public post-type registration. It escapes output, queries no members/payments/attendance/bookings, and grants no capabilities or entitlements. The theme owns presentation only. CI has read-only repository permissions, pinned checkout and no deployment/secrets configuration.

## Final archive verification

Both final ZIPs passed CRC, exact manifest-list/hash checks, safe-path/allowlist inspection and byte-for-byte comparison with the **staged installable source**. No stale source difference remains.

| Archive | Entries | SHA-256 |
| --- | --- | --- |
| `gymcore-starter-0.1.0.zip` | 26 | `f29fe1068e3c276aca90c807588f33ea8d517df1e3ed857324ccef474e063328` |
| `gymcore-starter-kit-0.1.0.zip` | 10 | `53bb5bad2e3b5621fd84db0e51bf42b6a5cac75591d697b658c8cf9b4e6808f8` |

The final archive inspection found no hidden/provider files, git metadata, source checkouts, vendor modules, traversal paths or credential/source-site scan hits. Only the locally generated screenshot is a bundled binary asset.

## Verification limits

The owner supplied the runtime evidence; this reviewer inspected the final verification report but did not independently rerun its full runtime matrix. It distinguishes the final 57 assertions, earlier 49/51-check matrix runs, browser/axe smoke and successful Theme Check from the failed Playground Plugin Check attempt. Synthetic GymCore schema fixtures remain clearly labeled; they do not prove real authorized GymCore compatibility or licensed features. Native Plugin Check, real GymCore integration, full commerce flows, MySQL/MariaDB, multisite, manual accessibility and directory approval remain release gates.

The parent must stage this revised report and the final runtime/release-checklist documentation before commit. No implementation files were changed by this reviewer.
