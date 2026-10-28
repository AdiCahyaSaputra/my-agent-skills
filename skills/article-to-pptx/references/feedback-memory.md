# Feedback memory

## Start every use

Read `references/user-preferences.md` from the installed skill directory, even when building from a separate deck workspace. Resolve this file relative to the loaded SKILL.md, not the current working directory. Read the deck's `research/feedback.md` when resuming it. Apply only preferences whose scope fits this deck. Mention the relevant saved choices briefly in the research brief, alongside the proposed theme.

The current request overrides saved preferences. A more specific applicable preference overrides a general one. If current instructions are materially ambiguous or saved entries conflict at the same scope, stop and ask. Preferences never override source accuracy, licensing, or the per-article approval gate.

## After each feedback iteration

1. Apply the feedback to the current deck and inspect analogous slides for the same issue.
2. Append a short entry to the deck's `research/feedback.md`: date, deck ID, iteration number, user's actual feedback, affected slides, resulting change, and scope (`deck-only`, `reusable`, or `unclear`). Use an existing deck identifier or the deck directory name. Record an exact short quote when it helps preserve intent. Do not invent feedback or record the agent's proposal as user approval.
3. Save explicit reusable preferences in the installed skill's `references/user-preferences.md` immediately. Examples are "always use Indonesian explanations", "I prefer short headings", or a correction to a known general preference. Keep a theme/color choice, article fact, audience-specific wording, or slide-specific edit local unless the user makes it reusable. A local correction such as "shorten slide 4" does not establish a global word limit.
4. If similar local feedback recurs, retain the individual evidence in the deck logs and ask whether it should become a reusable preference. Until clarified, keep it local. Do not delay independent requested edits while waiting for an optional memory clarification.
5. For each persistent entry, keep a stable ID, category, applicable scope, concise actionable preference, feedback evidence with deck/iteration/date, and last-updated date. Consolidate duplicate entries. Replace a superseded preference and note the prior value briefly with its evidence. Keep the active file concise. Do not accumulate conflicting instructions.
6. If the user asks to forget a preference, remove it from the active file and remove the corresponding preference text from the local memory log if requested. Do not restore it later from stale evidence. Report the preference saved, revised or removed in a short progress/delivery note. Do not claim persistence if the file could not be written; identify the path and limitation.

Writing categories include language, tone, terminology, title phrasing, detail level and speaker notes. Visual categories include palette, theme, layout, illustrations, connectors and spacing. Keep audience- or deck-type-specific preferences scoped accordingly. Never save secrets, private source content, or unrelated personal information in the shared skill.

## Deck log example

```markdown
## 2026-10-19, example-deck, iteration 2
- Feedback: "Use this wording only on slide 4."
- Affected slides: s04.
- Change: replaced the heading with the requested wording.
- Scope: deck-only. No persistent preference changed.
```

There is no requirement to solicit feedback on every delivery. Learn from feedback the user actually gives. If there is no feedback, leave memory unchanged. Complete requested edits and memory updates before final deck verification.
