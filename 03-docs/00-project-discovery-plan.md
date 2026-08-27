# Project Discovery Plan

## Goal

Before building the new UI or API, discover and document the existing LotteryCorner behavior from the reference project.

The goal is not to refactor yet.

The goal is to capture:
- URL structure
- SEO behavior
- GEO/AEO readiness gaps
- ad placements
- affiliate / Buy Tickets Now flows
- state page behavior
- game page behavior
- result display formats
- historical result format changes
- blog/news behavior
- reusable business rules hidden in code

## Discovery Order

### 1. URL and Route Inventory

Document:
- home page URL
- state page URLs such as /fl, /az, /ga
- game page URLs
- result page URLs
- history page URLs
- blog URLs
- news URLs
- static page URLs
- old/legacy URL patterns

Output file:
03-docs/01-url-inventory.md

### 2. SEO Inventory

Document:
- title generation
- meta description generation
- canonical URLs
- sitemap behavior
- robots behavior
- structured data/schema
- breadcrumbs
- Open Graph/social metadata
- internal linking patterns
- crawlability concerns
- content rendered in HTML versus JavaScript
- answer-style content blocks
- lastUpdated handling
- schema gaps for AI/search answer engines
- official source attribution

Output file:
03-docs/02-seo-geo-aeo-inventory.md

### 3. Revenue Inventory

Document:
- ad placements
- ad slot names/locations
- affiliate links
- Buy Tickets Now buttons
- jackpot/next draw visibility
- revenue-critical templates/pages

Output file:
03-docs/03-revenue-inventory.md

### 4. Game Result Format Inventory

Document:
- result format properties/config files
- number of balls per game
- ball labels
- special balls
- bonus balls
- multipliers
- games with 10+ or 15+ drawn numbers
- dynamic rendering needs
- date-based historical format differences

Output file:
03-docs/04-game-result-format-inventory.md

### 5. Business Rule Inventory

Document:
- game-specific if/else conditions
- state-specific conditions
- draw-date-specific conditions
- jackpot display rules
- result parsing rules
- state page conditions
- blog/news conditions
- any temporary-looking code that affects production behavior

Output file:
03-docs/05-business-rule-inventory.md

### 6. New UI Readiness Summary

After discovery, recommend:
- common page templates needed
- common components needed
- sample data files needed
- state page design inputs needed
- ad placement rules for new UI
- dynamic result display component design
- API contracts likely needed later

Output file:
03-docs/06-new-ui-readiness-summary.md

## Important Rule

Do not create UI or API code during discovery.

Discovery should only read the reference project and create documentation under 03-docs.
