# /design-doc-audit

Audit a design doc against the actual implementation.

## Usage

```
/design-doc-audit <name-or-path> [--security] [--completeness] [--drift]
```

## Behavior

1. Read the design doc
2. Read the relevant source code
3. Compare the design against implementation
4. Report findings

### --completeness (default)

Check if everything described in the doc is implemented:
- Are all components/modules mentioned in the doc present in the code?
- Are all API endpoints described actually implemented?
- Are all security considerations addressed?

### --security

Check security aspects specifically:
- Are auth/authz patterns matching the doc?
- Are mentioned encryption/hashing algorithms used correctly?
- Are rate limits implemented as described?
- Are input validations in place?

### --drift

Check if implementation has drifted from the doc:
- Code that exists but isn't described in the doc
- Doc sections that no longer match the code
- Renamed functions/modules
- Changed API signatures

## Example

```
/design-doc-audit auth-system --security
```

Output:

```
Security Audit: Auth System Design

✓ JWT tokens signed with RS256 as specified
✓ Refresh tokens stored hashed (argon2)
⚠ Rate limiting: doc says 100 req/min, code has 200 req/min
✗ Token revocation: described in doc but not implemented
✓ Input validation on login endpoint

2 issues found (1 warning, 1 missing)
```
