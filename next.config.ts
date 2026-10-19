import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**", "./node_modules/@prisma/client/**"],
  },
};

export default nextConfig;
