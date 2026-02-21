# sdlc-bridge

Bridge your repo to the old world. Sync docs, tasks, and comments between your git repo and external systems.

**[Why sdlc-bridge?](WHY.md)**

Markdown is the source of truth. sdlc-bridge publishes to external platforms for review, creates and updates tasks, and pulls comments back into your repo.

## How it works

```
repo/docs/design/*.md  (source of truth)
        │
    sdlc-bridge
     ╱        ╲
Google Docs    Linear
 ├ docs         ├ docs
 └ comments     ├ comments
                └ tasks
        │
        ▼
Comments synced back as .comments.md files
Task statuses synced between doc and Linear
```

## Bridges

- **gdocs-bridge** — publish markdown → Google Docs with full formatting and tabs. Pull comments back.
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
- uses: podviaznikov/sdlc-bridge/gdocs-bridge@v1
  with:
    google-credentials: ${{ secrets.GOOGLE_SA_KEY }}

- uses: podviaznikov/sdlc-bridge/linear-bridge@v1
  with:
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
```

## Config

Per-file frontmatter:

```yaml
---
title: Auth System Redesign
publish:
  gdocs:
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

After first sync, URLs and task IDs are written back:

```yaml
---
title: Auth System Redesign
publish:
  gdocs:
    docId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ
    url: https://docs.google.com/document/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
    sharing: anyone-with-link
  linear:
    project: auth-redesign
    docId: doc_abc123
    url: https://linear.app/team/document/auth-system-redesign-abc123
    tasks: true
    issues:
      - id: ENG-142
        title: Implement JWT token generation
        url: https://linear.app/team/issue/ENG-142
      - id: ENG-143
        title: Add refresh token rotation
        url: https://linear.app/team/issue/ENG-143
      - id: ENG-144
        title: Migrate existing sessions
        url: https://linear.app/team/issue/ENG-144
---
```

## Comments

Comments from Google Docs and Linear are pulled back and saved next to the source doc:

```
docs/design/
├── auth.md              ← source of truth
├── auth.comments.md     ← auto-generated comments from all platforms
```

Each comment includes the quoted text, author, timestamp, and a link back to the original comment.

## License

MIT
