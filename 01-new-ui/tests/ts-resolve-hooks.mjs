/*
 * Test-only module resolution hooks.
 *
 * Task LRG-STATE-021 §12. Zero dependencies — uses `node:module`'s built-in `registerHooks`.
 *
 * WHY THIS EXISTS. Application source uses extensionless relative imports (`./jurisdictionRegistry`)
 * and the `@/` alias, both of which the Next.js/TypeScript resolver understands and Node's native ESM
 * resolver does not. Rather than contort application code to suit the test runner — or add a test
 * framework and a lockfile change — these hooks teach Node the same two rules for the duration of a
 * test run only.
 *
 * This file is never imported by the application.
 */

import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");

/** Try `<base>.ts`, `<base>.tsx`, then `<base>/index.ts(x)`. */
function firstExisting(base) {
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    /* `@/…` — the tsconfig path alias, rooted at the app directory. */
    if (specifier.startsWith("@/")) {
      const hit = firstExisting(resolvePath(ROOT, specifier.slice(2)));
      if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
    }

    /* Extensionless relative specifiers. */
    if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : ROOT;
      const hit = firstExisting(resolvePath(dirname(parentPath), specifier));
      if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
});
