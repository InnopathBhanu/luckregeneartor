/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Phase 1 scaffold: keep TS strict (real safety), but don't let lint block the scaffold build.
  // Run `npm run lint` separately. See 03-docs/14.
  eslint: { ignoreDuringBuilds: true },
  // SSR/SSG hybrid, never static export. The temporary Vercel ad preview does not decide production hosting.
};

export default nextConfig;
