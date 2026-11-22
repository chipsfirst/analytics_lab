import re, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
version = (root / "VERSION").read_text(encoding="utf-8").strip()
sw = (root / "sw.js").read_text(encoding="utf-8")
m = re.search(r'const VERSION = "([^"]+)"', sw)
if not m or m.group(1) != version:
    print(f"VERSION={version}, sw.js={m.group(1) if m else 'not found'}", file=sys.stderr)
    sys.exit(1)
print(f"Версия согласована: {version}")
