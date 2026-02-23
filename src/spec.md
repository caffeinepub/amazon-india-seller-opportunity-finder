# Specification

## Summary
**Goal:** Build a full-stack Amazon India seller opportunity finder that analyzes products, calculates opportunity scores, and helps sellers identify profitable niches in the Indian e-commerce market.

**Planned changes:**
- Create backend data model storing Amazon.in product information (title, category, price, MRP, rating, reviews, BSR, seller type, brand, sales estimates, stock availability)
- Implement proprietary Opportunity Score algorithm (1-100) based on demand, competition, growth, and margin potential
- Support all major Amazon.in categories with hierarchical filtering and subcategory navigation
- Build advanced filtering system (price range, rating, reviews, BSR, revenue, weight, FBA count, growth, margins)
- Create keyword research module with search volume, difficulty, CPC, trend graphs, and long-tail suggestions
- Implement trend detection identifying review spikes, price increases, seasonal patterns with "Rising Star" badges
- Add India-specific profit calculator with Amazon fees, FBA fees, GST, shipping, packaging, ads budget, outputting net profit, ROI%, and break-even ACOS
- Build competitor analysis page showing top 10 sellers with metrics and weakness detection
- Design modern dashboard UI with dark mode, category heatmap, opportunity leaderboard, sortable lists, and interactive charts (revenue bars, BSR trends, review growth, margin breakdown)
- Implement seller alerts for new opportunities, competition drops, trending keywords, and seasonal spikes
- Create three-tier monetization system (Free with search limits, Pro, Premium) with CSV export, saved lists, and alert features
- Add AI-generated opportunity explanations, private label scores, brand domination detection, saturation warnings, capital estimates, and India sourcing suggestions
- Display product cards with name, category, price, sales, revenue, competition, opportunity score, margin, trend, and YES/AVOID/MODERATE recommendation
- Optimize for Indian sellers with GST handling, Indian buying patterns, scalability for millions of products, and sub-3-second search response

**User-visible outcome:** Sellers can search and filter millions of Amazon India products, view calculated opportunity scores, analyze competitors, research keywords, calculate India-specific profits, receive alerts about emerging opportunities, and export data for further analysis.
