---
name: visualize-changes
description: When explicitly invoked or called by verify-changes-api, explain the requested work with an offline HTML report containing a Mermaid sequence diagram, source excerpts worth reading, and verification evidence. Save reports in a project folder under ~/.agent-work-diagrams/ and return a direct file link.
---

# Visualize changes

Run only when the user explicitly requests this skill by name, such as `$visualize-changes` or "use visualize-changes for this work," or when called by an explicitly invoked `verify-changes-api`. In the bundle, wait until the HTTP scenario phase has finished and use its actual results as verification evidence. Produce one report for the work they specify. Invoking it for one task does not enable it for subsequent tasks. A request to edit or configure the skill does not itself request a diagram report.

Explain the resulting behavior and the code a human should read to assess it. Do not generate reports automatically after ordinary tasks or edits, or narrate tool calls as the diagram.

## Gather evidence

- Record the starting diff when active at task start. Inspect the final diff and relevant source. Separate this task's work from pre-existing edits and other agents' changes. If the starting state is unavailable, state the attribution limit rather than claiming the entire diff.
- Use the repository root's project name, including when working in a backend/mobile subdirectory. Consult existing reports for an established name. For non-repository work, use the named project or containing project directory. Ask if the project identity is materially ambiguous.
- Select the few files and exact current lines that explain the important decisions, behavior, and risks. Explain deletions without inventing current line links for deleted code. Excerpts are a snapshot; opening the original file shows its current contents.

## Explain the change visually

Use a Mermaid `sequenceDiagram` to explain the resulting behavior through participants and ordered messages. Use `alt`/`else` for branches, `opt` for conditional steps, and notes for changes or structural context. Focus on one task with only the participants and interactions needed to understand it. Split only when one diagram becomes difficult to read.

Name participants by their actual roles and messages by concrete behavior. Use notes to identify changed interactions and explain the notation. Include necessary unchanged context. Use `[1]`, `[2]`, etc. in message labels or notes to map to the numbered reading list. Do not fabricate execution paths, dependencies, or improvements. Reflect the actual final implementation.

Use sequence-diagram syntax supported by the bundled Mermaid Tiny runtime. Avoid external icons, images, links, HTML labels, and diagram types requiring extra libraries. Keep navigation in the reading list outside the diagram.

## Generate the report

Use `scripts/render_report.py` with a JSON input file. Resolve the script relative to this SKILL.md; do not assume the current directory is the skill directory.

```json
{
  "project": "example-project",
  "project_root": "/absolute/path/to/project",
  "title": "Reject expired sessions before loading account data",
  "summary": "Expired sessions now return an authentication error before the account query runs.",
  "diagram": "sequenceDiagram\n participant Client\n participant Auth as Authentication middleware\n participant DB as Account database\n Client->>Auth: Request account\n Note over Auth: Changed: check session expiry [1]\n alt Session expired\n Auth-->>Client: Authentication error\n else Session valid\n Auth->>DB: Query account\n DB-->>Auth: Account data\n Auth-->>Client: Account response\n end",
  "changes": ["The authentication middleware now checks expiry before querying account data. The note identifies the check changed in this task."],
  "reading": [
    {"path": "src/auth.js", "line": 42, "why": "Start here to see the expiry check and early return."}
  ],
  "verification": ["Replace with actual commands, results, and any limitations before handoff."]
}
```

```sh
python3 /absolute/path/to/visualize-changes/scripts/render_report.py /absolute/path/to/report-input.json
```

The generator validates source references and embeds numbered excerpts and Mermaid. It creates timestamped `.html` and `.json` files in `$HOME/.agent-work-diagrams/<project-name>/` with no network dependency. The JSON preserves editable Mermaid source. Reuse `--output-stem` only to finalize the same task report. The default creates a new report without overwriting history.

Normalize a clear project name to a lowercase slug of letters, digits, dots, underscores, or hyphens starting with a letter or digit. Do not guess between materially different projects.

Do not copy credentials or sensitive records into reports or excerpts. Choose a safe reference or explain an omission. Keep files local unless sharing was explicitly requested.

## Verify and hand off

Complete the requested implementation first. Run relevant project checks as the final work phase. Record actual results, including failures, skipped checks, and attribution limits. Generate or finalize the report during that phase and verify the artifact before claiming completion.

Check the report in an available headless browser with networking disabled when possible. Confirm Mermaid produces an SVG, there is no render error, and reading anchors work. Do not launch or control a separate interactive browser for this check. If browser verification is unavailable, state that diagram rendering remains unverified; source inspection alone does not prove it renders.

Return a clickable absolute Markdown link such as `[Open work diagram](/Users/name/.agent-work-diagrams/example-project/20261029T090000-example.html)`. Include the most useful source link as `[auth.js:42](/absolute/path/to/project/src/auth.js:42)` when helpful. Do not use `file://` links in chat. Inside the HTML, reading links jump to embedded excerpts; separate file links open the original file because browser line navigation is unreliable.

Keep the final response short. A skill is selected by its host agent; creating it does not install a universal post-task hook. Do not claim automatic coverage in other agents or sessions unless their instructions or configuration activate it.

When modifying the generator, run `python3 scripts/test_render_report.py` from this skill directory. These checks cover source escaping, invalid references, project path isolation, and report history. They do not replace checking Mermaid in a browser.
