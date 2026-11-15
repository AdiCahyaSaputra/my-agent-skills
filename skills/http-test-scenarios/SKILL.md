---
name: http-test-scenarios
description: When explicitly invoked or called by verify-changes-api, derive Kulala HTTP scenarios from the requested API changes, save numbered .http files in project folders under ~/.http-test/, and run safe read-only scenarios. Ask before executing mutations.
---

# HTTP test scenarios

Run only when explicitly requested by name, including "create http test", or called by an explicitly invoked `verify-changes-api`. Scope activation to the requested task. Editing this skill does not invoke it.

## Establish the scenario

Inspect the requested work, relevant final diff, routes, validation, authorization, and response contracts. If active before implementation, record the starting diff. Separate task changes from pre-existing edits; disclose attribution limits when no baseline exists. Ask before choosing between materially different task scopes or projects.

Use the named project when provided; otherwise use the repository root's project identity, even from a backend or mobile subdirectory. Consult existing `~/.http-test/` directories for established naming. Qonvert requests always belong in `~/.http-test/qonvert/`. Normalize an unambiguous new project name to a lowercase slug of letters, digits, dots, underscores, and hyphens starting with a letter or digit.

Inspect existing project `.http` files and follow their numbering, request syntax, variables, authentication, response assertions, and chaining conventions where supported by the available Kulala version. Inspect local environment configuration without exposing secrets. Determine the target base URL and environment from evidence; ask if materially ambiguous.

Derive scenarios from changed externally observable behavior, including the useful success, validation, authorization, and regression cases. Assert actual status codes and relevant response fields or state transitions from the implementation. Do not invent endpoints, expected responses, fixtures, or authentication. Include setup and cleanup only where the scenario needs them, and identify their effects. If no API behavior is affected, report HTTP scenarios as not applicable rather than inventing requests.

## Create reviewable requests

Save new files under `~/.http-test/<project-name>/` using the next available numeric prefix and a descriptive scenario name, such as `19-session-expiry.http`. Never overwrite an existing test unless requested. Recheck availability when writing. Keep related dependent steps together and name each request uniquely for individual execution.

Document the behavior being tested, prerequisites, target environment, expected result, and which steps mutate data in request comments. Reuse environment variables and existing secure authentication sources; do not embed credentials or sensitive response records. Mark missing prerequisites explicitly rather than filling in guessed values.

Use syntax and response scripting supported by the installed Kulala runtime. Preserve compatible project conventions; explain any required compatibility change. Consult the installed plugin's documentation or the official [Kulala Neovim documentation](https://github.com/dont-be-evil-company/kulala.nvim) and [Kulala CLI documentation](https://github.com/dont-be-evil-company/kulala-cli) when needed. Do not assume every JetBrains or REST Client scripting feature works in every Kulala version.

## Validate and execute

Finish the requested implementation and scenario files before beginning final verification. Validate request syntax, JSON bodies, variable references, request dependencies, and response-script syntax with available compatible tools. State any validation that cannot be performed. Static validation does not prove live assertions pass.

Discover an available Kulala runner and inspect its supported options before use. Prefer an installed compatible CLI or an existing Kulala Neovim setup that can provide observable assertion results. Do not replace Kulala with a custom HTTP runner and claim Kulala verification. If the runner, credentials, service, or fixtures are unavailable, ask for the specific intervention needed. Do not install tooling or change editor configuration merely to hide an unavailable runner.

Execute safe read-only scenarios automatically when the target and prerequisites are established. Classify safety from actual behavior, including scripts, redirects, imported requests, setup, and chained dependencies, rather than the HTTP verb alone. A GET that changes data needs approval; a read-only GraphQL POST may be safe. Do not trigger login, fixture creation, payments, notifications, or cleanup without authorization for those effects.

Select individual safe requests in mixed files. Never run the whole project directory or a whole file containing unapproved steps. For a compatible CLI, request selection looks like:

```sh
kulala run --tests --env=<known-environment> /absolute/path/to/scenario.http --name '<unique request name>'
```

Confirm that selection and script behavior in the available version cannot implicitly execute unapproved dependencies. If safe selection is unavailable, isolate safe requests in a separate numbered file, preserving required variables, or ask for intervention. Do not bypass a missing mutation prerequisite by making up response IDs.

Before mutations, finish creating and validating the files and running independent safe scenarios. Then ask for approval of the concrete request names, environment, affected records, expected effects, and cleanup, with direct file links. Explain that this skill requires approval for data-changing requests. Existing explicit authorization for those exact effects remains valid; do not ask again. Offer manual execution if preferred. Wait for the answer before dependent execution. If the user executes a step, obtain its actual result before claiming success. If declined, mark it skipped. Do not treat a timeout as consent.

After approval, execute only the authorized scope in dependency order. Stop on an unexpected failure or side effect and assess before retrying; do not repeat mutations blindly. Fix task-related failures and rerun relevant checks when authorized. Record the environment, selected requests, actual assertions and results, and any failed, skipped, or blocked steps without copying secrets. Never equate an HTTP response or a process exit alone with passing response assertions.

## Hand off

Return direct absolute Markdown links to created `.http` files and a concise account of passed, failed, skipped, and blocked scenarios. Distinguish syntax validation from live execution. When called by `verify-changes-api`, pass this evidence back to the bundle before any diagram is generated. Do not generate a visual report independently.
