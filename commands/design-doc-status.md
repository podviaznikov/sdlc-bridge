# /design-doc-status

Check the implementation status of a design doc.

## Usage

```
/design-doc-status <name-or-path>
```

## Behavior

1. Read the design doc
2. Parse all tasks (checkboxes)
3. Check which tasks have corresponding Linear issues
4. Check which Linear issues are completed
5. Look at the codebase to verify implementation exists for completed tasks
6. Report:
   - Total tasks / completed / in progress / not started
   - Tasks with no Linear issue
   - Tasks marked done but no code found
   - Tasks with code but not marked done
   - Overall status: draft / in-progress / mostly-done / complete

## Example

```
/design-doc-status auth-system
```

Output:

```
Auth System Design — 3/5 tasks complete

✓ Implement JWT token generation (ENG-142, done)
✓ Add refresh token rotation (ENG-143, done)
✓ Migrate existing sessions (ENG-144, done)
○ Update rate limiting per token tier (ENG-145, in progress)
○ Add token revocation endpoint (no issue created)

Status: in-progress (60%)
```
