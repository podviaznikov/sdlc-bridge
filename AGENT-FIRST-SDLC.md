# Agent-First SDLC

The new world is **agent-first, people-second**. Agents are the primary audience for docs, code, and tasks. Human UI is a layer on top — not the starting point.

**The most leverage layer now is the agentic experience** for interaction with docs and knowledge — not the user experience. Optimize for that and offer temporary escape hatches via syncs to people who say they need it.

See [Beads](https://github.com/steveyegge/beads) as an example of this in practice.

Docs, reviews, and code live in the same system — the repo. Agents operate across all three.

```
repo/
├── docs/design/auth.md     ← agent writes spec
├── src/auth/               ← agent implements spec
└── tests/auth/             ← agent verifies spec
```

## Agents do the work

- Most code will be written by agents. This is already clear.
- Most code should also be reviewed by agents.
- Most design docs will be created, reviewed, and implemented by agents.
- **Human feedback is opt-in.** Default is agent review. Specialized agents review docs and PRs automatically. People opt in when tagged explicitly.
- Default assumption: the author went through a multi-hour session with agents on the thing. The review itself is automated and done by agents.
- Modern design and agentic coding sessions last for hours. Tons of feedback and nuanced discussion happens between agent and human. Most real-world human-to-human interactions on design docs or code reviews are not like that — they are usually short, 5-minute, low-depth time investments with ~1% of the value an agent can provide.
- **Wisdom of a multi-hour work session with agents is way higher than wisdom of the crowd** for most typical problems.
- Design doc becomes the single driver of the entire lifecycle. Agent reads the doc, creates tickets in Linear, assigns them to agents or people, implements the code, and updates the doc as work completes.
- Agent can analyze the design doc, find actual dependencies and blockers, create proper tickets in Linear with the right order, and assign them to the right people or other agents — even across teams.
- Agent can run a status check — read all docs and code, report what's done, what's in progress, what's blocked. And keep statuses up to date in Google Docs and Linear automatically.

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

## Docs are programs

- When docs live next to code, agents can programmatically check what was implemented and when. **Knowledge unified in one system compounds** — because it's complete.
- **Docs are programmable.** Because of AI and agents, docs can be executed, reasoned about, and trigger state updates in external systems.
- Docs can be part of CI/CD and engineering practices. You can create tests against them, run audits, auto-fix broken links and outdated references.
- Docs must stay up to date because they are now operational. They become part of agent skills, commands, and configuration files.
- Proper docs don't just prevent confusion — they enable entirely new capabilities that were not possible before. An agent can read a design doc and implement the feature. Read a security doc and audit the codebase. Read an architecture doc and know where to put new code. Each doc makes every other doc and every agent interaction more valuable. **Knowledge compounds.**
- Docs continue to accumulate and keep knowledge in one place — instead of rotting across disconnected systems.
- All non-code artifacts today are very inconsistent. One person writes detailed design docs and Linear tickets. Another keeps it short and vague. But when it's all in a repo, you can enforce shared templates, quality checks, and lints for docs. Apply engineering practices we had for code for decades — but now for docs, because **markdown files are executable programs**.
- There is a misconception that docs for people and agents should be written in a different way. **That is not true.** Docs need to be clear, have little ambiguity, be up to date, link to proper resources for more context. Docs should be composable and linkable — like a system. This is true regardless of who the consumer is.

## Same session, same place

- You are inside a work session, discover an issue in a doc, and **fix it right there**. You don't need to go find the Google Doc or Linear issue, post a comment there, and in the comment put a link to the GitHub code that drove the change. All done in the same working session, exactly where the problem was discovered.
- Templates live in the repo too. Design doc template, RFC template, ADR template — all version controlled, easy to evolve. An agent or a human can run a simple command to create a new doc from a template. No need to copy-paste from a Google Doc or find the "right" Notion template.

## Open formats win

- **Files win.** You can grep them, agent can grep them. Way faster than any API or MCP or any remote call.
- Do not keep source of truth in closed systems and unclear formats like Google Docs. Use open formats. They are always future-proof. They can be changed and refactored in one go via agents.
- Imagine refactoring or moving a thousand Google Docs — slower, harder, less reliable, hard to verify, cannot preview changes the way you can with files.
- Files and git have **unified history**. Do not rely on external systems. They might have their own versioning or not have that at all, or have it not available via API, or have some weird format or lack of data.

## Outcome over artifacts

- **Outcome is judged by real deliverable artifacts** — products and real usage. Not by temporary artifacts like PRs or design docs. A great PR or a polished design doc is not a delivery. If the product doesn't ship or no one uses it, the artifacts don't matter. Don't cargo cult process — PRs and docs serve the outcome, not the other way around.
- Imagine implementing a review/post-mortem flow where you assign a date when you expect to get results and bring them in from real systems. Outcome-based. Not cargo culting.
- We have been here before. Early in my career there were always people on the team who would spend hours nitpicking syntax in your code or blocking you for days from delivering value. Then we moved on from thinking that value is in how you named your variable in code — at least to the PR as a unit. Now we are moving all the way up. **The unit of work is the full deliverable including the usage of that deliverable**, not code.
