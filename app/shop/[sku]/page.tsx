import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, bySku, usd, ngn } from "@/lib/catalog";
import { NAMES } from "@/lib/names";
import ProductArt from "@/components/ProductArt";

export function generateStaticParams() { return PRODUCTS.map(p => ({ sku: p.sku })); }
export async function generateMetadata({ params }: { params: Promise<{ sku: string }> }): Promise<Metadata> {
  const p = bySku((await params).sku); if (!p) return {};
  return { title: p.name, description: `${p.tagline} ${p.desc}` };
}

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const p = bySku((await params).sku); if (!p) notFound();
  const others = PRODUCTS.filter(x => x.sku !== p.sku && x.sku !== "send").slice(0, 3);
  return (
    <>
      <section className="wrap pdp">
        <div className="pdp-art" data-reveal><ProductArt p={p} name={NAMES[45]} big /></div>
        <div data-reveal data-stagger>
          <Link href="/shop" className="eyebrow">← Shop</Link>
          <h2 style={{ marginTop: 14 }}>{p.name.split(" ").slice(0, -1).join(" ")} <em>{p.name.split(" ").slice(-1)}</em></h2>
          <p className="lede">{p.desc}</p>
          <ul className="details">{p.details.map(d => <li key={d}>{d}</li>)}</ul>
          <div className="pdp-buy">
            <div className="pdp-price"><b>{usd(p.usd)}{p.sku === "wallpapers" ? " or more" : ""}</b><span className="note">{ngn(p.ngn)} · {p.ships}</span></div>
            {p.status === "notify"
              ? <Link href="/shop#notify" className="pill">Notify me</Link>
              : <Link href={`/checkout?sku=${p.sku}`} className="pill">{p.status === "preorder" ? "Pre-order" : "Buy"} · {usd(p.usd)}</Link>}
          </div>
          <p className="note" style={{ fontSize: 12, marginTop: 14 }}>Paid securely through Squad. Pre-orders post in the order they arrive. Questions: team@99names.net</p>
        </div>
      </section>
      <section className="wrap">
        <div className="eyebrow" style={{ marginBottom: 20 }}>Also</div>
        <div className="grid g3 shopgrid" data-reveal data-stagger>
          {others.map(o => <Link key={o.sku} href={`/shop/${o.sku}`} className="product"><ProductArt p={o} /><b>{o.name}</b><span className="note">{o.tagline}</span><span className="price">{usd(o.usd)}</span></Link>)}
        </div>
      </section>
    </>
  );
}
