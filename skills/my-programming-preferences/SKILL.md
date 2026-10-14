---
name: my-programming-preferences
description: Apply my personal programming preferences when writing, editing, or reviewing code in any programming language. Separate logical steps with blank lines, name complex conditions, and use keyword arguments or an options object for functions with more than two parameters.
---

# My programming preferences

Apply these rules to code within the requested scope. Preserve behavior. Follow explicit task instructions when they require a different approach.

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
