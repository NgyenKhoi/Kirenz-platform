# Kirenz Development Rules

## Agent Workflow

1. Before changing code, read this `rule.md` and the files directly related to the task.
2. Follow existing project patterns before introducing new abstractions.
3. Keep changes scoped to the requested feature or bug.
4. Do not revert or overwrite user changes unless explicitly requested.
5. Prefer implementation plus verification over proposal-only answers when the request is actionable.
6. Run the most relevant verification command after code changes and report the result.

## Code Style

1. Do not add comments for obvious code.
2. Add short comments only when they clarify non-trivial behavior or business rules.
3. Keep DTOs separate from persistence models.
4. Use domain-based package structure.
5. Prefer clear names over clever names.
6. Avoid unrelated refactors in feature or bugfix commits.

## Backend Rules

1. Each service owns its own database schema, tables, or collections.
2. Services must not access another service's database directly.
3. Cross-service communication must use OpenFeign or Kafka.
4. Kafka is the only event-driven messaging technology.
5. Use service names for Feign clients instead of hardcoded service URLs when discovery is enabled.
6. Use Liquibase for PostgreSQL schema changes.
7. Keep API responses consistent with the project response envelope.
8. Exceptions must be mapped intentionally; do not let expected business errors fall through as HTTP 500.
9. Validation errors must include field-level messages when possible.

## Frontend Rules

1. Always show client-visible errors in the UI instead of only logging them to devtools.
2. Field validation errors must appear under the matching input.
3. Form-level errors are only for errors that cannot be mapped to a specific field.
4. Clear a field's error when the user edits that field.
5. Disable submit controls while requests are pending.
6. Preserve accessible form states with `aria-invalid` and `aria-describedby` for invalid fields.
7. Use existing design tokens, spacing, component patterns, and page structure.
8. Do not add visible instructional text unless the workflow genuinely needs it.
9. Keep frontend server state behind TanStack Query hooks and mutations through `useAuth`, service modules, or equivalent existing query patterns.
10. Use direct local state only for purely local UI state, such as input values, toggles, modal state, or transient field errors.

## Error UX Rules

1. Backend validation payloads like `data.errors.username` must map to the `username` input.
2. Login errors should be mapped to the most useful field when possible.
3. Unknown or non-field errors should show a clear form-level message.
4. Avoid raw technical messages for users.
5. Keep console logging optional and secondary; UI feedback is required.

## Testing And Verification

1. Run the smallest useful test or type-check for the changed area.
2. For frontend changes, run `npm run lint` from `frontend/` when TypeScript or JSX changes.
3. For backend changes, run module-level Maven compile or targeted tests.
4. If verification fails because of missing local infrastructure or migrations, report the exact blocker and the command needed to continue.

## Documentation

1. Update docs when behavior, architecture, use cases, or API expectations change.
2. User-facing feature names may differ from internal technical names when that improves clarity.
3. Keep docs concise and aligned with the current implementation.
