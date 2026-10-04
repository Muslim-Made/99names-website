import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, usd } from "@/lib/catalog";
import ProductArt from "@/components/ProductArt";
export const metadata: Metadata = { title: "Shop" };

const STATUS = { order: "Buy", preorder: "Pre-order", notify: "Notify me" };

export default function Shop() {
  return (
    <section className="wrap" style={{ paddingTop: 56 }}>
      <div className="eyebrow">Shop · Ships worldwide</div>
      <h2>Things you’d <em>keep.</em></h2>
      <p className="lede" style={{ marginBottom: 40 }}>Paper, wood, light. Made slowly, in small runs. Pre-orders post first, and every parcel carries one extra card to give away.</p>
      <div className="grid g3 shopgrid" data-reveal data-stagger>
        {PRODUCTS.map(p => (
          <Link key={p.sku} href={p.sku === "send" ? "/send" : `/shop/${p.sku}`} className="product" data-tilt>
            <ProductArt p={p} />
            <b>{p.name}</b>
            <span className="note">{p.tagline}</span>
            <span className="price">{usd(p.usd)}{p.sku === "wallpapers" ? "+" : ""} · {STATUS[p.status]}</span>
          </Link>
        ))}
      </div>
      <form id="notify" className="card notifyform" action="https://formspree.io/f/REPLACE_ME" method="POST" data-reveal>
        <div><b>Tell me when things ship.</b><div className="note">No newsletter. One email when the deck posts, one before Ramadan.</div></div>
        <input name="email" type="email" required placeholder="you@example.com" />
        <button className="pill" type="submit">Notify me</button>
      </form>
    </section>
  );
}
