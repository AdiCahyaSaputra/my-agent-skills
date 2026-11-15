---
name: pr
description: Commit staged changes with a conventional commit and create a pull request using the repository's PR template. Use when asked to commit staged work and open a PR, or when explicitly invoked as $pr.
---

# PR

Commit the staged changes and create a pull request that describes the branch's complete changes against its base. Follow repository instructions and the host's PR workflow.

1. Inspect the repository status, staged diff, branch, remotes, and repository guidance. Review the staged changes sufficiently to choose an accurate conventional commit type, optional scope, and imperative subject. Commit only the staged changes and do not stage unrelated work. If nothing is staged, ask the user what to include. Do not commit directly to a protected or default branch either.
2. Commit with a message in conventional commit form, such as `feat(scope): add export`. Use `!` or a `BREAKING CHANGE` footer when the staged changes warrant it. Do not invent a scope or claim checks passed without evidence.
3. Identify the PR base using the user's instruction, repository convention, or the default branch. Inspect the full branch diff and commits against that base, including any commits that predate the new commit. Choose a title that describes the PR's overall change and fill the template from the actual diff and verification results. Do not claim unrun tests passed.
4. Look for `PR_TEMPLATE.md` and repository or hosting-service PR templates, including `.github/PULL_REQUEST_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE.md`, and `.github/PULL_REQUEST_TEMPLATE/`. Follow the repository's documented or configured template selection. If multiple templates apply and the choice materially affects the PR, ask the user. If no template exists, help the user create one using the default below. Add it at the repository's conventional location, or `.github/PULL_REQUEST_TEMPLATE.md` if there is no convention. Leave the new template uncommitted unless the user asks to include it, and tell the user where it was created. Use it to draft the PR body.
5. Push the feature branch and create the PR with the selected base and completed body. Report the PR link, commit, and verification results. Follow any environment-specific PR linking requirements. If a required permission, host access, or material decision blocks an action, explain the blocker and preserve completed work.

## Default PR template

```markdown
## Summary

- Describe the change and the problem it solves.

## Before

- Describe the relevant flow and behavior before the change, including the problem or limitation.

## After

- Describe the flow and behavior after the change, including how it addresses the problem.

## Testing

- List checks run and their results, or explain why checks were not run.
```

Replace the prompts with evidence from the base and branch when writing the PR body. Compare the same flow in the before and after sections, and state any uncertainty. Keep the template prompts in a template file so future authors can use them.
