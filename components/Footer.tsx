"use client";
import Link from "next/link";
import { useHour } from "./HourProvider";
import { HOURS, HOUR_LABEL } from "@/lib/hour";
import { Mark } from "./Rays";

export default function Footer() {
  const { hour, override, setOverride, source } = useHour();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="fgrid">
          <div>
            <div className="brand"><Mark size={26} /><span>99names</span></div>
            <p className="note">Light, by name.<br />One name a week. Ninety-nine ways He's near.</p>
            <p className="ar sig">الأسماء الحسنى</p>
          </div>
          <div className="fcol"><b>Explore</b><Link href="/names">All 99 names</Link><Link href="/remember">Remember</Link><Link href="/send">Send a name</Link><Link href="/app">The app</Link></div>
          <div className="fcol"><b>Shop</b><Link href="/shop">The Deck</Link><Link href="/shop">Send-a-Name</Link><Link href="/shop">Ramadan Edition</Link></div>
          <div className="fcol"><b>The hour</b>
            <p className="note" style={{ marginBottom: 10 }}>This page is tinted for <strong>{HOUR_LABEL[hour]}</strong>{override ? " (set by you)" : ` (${source})`}.</p>
            <div className="hours">
              {HOURS.map(h => <button key={h} className={h === hour ? "on" : ""} onClick={() => setOverride(h)}>{HOUR_LABEL[h]}</button>)}
              {override && <button onClick={() => setOverride(null)}>Auto</button>}
            </div>
          </div>
        </div>
        <div className="fbot"><span>© {new Date().getFullYear()} 99names</span><span>Instagram · @official99names</span></div>
      </div>
    </footer>
  );
}
