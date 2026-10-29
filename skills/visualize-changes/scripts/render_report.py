#!/usr/bin/env python3
"""Build a portable, offline work report from JSON and actual source files."""

import argparse
from datetime import datetime, timezone
import html
import json
from pathlib import Path
import re
import uuid


def escape(value):
    return html.escape(str(value), quote=True)


def source_excerpt(item, root):
    path = (root / item["path"]).resolve()
    path.relative_to(root)
    lines = path.read_text().splitlines()
    line = item["line"]
    valid_line = type(line) is int and 1 <= line <= len(lines)
    if not valid_line:
        raise ValueError(f"Invalid source line: {path}:{line}")

    start = max(1, line - 5)
    end = min(len(lines), line + 7)
    excerpt = "\n".join(
        f'<span class="{"focus" if number == line else "source-line"}">'
        f'<span class="line-number">{number:4}</span> {escape(lines[number - 1])}</span>'
        for number in range(start, end + 1)
    )

    return path, excerpt


def render(data):
    required = ("project", "project_root", "title", "summary", "diagram", "changes", "reading", "verification")
    for key in required:
        if not data.get(key):
            raise ValueError(f"Missing or empty field: {key}")

    if not re.fullmatch(r"[a-z0-9][a-z0-9._-]*", data["project"]):
        raise ValueError("project must be a lowercase project slug")

    root = Path(data["project_root"]).expanduser().resolve(strict=True)
    readings = []
    snippets = []
    for index, item in enumerate(data["reading"], 1):
        path, excerpt = source_excerpt(item, root)
        label = f'{path.relative_to(root)}:{item["line"]}'
        readings.append(f'<li><a href="#code-{index}">{escape(label)}</a><p>{escape(item["why"])}</p></li>')
        snippets.append(
            f'<details id="code-{index}" open><summary>[{index}] {escape(label)}</summary>'
            f'<p>{escape(item["why"])} <a href="{escape(path.as_uri())}">Open current file</a></p>'
            f'<pre><code>{excerpt}</code></pre></details>'
        )

    asset = Path(__file__).resolve().parent.parent / "assets" / "mermaid-12.2.0.js"
    runtime = asset.read_text().replace("</script", r"<\/script")
    template = (Path(__file__).resolve().parent.parent / "assets" / "report.html").read_text()
    replacements = {
        "TITLE": escape(data["title"]),
        "PROJECT": escape(data["project"]),
        "SUMMARY": escape(data["summary"]),
        "DATE": escape(datetime.now(timezone.utc).isoformat(timespec="seconds")),
        "DIAGRAM": escape(data["diagram"]),
        "CHANGES": "".join(f'<li>{escape(item)}</li>' for item in data["changes"]),
        "READING": "".join(readings),
        "SNIPPETS": "".join(snippets),
        "VERIFICATION": "".join(f'<li>{escape(item)}</li>' for item in data["verification"]),
        "RUNTIME": runtime,
    }

    return re.sub(r"@@([A-Z]+)@@", lambda match: replacements[match[1]], template)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output-stem", help="Reuse this stem only to finalize the same task report")
    args = parser.parse_args()
    data = json.loads(args.input.read_text())
    document = render(data)
    stem = args.output_stem
    if stem is None:
        slug = re.sub(r"[^a-z0-9]+", "-", data["title"].lower()).strip("-")[:64] or "work"
        stem = f'{datetime.now(timezone.utc):%Y%m%dT%H%M%S}-{slug}-{uuid.uuid4().hex[:8]}'

    if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9._-]*", stem):
        raise ValueError("output-stem must be a filename stem without path separators")

    folder = Path.home() / ".agent-work-diagrams" / data["project"]
    folder.mkdir(parents=True, exist_ok=True)
    output = folder / f"{stem}.html"
    output.write_text(document)
    output.with_suffix(".json").write_text(json.dumps(data, indent=2) + "\n")
    print(output)


if __name__ == "__main__":
    main()
