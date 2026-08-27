/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Phase 1 scaffold: keep TS strict (real safety), but don't let lint block the scaffold build.
  // Run `npm run lint` separately. See 03-docs/14.
  eslint: { ignoreDuringBuilds: true },
  // Self-hosted Node deployment (not Vercel, not static export). SSR/SSG hybrid — see 03-docs/14 Decision 16.
};

export default nextConfig;
