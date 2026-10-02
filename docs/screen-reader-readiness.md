# Screen-reader acceptance

**Pending: no screen-reader pass is claimed.** On 2026-10-01 the local macOS probe found VoiceOver installed and initially not running. System Events reported `UI elements enabled = false`. A bounded request for the VoiceOver cursor bounds timed out after 20 seconds; the final VoiceOver quit command returned exit 0. No screen contents were requested or permissions changed. This does not establish that a particular permission was denied: the failed probe does not identify the cause.

A human VoiceOver session or user-configured macOS Accessibility/Automation and VoiceOver scripting access is required before those checks can be completed. A human can satisfy acceptance by running the checklist with a supported screen reader/browser and recording the spoken results, without enabling automation permissions. If automated VoiceOver scripting is desired, setup should be performed deliberately by the user in their OS settings; the fixture does not grant permissions or operate VoiceOver.

## Start the disposable fixture

```sh
npm ci
node tests/screen-reader-fixture.mjs
```

The runner copies the theme into scratch, starts a fresh fictional WordPress 7.1.2/PHP 8.3 Playground site on `http://127.0.0.1:9501`, and prints exact page routes when ready. No source theme files, existing WordPress databases, production credentials, or personal browser profiles are mounted. Open the printed URL in a dedicated temporary browser profile. For example, on macOS with Chrome installed:

```sh
GCS_READER_PROFILE=$(mktemp -d /tmp/gcs-reader-profile.XXXXXX)
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --user-data-dir="$GCS_READER_PROFILE" http://127.0.0.1:9501/
```

After the session, close that temporary browser completely and remove only the recorded temporary profile directory. Do not reuse a personal profile for this fixture. Enable and operate VoiceOver using the user's normal macOS workflow; no automated speech/reading claim follows from starting the site.

The fixture shuts down 15 minutes after readiness or on Ctrl-C/SIGTERM. `GCS_READER_SECONDS` accepts 1–3600 seconds; `GCS_TEST_PORT` selects another loopback port. Server shutdown and scratch deletion are attempted independently. `test-results/screen-reader/fixture.json` records startup/cleanup evidence, **not** accessibility acceptance.

## Human acceptance checklist

Record tester, date, macOS version, browser/version, VoiceOver/version, exact route, action, spoken result, and pass/fail/blocked for each observation. Use the fixture's printed routes; content is fictional.

- Front page: navigate landmarks and headings. Confirm one main region, a usable page title, understandable heading order, and no unexpected repeated or missing content.
- Use the skip link with keyboard and VoiceOver. Confirm focus/reading resumes in the main content and the next actionable item is sensible.
- At a narrow window, open navigation. Confirm the menu's purpose and state are announced, reading/focus stays within it, and Escape returns focus to its opener. Check forward and reverse navigation.
- Reach an FAQ summary, expand and collapse it, and confirm its state and answer are announced without losing place.
- On the 404 route, locate the labeled search field, enter Accessibility, submit, and confirm the results page title/heading is understandable.
- On the single-post route, read the fictional comment, reach Reply and the comment form, and confirm labels, required markers, consent checkbox state, and submit purpose. Type only fictional text. Submit with required fields empty and record whether the invalid field, error, and recovery path are announced. Do not infer announcement success from DOM focus alone.
- On the long-content page and archive, verify reading order and continued access when text wraps and the page scrolls. Note any verbosity or unclear link purpose.

Complete a separate human review for Site Editor dialogs, commerce checkout, third-party forms, and real editorial image alternatives where those features are part of the intended release. Native engine zoom is covered separately in [native-zoom-readiness.md](native-zoom-readiness.md); it does not replace spoken-output testing.

## Fixture validation

The short smoke command is `GCS_READER_SECONDS=2 node tests/screen-reader-fixture.mjs`. An HTTP 200 and successful cleanup show only that the fictional review site works and is removed afterward. Human acceptance results must be added explicitly after an actual reader session; the runner always records `screenReaderPassed: false` to avoid treating infrastructure success as a reader pass.

Timeout smoke verified on 2026-10-01T15:14:51.801Z: HTTP 200, WP 7.1.2/PHP 8.3.32, process exit 0, `stoppedBy: timeout`, zero cleanup errors.

SIGINT smoke verified on 2026-10-01T15:15:51.790Z: HTTP 200, process exit 0, `stoppedBy: signal`, zero cleanup errors. Both smoke tests kept `screenReaderPassed: false`.
