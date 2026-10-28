# Article-to-PPTX Codex skill

A source-first, illustrated PPTX production workflow with a mandatory approval checkpoint.

## Install into Codex
Copy the **entire folder** to `~/.agents/skills/article-to-pptx` (typical Codex personal skill directory). Restart Codex or open a new session, then ask: “Use article-to-pptx on [URL]”. You can also keep this folder inside a repository's `.agents/skills/article-to-pptx/` for project-local use. Adjust installation paths if your Codex environment uses a different skills directory.

## Prerequisites
Node.js 20+, npm; Microsoft PowerPoint is the preferred editor and visual review tool for this user. Optional LibreOffice + Poppler support the automated `render` command; it does not automate PowerPoint. Image generation is an external Codex/ChatGPT capability, **not** bundled into this project. Internet access is needed for researching URLs and downloading permission-cleared assets.

## Commands
```bash
npm install
cp examples/storyboard.example.json storyboard.json
npm run research -- 'https://your-article-url'
# read research/article.md and image candidates; have agent research and write brief
# have agent create and present a storyboard; YOU approve it
# set project.approved=true ONLY after explicit approval
npm run assets
npm run build
npm run render  # optional
npm run verify
npm run check
npm run test:themes  # isolated builds and PPTX structure checks for all presets
```

The example storyline is fictitious and references no real sourced factual claims; it is a **smoke test**, not a researched deliverable. After approving it for a test build, set `approved: true`. Do not treat the placeholder URL as evidence.

## Source and licensing model
The crawler discovers article images but deliberately records their permission as `needs-review`; it does not acquire permission. `assets` downloads only those marked `allowed`. `verify` checks traceability fields and reference statuses, but it does not browse or independently validate whether any purported permission or factual source is genuine. The agent/user must perform and document those checks.

## Output
- `research/article.md`, `research/image-candidates.json`
- `storyboard.json` source/claim/asset manifest
- `output/presentation.pptx`
- `output/presentation.pdf` and `output/rendered/*.png` if rendered
- `output/verification-report.md` and JSON

## Preview themes

Open [theme-preview.html](theme-preview.html) directly in your browser. It works offline and compares all eleven themes, with cover, process and image/explanation views. Copy the selected theme setting into the storyboard. Regenerate it with `npm run preview:themes` when theme tokens change. Final font wrapping should be checked in PowerPoint.

## Customization
Choose one of ten additional presets with `project.theme: {"preset":"midnight-lab"}`. See [the theme catalog](references/themes.md) for palettes and layout treatments. Explicit theme color fields override preset colors. The original default and custom branding remain supported.

The agent reads [user preferences](references/user-preferences.md) at each invocation and follows [the feedback workflow](references/feedback-memory.md) after each iteration. Reusable preferences live with the installed skill; one-off changes live in the deck's `research/feedback.md`. Build scripts do not collect feedback automatically.

Modify `project.theme` in storyboard for branding; change layout functions in `scripts/build.ts`; update design and verification instructions in `SKILL.md`. The slide generator supports a defined set of layouts, not arbitrary layout instructions. No script autonomously researches external sources or generates visuals; these are explicit agent tasks so that content and rights can be reviewed.
