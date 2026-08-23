import Link from "next/link";
import { NAMES, weeklyName } from "@/lib/names";
import { Rays, Mark } from "@/components/Rays";
import NameCard from "@/components/NameCard";
import Breath from "@/components/Breath";
import Listen from "@/components/Listen";

export const revalidate = 3600;

export default function Home() {
  const name = weeklyName();
  return (
    <>
      <header className="wrap hero">
        <Rays className="rays-bg" r1={150} r2={200} w={1} />
        <div style={{ position: "relative" }}>
          <div className="eyebrow">This week · No. {name.n} of 99</div>
          <h1 style={{ marginTop: 16 }}>{splitTitle(name.en)}</h1>
          <div className="ar hero-ar">{name.ar}</div>
          <p className="lede">{name.tr}. {name.line}</p>
          <div className="actions">
            <Listen text={name.ar} />
            <Link href={`/names/${name.slug}`} className="pill o">Read this name</Link>
            <Breath />
          </div>
        </div>
        <div className="hero-card"><NameCard name={name} big /></div>
      </header>

      <section>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
            <div><div className="eyebrow">Ninety-nine names</div><h2>Dawn <em>to night.</em></h2></div>
            <Link href="/names" className="pill o">All 99 names</Link>
          </div>
          <p className="lede" style={{ marginBottom: 40 }}>The names run from Ar-Rahman at dawn to As-Sabur at night. Tap any name to hear it, read it, and keep it.</p>
          <div className="strip">
            {NAMES.filter(n => [1, 2, 5, 19, 30, 47, 62, 68, 80, 93, 94, 99].includes(n.n)).map(n => <NameCard key={n.n} name={n} rays={false} />)}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap grid g3">
          <Link href="/remember" className="card"><div className="eyebrow">Remember</div><h3 style={{ marginTop: 10 }}>Do you remember this one?</h3><p className="note">A quiet ten-question round. Wrong answers just show you the name again, warmly. Share how many you know.</p></Link>
          <Link href="/send" className="card"><div className="eyebrow">Send a name</div><h3 style={{ marginTop: 10 }}>For whoever needs it this week.</h3><p className="note">Pick a name, write who it's for, send a link — or a real card in the post.</p></Link>
          <Link href="/app" className="card"><div className="eyebrow">The app</div><h3 style={{ marginTop: 10 }}>It knows what time it is.</h3><p className="note">Blush at Fajr, navy at Isha. One name, one breath, no streaks, no guilt.</p></Link>
        </div>
      </section>

      <section>
        <div className="wrap grid g2" style={{ alignItems: "center", gap: 56 }}>
          <div>
            <div className="eyebrow">Why the names</div>
            <h2>Know Him <em>by name.</em></h2>
            <p className="lede">In the Qur'an and the words of the Prophet ﷺ, Allah describes Himself through His names — the Most Beautiful Names, <em>al-Asmā' al-Ḥusnā</em>. Mercy, patience, light, majesty, nearness. Each one is a window.</p>
            <p className="note" style={{ marginTop: 16 }}>"And to Allah belong the best names, so invoke Him by them." — Al-A'raf 7:180</p>
            <div className="nasta" style={{ fontSize: 30, marginTop: 18, textAlign: "left" }}>وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</div>
          </div>
          <div className="card" style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}><Mark size={40} /><div><b style={{ fontFamily: "var(--disp)", fontWeight: 400, fontSize: 20 }}>Ninety-nine rays</b><div className="note">Our mark has exactly 99 rays. One per name. Count them.</div></div></div>
            <div className="note"><b style={{ fontWeight: 500 }}>One a week.</b> At that pace you'll know all 99 in under two years. Slower is fine. This isn't a race.</div>
            <div className="note"><b style={{ fontWeight: 500 }}>The hour.</b> This page is tinted for the current prayer time where you are. Scroll to the foot of the page to change it.</div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
            <div><div className="eyebrow">The Deck</div><h2 style={{ fontSize: 44 }}>Ninety-nine, <em>in your hand.</em></h2><p className="note">99 soft-touch cards, dawn to night. Keep one on the nightstand. Send one to a friend. $34, ships worldwide.</p></div>
            <Link href="/shop" className="pill">Shop</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function splitTitle(en: string) {
  const parts = en.replace(/^The /, "").split(" ");
  if (parts.length === 1) return <>The <em>{parts[0]}</em></>;
  const last = parts.pop();
  return <>The {parts.join(" ")} <em>{last}</em></>;
}
