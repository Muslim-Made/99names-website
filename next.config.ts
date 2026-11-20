import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iOS fetches this file with no extension and insists on JSON. It lets /for and /with links open the app.
  headers() {
    return [{ source: "/.well-known/apple-app-site-association", headers: [{ key: "Content-Type", value: "application/json" }] }];
  },
  // The quiz used to live at /remember. Old links, captions and certificates still point there.
  redirects() {
    return [{ source: "/remember", destination: "/quiz", permanent: true }];
  },
};

export default nextConfig;
