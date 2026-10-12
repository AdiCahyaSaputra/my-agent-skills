---
name: my-typescript-preferences
description: Apply my personal TSX conditional rendering preferences when creating, editing, or reviewing React or React Native components in .tsx files. Use alongside general TypeScript guidance.
---

# My TypeScript preferences

Apply these preferences to TSX code within the requested scope. Preserve behavior and follow explicit task instructions when they require a different approach.

## Optional components

Prefer short-circuit rendering when the alternative is `null`:

```tsx
// Avoid
{isVisible ? <Comp /> : null}

// Prefer
{isVisible && <Comp />}
```

Use a boolean condition. For a count, use `count > 0`; for a string presence check, use `Boolean(value)`. Do not let `0` or another non-boolean falsy value become a rendered child. Preserve the original condition's meaning when converting it.

## Two alternatives

Keep ternaries when choosing between two components or text values:

```tsx
{isReady ? <Content /> : <Loading />}
<Comp>{condition ? "True cond" : "False cond"}</Comp>
```

Being inside a tag does not itself prohibit `&&`. React omits boolean children, but a ternary is needed here to preserve both text alternatives.
