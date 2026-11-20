import type { Metadata } from "next";
import Link from "next/link";
import { load, normCode, validCode } from "@/lib/circle";
import Ring from "@/components/Ring";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Learn the 99 Names together", description: "You have been invited to learn the 99 Names of Allah alongside someone, in the 99names app." };

/** The page an invite link opens. With the app installed, the link opens the app instead. */
export default async function With({ params }: { params: Promise<{ code: string }> }) {
  const code = normCode((await params).code);
  const circle = validCode(code) ? await load(code) : null;
  const host = circle?.members[0];
  return (
    <section className="wrap closing" style={{ paddingTop: "clamp(48px,8vw,96px)" }}>
      <div className="wrap" style={{ display: "grid", justifyItems: "center", gap: 6 }}>
        <Ring lit={Array.from({ length: host?.count ?? 0 }, (_, i) => i + 1)} className="closing-ring"><b>{host?.count ?? 0}</b><span>of 99</span></Ring>
        <h2>{host ? <>{host.name} invited you <em>to learn together.</em></> : <>Learn the 99 Names <em>together.</em></>}</h2>
        <p className="lede">In the 99names app you each see the other&rsquo;s ring fill, one ray for every name known. No scores, no ranking, nothing else shared.</p>
        <p className="lede" style={{ marginBottom: 8 }}>Your code is <strong style={{ fontFamily: "var(--disp)", letterSpacing: ".06em" }}>{code}</strong>. Open the app, go to You, then Your circle, and enter it.</p>
        <div className="actions-row" style={{ justifyContent: "center" }}>
          <a className="pill big" href={`ninetyninenames://with/${code}`}>Open in the app</a>
          <Link className="pill o big" href="/app">Get the app</Link>
          <Link className="pill o big" href="/quiz">Start on the web</Link>
        </div>
      </div>
    </section>
  );
}
