# doc-bridge

Sync markdown docs from your git repo to Google Docs and Linear. Bring comments back.

Markdown is the source of truth. Doc-bridge publishes to external platforms for review and pulls comments back into your repo.

## How it works

```
repo/docs/design/*.md  (source of truth)
        │
        ├──→ Google Docs  (rich formatting, tabs, external reviewers)
        │
        └──→ Linear Docs  (team review, linked to projects)
        │
        ▼
  Comments synced back as .comments.md files
```

## Features

- One-way publish: markdown → Google Docs and/or Linear
- Google Docs with full formatting (headings, tables, code blocks, lists)
- Google Docs tabs support (one tab per markdown file)
- Linear docs with native markdown rendering
- Comment sync: pull inline comments back from both platforms
- Comments include quoted text, author, links back to source
- Frontmatter-driven config with auto-populated URLs
- Available as a GitHub Action

## Install

```yaml
- uses: podviaznikov/doc-bridge@v1
  with:
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
    google-credentials: ${{ secrets.GOOGLE_SA_KEY }}
    docs-path: 'docs/design/**/*.md'
```

## Config

Per-file frontmatter:

```yaml
---
title: Auth System Design
publish:
  linear:
    project: auth-redesign
  gdocs:
    sharing: anyone-with-link
---
```

After first sync, URLs are written back:

```yaml
---
title: Auth System Design
publish:
  linear:
    project: auth-redesign
    docId: doc_abc123
    url: https://linear.app/team/document/auth-system-design-abc123
  gdocs:
    docId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ
    url: https://docs.google.com/document/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
    sharing: anyone-with-link
---
```

## License

MIT
