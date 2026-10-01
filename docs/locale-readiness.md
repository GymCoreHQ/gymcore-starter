# Locale loading and RTL verification

This phase adds private catalog loading and a repeatable Arabic/German browser smoke test. It does **not** ship reviewed Arabic or German starter translations or certify language quality.

## Package behavior

- The theme registers its `languages/` path on `after_setup_theme`, without evaluating translated strings during bootstrap. Private PHP catalogs use locale-only names, such as `de_DE.mo`.
- The companion registers its local path on `init` at priority 0, before block metadata registration. PHP catalogs use domain-and-locale names, such as `gymcore-starter-kit-de_DE.mo`.
- The editor script receives the same local directory through `wp_set_script_translations`. Compile the translated PO with `wp i18n make-json --no-purge` and preserve its per-source hashed JSON filenames.
- Both headers declare `Domain Path: /languages`. WordPress's standard global language-pack locations remain available; these hooks add private distribution paths.
- Only real source **POT templates** and explanatory readmes ship. Synthetic test PO/MO/JSON files are generated in disposable copies of the packages and never enter release directories or ZIPs.

The theme POT contains 67 message/context entries and the plugin POT 58. They include PHP/JS strings, block metadata, theme presets/template-part titles, pattern metadata, and the Light style title. Empty translation values are intentional. `Report-Msgid-Bugs-To` is blank rather than suggesting an unpublished WordPress.org support URL.

```sh
# Requires official WP-CLI PHAR, PHP, gettext and network access for WP metadata.
GCS_WP_CLI_PHAR=/path/to/wp-cli.phar GCS_I18N_PHP=/path/to/php \
  python3 tools/i18n.py --write-templates

# Requires npm dependencies, GNU msgfmt and Playwright Chromium.
node tests/locale-rtl.mjs
```

The extraction helper validates synthetic MO formats and Jed JSON in ignored `test-results/i18n/`. Its `--write-templates` option copies **only POT files** into the packages. It does not publish translations or contact a translation service.

## Runtime test design

`tests/locale-rtl.mjs` creates fresh WordPress Playground 7.1.2/PHP 8.5 fixtures on port 9493 by default, installing the official WordPress core `ar` and `de_DE` language packs. Package files are copied into disposable directories rather than mounting writable release sources. Synthetic local catalogs contain conspicuous `[TEST-ar]`/`[TEST-de_DE]` markers and Arabic/German stress text. Arabic's six-form and German's two-form plural expressions are exercised without claiming that the test text is an accurate translation.

The PHP checks require the official core catalog, expected locale/direction, local theme/plugin translations, translated pattern output and a translated two-class plural. A test-only MU plugin observes premature `_load_textdomain_just_in_time` warnings and registers fictional public class schema. This is presentation testing, not a licensed GymCore integration or entitlement test.

The browser checks both the homepage and a schedule page at 1200×900 and 390×844. They verify computed RTL/LTR direction, no horizontal document overflow, native mobile navigation open/Escape behavior, selected axe WCAG 2 A/AA and 2.1 AA rules, and no uncaught page errors. In the actual Gutenberg editor, the test verifies private JavaScript strings through `wp.i18n`, opens the selected schedule block's inspector, and checks its direction and overflow at desktop width. Requests before and after browser checks must not record premature package translation loading.

Use `GCS_BROWSER_CHANNEL=chrome` for installed Chrome, `GCS_LOCALES=ar` to narrow a diagnostic rerun, or `GCS_LOCALE_PORT` to avoid a local collision. The script writes its report to ignored `test-results/locale-rtl.json` and removes the disposable package copies/catalogs on completion.

## Result and limits

Final complete run on 2026-10-01: **pass, exit 0** on WordPress **7.1.2**, Playground PHP **8.5.8**, installed Chrome **154.0.8037.58**, Playwright **1.58.2**, and axe-core **4.11.1**.

| Locale | PHP/private pattern/plural catalogs | Browser pages/viewports | Editor JS + inspector | Early loading notices |
| --- | --- | --- | --- | --- |
| Official core `ar` + synthetic local catalogs | Pass | Four combinations; RTL, no overflow, zero selected-rule axe violations; mobile open/Escape pass | Actual `[TEST-ar]` strings; RTL inspector, no overflow | None |
| Official core `de_DE` + synthetic local catalogs | Pass | Four combinations; LTR, no overflow, zero selected-rule axe violations; mobile open/Escape pass | Actual `[TEST-de_DE]` strings; LTR inspector, no overflow | None |

Neither locale produced uncaught browser page errors. PHP/JS syntax, scoped WordPress coding standards, and the 41-file distribution audit also passed. The extraction helper's `--write-templates` mode was run successfully; no synthetic catalogs entered package directories.

Two harness issues were corrected during development: axe requires an explicitly created browser context, and WordPress can omit the HTML `dir` attribute for LTR pages. The final test checks computed direction rather than treating an omitted attribute as a product failure. No app change was needed for either issue.

No language-quality, screen-reader, comprehensive RTL/editor-mobile, or WordPress.org approval claim follows from these smoke tests.

Switching a site locale does not rewrite previously saved page/pattern content. Private catalog changes require appropriate cache handling and site-specific verification; authors remain responsible for their multilingual-content workflow and for reviewing translated copy before publication.

Canonical local skills reviewed: `wp-block-development`, `wp-block-themes`, `wp-patterns` (pattern registration/i18n), and `wp-plugin-development` from the installed WordPress agent-skills catalog. Official API sources checked 2026-10-01: [load_theme_textdomain](https://developer.wordpress.org/reference/functions/load_theme_textdomain/), [load_plugin_textdomain](https://developer.wordpress.org/reference/functions/load_plugin_textdomain/), [wp_set_script_translations](https://developer.wordpress.org/reference/functions/wp_set_script_translations/), [make-pot](https://developer.wordpress.org/cli/commands/i18n/make-pot/), and [make-json](https://developer.wordpress.org/cli/commands/i18n/make-json/).
