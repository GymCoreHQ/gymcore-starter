Translation templates

gymcore-starter-kit.pot contains extracted source strings, not a translated language.
For a private translation, place a reviewed PHP catalog here named
gymcore-starter-kit-LOCALE.mo. Compile the corresponding PO's JavaScript messages
with wp i18n make-json --no-purge; retain the source-path-hashed JSON filenames.
The plugin registers this directory on init and supplies it to the editor script
translation loader. WordPress's standard global language-pack path also works.

Refresh the POT with tools/i18n.py --write-templates from the repository root.
Only POT templates ship by default. Synthetic locale test catalogs are not
publishable translations and must never be copied here.
