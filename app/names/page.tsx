import type { Metadata } from "next";
import { NAMES } from "@/lib/names";
import NameCard from "@/components/NameCard";
export const metadata: Metadata = { title: "All 99 names" };

export default function Names() {
  return (
    <section className="wrap" style={{ paddingTop: 56 }}>
      <div className="eyebrow">All ninety-nine</div>
      <h2>Ninety-nine, <em>dawn to night.</em></h2>
      <p className="lede" style={{ marginBottom: 40 }}>In the traditional order, beginning with Ar-Rahman. The colour is the hour each name belongs to.</p>
      <div className="strip" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))" }}>
        {NAMES.map(n => <NameCard key={n.n} name={n} rays={false} />)}
      </div>
    </section>
  );
}
