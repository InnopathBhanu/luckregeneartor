# URL and SEO Preservation Rules

## Purpose

This file protects existing LotteryCorner SEO value during the rebuild.

The rebuild may redesign pages, but existing indexed URLs, canonical behavior, internal links, and revenue-critical pages must be reviewed before changes.

## Core Rules

- Inventory existing URLs before creating new routes.
- Preserve existing indexed URLs wherever possible.
- If a URL changes, document old URL, new URL, canonical, and 301 redirect.
- Do not redirect unrelated URLs to the home page.
- Do not remove blog/news/state/game/history pages without approval.
- Do not introduce duplicate URLs for the same page intent.
- Use lowercase, stable, clean URLs.
- Preserve or improve title, meta description, H1, canonical, breadcrumbs, schema, sitemap, and internal links.

## URL Types to Inventory

- Home page
- State pages
- Game pages
- Result pages
- History pages
- Blog listing and blog posts
- News listing and news posts
- Static pages
- Affiliate / Buy Tickets Now routes
- Legacy routes
- Sitemap URLs

## Redirect Map Format

If a URL changes, add it to a redirect map with:

old_url,new_url,status,reason,priority,approved

Example:

/old-url,/new-url,301,Rebuild URL cleanup,P0,no
