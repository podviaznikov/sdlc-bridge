# doc-bridge

## Overview

doc-bridge syncs markdown files from a git repo to Google Docs and Linear for review, and pulls comments back.

Markdown in the repo is the single source of truth. Publishing is one-way (repo → platforms). Comments flow back as .comments.md files.

## Architecture

- **GitHub Action** — primary distribution. Users add a workflow YAML + secrets.
- **Markdown parsing** — use `unified`/`remark` to parse markdown into AST (mdast).
- **Google Docs** — use Docs API v1 `batchUpdate` to create structured documents with formatting. Use Drive API for file creation and `comments.list` for reading comments back. Tabs API for multi-file documents.
- **Linear** — use `@linear/sdk` or GraphQL API. `documentCreate`/`documentUpdate` accept raw markdown. Comments via GraphQL with `quotedText` for anchored context.
- **Frontmatter** — `gray-matter` for parsing/writing. Store platform doc IDs and URLs after first publish.
- **Comment sync** — pull comments from both platforms, generate `.comments.md` files with quoted text, author, timestamps, and deep links back to the original comment.

## Key design decisions

- No bidirectional content sync. Markdown is source of truth, always.
- Google Docs formatting requires translating mdast → batchUpdate requests (index math). This is the hardest part.
- Linear accepts markdown natively — much simpler.
- Comments ordered by position in document (match `quotedText` against markdown source).
- Orphaned comments (quoted text no longer in source) shown with warning, not deleted.
- Action commits updated frontmatter + .comments.md back to the repo.

## Tech stack

- TypeScript
- Node 20 (GitHub Action runtime)
- `unified` / `remark` / `mdast` for markdown parsing
- `googleapis` npm package for Google Docs + Drive API
- `@linear/sdk` for Linear API
- `gray-matter` for frontmatter
- `@vercel/ncc` or `esbuild` for bundling into single dist/index.js

## Commands

- `npm run build` — bundle the action
- `npm run test` — run tests
- `npm run deploy` — publish (do NOT use wrangler deploy)
