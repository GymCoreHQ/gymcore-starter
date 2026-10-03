# Optional Core trial-request example

The starter deliberately owns no public lead handler, consent store, or receipt scheduler. This example composes the separately installed **GymCore Trial Signup** block (`gymcore/trial-signup`) with ordinary editable WordPress blocks. It adds no data collection to the default theme or draft importer.

## Dependencies and limits

Obtain authorized **GymCore Core and GymCore Blocks** builds containing the generic contact alignment and its prerequisite Core PR #128 (`28b6050540bb46c5c95a1f1cef2a95ece0a33401`). The alignment is [Core PR #130](https://github.com/GymCoreHQ/gymcore/pull/130), independently reviewed at `07ce8b6559d8b8ccd769e1bf3a39c9da3af2392b`; this commit includes the prerequisite. Both PRs must be integrated and the resulting Core/Blocks packages built before treating this as released behavior. Existing packages numbered 1.0.0 can predate these fixes: do not infer compatibility from that version label. No released minimum version is claimed until the corrected build is actually released. Keep private product packages outside this repository.

The starter itself still needs only WordPress 7.0+/PHP 8.3+. Follow Core/Blocks' own activation requirements, including WooCommerce where required; this example does not install dependencies or grant entitlements. The starter companion plugin is optional and does not supply the trial block. If the block is missing, stop and install/configure the authorized dependency; do not publish a missing-block placeholder.

This generic example captures an **adult contact request**. It does not collect minor/guardian identities, select a class, reserve capacity, or confirm a booking. The success text must not imply one. Use a separately supported flow for minors or actual booking. Do not paste a site-specific adapter into the starter.

## Build the page through WordPress

1. On an isolated fictional test site, activate the corrected Core and Blocks packages and configure their public trial endpoint and approved lead-source choices.
2. Create a new draft page in **Pages → Add New**. Insert **GymCore Trial Signup**, or paste `examples/core-trial-request.html` into the editor's Code editor, then return to Visual editor. The file is ordinary block markup, not PHP or an automatic importer.
3. Select the trial block and use its inspector for location, button label, and success text. Select an actual configured location rather than copying an ID from another site. Edit the heading/paragraph normally; style the surrounding blocks with Site Editor/Styles.
4. Review the displayed contact and consent wording. Either email or phone is sufficient, but every supplied value must be valid. Phone accepts 10–15 digits with common separators. Consent is optional and initially unchecked; do not make it a condition of submitting a request.
5. Test email-only, phone-only, and both, each with consent checked and unchecked. Also test neither, malformed email with valid phone, malformed phone with valid email, and markup in contact input. Valid requests should produce the ordinary neutral success response; invalid requests must create no lead, consent grant, or scheduled job.
6. Inspect Core's own lead/consent records. For checked consent, only supplied destinations may receive grants. If a supported booking workflow emits the shared receipt event, only eligible supplied destinations may receive jobs. The generic signup API itself does not introduce that booking-receipt event. Other configured Core automations remain Core-owned.
7. Review configuration and content before publishing. A published form creates real Core records and may trigger configured automations; run acceptance only in a fictional isolated environment with outbound providers blocked.

No default page, menu, homepage setting, user role, or existing content is changed. Removing the example page does not delete Core lead/consent records; their retention and deletion belong to Core. Theme changes do not remove the block. Deactivating GymCore Blocks requires replacing/removing the trial block before publishing the page again.

## Distribution boundary

This repository example and guide are opt-in development material outside both installable ZIPs. The theme remains presentation-only and does not recommend an unlisted plugin in its packaged onboarding/readme. No GymCore binaries, business logic, customer data, API keys, account IDs or provider setup are included.

## Verified development matrix — 2026-10-03

| Fixture | Observed versions | Result |
| --- | --- | --- |
| Canonical Core services, real WordPress REST/wpdb and Action Scheduler; built Blocks registration | WordPress 7.0.4, PHP 8.2.33, MySQL 8.4, Action Scheduler 3.9.3 | 8 direct-intake and 18 REST cases pass; actual block and this example render |
| Same native fixture on cached official PHP 8.3 image | WordPress 7.0.2, PHP 8.3.33, MySQL 8.4, Action Scheduler 3.9.3 | Same complete matrix passes; compatible PHP floor for starter |
| Starter isolated Playground regression, without commercial packages | WordPress 7.1.2, PHP 8.3.32 | 57 assertions pass across ordinary trash and immediate-deletion configurations |
| Core local checks at reviewed head | PHP 8.5.7 | Lint and PHPStan pass; 4,532 unit tests / 20,660 assertions pass, with existing warnings/deprecations and six skips |
| Blocks actual frontend script and production assets | Three JS suites | 34 tests, production build and PHP render contract pass |

The 18 REST cases cover email-only, phone-only, both, neither, malformed email, malformed phone, tagged phone, null email and array email, each with consent checked and unchecked. Invalid input creates no lead, consent event or scheduled job. Checked consent grants only present destinations. No booking-receipt jobs appear until the fixture explicitly emits the shared receipt event with allowed channels; then real Action Scheduler rows match supplied eligible destinations.

These native fixtures load canonical Core classes and register the built block; they do **not** activate the full commercial product or WooCommerce, test provider delivery, or certify booking/gateway compatibility. The PHP 8.2 run verifies Core/Blocks, not the starter plugin's PHP minimum. Mutable image tags are recorded by observed versions; no latest-version or full-stack certification is claimed. All data is fictional, outgoing HTTP/mail/workers are blocked, and fixture-owned containers/networks are removed afterward.

The starter source audit, PHP lint and packaging pass. Both installable ZIPs are byte-for-byte unchanged by this documentation/example addition. VoiceOver acceptance and existing directory/public-release gates remain separate; this example does not waive them.
