"use client";
import Link from "next/link";
import { useHour } from "./HourProvider";
import { HOUR_LABEL } from "@/lib/hour";
import { Mark } from "./Rays";
import Ambience from "./Ambience";

export default function Footer() {
  const { hour, override, source } = useHour();
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
          <div className="fcol"><b>This hour</b>
            <p className="note" style={{ marginBottom: 10 }}>The site is tinted for <strong>{HOUR_LABEL[hour]}</strong>{override ? " (set by you)" : ` (${source})`}. Change it from the dial in the top bar.</p>
            <div><Ambience /></div>
            <p className="note" style={{ marginTop: 6 }}>A quiet, generative sound for this hour. Nothing recorded, nothing looping.</p>
          </div>
        </div>
        <div className="fbot"><span>© {new Date().getFullYear()} 99names</span><span>Instagram · @official99names</span></div>
      </div>
    </footer>
  );
}
