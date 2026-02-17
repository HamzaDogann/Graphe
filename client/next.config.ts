import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/charts",
        destination: "/dashboard/charts",
        permanent: false,
      },
      {
        source: "/charts/:chartId",
        destination: "/dashboard/charts/:chartId",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
