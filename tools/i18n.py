#!/usr/bin/env python3
"""Extract catalogs and verify synthetic JS/format fixtures; never load a site.

Requires PHP, official WP-CLI PHAR (GCS_WP_CLI_PHAR), and GNU msgfmt.
Synthetic outputs stay under ignored test-results/i18n. The explicit
--write-templates option refreshes only POT templates in installable packages.
"""
import hashlib
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--write-templates', action='store_true', help='Refresh only real POT templates in the packages; synthetic catalogs stay in test-results.')
args = parser.parse_args()
out = root / 'test-results' / 'i18n'
out.mkdir(parents=True, exist_ok=True)
phar = Path(os.environ.get('GCS_WP_CLI_PHAR', '/tmp/gcs-i18n-wp-cli.phar'))
php = os.environ.get('GCS_I18N_PHP', 'php')
if not phar.is_file() or not shutil.which(php) or not shutil.which('msgfmt'):
    raise SystemExit('Provide official GCS_WP_CLI_PHAR, GCS_I18N_PHP and GNU msgfmt; see docs/translation-review.md.')
env = dict(os.environ, WP_CLI_CACHE_DIR=str(out / 'cache'))
cli = [php, str(phar), '--skip-packages']
counts = {}
for kind, domain in [('theme', 'gymcore-starter'), ('plugin', 'gymcore-starter-kit')]:
    target = out / (domain + '.pot')
    subprocess.run(cli + ['i18n', 'make-pot', str(root / kind / domain), str(target),
                         '--domain=' + domain, '--headers={"POT-Creation-Date":"2026-10-01 00:00+0000","Report-Msgid-Bugs-To":""}'],
                   cwd=root, env=env, check=True)
    text = target.read_text()
    counts[domain] = sum(line.startswith('msgid ') and line != 'msgid ""' for line in text.splitlines())
    required = ['"Light"', '"Header"', '"Training community introduction"'] if kind == 'theme' else [
        '"Schedule filters"', '"Weekly class schedule"', '"%s weekly class"']
    assert all(value in text for value in required), (domain, 'Missing expected extraction')
    if args.write_templates:
        languages = root / kind / domain / 'languages'
        languages.mkdir(exist_ok=True)
        shutil.copyfile(target, languages / target.name)

# Clearly synthetic translation, not a shipped language or linguistic certification.
po = out / 'gymcore-starter-kit-en_XA.po'
po.write_text('''msgid ""
msgstr ""
"Project-Id-Version: GymCore Starter test\\n"
"Language: en_XA\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"
"X-Domain: gymcore-starter-kit\\n"

#: blocks/weekly-schedule/index.js:14
msgid "All"
msgstr "[TEST] All"

#: includes/schedule.php:109
#, php-format
msgid "%s weekly class"
msgid_plural "%s weekly classes"
msgstr[0] "[TEST] %s class"
msgstr[1] "[TEST] %s classes"
''')
subprocess.run(['msgfmt', '--check-format', str(po), '-o', str(out / 'gymcore-starter-kit-en_XA.mo')], check=True)
subprocess.run(cli + ['i18n', 'make-json', str(po), str(out), '--no-purge'], cwd=root, env=env, check=True)
digest = hashlib.md5(b'blocks/weekly-schedule/index.js').hexdigest()
catalog = out / ('gymcore-starter-kit-en_XA-' + digest + '.json')
data = json.loads(catalog.read_text())
messages = data['locale_data']['messages']
assert messages['All'] == ['[TEST] All'], 'JS translation not emitted'
assert '%s weekly class' not in messages, 'PHP-only translation incorrectly emitted to JS'
report = {'pot_messages': counts, 'synthetic_mo_format_check': 'pass',
          'synthetic_jed_json': 'pass', 'runtime_translation_loading': 'not tested',
          'language_quality_and_rtl_browser': 'not tested'}
(out / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
