# My agent skills

Personal agent preferences, maintained separately from third-party skills.

## Installed skills

`pr` commits staged changes using conventional commits and creates a pull request from the repository template.

`code-gap` compares frontend or backend feature requirements with the codebase and identifies affected models and implementation gaps.

`my-programming-preferences` applies spacing, complex-condition naming, and named function input conventions across programming languages.

`my-typescript-preferences` applies my TSX conditional rendering conventions alongside general TypeScript guidance.

`article-to-pptx` turns articles into editable, source-first slide decks, using Tailwind red-600 and SF Pro as its default theme.

`visualize-changes` runs when explicitly requested by name, such as `$visualize-changes`, or through an explicit `$verify-changes-api` invocation. It explains the requested work with an offline HTML report containing a Mermaid sequence diagram, source excerpts, and verification results. Reports are saved under `~/.agent-work-diagrams/<project-name>/` with a direct link in the agent's response.

`http-test-scenarios` creates numbered Kulala `.http` scenarios under `~/.http-test/<project-name>/` for the requested API changes. It runs safe read-only scenarios and asks before mutations. Invoke it explicitly or through `verify-changes-api`.

`verify-changes-api` is an explicit-only bundle that completes HTTP scenarios before generating the visual report with their actual results. Pending intervention pauses the bundle; declined or deferred scenarios remain visible in the report.

## Local setup

The global skill locations link to the directories under `skills/` in this checkout. Edit the source here, then commit and push to back it up. Changes are available through the links without copying files.

Third-party `npx skills update -g` updates use their own tracked sources. Keep these personal skills' unique names and do not replace them with third-party skills.

On another computer, clone this private repository and link each skill directory under `skills/` into `~/.agents/skills/` and, when using a separate Codex home, `$CODEX_HOME/skills/`.
