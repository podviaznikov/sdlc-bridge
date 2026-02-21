# sdlc-bridge

## Overview

sdlc-bridge syncs markdown files from a git repo to Google Docs and Linear for review, creates and updates tasks, and pulls comments back.

Markdown in the repo is the single source of truth. Publishing is one-way (repo → platforms). Comments flow back as .comments.md files.

## Architecture

Modular bridge design — each bridge is a self-contained module:

- **core/** — shared code: markdown parsing, frontmatter handling, comment formatting
- **gdocs-bridge/** — Google Docs: publish formatted docs (via Docs API batchUpdate), tabs support, read comments (via Drive API comments.list)
- **linear-bridge/** — Linear: publish docs (markdown native), create/update tasks, read inline comments (via GraphQL with quotedText)

Primary distribution is a **GitHub Action**. Users add a workflow YAML + secrets.

## Key design decisions

- No bidirectional content sync. Markdown is source of truth, always.
- Each bridge is independently usable. No bridge depends on another.
- Auth boundary = module boundary. gdocs-bridge needs Google credentials. linear-bridge needs Linear API key.
- Google Docs formatting requires translating mdast → batchUpdate requests (index math). This is the hardest part.
- Linear accepts markdown natively — much simpler.
- Comments ordered by position in document (match `quotedText` against markdown source).
- Orphaned comments (quoted text no longer in source) shown with warning, not deleted.
- Action commits updated frontmatter + .comments.md back to the repo.
- Tasks extracted from `- [ ]` checkboxes in the doc, auto-created as Linear issues.
- Task completion synced bidirectionally: check in doc → close issue, close issue → check in doc.

## Tech stack

- TypeScript
- Node 20 (GitHub Action runtime)
- `unified` / `remark` / `mdast` for markdown parsing
- `googleapis` npm package for Google Docs + Drive API
- `@linear/sdk` for Linear API
- `gray-matter` for frontmatter
- `@vercel/ncc` or `esbuild` for bundling into single dist/index.js

## Repo structure

```
sdlc-bridge/
├── core/               ← markdown parsing, frontmatter, comment formatting
├── gdocs-bridge/       ← Google Docs bridge
├── linear-bridge/      ← Linear bridge
├── action.yml          ← umbrella GitHub Action
├── WHY.md              ← motivation and philosophy
└── README.md
```

## Commands

- `npm run build` — bundle the action
- `npm run test` — run tests
- `npm run deploy` — publish (do NOT use wrangler deploy)
