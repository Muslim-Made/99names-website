import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, Scheherazade_New, Amiri } from "next/font/google";
import "./globals.css";
import HourProvider from "@/components/HourProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Motion from "@/components/Motion";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz", "SOFT"], weight: "variable", style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-dm", display: "swap" });
const scheherazade = Scheherazade_New({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-scheherazade", display: "swap" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://99names.net"),
  title: { default: "99names — Light, by name.", template: "%s · 99names" },
  description: "The 99 Names of Allah, one a week. Cards, an app that knows what time it is, and a quiet place to remember.",
  openGraph: { title: "99names — Light, by name.", description: "The 99 Names of Allah, one a week.", images: ["/og-image.png"], siteName: "99names" },
  icons: { icon: "/favicon.svg", apple: "/apple-icon.png" },
};
export const viewport: Viewport = { themeColor: "#F6DCCF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-hour="fajr" className={`${fraunces.variable} ${dm.variable} ${scheherazade.variable} ${amiri.variable}`}>
      <body>
        <HourProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <Motion />
        </HourProvider>
      </body>
    </html>
  );
}
