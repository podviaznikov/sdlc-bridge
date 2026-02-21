# Linear Setup

## 1. Create an API Key

1. Go to [Linear Settings → API](https://linear.app/settings/api)
2. Click **Create Key**
3. Name it `sdlc-bridge`
4. Copy the key (it's only shown once)

## 2. Add to GitHub Secrets

1. Go to your repo → Settings → Secrets and variables → Actions
2. Create a new secret named `LINEAR_API_KEY`
3. Paste the API key as the value

## Permissions

The API key inherits the permissions of the user who created it. The key needs access to:

- **Documents** — create and update project documents
- **Issues** — create issues from task checkboxes, update issue status
- **Comments** — read inline comments on documents
- **Projects** — link documents to projects
- **Teams** — create issues in the correct team

Use an admin or member account to create the key. Viewer accounts cannot create documents or issues.

## Frontmatter Config

```yaml
---
title: My Design Doc
publish:
  linear:
    project: my-project-slug    # Linear project slug
    team: ENG                   # Team key for issue creation
    tasks: true                 # Auto-create issues from checkboxes
---
```

## Finding Your Project Slug

The project slug is in the URL when you open a project in Linear:

```
https://linear.app/your-workspace/project/my-project-slug
                                          ^^^^^^^^^^^^^^^^^
```

## Finding Your Team Key

The team key is the short prefix on issue IDs (e.g., `ENG` in `ENG-142`).
