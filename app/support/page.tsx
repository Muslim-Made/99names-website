import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Help with the 99names app: reminders, your hour, your circle, moving to a new phone, and how to reach us.",
};

const card = { padding: 24 } as const;

export default function SupportPage() {
  return (
    <section className="wrap" style={{ paddingTop: 56, paddingBottom: 40, maxWidth: 860 }}>
      <h2>Help, <em>whenever you need it.</em></h2>
      <p className="lede">Write to <a href="mailto:team@99names.net">team@99names.net</a>. A person reads every message and we usually answer within two working days. The common questions are below.</p>

      <div className="grid" style={{ gap: 14, marginTop: 36 }}>
        <div className="card" style={card}>
          <h3>Do I need an account?</h3>
          <p className="note">No. There is nothing to sign in to. Open the app and begin.</p>
        </div>

        <div className="card" style={card}>
          <h3>Is it free?</h3>
          <p className="note">Yes. The app is free, with no adverts and nothing to buy inside it. Printed cards are sold on this website, in your browser.</p>
        </div>

        <div className="card" style={card}>
          <h3>My reminder does not arrive</h3>
          <p className="note">Check that notifications are allowed for 99names in your phone&rsquo;s settings. Then open the app, go to You, Settings, Reminders, and see that the daily name is on. The reminder comes a quarter of an hour after the prayer you chose. There is one a day at most.</p>
        </div>

        <div className="card" style={card}>
          <h3>Changing the hour, the city or the pace</h3>
          <p className="note">All three are in You, then Settings. You can pick a city by hand. Location is optional and never leaves the phone.</p>
        </div>

        <div className="card" style={card}>
          <h3>A name came back that I thought I knew</h3>
          <p className="note">That is how remembering works here. A name is yours after two right answers in two different ways. Names return on a widening gap, so the ones you know well come back less and less.</p>
        </div>

        <div className="card" style={card}>
          <h3>Your circle</h3>
          <p className="note">Go to You, then Your circle. Start one and share the invite, or enter a code someone sent you. A circle holds up to five people. Each sees the others&rsquo; display name and ring, and nothing else. You can leave at any time, and your entry is removed.</p>
        </div>

        <div className="card" style={card}>
          <h3>Moving to a new phone</h3>
          <p className="note">Your progress lives on the phone and rides with your phone&rsquo;s own backup, iCloud or Google. Restore the backup on the new phone and it comes with you. There is also &ldquo;Export my progress&rdquo; in Settings, under Privacy and data.</p>
        </div>

        <div className="card" style={card}>
          <h3>Starting again, or removing everything</h3>
          <p className="note">Settings, then Privacy and data, then &ldquo;Erase everything on this phone&rdquo;. To remove anything held by us, such as an order, write to us and we will delete it.</p>
        </div>

        <div className="card" style={card}>
          <h3>Something reads wrongly</h3>
          <p className="note">If a name, a meaning, a verse or a reference looks wrong, please tell us. Send the name and what you saw. We check every report against the source and correct it.</p>
        </div>

        <div className="card" style={card}>
          <h3>An order from the shop</h3>
          <p className="note">Write to <a href="mailto:team@99names.net">team@99names.net</a> with your order reference. It is in your receipt email and starts with 99N.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
        <a className="pill" href="mailto:team@99names.net">Write to us</a>
        <Link className="pill o" href="/privacy">Privacy</Link>
      </div>
    </section>
  );
}
