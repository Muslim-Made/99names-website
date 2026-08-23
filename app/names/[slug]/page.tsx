import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NAMES, bySlug, arNum } from "@/lib/names";
import { hourForName, HOUR_LABEL } from "@/lib/hour";
import NameCard from "@/components/NameCard";
import Listen from "@/components/Listen";
import Breath from "@/components/Breath";
import ForBanner from "./ForBanner";

export function generateStaticParams() { return NAMES.map(n => ({ slug: n.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const n = bySlug((await params).slug); if (!n) return {};
  return { title: `${n.tr} — ${n.en}`, description: `${n.ar} · ${n.tr}, ${n.en}. ${n.meaning}` };
}

export default async function NamePage({ params }: { params: Promise<{ slug: string }> }) {
  const n = bySlug((await params).slug); if (!n) notFound();
  const prev = NAMES[(n.n - 2 + 99) % 99], next = NAMES[n.n % 99];
  return (
    <>
      <section className="wrap namehero">
        <div>
          <ForBanner />
          <div className="eyebrow">No. {n.n} · {HOUR_LABEL[hourForName(n.n)]}</div>
          <div className="ar" style={{ marginTop: 10 }}>{n.ar}</div>
          <h1 style={{ fontSize: "clamp(40px,5vw,72px)" }}>{n.tr}<br /><em>{n.en}</em></h1>
          <p className="lede" style={{ marginTop: 20 }}>{n.meaning}</p>
          <div className="hero actions" style={{ minHeight: 0, padding: 0, display: "flex", gap: 12, marginTop: 24, alignItems: "center", flexWrap: "wrap" }}>
            <Listen text={n.ar} />
            <Link href={`/send?name=${n.slug}`} className="pill o">Send this name</Link>
            <Breath />
          </div>
          <div className="facts">
            <div className="card"><b>Root</b><span className="ar" style={{ fontSize: 26, textAlign: "left", fontFamily: "var(--font-ruqaa)" }}>{n.root}</span></div>
            <div className="card"><b>This week</b><span style={{ fontFamily: "var(--disp)", fontSize: 19, fontStyle: "italic" }}>{n.line}</span></div>
            <div className="card"><b>Say it</b><span className="note">Once, slowly, after a prayer. <em>Yā {n.tr.replace(/^(Al|Ar|As|Ash|At|Az|Ad|An)-/i, "")}</em> — {n.en}.</span></div>
          </div>
        </div>
        <div className="hero-card"><NameCard name={n} href={false} big /></div>
      </section>
      <div className="wrap prevnext">
        <Link href={`/names/${prev.slug}`}><span className="eyebrow">← No. {prev.n}</span><span className="ar" style={{ textAlign: "left" }}>{prev.ar}</span><span className="note">{prev.tr}</span></Link>
        <Link href="/names" className="pill o" style={{ alignSelf: "center" }}>All 99</Link>
        <Link href={`/names/${next.slug}`} style={{ textAlign: "right" }}><span className="eyebrow">No. {next.n} →</span><span className="ar">{next.ar}</span><span className="note">{next.tr}</span></Link>
      </div>
      <div className="wrap" style={{ padding: "40px 0 0" }}><div className="note" style={{ textAlign: "center", margin: "0 auto" }}>{arNum(n.n)} · 99names.net/names/{n.slug}</div></div>
    </>
  );
}
