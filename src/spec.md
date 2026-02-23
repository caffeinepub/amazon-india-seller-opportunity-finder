# Specification

## Summary
**Goal:** Fix the "Something went wrong!" error appearing in the draft preview and improve error handling throughout the application.

**Planned changes:**
- Investigate and resolve the root cause of the "Something went wrong!" error in ProductGrid component by examining error handling logic, query response handling, and backend searchProducts method
- Add fallback error recovery with user-friendly error messages and actionable troubleshooting steps instead of generic error message
- Verify backend searchProducts method returns valid response structure when no filters are applied
- Add initialization error detection in useActor hook to catch and report backend actor failures

**User-visible outcome:** The draft preview loads successfully without errors, and if errors do occur, users see specific, actionable error messages with retry options instead of a generic "Something went wrong!" message.
