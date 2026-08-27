import { NextResponse } from "next/server";

/*
 * /buynow/<code> — Phase-1 STUB for the internal affiliate redirect.
 *
 * In production this resolves the destination by geo/IP, state, game, affiliate availability and
 * tracking (03/13/14 docs) and 302s to the partner. Phase 1 has NO affiliate resolver and makes NO
 * external/live calls — it returns a noindex placeholder so CTAs don't 404 and no external URL is
 * ever hardcoded. robots.txt disallows /buynow/ in production.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  return new NextResponse(
    `Buy Tickets redirect placeholder for code "${code}". The future API resolves the affiliate destination (geo/state/game/tracking). No external URL is hardcoded in the UI.`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
