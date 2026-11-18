import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The quiz used to live at /remember. Old links, captions and certificates still point there.
  redirects() {
    return [{ source: "/remember", destination: "/quiz", permanent: true }];
  },
};

export default nextConfig;
