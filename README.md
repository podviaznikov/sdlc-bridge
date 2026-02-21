# sdlc-bridge

Sync markdown docs from your git repo to Google Docs and Linear. Pull comments back. Keep tasks in sync.

**[Why sdlc-bridge?](WHY.md)** | **[Agent-First SDLC](AGENT-FIRST-SDLC.md)**

Markdown is the source of truth. sdlc-bridge publishes to external platforms for review, creates and updates tasks, and pulls comments back into your repo. Each published doc links back to the GitHub source.

## How it works

```
repo/docs/design/*.md  (source of truth)
        │
    sdlc-bridge
     ╱        ╲
Google Docs    Linear
 ├ docs         ├ docs
 ├ comments     ├ comments
 └ discussions  ├ tasks
                └ discussions
        │
        ▼
Comments + tasks synced back as .md and .json files
```

## Bridges

- **google-docs-bridge** — publish markdown → Google Docs with full formatting and tabs. Pull comments back.
- **linear-bridge** — publish markdown → Linear docs. Auto-create tasks from doc. Update task statuses. Pull comments back.

Each bridge is independently usable or compose them together.

## Install

```yaml
# .github/workflows/sdlc-bridge.yml
on:
  push:
    paths: ['docs/design/**/*.md']
  schedule:
    - cron: '0 */6 * * *'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: podviaznikov/sdlc-bridge@v1
        with:
          google-credentials: ${{ secrets.GOOGLE_SA_KEY }}
          linear-api-key: ${{ secrets.LINEAR_API_KEY }}
```

Or use individual bridges:

```yaml
- uses: podviaznikov/sdlc-bridge/google-docs-bridge@v1
  with:
    google-credentials: ${{ secrets.GOOGLE_SA_KEY }}

- uses: podviaznikov/sdlc-bridge/linear-bridge@v1
  with:
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
```

Setup guides: [Google Docs](docs/guides/google-docs-setup.md) | [Linear](docs/guides/linear-setup.md)

## Config

Per-file frontmatter:

```yaml
---
title: Auth System Redesign
discussions:
  slack:
    - https://slack.com/archives/C123/p456
  linear:
    - https://linear.app/team/issue/ENG-100
publish:
  google_docs:
    sharing: anyone-with-link
  linear:
    project: auth-redesign
    tasks: true
---

## Tasks

- [ ] Implement JWT token generation
- [ ] Add refresh token rotation
- [ ] Migrate existing sessions
```

After first sync, `doc_id`, `url`, and `issues` are written back to frontmatter automatically. Subsequent pushes update existing docs instead of creating new ones.

## Output formats

By default, both human-readable (`.md`) and machine-readable (`.json`) files are generated:

```
docs/design/
├── auth.md              ← source of truth
├── auth.comments.md     ← human-readable comments
├── auth.comments.json   ← machine-readable (for agents, CI/CD, dashboards)
├── auth.tasks.md        ← human-readable task statuses
├── auth.tasks.json      ← machine-readable task statuses
```

Each comment includes the quoted text, author, timestamp, and a link back to the original comment.

Override formats globally in `.sdlc-bridge.yml`:

```yaml
formats:
  comments: [md, json]    # default: both
  tasks: [md, json]       # default: both
```

Or per-file in frontmatter:

```yaml
---
title: Auth System Design
formats:
  comments: [json]        # this doc only needs json
---
```

## Templates

Design doc templates live in your repo:

```
docs/templates/
├── design-doc.md
├── rfc.md
└── adr.md
```

Create a new doc from a template with `/design-doc-new`. See [commands/](commands/) for available commands.

## License

MIT
