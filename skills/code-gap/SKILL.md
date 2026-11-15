---
name: code-gap
description: Compare a frontend or backend codebase with feature specs, external documentation, or other references and explain implementation gaps and required model changes. Use only when explicitly invoked as $code-gap.
---

# Code gap

Explain what the relevant frontend, backend, or both already do, what the feature references require, and what must change to close the gap. Treat this as analysis unless the user also requests implementation.

## Investigate

1. Identify the feature scope and obtain the supplied specs, documents, links, or other references from the user (ask it explicitly if they don't specify anything). Use available connected sources for private references and inspect referenced external pages when needed. If a missing reference or conflicting requirement materially changes the outcome, ask the user instead of choosing an interpretation. Continue independent investigation where possible.
2. Inspect the relevant code paths and repository guidance. Trace frontend screens, interactions, state, API calls, and backend entry points, business logic, persistence, integrations, and existing tests as relevant to the scope. Compare user-visible behavior and states with the references for frontend features. Establish actual behavior from code rather than names or assumptions. Identify the versions or revisions of references when available.
3. Map each relevant requirement to code evidence. Identify implemented, partial, missing, and conflicting behavior. Separate explicit requirements from inferences and proposed design choices. Cite precise code paths and line numbers and link to the relevant reference or section.
4. Inventory all models affected within the feature scope. Search relevant frontend and backend boundaries, including UI state and view models, form and validation schemas, domain objects, API request and response types, persisted entities and schemas, enums, events, and integration contracts where applicable. Follow relationships and callers to find indirect impacts.
5. For each affected existing model or proposed new model, state its location or proposed location, current shape or behavior, required change, why the requirement needs it, and downstream effects such as UI behavior, migrations, compatibility, validation, and data backfill where supported by evidence. Distinguish required changes from options and unknowns. Do not invent changes to models that already satisfy the requirement.

## Report

Lead with the feature's current readiness and the main gaps. Present a requirement-by-requirement comparison with evidence for both the reference and the code. Include a model impact table with model, current state, change, reason, and consequences. Include proposed new models when warranted, and state explicitly if no model changes are supported by the evidence. Highlight dependencies, constraints, and unresolved questions that affect design or implementation. Give a practical sequence of work when useful, without presenting an unverified design as a requirement.
