# Translation readiness review — 2026-09-30

Independent source and extraction review of the starter after commit `3a8b3d405e832443e05c77309c703aa84a0acc84`. Only this report and `tools/i18n.py` were authored by this reviewer; no installable implementation changed.

## Verified

Official WP-CLI 2.12.0 extracted catalogs with its string audit enabled, using native PHP 8.2.31. The tool's dependencies emit extensive deprecation notices under the installed PHP 8.5.7, so PHP 8.2 was used for extraction only; this does not lower the starter's PHP requirement. No WordPress site or database was loaded.

| Check | Result |
| --- | --- |
| Theme POT extraction | 67 message/context entries |
| Plugin POT extraction | 58 message/context entries |
| Pattern title/description, theme presets/template-part titles, Light variation | Included by official extractor |
| PHP messages, plural class count, JS inspector controls, block title/description | Included by official extractor |
| Synthetic plural PO to MO format validation | Pass with GNU `msgfmt --check-format` |
| Synthetic JS PO to per-source Jed JSON | Pass; expected source-path hash and translated `All` entry verified; PHP-only message excluded |

Visible source strings use the correct package text domains; placeholder messages include translator context. Block metadata declares its text domain, the editor depends on `wp-i18n`, and registration calls `wp_set_script_translations`. This establishes extraction readiness, not actual translation quality or frontend/editor loading under another locale.

## Findings and remaining work

1. **Admin-label issue resolved:** the parent replaced the raw `get_post_status($id)` code beside imported page links with the owning WordPress post-status object's translated label. Verified in refreshed source; no implementation edit made by this reviewer.
2. **Private catalog delivery is not configured:** no POT/PO/MO/Jed JSON files or local language directories ship yet. WordPress.org's standard global language-pack paths can serve slug-matched domains automatically. A private package that bundles local translations needs an explicit local theme/plugin textdomain path and the third `wp_set_script_translations` directory argument. Register paths on the appropriate normal lifecycle hook, avoiding early translation evaluation. Merely adding a POT does not load a translation.
3. **No real language pack validated:** the generated pseudo-locale fixtures are test-only, not publishable translations. Do not distribute them as a genuine supported language. Obtain reviewed locale translations, compile PHP MO and JS JSON, and verify actual native WordPress loading before claiming locale support.
4. **RTL browser checks pending:** schedule CSS already uses logical block borders/padding and a responsive grid; theme left/right padding is symmetrical. Native navigation has physical `justifyContent: right`, whose effective RTL behavior needs a browser check. Test Arabic/Hebrew direction, long labels, schedule times/numerals, day ordering, inspector layout and mobile menu. Static inspection does not establish RTL correctness.
5. **Saved content is content:** inserted patterns and imported draft text are stored in the language used at insertion. Switching the site locale should not silently rewrite an author's saved page content. Document this distinction from translated UI, and use the owner's chosen multilingual-content workflow if required.

## Reproduce extraction and catalog-format checks

Provide official WP-CLI PHAR, PHP and GNU gettext. The script does not download executables or start a service. It writes only to ignored `test-results/i18n/`, including both POTs, synthetic PO/MO/JSON and a JSON report. WP-CLI may fetch official WordPress i18n metadata, so network access is required even though no site is loaded.

```sh
GCS_WP_CLI_PHAR=/path/to/wp-cli.phar GCS_I18N_PHP=/path/to/php python3 tools/i18n.py
```

Successful review outputs used `test-results/i18n/gymcore-starter.pot` and `gymcore-starter-kit.pot`. Move templates into release `languages/` directories only as an intentional packaging change; update the archive allowlist for `.pot` and any genuinely supported `.po`/`.mo` files. JSON is already an allowed type, but paths and loading still need testing. The helper's fixed POT creation timestamp makes extraction diffs easier to review; strings and translator comments still come from current source.

## Native Plugin Check recovery and environment inspection

Native PHP 8.5.7 has `mysqli`, `pdo_mysql`, `pdo_sqlite`, `sqlite3`, `intl` and `mbstring`; PHP 8.2.31 is also available for development tools. No MySQL/MariaDB server/client was found in the checked Homebrew/Applications executable locations. Standard Local.app and Local lightning-services locations are absent. Docker CLI exists but its configured desktop socket is absent; no daemon was started and no services, containers, existing site files, credentials or databases were changed/read. A new disposable database was created for the authorized follow-up below.

**Executed successfully:** a fresh native fixture under `/tmp/gcs-native-pcp/wordpress` used official WordPress **7.1.2**, SQLite Database Integration **3.0.2**, WP-CLI **2.12.0**, Plugin Check **2.1.0**, and native PHP **8.5.7**. The first extraction attempt hit PHP's default memory limit; the fresh download completed with a 512 MB command-local limit. No HTTP server or database daemon was started. Only fictional fixture configuration and the starter/official checking packages were installed. WordPress was installed using CLI with outgoing installation email disabled.

The starter remained inactive and the CLI runner was not initialized early, so `CLI_Runner::allow_runtime_checks()` excluded runtime checks. The default available static checks ran, without an ignored-warning or ignored-error filter. Initial runs found six global-variable prefix warnings in the new multisite uninstall implementation; the parent wrapped that implementation in a static closure. After refreshing the scratch copy, the native PHP 8.5.7 rerun returned **exit 0, “Checks complete. No errors found,” no warning records and empty stderr**. This also covers the tool's `i18n_usage` static check. It does not cover runtime preparations, PHP notices from executing the starter, or native MySQL behavior.

Exact final check command (fixture paths only):

```sh
WP_CLI_CACHE_DIR=/tmp/gcs-native-pcp/cache /opt/homebrew/bin/php \
  -d memory_limit=512M -d error_reporting=24575 /tmp/gcs-i18n-wp-cli.phar \
  --skip-packages --path=/tmp/gcs-native-pcp/wordpress \
  plugin check gymcore-starter-kit --format=json
```

The command-local error mask omits PHP `E_DEPRECATED` notices from WP-CLI's older dependencies on PHP 8.5; no PCP result code or warning was suppressed. Raw stdout/stderr are retained temporarily as `/tmp/gcs-native-pcp/static-php85-result.txt` and `static-php85-stderr.txt`. These runtime tools/databases are not distributed. Full native PHP/MySQL Plugin Check and runtime-check coverage remain separate release gates.

Reviewed canonical local skills: `wp-block-development`, `wp-block-themes`, `wp-plugin-development`, and `wp-patterns/references/pattern-registration.md` from the installed WordPress agent-skills catalog. Official references checked 2026-09-30: [make-pot](https://developer.wordpress.org/cli/commands/i18n/make-pot/), [make-json](https://developer.wordpress.org/cli/commands/i18n/make-json/), and [wp_set_script_translations](https://developer.wordpress.org/reference/functions/wp_set_script_translations/).
