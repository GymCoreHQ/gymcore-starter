# Weekly schedule adapter

Implementation: `plugin/gymcore-starter-kit/includes/schedule.php` and `blocks/weekly-schedule/`. Parent bootstrap must call `GymCoreStarter\schedule_register` on `init` at priority 20. Block name: `gymcore-starter/weekly-schedule`.

This is newly authored integration code, informed by the useful grouping/filtering behavior of the canonical source site's schedule. No source site's class records, branding, defaults, locations, instructors, or fallback timetable are copied. The correct visible-result count and empty state preserve the intent of the upstream frontend fixes.

## Canonical schema inspected

Canonical GymCore source `wp-content/plugins/gym-core/src/Schedule/ClassPostType.php` and `src/Providers/ScheduleServiceProvider.php`, inspected 2026-09-30:

- Public `gym_class` CPT, published records only; password-protected records excluded.
- `_gym_class_status` must be `active`.
- `_gym_class_day_of_week`: full lowercase English weekday key.
- `_gym_class_start_time` and `_gym_class_end_time`: `H:i` 24-hour wall-clock strings. Invalid starts are excluded; invalid or missing end times are omitted.
- `_gym_class_recurrence` must resolve to `weekly`. Nonweekly/specific-date records are excluded because this is a recurring timetable, not an occurrence calendar. WordPress supplies GymCore's registered `weekly` default for absent metadata.
- `gym_program` and `gym_location` term relationships drive filtering and public labels. Exact term IDs are matched; child terms are not implicitly included. Filters combine with AND.
- The source site's schema renderer referenced `_gym_class_duration_minutes`, but canonical GymCore does not register that field. The starter uses canonical end times and does not invent a duration fallback.

No user, instructor, attendance, booking, payment, lead, or membership data are queried. Public titles and taxonomy names are escaped. GymCore retains control of its post type registration and capabilities: the adapter checks its class and public CPT exist, and never instantiates GymCore services, grants capabilities, modifies license/entitlement state, or calls paid operations. This is read-only public presentation, not booking functionality. Existing registered GymCore public content is the adapter boundary; it is not a substitute license check for a future premium API.

## Editing and display

Editors insert the block through the standard inserter. Inspector controls expose searchable Program and Location term selectors, day selection, and day heading level. Term selectors query the native authenticated WordPress core-data taxonomy endpoints (100 results per search; type a narrower search for larger taxonomies). Terms and classes remain managed in GymCore's normal admin screens.

The site `start_of_week`, `time_format`, and time zone settings control ordering and time formatting. The visible timezone is explicit. No UTC conversion is applied to stored recurring wall times. End time less than or equal to start time is marked next day. Use a geographic timezone in Settings → General for seasonal daylight-saving changes.

The block renders semantic day sections and lists, excludes empty days, sorts raw 24-hour time values rather than formatted labels, and calculates counts after validation and filtering. CSS uses a responsive grid without a fixed seven-column minimum. No frontend JavaScript is loaded. Heading level is editable to fit its surrounding page. There is no fabricated fallback schedule. Missing dependencies display an unavailable state; zero qualifying records display a real zero count and empty state.

## Verification and remaining release checks

On 2026-09-30: PHP syntax check and Node syntax check passed. Nine focused PHP fixture assertions passed: validated count, chronological ordering, title escaping, explicit timezone, day filter, combined taxonomy constraints, published/active/non-password query scope, empty state, missing dependency. These fixture tests stub WordPress APIs and do not prove real WordPress/GymCore/WooCommerce integration. The parent task owns the real WordPress harness, browser accessibility/editor checks, final exact source commit pins, and release matrix.

Reference checked 2026-09-30: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/ — canonical block.json, API version 3, server registration, file asset metadata. Server-side render uses WordPress's existing block renderer rather than a custom public endpoint. Editor assets use native `wp` packages and readable shipped source with an explicit `.asset.php`; no build pipeline is required.

Limitations: no dated cancellations, holiday exceptions, biweekly occurrences, live capacity, booking, instructor profiles, location-specific timezones, or recurrence expansion. The site time zone applies to all classes. Validate those needs against a supported GymCore public API before extending this adapter. The timetable loads all matching published active classes, appropriate for typical gym schedules; benchmark very large catalogues before deployment.
