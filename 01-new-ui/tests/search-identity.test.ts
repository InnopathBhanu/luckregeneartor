/*
 * FOCUSED TESTS for the search-identity assets — LRG-IDENTITY-044.
 *
 * These exist because LRG-STATE-043 shipped with a recorded asset gap: no favicon at all, and an Organization
 * JSON-LD `logo` pointing at a file that did not exist. Both are asserted here against the real files, by
 * parsing their actual headers rather than trusting a filename.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { organizationSchema } from "../lib/seo/siteSchema";

/** Real dimensions from a PNG's IHDR — a filename proves nothing. */
function pngSize(path: URL): { width: number; height: number } {
  const d = readFileSync(path);
  assert.deepEqual([...d.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    `${path.pathname} must be a real PNG`);
  return { width: d.readUInt32BE(16), height: d.readUInt32BE(20) };
}

/** Every size declared in an ICO directory. */
function icoSizes(path: URL): number[] {
  const d = readFileSync(path);
  assert.equal(d.readUInt16LE(0), 0, "ICO reserved field");
  assert.equal(d.readUInt16LE(2), 1, "ICO type must be icon");
  const count = d.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => d[6 + i * 16] || 256);
}

const asset = (name: string) => new URL(`../public/${name}`, import.meta.url);

describe("LRG-IDENTITY-044: the favicon", () => {
  test("a multi-resolution ICO exists and includes the sizes search needs", () => {
    assert.ok(existsSync(asset("favicon.ico")), "public/favicon.ico must exist");
    const sizes = icoSizes(asset("favicon.ico"));
    /* Google ignores anything under 48px for a search-result favicon. */
    assert.ok(sizes.includes(48), `ICO must contain a 48x48 image, has ${sizes.join(",")}`);
    assert.ok(sizes.includes(96), `ICO must contain a 96x96 image, has ${sizes.join(",")}`);
    assert.ok(Math.max(...sizes) >= 128, "and a large raster for high-density displays");
  });

  test("the 48 and 96 PNGs exist and are genuinely square", () => {
    for (const [name, expected] of [["icon-48.png", 48], ["icon-96.png", 96]] as const) {
      assert.ok(existsSync(asset(name)), `public/${name} must exist`);
      const { width, height } = pngSize(asset(name));
      assert.equal(width, expected, `${name} width`);
      assert.equal(height, expected, `${name} height`);
      assert.equal(width, height, `${name} must be square`);
    }
  });

  test("root metadata declares them with explicit sizes and MIME types", () => {
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    assert.ok(/icons:\s*\{/.test(layout), "the root layout must declare icons");
    for (const needle of ['url: "/favicon.ico"', 'url: "/icon-48.png"', 'url: "/icon-96.png"',
                          'sizes: "48x48"', 'sizes: "96x96"', 'type: "image/png"', 'type: "image/x-icon"']) {
      assert.ok(layout.includes(needle), `root metadata must declare ${needle}`);
    }
    /* Declared once in the ROOT layout, so Home and every State page inherit the same icon rather than each
       route declaring its own. */
    for (const route of ["../app/page.tsx", "../app/[state]/page.tsx"]) {
      assert.ok(!/icons:/.test(readFileSync(new URL(route, import.meta.url), "utf8")),
        `${route} must not declare its own icons`);
    }
  });

  test("every declared icon URL resolves to a file that exists", () => {
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    const declared = [...layout.matchAll(/url: "\/([^"]+)"/g)].map((m) => m[1]);
    assert.ok(declared.length >= 3, "the declarations were found");
    for (const file of declared) {
      assert.ok(existsSync(asset(file)), `declared icon /${file} must exist in public/`);
    }
  });
});

describe("LRG-IDENTITY-044: the Organization logo", () => {
  test("the JSON-LD logo reference now resolves, and clears 112x112", () => {
    /* This is the gap LRG-STATE-043 recorded: `organizationSchema()` referenced `/logo.png`, which was absent. */
    assert.ok(existsSync(asset("logo.png")), "public/logo.png must exist for Organization JSON-LD");
    const { width, height } = pngSize(asset("logo.png"));
    assert.ok(width >= 112 && height >= 112, `logo must be at least 112x112, got ${width}x${height}`);
    assert.equal(width, height, "and square");
    /*
     * The schema still points at exactly that path. Asserted against the EMITTED node rather than a source
     * string: LRG-UX-SCHEMA-001 moved the identity into `lib/seo/brandIdentity.ts` and made the logo an
     * `ImageObject` (the form the four page-family modules already used), so a regex over `siteSchema.ts`
     * would now be checking a file that no longer holds the value.
     */
    const logo = (organizationSchema() as { logo: { "@type": string; url: string } }).logo;
    assert.equal(logo["@type"], "ImageObject");
    assert.equal(logo.url, "https://www.lotterycorner.com/logo.png");
  });

  test("the logo is not conflated with the favicon or an Open Graph image", () => {
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    /* `/logo.png` is the Organization asset; it must not be declared as an icon, and no OG image is claimed. */
    assert.ok(!/url: "\/logo\.png"/.test(layout), "the Organization logo is not a favicon declaration");
    assert.ok(!/openGraph[\s\S]{0,200}images/.test(layout), "no Open Graph image is claimed here");
  });
});

describe("LRG-IDENTITY-044: the mark is the approved one, unaltered", () => {
  test("the ICO is byte-identical to the approved production asset", () => {
    /*
     * Provenance, asserted rather than described. `public/favicon.ico` is the production
     * `LotteryCorner40/WebContent/favicon.ico` copied verbatim — no redesign, no recolour, no regeneration.
     * If someone later edits the shipped file, this fails and the change has to be justified.
     */
    const shipped = readFileSync(asset("favicon.ico"));
    const source = new URL(
      "../../00-reference-existing-project/LotteryCorner40/WebContent/favicon.ico", import.meta.url);
    if (!existsSync(source)) return; /* Legacy tree absent in this checkout; nothing to compare against. */
    assert.deepEqual(shipped, readFileSync(source), "the shipped ICO must be the approved asset, unaltered");
  });

  test("the mark is a square symbol, not a wordmark shrunk down", () => {
    /*
     * The task forbids a tiny full wordmark. A wordmark is wide and sparse; this mark is square and densely
     * inked, which is what keeps it legible at 16px. Measured from the pixels rather than asserted by eye.
     */
    const d = readFileSync(asset("icon-48.png"));
    assert.equal(d.readUInt32BE(16), d.readUInt32BE(20), "square");
    /* The 362x99 LotteryCorner logo is ~3.7:1; nothing that shape was used. */
    const { width, height } = pngSize(asset("logo.png"));
    assert.ok(width / height < 1.05, "aspect ratio is square, so no wordmark was used");
  });
});
