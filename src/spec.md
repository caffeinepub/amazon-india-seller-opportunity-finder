# Specification

## Summary
**Goal:** Add ASIN and Product Name fields to product data and display them in the product cards.

**Planned changes:**
- Add ASIN field (10-character alphanumeric identifier) to Product type in backend
- Add productName field to Product type in backend if not present
- Update ProductCard component to display ASIN prominently with clear labeling
- Ensure product name is displayed as the primary heading in ProductCard
- Update frontend TypeScript Product interface to include asin and productName fields

**User-visible outcome:** Users will see the ASIN and full product name displayed on each product card in the search results, making it easier to identify and reference specific Amazon products.
