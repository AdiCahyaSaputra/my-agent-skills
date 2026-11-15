---
name: my-programming-preferences
description: Apply to all coding-related tasks in any programming language, including writing, editing, debugging, refactoring, and reviewing code.
---

# My programming preferences

Apply these rules to every coding-related task in any programming language, including writing, editing, debugging, refactoring, and reviewing code. Apply them across the whole requested scope, not only when this skill is explicitly named. Preserve behavior. Follow explicit task instructions when they require a different approach.

## Apply pragmatic programming principles

Use these principles from _The Pragmatic Programmer_ to guide implementation decisions within the requested scope.

- State problems and limitations plainly, offer concrete ways forward, and distinguish verified facts from assumptions.
- Keep each piece of knowledge in one authoritative place. Apply DRY to business rules, configuration, schemas, and documentation as well as code. Share an abstraction when callers represent the same rule and should change together. Similar-looking code alone does not justify coupling unrelated concepts.
- Prefer the simplest design that supports the known requirements. Add an abstraction when it removes concrete coupling, rather than for hypothetical future needs.
- Build uncertain features in small, working slices. Use a thin implementation through the real integration points to validate the approach before expanding it.
- Do not hide failures with fallback values, swallowed errors, or guards that merely suppress symptoms.
- Automate repeatable work when it reduces errors or repeated effort. Reuse existing project tools first. Add a script or generator when its maintenance cost is justified, rather than building tooling for a trivial one-time edit.
- Verify assumptions and behavior. Make input expectations, outputs, and invariants explicit, and validate untrusted data at system boundaries. After all requested edits, run the relevant tests or direct verification as the final work step. Match checks to the change and its risk. Report what ran, what passed, and what remains unverified. If no applicable check exists, say so.
- Treat quality as part of implementation. Learn from the project's conventions and observed failures instead of imposing a new pattern without evidence.

## Prefer enums for finite string values

When a string represents one choice from a known, finite set, use an enum instead of repeating hardcoded string literals. Prefer the language's enum feature. When it has no suitable enum, use its idiomatic typed equivalent, such as a constant set or a closed union type.

Keep arbitrary text, user-provided values, and genuinely open-ended strings as strings. For values that must cross an API, storage, or protocol boundary as strings, use string-backed enum values (or the language's equivalent) that preserve the required external representation. Do not change a required public, framework, protocol, or external-library contract.

```typescript
enum OrderStatus {
  Pending = "pending",
  Paid = "paid",
  Cancelled = "cancelled",
}

if (order.status === OrderStatus.Paid) {
  completeOrder(order);
}
```

## Separate logical steps

Use one blank line between logical groups of statements inside a function. Keep closely related statements together.

After a complete `if`/`else` chain or `try`/`catch`/`finally` block, add a blank line before the next statement at the same nesting level. Apply the equivalent rule to Python `try`/`except`/`finally`. Do not separate an `else`, `catch`, `except`, or `finally` from its preceding block. No extra blank line is needed before the enclosing block ends.

```javascript
function parseRecord(raw) {
  let record;

  try {
    record = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!record.id) {
    return null;
  }

  return record;
}
```

## Give complex conditions meaningful names

Extract complex `if` and `else if` conditions that combine multiple checks with `&&`, `||`, `and`, `or`, or equivalent operators into a self-explanatory local variable. Nested combinations, mixed operators, and several comparisons are clear reasons to extract a condition. Name the decision, such as `canSubmitOrder` or `shouldRetry`, rather than `condition`, `flag`, or `check`.

Simple conditions and single comparisons such as `if (isReady)` or `if (age >= 18)` can stay inline. Do not extract every arithmetic or comparison expression merely because it has two operands.

```javascript
const canSubmitOrder =
  isAuthenticated && hasItems && (hasSavedPayment || usesFreeCheckout);

if (canSubmitOrder) {
  submitOrder();
}
```

Evaluate the variable where the original condition would run. Preserve short-circuit behavior, evaluation order, side effects, and variable scope. In an `else if` chain, do not eagerly evaluate a later branch's condition before earlier branches have failed. Restructure that branch locally if needed.

## Use named inputs for more than two parameters

When a function needs three or more input parameters, require named inputs in its declaration and at its call sites. Count optional parameters too. Exclude implicit receivers such as Python `self` and `cls` or a Go method receiver.

- In Python, declare explicit keyword-only parameters with `*` and pass each input by name. Do not replace known parameters with an untyped `**kwargs` dictionary.
- In JavaScript and TypeScript, use a single options object with meaningful field names. Preserve or add the appropriate type when the language supports it.
- In Go, use a named parameter struct and keyed fields at call sites.
- In other languages, use the supported equivalent, such as an options record, struct, or native named arguments. If the language cannot support either form, retain a valid signature and explain the limitation.

Python:

```python
def create_user(*, name: str, email: str, is_admin: bool = False):
    return {"name": name, "email": email, "is_admin": is_admin}


user = create_user(name="Ari", email="ari@example.com", is_admin=False)
```

JavaScript:

```javascript
function createUser({ name, email, isAdmin = false }) {
  return { name, email, isAdmin };
}

const user = createUser({
  name: "Ari",
  email: "ari@example.com",
  isAdmin: false,
});
```

Go:

```go
type CreateUserParams struct {
    Name    string
    Email   string
    IsAdmin bool
}

func createUser(params CreateUserParams) CreateUserParams {
    return params
}

func example() {
    user := createUser(CreateUserParams{
        Name:    "Ari",
        Email:   "ari@example.com",
        IsAdmin: false,
    })
    _ = user
}
```

Functions with zero, one, or two inputs do not require this conversion. When changing an existing signature, update affected call sites within scope. Preserve required framework, protocol, override, and external library signatures. If a required conversion would break a public contract outside the authorized scope, explain the conflict before changing that contract.
