---
name: verify-changes-api
description: When explicitly invoked, verify the requested API changes with http-test-scenarios, then use visualize-changes to produce an offline sequence-diagram report containing the actual scenario results.
---

# Verify API changes

Run only when the user explicitly invokes `verify-changes-api` for a specified task. Editing or configuring this skill does not invoke it, and invocation does not enable it for later tasks.

This bundle invokes [http-test-scenarios](../http-test-scenarios/SKILL.md) and then [visualize-changes](../visualize-changes/SKILL.md). Read both skills and follow their instructions in the current agent. Do not assume dollar-prefixed names execute tools or require separate agents. Resolve the sibling paths relative to this file; if a dependency is missing, report it rather than silently replacing its workflow.

1. Establish one shared task scope, project identity, and starting diff when available. Complete any requested implementation first. When invoked after implementation, inspect the specified final diff and disclose attribution limits instead of inventing a baseline.
2. Run `http-test-scenarios` for that scope. Create and validate the numbered Kulala files, execute safe read-only scenarios, and ask for the required intervention before mutations or when prerequisites are missing. While awaiting a decision, keep the bundle pending and do not generate the visual report.
3. Finish the scenario phase with actual passed, failed, skipped, or blocked outcomes. If the user declines a mutation or explicitly defers an unavailable prerequisite, record it as skipped or blocked and proceed with that limitation. An unanswered question does not finish the phase. If no API behavior applies, record HTTP testing as not applicable and proceed to visualization.
4. Only after the scenario phase is finished, invoke `visualize-changes` for the same work. Include the `.http` artifact paths, tested environment, actual assertion results, relevant project checks, and remaining limitations in the report's verification evidence. Explain behavior using a Mermaid sequence diagram and source references, following that skill's report generation and artifact verification instructions. A failed or skipped scenario must remain visible; a generated report does not imply successful verification.

Keep verification as the final work phase after implementation and scenario authoring. Complete relevant project checks and scenario execution before finalizing the report. If a failure requires implementation changes, repeat the affected verification before reporting the final result.

Return a short status with clickable absolute Markdown links to the scenario files and final HTML report. State failures and unexecuted scenarios clearly. This bundle is an explicitly selected workflow, not an automatic post-task hook. For work that only needs explanation, the user can invoke `visualize-changes` alone.
