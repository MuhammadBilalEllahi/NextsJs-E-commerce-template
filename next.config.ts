import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images-dehlimirchmasalajaat-com.s3.ap-south-1.amazonaws.com"],
    // or use remotePatterns for more control:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-dehlimirchmasalajaat-com.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
