# UI-First Implementation Notes

## Strategy

Build the new LotteryCorner UI first using dummy/static XML or JSON data.

The API will be built later only after the UI, SEO, ad placement, responsive design, and revenue flows are satisfactory.

## UI Data Sources During First Phase

The UI may use:

- Static JSON files
- Static XML files
- XML available at a URL
- Sample state content
- PDFs/mockups provided by Bala
- Existing project reference code for behavior discovery only

## Important UI Requirements

- Use reusable components.
- Keep state pages dynamic and config-driven.
- Keep game result rendering dynamic.
- Support different games with different ball counts, labels, colors, special balls, multipliers, and historical formats.
- Support desktop, tablet/iPad, and mobile layouts.
- Preserve ad placements even if not shown in mockups.
- Preserve Buy Tickets Now / affiliate CTA behavior.
- Preserve SEO and GEO/AEO requirements.
- Main result data should be crawlable and available in HTML where possible.

## Do Not Do Yet

- Do not build API first.
- Do not hardcode one game format.
- Do not hardcode only Florida or Arizona.
- Do not remove ads because mockups do not show them.
- Do not finalize URL changes without redirect planning.
