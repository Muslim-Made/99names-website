import Link from "next/link";
import { NAMES } from "@/lib/names";
import { Mark } from "@/components/Rays";
import NoorField from "@/components/NoorField";
import { HourHero, HourStrip } from "@/components/HourHome";

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <header className="wrap hero">
        <NoorField />
        <HourHero />
        <div className="scroll-cue" aria-hidden="true"><span /></div>
      </header>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map(k => (
            <div className="marquee-run ar" key={k}>
              {NAMES.map(n => <span key={n.n}>{n.ar}</span>)}
            </div>
          ))}
        </div>
      </div>

      <section>
        <div className="wrap">
          <HourStrip />
        </div>
      </section>

      <section>
        <div className="wrap grid g3" data-reveal data-stagger>
          <Link href="/remember" className="card feature"><div className="eyebrow">Remember</div><h3 style={{ marginTop: 10 }}>Do you remember this one?</h3><p className="note">A quiet ten-question round. Wrong answers just show you the name again, warmly. Share how many you know.</p></Link>
          <Link href="/send" className="card feature"><div className="eyebrow">Send a name</div><h3 style={{ marginTop: 10 }}>For whoever needs it this week.</h3><p className="note">Tell us who it's for and what they're going through. Send a link for free, or the real card, posted anywhere, for $6.</p></Link>
          <Link href="/app" className="card feature"><div className="eyebrow">The app</div><h3 style={{ marginTop: 10 }}>It knows what time it is.</h3><p className="note">Blush at Fajr, navy at Isha. One name, one breath, no streaks, no guilt.</p></Link>
        </div>
      </section>

      <section>
        <div className="wrap grid g2" style={{ alignItems: "center", gap: 56 }}>
          <div data-reveal data-stagger>
            <div className="eyebrow">Why the names</div>
            <h2>Know Him <em>by name.</em></h2>
            <p className="lede">In the Qur'an and the words of the Prophet ﷺ, Allah describes Himself through His names — the Most Beautiful Names, <em>al-Asmā' al-Ḥusnā</em>. Mercy, patience, light, majesty, nearness. Each one is a window.</p>
            <p className="note" style={{ marginTop: 16 }}>"And to Allah belong the best names, so invoke Him by them." — Al-A'raf 7:180</p>
            <div className="nasta" style={{ fontSize: 30, marginTop: 18, textAlign: "left" }}>وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</div>
          </div>
          <div className="card" data-reveal data-parallax="0.05" style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}><Mark size={40} /><div><b style={{ fontFamily: "var(--disp)", fontWeight: 400, fontSize: 20 }}>Ninety-nine rays</b><div className="note">Our mark has exactly 99 rays. One per name. Count them.</div></div></div>
            <div className="note"><b style={{ fontWeight: 500 }}>One a week.</b> At that pace you'll know all 99 in under two years. Slower is fine. This isn't a race.</div>
            <div className="note"><b style={{ fontWeight: 500 }}>The hour.</b> This page is tinted for the current prayer time where you are. Use the dial in the top bar to see any other hour.</div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="card deck-cta" data-reveal>
            <div data-parallax="0.03"><div className="eyebrow">The Deck</div><h2 style={{ fontSize: "clamp(36px,4.5vw,56px)" }}>Ninety-nine, <em>in your hand.</em></h2><p className="note">99 soft-touch cards, dawn to night. Keep one on the nightstand. Send one to a friend. $34, ships worldwide.</p></div>
            <Link href="/shop" className="pill">Shop</Link>
          </div>
        </div>
      </section>
    </>
  );
}
