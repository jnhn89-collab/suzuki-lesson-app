# Communication Rules

These rules govern agent-to-agent communication inside the shared cmux workspace.

## Scope

- Applies to Codex and Claude when they communicate through cmux surfaces.
- Applies to all future additions unless a newer explicit rule supersedes an older one.
- New communication rules discovered during testing or requested by the user must be added to this file.

## Message Header

- Every agent-to-agent message must start with a clear direction header.
- Codex to Claude messages must start with `[CODEX->CLAUDE]`.
- Claude to Codex messages must start with `[CLAUDE->CODEX]`.
- User-authored messages must not use these agent-to-agent headers unless the user explicitly says they are quoting a message.
- The header is required so agent messages are clearly distinguishable from user input.

## cmux Delivery

- Target the exact workspace and surface when sending messages.
- Previously verified workspace: `workspace:4`.
- Previously verified Codex surface: `surface:15`.
- Previously verified Claude surface: `surface:14`.
- Current verified workspace for the Suzuki lesson app expansion: `workspace:7`.
- Current verified Codex surface for the Suzuki lesson app expansion: `surface:21`.
- Current verified Claude surface for the Suzuki lesson app expansion: `surface:20`.
- For reliable submission, prefer sending text and Enter as separate operations:

```bash
cmux send --workspace workspace:4 --surface <target-surface> "message"
cmux send-key --workspace workspace:4 --surface <target-surface> enter
```

- Do not rely on shell-expanded `$'...\n'` as the submission mechanism; it can place text without submitting in the target agent UI.
- If using `cmux send` escape handling directly, pass a literal `\n` in a normal quoted string.

## Round-Trip Test Protocol

- A round trip is complete only when the receiving agent visibly responds back to the sender with the required header.
- For repeated tests, number the turns in the body, for example `turn 1/2` and `turn 2/2`.
- After each send, verify the target surface with `cmux read-screen` before declaring success.
