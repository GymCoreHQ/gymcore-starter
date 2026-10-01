#!/usr/bin/env python3
"""Create installable source ZIPs with an explicit inclusion policy, never repository history."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

root = Path(__file__).resolve().parents[1]
subprocess.run(['python3', str(root / 'tools/audit.py')], check=True)
out = root / 'dist'
out.mkdir(exist_ok=True)
manifest = {}
for kind, name in [('theme', 'gymcore-starter'), ('plugin', 'gymcore-starter-kit')]:
    base = root / kind / name
    target = out / f'{name}-0.1.0.zip'
    files = []
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in sorted(base.rglob('*')):
            if not p.is_file():
                continue
            assert not p.is_symlink()
            assert p.suffix in ('.php', '.js', '.css', '.json', '.html', '.txt', '.png') or p.name == 'LICENSE'
            archive = str(p.relative_to(base.parent))
            info = zipfile.ZipInfo(archive, (2026, 9, 30, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, p.read_bytes())
            files.append(archive)
    manifest[target.name] = {'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'files': files}
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({k: {'sha256': v['sha256'], 'files': len(v['files'])} for k, v in manifest.items()}, indent=2))
