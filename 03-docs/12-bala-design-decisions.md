# Bala Design Decisions

## Purpose

This file captures Bala's product/design decisions for the LotteryCorner rebuild after the first design-input discovery pass.

## Design Input Coverage

Claude's first review sampled representative files, mainly Florida proposed PDF, New York proposed PDF, Florida existing screenshot, home.png, and the section-analysis docx.

Before finalizing UI requirements, Claude must do a complete pass across all available existing screenshots, proposed PDFs, home screenshots, and section-analysis documents under 05-design-inputs.

## Existing vs Proposed Design

Proposed PDFs/mockups are design references, not final production layouts.

The new UI should use the proposed state-page designs as inspiration for structure, clarity, and modern look and feel.

However, existing SEO value, ad placement, affiliate CTAs, Buy Tickets Now flows, internal links, and revenue-critical sections must be preserved.

## Ads and Revenue

Ads should be maintained as close as possible to the existing pages.

If proposed mockups do not show ads, this does not mean ads should be removed.

Claude must adjust the proposed design to include the existing ad placement patterns.

Before UI implementation, Claude must discover and document:
- existing ad slots
- right-rail ads
- in-content ads
- leaderboard ads
- affiliate banners
- Buy Tickets Now CTAs
- jackpot/revenue sections
- any ad behavior that differs by page type

## Home Page

The home page should mostly preserve the existing structure.

Only minimal changes should be proposed to align it visually with the new state-page design system.

There is no separate proposed home-page mockup yet.

Claude should not redesign the home page heavily without approval.

## AI-Enabled Positioning

LotteryCorner is expected to include AI-enabled tools for logged-in users in the future.

The new UI should make room for AI-related sections where appropriate, without making unsupported or fake claims.

Possible future AI areas:
- AI lottery insights
- Smart number analysis
- personalized alerts
- logged-in user tools
- Lottery Genie / Lucky GPT entry points
- AI-assisted lottery exploration

Exact AI feature copy and placement will be discussed later with Bala.

## State Pages

State pages should use a reusable StatePage template.

State-specific content and optional modules must be data/config-driven.

Do not hardcode Florida-specific layout or content into all states.

State page URLs and SEO value must be preserved.

## Mobile and Tablet

Existing mobile screenshots may be provided later.

Proposed mobile/tablet mockups are not available.

Claude must derive responsive desktop, tablet/iPad, and mobile layouts from the desktop PDFs and existing site behavior.

Revenue-critical elements must not disappear on mobile.

## Final Rule

Before creating UI code, Claude must:
1. complete full design-input coverage
2. complete revenue inventory
3. complete URL/SEO inventory
4. confirm ad placement strategy with Bala
