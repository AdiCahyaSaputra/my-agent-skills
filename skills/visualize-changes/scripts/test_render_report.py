"""Verify report links, source snapshots, output isolation, and history."""

import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from render_report import render


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        (self.root / "source.py").write_text('first = 1\nprint("<script>alert(1)</script>")\nlast = 3\n')
        self.data = {
            "project": "test-project",
            "project_root": str(self.root),
            "title": "A <small> change",
            "summary": "Read the actual source.",
            "diagram": "flowchart LR\n A[Start] --> B[Finish]",
            "changes": ["Updated output."],
            "reading": [{"path": "source.py", "line": 2, "why": "The changed output."}],
            "verification": ["Unit checks."],
        }

    def test_source_is_escaped_and_links_target_real_excerpt(self):
        document = render(self.data)
        self.assertIn('href="#code-1"', document)
        self.assertIn('id="code-1"', document)
        self.assertIn('class="focus"', document)
        self.assertIn('&lt;script&gt;alert(1)&lt;/script&gt;', document)
        self.assertIn('source.py:2', document)
        self.assertTrue((self.root / "source.py").resolve().as_uri() in document, "Original file URI missing")

    def test_rejects_invalid_lines_and_paths(self):
        for path, line in [("source.py", 0), ("source.py", 4), ("source.py", True), ("../outside.py", 1)]:
            with self.subTest(path=path, line=line):
                data = copy.deepcopy(self.data)
                data["reading"][0].update(path=path, line=line)
                with self.assertRaises(ValueError):
                    render(data)

    def test_rejects_project_directory_traversal(self):
        self.data["project"] = "../outside"
        with self.assertRaises(ValueError):
            render(self.data)

    def test_cli_preserves_history_under_home(self):
        input_path = self.root / "input.json"
        input_path.write_text(json.dumps(self.data))
        script = Path(__file__).with_name("render_report.py")
        environment = dict(os.environ, HOME=str(self.root))
        paths = []
        for _ in range(2):
            result = subprocess.run([sys.executable, str(script), str(input_path)], env=environment, capture_output=True, text=True, check=True)
            paths.append(Path(result.stdout.strip()))

        self.assertNotEqual(*paths)
        for path in paths:
            self.assertEqual(path.parent, self.root / ".agent-work-diagrams" / "test-project")
            self.assertTrue(path.is_file())
            self.assertEqual(json.loads(path.with_suffix(".json").read_text()), self.data)


if __name__ == "__main__":
    unittest.main()
