/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // ── UPDATED: removed "canvas" because face detection stack removed ──
  serverExternalPackages: [
    "puppeteer",
    "pdf-parse"
  ],
};

export default nextConfig;