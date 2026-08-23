import type { Metadata } from "next";
import { NAMES } from "@/lib/names";
import NameCard from "@/components/NameCard";
import { Rays } from "@/components/Rays";
export const metadata: Metadata = { title: "Shop" };

export default function Shop() {
  return (
    <section className="wrap" style={{ paddingTop: 56 }}>
      <div className="eyebrow">Shop · Ships worldwide</div>
      <h2>Things you'd <em>keep.</em></h2>
      <p className="lede" style={{ marginBottom: 40 }}>Three things, made slowly. Pre-orders open soon — leave your email and we'll tell you first.</p>
      <div className="grid g3">
        <div className="product">
          <div className="pimg" style={{ background: "linear-gradient(160deg,#F6DCCF,#EFD9B8 35%,#CFD9C4 70%,#C9DBE6)" }}>
            <div style={{ width: "52%", transform: "rotate(-6deg) translateX(-18%)" }}><NameCard name={NAMES[0]} href={false} /></div>
            <div style={{ width: "52%", position: "absolute", transform: "rotate(5deg) translateX(22%)" }}><NameCard name={NAMES[98]} href={false} /></div>
          </div>
          <b>The Deck</b><span className="note">99 soft-touch cards, 70 × 110mm, dawn to night. Navy box, rays blind-embossed.</span><span className="price">$34 · Pre-order</span>
        </div>
        <div className="product">
          <div className="pimg" style={{ background: "linear-gradient(160deg,#EFD9B8,#CFD9C4 60%,#8FA88F)" }}>
            <div style={{ width: "56%" }}><NameCard name={NAMES[8]} href={false} /></div>
          </div>
          <b>Send-a-Name</b><span className="note">One card, one envelope, a line to write who it's for. We post it anywhere.</span><span className="price">$6 · Pre-order</span>
        </div>
        <div className="product">
          <div className="pimg" style={{ background: "linear-gradient(170deg,#E8A64B,#D98C7C 45%,#6B5A7A 80%,#2A2F44)", color: "#F4EEE4", flexDirection: "column", gap: 8 }}>
            <Rays style={{ width: "60%", opacity: .5 }} r1={90} r2={190} w={1.2} />
            <span className="eyebrow" style={{ color: "inherit", position: "absolute", bottom: 18 }}>30 nights · 30 names</span>
          </div>
          <b>Ramadan Edition</b><span className="note">Thirty Verse cards, one per night, Maghrib gradients, limited.</span><span className="price">$29 · Notify me</span>
        </div>
      </div>
      <form className="card" style={{ marginTop: 32, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }} action="https://formspree.io/f/REPLACE_ME" method="POST">
        <div><b style={{ fontFamily: "var(--disp)", fontWeight: 400, fontSize: 22 }}>Tell me when it's ready.</b><div className="note">No newsletter. One email when the deck ships.</div></div>
        <input name="email" type="email" required placeholder="you@example.com" style={{ font: "inherit", padding: "12px 16px", borderRadius: 999, border: "1px solid rgba(42,38,34,.15)", minWidth: 260, marginLeft: "auto", color: "#2A2622" }} />
        <button className="pill" type="submit">Notify me</button>
      </form>
    </section>
  );
}
