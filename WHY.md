# Why sdlc-bridge?

The software development lifecycle has changed a lot in the past year and will continue to change.

## Old world

Docs, reviews, and code lived in different disconnected systems.

```
Google Docs       Slack/Email       Linear          GitHub/GitLab
    │                  │               │                  │
  write doc       discussion       discussion       implement in code
    │                  │               │                  │
  comments         comments        comments          pull request
```

One directional flow. No feedback loop.

```
  design doc ──→ review ──→ linear tasks ──→ code ──→ ship
       │                        │              │
       │    often out of sync   │   forgot to  │
       │    or forgotten        │   link PR    │
       └─── no link back ──────┴──────────────┘
```

People forget to create tasks from the doc. Or update the doc when tasks change. Or link PRs to tickets. Everything drifts apart.

### Silos

- Docs in Google Docs, discussion in Slack, tasks in Linear, code in GitHub — all disconnected.
- Comments scattered across all these systems at once.
- No clear source of truth — need to jump between docs, code, and comments in different systems.

### No feedback loop

- One directional flow: doc → review → code → ship. No link back.
- No programmatic link between the design doc and the implementation.
- No way to verify what was implemented and when.

### Tasks drift

- Implementation plan and tasks in Linear often out of sync from design doc or code.
- People forget to create tasks from the doc.
- People forget to update the doc when tasks change.
- People forget to link PRs to Linear tickets.
- Someone manually creates tickets from the doc — half are missing or wrong.

### Things get lost

- No easy way to audit the status of a design doc against implementation.
- No way to run a security audit against the doc based on actual code.
- People forget to update statuses of docs and tickets.
- A comment from Slack or Google Docs or Linear gets lost and never gets implemented.
- Links in docs break. No one bothers to update docs when code changes or moves.

## New world

Docs, reviews, and code live in the same system — the repo. Agents operate across all three.

```
repo/
├── docs/design/auth.md     ← agent writes spec
├── src/auth/               ← agent implements spec
└── tests/auth/             ← agent verifies spec
```

- Most code will be written by agents. This is already clear.
- Most code should also be reviewed by agents.
- Most design docs will be created, reviewed, and implemented by agents.
- When docs live next to code, agents can programmatically check what was implemented and when.
- Knowledge unified in one system compounds — because it's complete.
- No easy way before to audit the status of a design doc. Now it can be a simple agent command — read the doc, check the implementation, report what's done and what's missing.
- Or run a security audit against the doc based on actual implementation. And update all the statuses in Linear automatically.
- Design doc becomes the single driver of the entire lifecycle. Agent reads the doc, creates tickets in Linear, assigns them to agents or people, implements the code, and updates the doc as work completes.
- In the new world, docs are programmable. Because of AI and agents, docs can be executed, reasoned about, and trigger state updates in external systems.
- Docs can be part of CI/CD and engineering practices. You can create tests against them, run audits, auto-fix broken links and outdated references.
- Docs continue to accumulate and keep knowledge in one place — instead of rotting across disconnected systems.

Closed loop:

```
         ┌──────────────────────────────┐
         │            repo              │
         │                              │
         │  doc ←──→ code ←──→ tests    │
         │   │         │         │      │
         │   └────→ agent ←──────┘      │
         │        verifies spec         │
         │        updates status        │
         │        syncs tasks           │
         └──────────────────────────────┘
```

Doc drives the full lifecycle:

```
         design doc (repo)
              │
         agent reads spec
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
 ticket 1  ticket 2  ticket 3  ──→ auto-created in Linear
    │         │         │
  agent     agent    person    ──→ assigned
    │         │         │
  code      code      code     ──→ implemented
    │         │         │
    └─────────┼─────────┘
              ▼
     doc status updated
```

## The bridge (~1% of interactions)

But for some time we need a short bridge to get those documents to the old systems, so some people can still opt in and read docs in their old interfaces, ask questions, and leave comments. The amount of those interactions will be ~1% very soon, but this is still needed.

```
         ┌──────────────────────────────┐
         │            repo              │
         │   doc ←→ code ←→ tests       │
         │            │                 │
         └────────────┼─────────────────┘
                      │
                  sdlc-bridge
                   ╱      ╲
          Google Docs    Linear
          (read &        (status updates,
           comment)       update tasks,
                          & read)
```

sdlc-bridge does exactly that.
