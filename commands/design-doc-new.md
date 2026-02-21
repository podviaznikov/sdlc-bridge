# /design-doc-new

Create a new design doc from the template.

## Usage

```
/design-doc-new <name> [--project <project-slug>] [--team <team-key>]
```

## Behavior

1. Read the template from `docs/templates/design-doc.md`
2. Create a new file at `docs/design/<name>.md`
3. Replace TITLE placeholder with the name
4. Set `created` to today's date
5. Set `author` to the current user
6. If `--project` is provided, set `publish.linear.project`
7. If `--team` is provided, set `publish.linear.team`

## Example

```
/design-doc-new auth-system --project auth-redesign --team ENG
```

Creates `docs/design/auth-system.md` with frontmatter pre-filled.
