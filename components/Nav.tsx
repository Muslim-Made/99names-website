"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./Rays";
import HourDial from "./HourDial";

const LINKS = [["/names", "Names"], ["/remember", "Remember"], ["/send", "Send a name"], ["/app", "App"]];

export default function Nav() {
  const p = usePathname();
  return (
    <nav className="nav">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="99names home"><Mark size={30} /><span>99names</span></Link>
        <div className="links">
          {LINKS.map(([h, l]) => <Link key={h} href={h} className={p.startsWith(h) ? "on" : ""}>{l}</Link>)}
          <HourDial />
          <Link href="/shop" className="pill small">Shop</Link>
        </div>
      </div>
    </nav>
  );
}
