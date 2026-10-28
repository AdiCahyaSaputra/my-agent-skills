---
name: article-to-pptx
description: Convert a blog post or article URL into an illustrative, source-first, editable PPTX using a mandatory three-stage research/approval, building, and source-verification workflow. Use when asked for visual slide decks based on articles, blogs, reports or reference URLs.
---

# Article to PPTX — Source-first Skill

## Mission
Transform an article/blog into a visually compelling **editable** 16:9 PPTX for Microsoft PowerPoint. Faithfully preserve its central claims. Prefer original-article illustrations, then authoritative external figures, then properly licensed web assets. **Generate images only as fallback** and mark them as AI-generated conceptual illustrations. Never invent source citations or portray generated visuals as primary-source evidence.

## Mandatory three-stage workflow

### Stage 1 — Research & shared understanding (HUMAN APPROVAL REQUIRED)
1. Read [references/user-preferences.md](references/user-preferences.md) and follow [references/feedback-memory.md](references/feedback-memory.md). Get the original URL/content and identify audience and desired takeaway. Stop and ask when a material ambiguity affects the outcome or action.
2. `npm run research -- "https://..."` saves `research/article.md`, `research/article-metadata.json`, `research/image-candidates.json`. The extractor is a convenience, not guaranteed for JS-heavy/paywalled pages; inspect the actual article manually as needed.
3. Research primary references for claims and discover visuals. **Search article image captions and credits first.** For every proposed asset record source URL, author/creator, permission/license and its relationship to slide argument. Publicly reachable is *not* evidence of reuse permission. Avoid hotlinking in the final deck. Do not bypass access restrictions.
4. Create `research/research-brief.md` recording main argument, audience, 3–7 key takeaways, contested/uncertain details, recommended tone, visual policy, possible slide count, licensing issues, open questions.
5. Create `storyboard.json` based on `examples/storyboard.example.json`. Provide slide IDs/types, titles, concept, illustrative intent, `claimIds`, asset candidates and references. Every material factual assertion needs a corresponding claim and actual evidence (not just a URL). Record claims as `unverified` until independently checked.
6. Read [references/themes.md](references/themes.md), recommend 2–3 themes that fit the audience and saved preferences, and include the proposed preset and layout treatment in the storyboard. **Present the research brief and slide-by-slide storyboard to the user. STOP.** Do not set `project.approved=true` yourself unless the user explicitly approves the outline. Approval of a previous project does not carry over to new source articles.

### Stage 2 — Building (after approval)
1. Confirm `project.approved=true`; set `approvedAt`. Edit the content and layout to create an illustrated narrative rather than bulleted article screenshots.
2. Implement visual sourcing priority: (a) original article figure with documented permission, (b) authoritative cited figure with documented permission, (c) licensed third-party asset, (d) generated illustrative image with generation prompt and visible/contextual disclosure. `origin='generated'` never means photographic/source evidence. Where rights are unclear, obtain permission, use own re-created editable diagram from the facts, or generate a clearly conceptual substitute. Never trace/redraw protected artwork merely to evade licensing.
3. Store visuals locally in `assets/`. Use `npm run assets` only for assets marked `permission:'allowed'`; source images not documented for reuse must remain `needs-review`. If images are generated, invoke available image generation tools, manually save files and populate `file`, `origin:'generated'`, `generatedPrompt`. The script **does not itself generate AI images**.
4. Use `npm run build` to create editable slide text, shapes, diagrams in `output/presentation.pptx`. Image assets remain embedded bitmaps. Source notes are placed in PowerPoint speaker notes. Avoid converting whole slides to background images.
5. Prefer visual review in Microsoft PowerPoint, this user's editor. Open the generated `.pptx` and inspect slides in slideshow view, or export a PDF from PowerPoint for review. Use `npm run render` as an alternative when LibreOffice and Poppler are available to get page previews in `output/rendered/`; this command does not automate PowerPoint. Inspect every slide; repair overflow, cropping, poor hierarchy, mismatched visuals. Check SF Pro availability and font substitution in PowerPoint. Iterate.

### Stage 3 — Verify the source & QA (MANDATORY)
1. Check every claim against original or primary sources by actually opening/verifying cited documents and quotes. Set `status:'verified'` only if its `evidence` supports the exact claim. The verifier script cannot fact-check web content by itself.
2. Verify image attribution, source origin, license/permissions, captions, and whether each image accurately represents the claim. No synthetic image passed off as a real screenshot, research photograph or evidence.
3. `npm run verify` outputs `output/verification-report.md` and JSON. Address **all errors**, rerun build, render, and verify until checks pass. A script PASS does not replace the independent human/agent checks in its report.
4. Do a final slide-by-slide visual review, including accessibility, source attribution, content accuracy, editable elements and reading order. Note any unresolved issues clearly; do not claim a completely verified presentation when issues persist.
5. Before final verification, record any new feedback and preference changes using the feedback-memory workflow. Finish all requested revisions, then run the relevant build, render review and verification as the final work step. Deliver `output/presentation.pptx`, sources/attribution details, and verification report. Keep research and storyboarding artifacts for audit. State when rendering or another relevant check could not run.

## Storyboard schema essentials
- `project`: title, articleUrl, audience, objective, approved, approvedAt, theme.
- `project.theme`: `{preset?, primary?, accent?, background?, foreground?, surface?, border?, fontFace?}`. See the theme catalog for the ten additional presets. Explicit fields override preset tokens; omit old color fields when switching presets.
- `claims`: `{id,text,sourceUrl,evidence,status}`; ID referenced by slides.
- `assets`: `{id,origin,url?,file?,sourceUrl?,creator?,license?,permission?,alt?,generatedPrompt?}`.
- `slides`: `{id,type,title,subtitle?,body?,bullets?,left?,right?,steps?,quote?,imageId?,claimIds?,speakerNotes?}`.
- Supported `type`: cover, statement, split, image, process, comparison, quote, closing.
- For third-party figures, set `permission:'allowed'` only with verified legal permission/license applicable to intended use. Keep full source metadata in `storyboard.json` and use notes for attribution.

## Design discipline
- Prefer an explanatory visual to decorative photography; use whitespace, clear hierarchy, one primary message per slide.
- Headings should tell the story. Keep body text minimal; aim for <=40 words on most slides.
- Retain numerical precision, units, sample dates and nuance. Never manufacture numbers or imply causality without evidence.
- With no selected preset, use `#DC2626` (Tailwind CSS `red-600`) for the default accent. All presets default to `SF Pro` for `fontFace`; a selected preset supplies its own colors. Keep user-provided brand overrides when requested. Use the same font for headings and body text. Check rendered slides for font substitution or overflow on systems without SF Pro.
- Source lists and permission provenance must remain in editable project files, not just in agent reasoning.

### Illustration, flow, and spacing

- Use illustrations that explain the subject: a recognizable device or software mark, encrypted file, care setting, or other relevant object. Avoid relying on text-only cards when a sourced visual would clarify the explanation. Follow the sourcing and permission rules above; conceptual illustrations must not imply an actual incident screenshot or prove a particular software version was used.
- Keep secondary text only when it adds information. Remove generic explanatory closing lines, repeated section labels, and subtitles that restate the heading or diagram. Retain definitions, units, estimates, time zones, citations, and factual limitations when needed to interpret the slide.
- Connect process stages with continuous arrow paths and attached arrowheads. Avoid tiny hairline arrows, floating chevrons used as connectors, and detached arrowheads. A reader should be able to follow the path without guessing which stage it reaches.
- Use a chronological timeline for dated events and a numbered process timeline for conceptual steps. Show recurrence with a smooth return arrow to the stage that repeats. Draw parallel effects as explicit branches from their actual source; do not turn simultaneous functions into a false linear sequence. Prefer editable PowerPoint connectors or paths.
- Derive each icon, timestamp, and stage label from one shared column center. Equal top coordinates do not establish vertical alignment. Account for transparent image padding and check the visible silhouette against the rendered text center.
- Treat a heading and its supporting sentence as one group. Keep their local gap compact and consistent, with more space between separate groups. Check rendered glyph spacing rather than trusting text-box coordinates; oversized text boxes can create an unintended gap.
- When feedback identifies a recurring visual issue, inspect analogous slides and apply the correction consistently. Preserve useful captions and the underlying claims.

For this user's decks, default to Indonesian explanations with English technical terms unless the current request specifies another language. Define unfamiliar technical terms on first use.

### Visual acceptance checks

During the final render review, inspect connector continuity and direction, loop and branch meaning, icon/time/label center alignment, and heading-to-explanation spacing. Review the affected slides at full size as well as in the deck overview. Where geometry is generated, compute shared alignment anchors instead of independently nudging elements. A source-verification PASS does not establish visual correctness.

## Themes and feedback across uses

The PPTX builder supports ten additional color and layout presets, described in [references/themes.md](references/themes.md). Before the user chooses, offer [theme-preview.html](theme-preview.html), an offline comparison of all eleven themes with cover, process, and split-image samples. Regenerate it with `npm run preview:themes` after changing theme tokens or preview layouts. Recommend a theme during storyboard approval; do not treat a past theme choice as a universal preference. The HTML is a layout approximation; final font wrapping requires PowerPoint review.

At every invocation, load the skill's [persistent user preferences](references/user-preferences.md). After each user feedback iteration, apply the requested change, record deck-local feedback, and update reusable preferences as described in [references/feedback-memory.md](references/feedback-memory.md). Current instructions take precedence. This is agent-maintained file memory, not automatic tracking by the build script. Do not wait until final delivery to capture feedback that may otherwise be lost.

## Commands
```bash
npm install
cp examples/storyboard.example.json storyboard.json
npm run research -- 'https://example.com/article'
# edit research brief and storyboard, then obtain explicit approval
npm run assets
npm run build
npm run render  # optional tooling: libreoffice + pdftoppm
npm run verify
```

## Troubleshooting
- JS-rendered articles may not extract cleanly. Verify against the actual page and improve research manually.
- Some sites prohibit image downloads, hotlinking or reuse. Respect restrictions and document alternatives.
- Missing images are **errors**, not permission to fill them with hallucinated content.
- PPTX speaker notes supplement but do not replace the separate source manifest.
- Add new layouts to `scripts/build.ts`, not by rasterizing slides.
