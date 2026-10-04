"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { bySku } from "@/lib/catalog";
import { SITE } from "@/lib/send";
import { Mark } from "@/components/Rays";
import ShareLinks from "@/components/ShareLinks";
import { NAMES, bySlug } from "@/lib/names";

type View = { ref: string; status: "pending" | "paid" | "failed"; sku: string; qty: number; usd: number; email: string; addressMode: string; hasAddress: boolean; nameSlug?: string; token?: string; to?: string };

export default function Done() {
  const sp = useSearchParams();
  const ref = sp.get("ref") || ""; const test = sp.get("test") === "1";
  const [v, setV] = useState<View | null>(null); const [err, setErr] = useState<string | null>(() => (ref ? null : "No order reference."));
  useEffect(() => {
    let tries = 0;
    const load = async () => {
      const r = await fetch(`/api/checkout/verify?ref=${encodeURIComponent(ref)}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "We couldn’t find that order."); return; }
      setV(j);
      if (j.status === "pending" && tries++ < 6) setTimeout(load, 2500); // the bank can be a beat behind the redirect
    };
    if (ref) load();
  }, [ref]);

  if (err) return <section className="wrap quiz"><div className="eyebrow">Checkout</div><h2>Hmm — <em>{err}</em></h2><Link href="/shop" className="pill">Back to the shop</Link></section>;
  if (!v) return <section className="wrap quiz"><div className="eyebrow">Checking with the bank…</div><Mark size={56} /></section>;
  const p = bySku(v.sku); const name = v.nameSlug ? bySlug(v.nameSlug) : null;

  if (v.status === "failed") return <section className="wrap quiz"><div className="eyebrow">Payment didn’t go through</div><h2>Nothing was <em>taken.</em></h2><p className="lede" style={{ textAlign: "center" }}>The bank said no, or the page was closed. Try again whenever you&rsquo;re ready.</p><Link href={v.sku === "send" ? "/send" : `/checkout?sku=${v.sku}`} className="pill">Try again</Link></section>;
  if (v.status === "pending") return <section className="wrap quiz"><div className="eyebrow">Almost</div><h2>Still <em>confirming.</em></h2><p className="lede" style={{ textAlign: "center" }}>Your bank hasn&rsquo;t answered yet. This page will keep checking; you&rsquo;ll also get an email at {v.email}.</p><p className="note">Order {v.ref}</p></section>;

  return (
    <section className="wrap quiz" style={{ minHeight: "auto" }}>
      {test && <p className="testbar">Test mode — no payment was taken. Add Squad keys to go live.</p>}
      <div className="eyebrow">Paid · {v.ref}</div>
      {v.sku === "send" && v.token ? (
        <>
          <h2>It&rsquo;s <em>on its way.</em></h2>
          <p className="lede" style={{ textAlign: "center" }}>
            {v.hasAddress ? `We’ll print and post ${name?.tr || "the card"} to ${v.to} within three days.` : `The moment ${v.to} adds an address from their link, we print and post. Send it now:`}
          </p>
          <ShareLinks url={`${SITE}/for/${v.token}`} to={v.to || "them"} text={name ? `${name.tr} — ${name.en}. ${name.line}` : "A name for you."} />
          <div className="actions-row" style={{ justifyContent: "center" }}><a className="pill o" href={`/for/${v.token}`} target="_blank" rel="noreferrer">Preview what they’ll see</a><Link href="/send" className="pill o">Send another</Link></div>
        </>
      ) : (
        <>
          <h2>Thank you, <em>truly.</em></h2>
          <p className="lede" style={{ textAlign: "center" }}>{v.qty} × {p?.name}{name ? ` · ${name.tr}` : ""}. {p?.digital ? "It’s in your inbox." : `We’ll email ${v.email} the day it posts.`}</p>
          <div className="actions-row" style={{ justifyContent: "center" }}><Link href="/shop" className="pill o">Back to the shop</Link><Link href="/names" className="pill o">Read the 99</Link></div>
        </>
      )}
      <p className="note" style={{ marginTop: 8 }}>A receipt is on its way to {v.email}. Something wrong? team@99names.net</p>
      <span style={{ display: "none" }}>{NAMES.length}</span>
    </section>
  );
}
