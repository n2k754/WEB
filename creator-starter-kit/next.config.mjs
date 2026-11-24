/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Paid files live in /private-files (never in /public). Make sure serverless
  // bundles ship them with the routes that need them.
  outputFileTracingIncludes: {
    "/api/download": ["./private-files/**/*"],
    "/success": ["./private-files/manifest.json"],
  },
};

export default nextConfig;
