# Why sdlc-bridge?

The software development lifecycle has changed. See [Agent-First SDLC](AGENT-FIRST-SDLC.md) for the full picture.

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

### Tasks and statuses drift

- Implementation plan and tasks in Linear often out of sync from design doc or code.
- People forget to create tasks from the doc.
- People forget to update the doc when tasks change.
- People forget to link PRs to Linear tickets.
- Someone manually creates tickets from the doc — half are missing or wrong.
- Statuses drift too — a ticket says "in progress" when it's already done, or "backlog" when someone already shipped it. A doc says "draft" when it's approved and implemented.

### Things get lost

- No easy way to audit the status of a design doc against implementation.
- No way to run a security audit against the doc based on actual code.
- People forget to update statuses of docs and tickets.
- A comment from Slack or Google Docs or Linear gets lost and never gets implemented.
- Links in docs break. No one bothers to update docs when code changes or moves.
- Status of the project is never clear — partially in Google Docs, partially in Linear, partially in code. No one knows what's up.

## New world

The [Agent-First SDLC](AGENT-FIRST-SDLC.md) changes all of this. Docs, code, and tasks live in the same system. Agents operate across all three. Knowledge compounds.

## The bridge (~1% of interactions)

But for some time we need a short bridge to get those documents to the old systems, so some people can still opt in and read docs in their old interfaces, ask questions, and leave comments. The amount of those interactions will be ~1% very soon, but this is still needed.

Similar to the IndieWeb [POSSE](https://indieweb.org/POSSE) model — Publish (on your) Own Site, Syndicate Elsewhere. Your repo is your site. Google Docs and Linear are the syndication targets.

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

sdlc-bridge does exactly that. Obviously this extends to Jira, Confluence, Notion, and any other system teams use today.
