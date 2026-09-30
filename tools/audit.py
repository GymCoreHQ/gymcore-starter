#!/usr/bin/env python3
"""Deterministic distribution audit. Heuristics complement human review; not a guarantee."""
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
errors = []
count = 0
for directory in ('theme', 'plugin'):
    for path in (ROOT / directory).rglob('*'):
        if not path.is_file():
            continue
        count += 1
        rel = str(path.relative_to(ROOT))
        if path.is_symlink():
            errors.append(f'{rel}: symlink prohibited')
        if path.suffix in ('.png',):
            if path.name != 'screenshot.png':
                errors.append(f'{rel}: unexpected binary asset')
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            errors.append(f'{rel}: unapproved binary file')
            continue
        # Intentionally restricted to installable source; provenance docs may name upstream projects.
        if re.search(r'haanpaa|teamhaanpaa|\bhma[-_ ]|pressable|wpengine|jetpack_crm|google-analytics|googletagmanager|fonts\.google|license[_-]exempt', text, re.I):
            errors.append(f'{rel}: source-site/provider residue')
        if re.search(r'AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|sk_live_[A-Za-z0-9]+', text):
            errors.append(f'{rel}: credential signature')
        if path.name != 'LICENSE' and re.search(r'https?://(?!www\.gnu\.org/|schemas\.wp\.org/)', text):
            errors.append(f'{rel}: review unexpected external URL')
        if path.name == 'LICENSE' and 'Version 2, June 1991' not in text:
            errors.append(f'{rel}: license text must match GPL-2.0-or-later declaration')
        if path.suffix == '.json':
            data = json.loads(text)
            if path.name == 'block.json' and data.get('apiVersion') != 3:
                errors.append(f'{rel}: block API version must be 3')
            if path.name == 'theme.json' and data.get('version') != 3:
                errors.append(f'{rel}: theme schema version must be 3')
        if path.suffix == '.php':
            result = subprocess.run(['php', '-l', str(path)], capture_output=True, text=True)
            if result.returncode:
                errors.append(f'{rel}: PHP syntax failure: {result.stdout} {result.stderr}')
        if path.suffix == '.js':
            result = subprocess.run(['node', '--check', str(path)], capture_output=True, text=True)
            if result.returncode:
                errors.append(f'{rel}: JS syntax failure')
for path in (ROOT / 'theme').rglob('*.html'):
    text = path.read_text()
    for match in re.finditer(r'<!-- wp:[\w/-]+\s+(\{.*?\})\s*/?-->', text):
        try:
            json.loads(match.group(1))
        except json.JSONDecodeError:
            errors.append(f'{path.name}: invalid block JSON')
for name in ('package-lock.json', 'composer.lock'):
    path = ROOT / name
    if path.exists() and re.search(r'autoproxxy|ask-in-opers|/Users/|_authToken', path.read_text()):
        errors.append(f'{name}: private registry/path residue')
print(json.dumps({'distribution_files': count, 'errors': errors}, indent=2))
sys.exit(bool(errors))
