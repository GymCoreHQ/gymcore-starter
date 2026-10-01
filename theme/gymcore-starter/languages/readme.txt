Translation templates

gymcore-starter.pot contains extracted source strings, not a translated language.
For a private translation, place a reviewed locale catalog here as LOCALE.mo
(for example de_DE.mo). The theme registers this path on after_setup_theme;
WordPress still checks its standard global language-pack directory.

Refresh the POT with tools/i18n.py --write-templates from the repository root.
The script's synthetic test catalogs stay under ignored test-results/i18n and
must never be copied into this directory. Saved pattern/page content remains in
the language in which an author inserted it; changing locale does not rewrite it.
