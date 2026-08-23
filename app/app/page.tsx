import type { Metadata } from "next";
import { NAMES } from "@/lib/names";
import { Mark } from "@/components/Rays";
import Breath from "@/components/Breath";
export const metadata: Metadata = { title: "The app" };

export default function AppPage() {
  const n = NAMES[98];
  return (
    <section className="wrap grid g2" style={{ paddingTop: 56, alignItems: "center", gap: 56 }}>
      <div>
        <div className="eyebrow">The app · iOS & Android, coming</div>
        <h2>It knows <em>what time it is.</em></h2>
        <p className="lede">Blush at Fajr. Sage at Asr. Navy at Isha. One name in the middle of the screen, a dot that breathes at the pace of slow dhikr, and a quiet "do you remember?" on Fridays. No streaks. No red badges. No guilt.</p>
        <div className="grid" style={{ gap: 12, marginTop: 28 }}>
          <div className="card" style={{ padding: 20 }}><div className="eyebrow">Reminders</div><p className="note">One line, once a day, at the hour you choose. Gradients, not alarms.</p></div>
          <div className="card" style={{ padding: 20 }}><div className="eyebrow">Progress</div><p className="note">Ninety-nine dots. They fill as you meet the names. That's it.</p></div>
          <div className="card" style={{ padding: 20 }}><div className="eyebrow">Listen</div><p className="note">Each name recited once, close, by a single warm voice.</p></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}><a className="pill" href="/shop#notify">Notify me</a><span className="pill o">Read the 99 on the web, now</span></div>
      </div>
      <div className="phone"><div className="sc" style={{ background: "linear-gradient(160deg,#F6DCCF,#EFD9B8 35%,#CFD9C4 70%,#C9DBE6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", opacity: .7 }}><span>Fajr · 05:14</span><span>Week 12</span></div>
        <div style={{ fontFamily: "var(--disp)", fontSize: 30, lineHeight: 1.05 }}>Good morning,<br /><em>Amaar.</em></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center" }}>
          <div className="ar" style={{ fontSize: 54 }}>{n.ar}</div>
          <div style={{ fontFamily: "var(--disp)", fontStyle: "italic", fontSize: 16, opacity: .85 }}>{n.en}</div>
          <div style={{ fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", fontWeight: 500 }}>{n.tr} · No. {n.n}</div>
          <div style={{ marginTop: 16 }}><Breath size={14} /></div>
        </div>
        <div style={{ display: "flex", gap: 6 }}><span className="pill" style={{ flex: 1, justifyContent: "center", background: "#2A2622", color: "#F4EEE4" }}>Listen</span><span className="pill o" style={{ flex: 1, justifyContent: "center", borderColor: "#2A2622", color: "#2A2622" }}>Reflect</span></div>
        <div style={{ display: "flex", justifyContent: "space-around", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", opacity: .6, paddingTop: 10, borderTop: "1px solid rgba(42,38,34,.12)" }}><span style={{ opacity: 1 }}>Today</span><span>Names</span><span>Remember</span><span>You</span></div>
      </div></div>
    </section>
  );
}
