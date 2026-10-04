"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { bySku, usd, ngn } from "@/lib/catalog";
import { NAMES, bySlug } from "@/lib/names";
import ProductArt from "@/components/ProductArt";
import AddressFields, { EMPTY_ADDRESS, addressComplete } from "@/components/AddressFields";
import type { Address } from "@/lib/orders";

export default function Checkout() {
  const sp = useSearchParams();
  const p = bySku(sp.get("sku") || "deck");
  const [qty, setQty] = useState(1);
  const [nameSlug, setNameSlug] = useState(sp.get("name") || "an-nur");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  if (!p || p.status === "notify" || p.sku === "send") return <section className="wrap quiz"><div className="eyebrow">Checkout</div><h2>That one isn&rsquo;t <em>on sale yet.</em></h2><Link href="/shop" className="pill">Back to the shop</Link></section>;

  const ok = /\S+@\S+\.\S+/.test(email) && name.trim() && (!p.needsAddress || addressComplete(address));
  const pay = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku: p.sku, qty, email, name, addressMode: p.needsAddress ? "have" : "none", address: p.needsAddress ? address : undefined, nameSlug: p.picksName ? nameSlug : undefined }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Something went wrong");
      location.href = j.url;
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };
  const chosen = bySlug(nameSlug) || NAMES[92];

  return (
    <section className="wrap" style={{ paddingTop: 56 }}>
      <Link href={`/shop/${p.sku}`} className="eyebrow">← {p.name}</Link>
      <h2 style={{ marginTop: 14 }}>Almost <em>yours.</em></h2>
      <div className="sendgrid" style={{ marginTop: 32 }}>
        <div className="card sendbox">
          {p.picksName && (
            <div className="field"><label>Which name?</label>
              <select value={nameSlug} onChange={e => setNameSlug(e.target.value)}>{NAMES.map(n => <option key={n.slug} value={n.slug}>{n.n}. {n.tr} — {n.en}</option>)}</select></div>
          )}
          <div className="field"><label>How many</label>
            <div className="qty"><button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Fewer">−</button><span>{qty}</span><button onClick={() => setQty(q => Math.min(20, q + 1))} aria-label="More">+</button></div></div>
          {p.needsAddress && <><div className="eyebrow" style={{ margin: "8px 0 12px" }}>Post it to</div><AddressFields value={address} onChange={setAddress} forWhom="you" /></>}
          <div className="rule" />
          <div className="eyebrow" style={{ marginBottom: 12 }}>Your receipt</div>
          <div className="addr">
            <div className="field"><label>Your name</label><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></div>
            <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" /></div>
          </div>
          {err && <p className="error">{err}</p>}
          <div className="actions-row">
            <button className="pill" disabled={!ok || busy} onClick={pay}>{busy ? "One moment…" : `Pay ${usd(p.usd * qty)} · ${ngn(p.ngn * qty)}`}</button>
          </div>
          <p className="note" style={{ fontSize: 12, marginTop: 14 }}>Paid securely through Squad. {p.ships}.</p>
        </div>
        <div className="preview">
          <ProductArt p={p} name={chosen} />
          <div className="summary"><b>{qty} × {p.name}</b><span className="note">{p.tagline}</span><span className="price">{usd(p.usd * qty)} · {ngn(p.ngn * qty)}</span></div>
        </div>
      </div>
    </section>
  );
}
