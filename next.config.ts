import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/:locale(en|ar)/product/kapci-polyester-putty-grey-350-1-85kg",
        destination: "/:locale/product/kapci-polyester-putty-350-1-85kg",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
