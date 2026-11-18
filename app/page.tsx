import type { CSSProperties } from "react";
import Link from "next/link";
import { NAMES } from "@/lib/names";
import NoorField from "@/components/NoorField";
import Ring from "@/components/Ring";
import { HourStrip } from "@/components/HourHome";
import { HeroQuestion, HeroActions, HowScene, LevelRail } from "@/components/HomeQuiz";

export const revalidate = 3600;

const VERSE_EN = "And to Allah belong the best names, so invoke Him by them.".split(" ");
const ALL = NAMES.map(n => n.n);

export default function Home() {
  return (
    <>
      <header className="wrap hero">
        <NoorField />
        <div className="hero-text" data-reveal data-stagger>
          <h1>Learn the 99 Names of Allah, <em>by heart.</em></h1>
          <p className="lede">Four names at a time, a few minutes a day. Free, no account, no streaks to keep.</p>
          <HeroActions />
        </div>
        <HeroQuestion />
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

      <section className="how-sec">
        <div className="wrap">
          <div data-reveal>
            <h2>Three small steps, <em>as often as you like.</em></h2>
            <p className="lede">The quiz teaches before it asks. You meet a name, you answer a few gentle questions about it, and it stays.</p>
          </div>
          <HowScene />
        </div>
      </section>

      <section className="levels-sec">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <div>
              <h2>Nine levels, <em>dawn to night.</em></h2>
              <p className="lede">Eleven names each, in the traditional order, from Ar-Rahman at Fajr to As-Sabur at Isha. Step in wherever you like.</p>
            </div>
            <Link href="/quiz?mode=check" className="pill o">Already know some? Find your number</Link>
          </div>
        </div>
        <div data-reveal><LevelRail /></div>
      </section>

      <section className="verse-sec" data-scrub>
        <div className="wrap">
          <div className="nasta verse-ar">وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</div>
          <p className="verse-en scrub-words">
            {VERSE_EN.map((w, i) => <span key={i} style={{ "--i": (i / VERSE_EN.length).toFixed(3) } as CSSProperties}>{w} </span>)}
          </p>
          <p className="note verse-ref">Al-A&rsquo;raf 7:180</p>
          <p className="lede verse-why" data-reveal>In the Qur&rsquo;an and the words of the Prophet ﷺ, Allah describes Himself through His names: mercy, patience, light, majesty, nearness. Each one is a window. Learning them is how you come to know who you are speaking to.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <HourStrip />
        </div>
      </section>

      <section>
        <div className="wrap grid g2" data-reveal data-stagger>
          <Link href="/send" className="card feature">
            <h3>Send a name to someone.</h3>
            <p className="note">Tell us who it is for and what they are going through. Send a link for free, or the real card, posted anywhere, for $6.</p>
            <span className="feature-go">Send a name →</span>
          </Link>
          <Link href="/app" className="card feature">
            <h3>The app knows what time it is.</h3>
            <p className="note">Blush at Fajr, navy at Isha. One name, one breath, and the same quiz in your pocket. Coming to iOS and Android.</p>
            <span className="feature-go">About the app →</span>
          </Link>
        </div>
        <div className="wrap">
          <Link href="/shop" className="deckline" data-reveal>
            <span><b>The Deck.</b> All ninety-nine as soft-touch cards, dawn to night. $34, ships worldwide.</span>
            <span className="feature-go">Visit the shop →</span>
          </Link>
        </div>
      </section>

      <section className="closing">
        <div className="wrap" data-reveal>
          <Ring lit={ALL} fresh={ALL} pace={0.022} className="closing-ring" />
          <h2>Begin with <em>one name.</em></h2>
          <p className="lede">Ar-Rahman is waiting at level one. At one name a week you would know all ninety-nine in under two years. Slower is fine.</p>
          <Link href="/quiz" className="pill big">Start the quiz</Link>
        </div>
      </section>
    </>
  );
}
