# Bundled runtime fixtures

These JSON files are byte-for-byte copies of the matching files in `04-sample-data/`. They are bundled inside
the Next.js source tree so a deployment whose root directory is `01-new-ui` does not depend on files outside
that root at build or runtime.

Included here:

- Home, campaign, footer, result-format, and ad-slot data read by `lib/data-provider/index.ts`.
- The 16 state payloads supported by the existing fixture-backed implementation.

The originals in `04-sample-data/` remain the provenance records and are not replaced or moved. Database
exports, the results-feed XML, HTML captures, payout reference data, and unused configuration files are not
copied because the runtime provider does not read them. These fixtures are presentation inputs for the temporary
frontend and must not be treated as API or database contracts.
