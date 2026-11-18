"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./Rays";
import HourDial from "./HourDial";

const LINKS = [["/names", "Names"], ["/send", "Send a name"], ["/app", "App"], ["/shop", "Shop"]];

/**
 * The quiz is the one filled button, on every page and every screen size.
 * On phones the other links fold into a sheet behind the menu button.
 */
export default function Nav() {
  const p = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("menu-open");
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("keydown", esc); document.documentElement.classList.remove("menu-open"); };
  }, [open]);
  const quiz = p.startsWith("/quiz");

  return (
    <nav className={`nav ${open ? "open" : ""}`} onClick={e => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
      <div className="wrap">
        <Link href="/" className="brand" aria-label="99names home"><Mark size={30} /><span>99names</span></Link>
        <div className="links">
          {LINKS.map(([h, l]) => <Link key={h} href={h} className={`nav-l ${p.startsWith(h) ? "on" : ""}`}>{l}</Link>)}
          <span className="nav-dial"><HourDial /></span>
          <Link href="/quiz" className={`pill small nav-quiz ${quiz ? "here" : ""}`} aria-current={quiz ? "page" : undefined}>
            <span className="nq-long">Take the quiz</span><span className="nq-short">Quiz</span>
          </Link>
          <button className="nav-menu" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="nav-sheet" aria-label={open ? "Close the menu" : "Open the menu"}>
            <i /><i />
          </button>
        </div>
      </div>
      {open && (
        <div className="nav-sheet" id="nav-sheet">
          <Link href="/quiz" className={quiz ? "on" : ""}>The quiz<small>Learn all ninety-nine, by heart</small></Link>
          <Link href="/names" className={p.startsWith("/names") ? "on" : ""}>All 99 names<small>Read each one</small></Link>
          <Link href="/send" className={p.startsWith("/send") ? "on" : ""}>Send a name<small>For whoever needs it</small></Link>
          <Link href="/app" className={p.startsWith("/app") ? "on" : ""}>The app<small>It knows what time it is</small></Link>
          <Link href="/shop" className={p.startsWith("/shop") ? "on" : ""}>Shop<small>The Deck, prints and more</small></Link>
          <HourDial inline />
        </div>
      )}
    </nav>
  );
}
