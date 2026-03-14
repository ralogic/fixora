import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Socket.io in Next.js
  serverExternalPackages: ["socket.io"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fixora.in",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
