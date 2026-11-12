#!/usr/bin/env python3
"""build.py leaves :icon: tokens in fragment .plain.html files; the pipeline turns them into
icon spans. Apply the same conversion to the local fragment copies (same regex as build.py)."""
import json, pathlib, re

ICON = re.compile(r'(?<=[\s>]):([a-z][a-z-]*[a-z]):(?=[\s<])')
base = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads((base / 'pages.json').read_text())
repo = (base / cfg['repo']).resolve()
for path in cfg.get('fragments', {}).values():
    f = repo / f'{path}.plain.html'
    s = f.read_text()
    n = len(ICON.findall(s))
    f.write_text(ICON.sub(r'<span class="icon icon-\1"></span>', s))
    print(f.name, n, 'icon tokens')
