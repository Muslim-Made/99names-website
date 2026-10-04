import { NAMES, Name } from "@/lib/names";
import { Product } from "@/lib/catalog";
import NameCard from "./NameCard";
import { Rays, Mark } from "./Rays";

const BG: Record<Product["hour"], string> = {
  fajr: "linear-gradient(160deg,#F6DCCF,#EFD9B8 35%,#CFD9C4 70%,#C9DBE6)",
  morning: "linear-gradient(160deg,#F4EEE4,#F3E3C2 50%,#EFD9B8)",
  dhuhr: "linear-gradient(160deg,#F4EEE4,#EFD9B8 50%,#F2CFC0)",
  asr: "linear-gradient(160deg,#EFD9B8,#CFD9C4 60%,#8FA88F)",
  maghrib: "linear-gradient(170deg,#E8A64B,#D98C7C 45%,#6B5A7A 80%,#2A2F44)",
  isha: "linear-gradient(160deg,#2A2F44,#1B1E2C 60%,#171A26)",
};

/** A small still life for each thing we sell, built from the card itself. */
export default function ProductArt({ p, name, big = false }: { p: Product; name?: Name; big?: boolean }) {
  const n = name || NAMES[8];
  const dark = p.hour === "maghrib" || p.hour === "isha";
  const cls = `pimg ${big ? "big" : ""}`;
  switch (p.sku) {
    case "deck": return (
      <div className={cls} style={{ background: BG.fajr }}>
        <div className="art-deckbox"><Mark size={40} color="#F4EEE4" /><span>99names</span></div>
        <div className="art-card" style={{ width: "44%", transform: "rotate(-8deg) translate(-38%,-6%)" }}><NameCard name={NAMES[0]} href={false} /></div>
        <div className="art-card" style={{ width: "44%", transform: "rotate(6deg) translate(30%,4%)" }}><NameCard name={NAMES[98]} href={false} /></div>
      </div>);
    case "send": return (
      <div className={cls} style={{ background: BG.asr }}>
        <div className="art-env" />
        <div className="art-card" style={{ width: "46%", transform: "translateY(-16%)" }}><NameCard name={n} href={false} /></div>
        <div className="art-envfront"><span>For <em>Nayla</em></span></div>
      </div>);
    case "bundle":
    case "stand": return (
      <div className={cls} style={{ background: BG[p.hour] }}>
        <div className="art-card" style={{ width: "42%", transform: "translateY(-10%) rotateX(4deg)" }}><NameCard name={NAMES[29]} href={false} /></div>
        <div className="art-stand" />
        {p.sku === "bundle" && <div className="art-deckbox small"><Mark size={22} color="#F4EEE4" /></div>}
      </div>);
    case "print": return (
      <div className={cls} style={{ background: BG.dhuhr }}>
        <div className="art-print" style={{ background: BG.fajr }}>
          <Rays style={{ position: "absolute", inset: "-20%", width: "140%", height: "140%", opacity: .28 }} r1={110} r2={195} w={.9} />
          <div className="ar art-print-ar">{n.ar}</div>
          <div className="art-print-en">{n.en}</div>
        </div>
      </div>);
    case "journal": return (
      <div className={cls} style={{ background: BG.asr }}>
        <div className="art-book"><Mark size={46} color="#2A2622" /><i /></div>
      </div>);
    case "ramadan": return (
      <div className={cls} style={{ background: BG.maghrib, color: "#F4EEE4" }}>
        <Rays style={{ width: "62%", opacity: .5 }} r1={90} r2={190} w={1.2} />
        <span className="eyebrow art-cap" style={{ color: "inherit" }}>30 nights · 30 names</span>
      </div>);
    case "wallpapers": return (
      <div className={cls} style={{ background: BG.morning }}>
        {(["fajr", "maghrib", "isha"] as const).map((h, i) => (
          <div key={h} className="art-phone" style={{ background: BG[h], transform: `translateX(${(i - 1) * 62}%) rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? -6 : 4}%)`, zIndex: i === 1 ? 2 : 1, color: h === "fajr" ? "#2A2622" : "#F4EEE4" }}>
            <span className="ar">{[NAMES[0], NAMES[46], NAMES[98]][i].ar}</span>
          </div>))}
      </div>);
    case "classroom": return (
      <div className={cls} style={{ background: BG.isha }}>
        <div className="art-stack">{[0, 1, 2, 3].map(i => <div key={i} className="art-deckbox flat" style={{ transform: `translateY(${-i * 26}%) translateX(${(i % 2) * 6 - 3}%)` }}><Mark size={26} color="#F4EEE4" /></div>)}</div>
        <span className="eyebrow art-cap" style={{ color: "#F4EEE4" }}>10 decks + a poster</span>
      </div>);
    default: return <div className={cls} style={{ background: BG[p.hour], color: dark ? "#F4EEE4" : "#2A2622" }}><Mark size={60} /></div>;
  }
}
