"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NAMES, bySlug } from "@/lib/names";
import NameCard from "@/components/NameCard";

export default function Send() {
  const sp = useSearchParams();
  const [slug, setSlug] = useState(sp.get("name") || "as-sabur");
  const [to, setTo] = useState(""); const [from, setFrom] = useState(""); const [copied, setCopied] = useState(false);
  const name = bySlug(slug) || NAMES[98];
  const url = `https://99names.net/names/${name.slug}?to=${encodeURIComponent(to || "you")}${from ? `&from=${encodeURIComponent(from)}` : ""}`;
  const share = async () => {
    const text = `${name.tr} — ${name.en}. ${name.line}`;
    if (navigator.share) { try { await navigator.share({ title: "A name for you", text, url }); return; } catch {} }
    await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section className="wrap" style={{ paddingTop: 56 }}>
      <div className="eyebrow">Send a name</div>
      <h2>For whoever <em>needs it this week.</em></h2>
      <p className="lede" style={{ marginBottom: 40 }}>Pick a name. Write who it's for. Send the link — or send the real card in the post.</p>
      <div className="sendgrid">
        <div className="card">
          <div className="field"><label>The name</label>
            <select value={slug} onChange={e => setSlug(e.target.value)}>{NAMES.map(n => <option key={n.slug} value={n.slug}>{n.n}. {n.tr} — {n.en}</option>)}</select></div>
          <div className="field"><label>To</label><input value={to} onChange={e => setTo(e.target.value)} placeholder="Nayla" /></div>
          <div className="field"><label>From (optional)</label><input value={from} onChange={e => setFrom(e.target.value)} placeholder="Amaar" /></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <button className="pill" onClick={share}>{copied ? "Link copied" : "Send the link"}</button>
            <Link href="/shop" className="pill o">Post the real card · $6</Link>
          </div>
          <p className="note" style={{ marginTop: 18, fontSize: 12 }}>{url}</p>
        </div>
        <div>
          <div style={{ maxWidth: 340, margin: "0 auto" }}><NameCard name={name} href={false} big /></div>
          {to && <p className="note" style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--disp)", fontStyle: "italic", fontSize: 18 }}>For {to}{from ? `, from ${from}` : ""}.</p>}
        </div>
      </div>
    </section>
  );
}
