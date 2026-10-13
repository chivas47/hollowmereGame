#!/usr/bin/env python3
"""Bundle the whole codebase into one Markdown file for a Claude Project.

Usage (from the repo root):
    python3 tools/bundle.py

Writes CODEBASE.md next to index.html. Re-run it after every change and
re-upload CODEBASE.md to the project so new chats see the current code.
"""
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "CODEBASE.md"
LANG = {".js": "js", ".css": "css", ".html": "html"}


def files():
    yield ROOT / "index.html"
    yield ROOT / "styles.css"
    order = ["core", "data", "systems", "render", "ui"]
    yield ROOT / "src" / "main.js"
    for folder in order:
        yield from sorted((ROOT / "src" / folder).glob("*.js"))


def main():
    paths = [p for p in files() if p.exists()]
    total = sum(p.stat().st_size for p in paths)
    parts = [
        "# Hollowmere Farm: codebase snapshot",
        "",
        f"Generated {date.today().isoformat()} by tools/bundle.py. "
        f"{len(paths)} files, {total // 1024} KB. This is the source of truth for the current code.",
        "",
        "## Files",
        "",
    ]
    parts += [f"- `{p.relative_to(ROOT).as_posix()}`" for p in paths]
    parts.append("")
    for p in paths:
        rel = p.relative_to(ROOT).as_posix()
        text = p.read_text(encoding="utf-8").rstrip()
        fence = "````" if "```" in text else "```"
        parts += [f"### {rel}", "", f"{fence}{LANG.get(p.suffix, '')}", text, fence, ""]
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}: {len(paths)} files, {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
