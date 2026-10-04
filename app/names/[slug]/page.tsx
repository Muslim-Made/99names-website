import type { CSSProperties } from "react";
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
  // rough width of the Arabic line, in em, so a long name shrinks instead of wrapping
  const arEm = n.ar.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\s]/g, "").length * 0.5;
  // same idea for the Latin lines: the longest of the two decides the display size
  const enEm = Math.max(n.tr.length, n.en.length) * 0.43;
  return (
    <div className="namepage">
      <section className="wrap namehero">
        <div className="namehero-text">
          <ForBanner />
          <div className="eyebrow">No. {n.n} · {HOUR_LABEL[hourForName(n.n)]}</div>
          <div className="ar namehero-ar" style={{ "--ar-em": arEm } as CSSProperties}>{n.ar}</div>
          <h1 className="namehero-h1" style={{ "--en-em": enEm } as CSSProperties}>{n.tr}<br /><em>{n.en}</em></h1>
          <p className="lede namehero-lede">{n.meaning}</p>
          <div className="namehero-actions">
            <Listen text={n.ar} />
            <Link href={`/send?name=${n.slug}`} className="pill o">Send this name</Link>
            <Breath />
          </div>
          <div className="facts">
            <div className="card"><b>Root</b><span className="ar fact-root">{n.root}</span></div>
            <div className="card"><b>This week</b><span className="fact-line">{n.line}</span></div>
            <div className="card"><b>Say it</b><span className="note">Once, slowly, after a prayer. <em>Yā {n.tr.replace(/^(Al|Ar|As|Ash|At|Az|Ad|An)-/i, "")}</em> — {n.en}.</span></div>
          </div>
        </div>
        <div className="hero-card"><NameCard name={n} href={false} big /></div>
      </section>
      <div className="wrap prevnext">
        <Link href={`/names/${prev.slug}`} className="pn-prev"><span className="eyebrow">← No. {prev.n}</span><span className="ar">{prev.ar}</span><span className="note">{prev.tr}</span></Link>
        <div className="pn-mid">
          <Link href="/names" className="pill o">All 99</Link>
          <span className="pn-url">{arNum(n.n)} · 99names.net/names/{n.slug}</span>
        </div>
        <Link href={`/names/${next.slug}`} className="pn-next"><span className="eyebrow">No. {next.n} →</span><span className="ar">{next.ar}</span><span className="note">{next.tr}</span></Link>
      </div>
    </div>
  );
}
