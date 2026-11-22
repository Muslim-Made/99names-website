import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What the 99names app and website keep, what leaves your phone, and how to remove it. No account, no ads, no trackers.",
};

const card = { padding: 24 } as const;

export default function PrivacyPage() {
  return (
    <section className="wrap" style={{ paddingTop: 56, paddingBottom: 40, maxWidth: 860 }}>
      <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", marginBottom: 18 }}>Privacy Policy</h1>
      <h2>Yours, <em>on your phone.</em></h2>
      <p className="lede">99names has no account, no adverts and no trackers. What you learn stays on your device. This page says exactly what is kept, what leaves, and how to remove it.</p>
      <p className="note" style={{ marginTop: 14 }}>Last updated 18 November 2026. It covers the 99names app for iPhone and Android, and this website.</p>

      <div className="grid" style={{ gap: 14, marginTop: 36 }}>
        <div className="card" style={card}>
          <h3>What stays on your device</h3>
          <p className="note">Your progress, the names you know, your awards, your settings, the hour and city you chose, and the days you opened the app. All of it is stored on the phone. It is included in your phone&rsquo;s own backup if you have that switched on. We cannot see it.</p>
        </div>

        <div className="card" style={card}>
          <h3>Location</h3>
          <p className="note">Location is optional. If you allow it, the app uses it on the phone to work out prayer times. It is never sent to us or to anyone else. You can choose a city instead and never grant the permission. The website may also ask, to match its colours to the hour. That too stays in your browser.</p>
        </div>

        <div className="card" style={card}>
          <h3>Reminders</h3>
          <p className="note">Reminders are scheduled by the app on your phone. There are no push messages from a server, and at most one reminder a day. You can switch each kind off in Settings.</p>
        </div>

        <div className="card" style={card}>
          <h3>Your circle: the one thing that leaves the phone</h3>
          <p className="note">A circle is optional. If you start or join one, the app sends these to our server so the people you invited can see your ring: the display name you type, how many names you know, the most recent name you learned, and the time of the last update. They are kept under a random circle code and a random member id. There is no email, no phone number, no contact list, no location and no device identifier.</p>
          <p className="note" style={{ marginTop: 10 }}>Anyone who holds the code can see the circle, so share it only with people you mean to invite. A circle holds five people at most. Leave a circle in the app and your entry is removed from it. A circle nobody has opened for a year is deleted.</p>
        </div>

        <div className="card" style={card}>
          <h3>Sending a name</h3>
          <p className="note">A name sent as a link carries the name, who it is for, who it is from and your note inside the link itself. It is not stored on our server. Whoever has the link can read it.</p>
        </div>

        <div className="card" style={card}>
          <h3>Orders from the shop</h3>
          <p className="note">Printed cards and other goods are sold on this website, never inside the app. An order needs your name, email address and, for posted goods, a postal address. A card sent to someone also needs their name, their address and your note. We use these only to fulfil the order. Payment is taken by Squad or Paystack. We never see or store your card number.</p>
        </div>

        <div className="card" style={card}>
          <h3>What we do not do</h3>
          <p className="note">No adverts. No analytics kits. No tracking across apps or websites. No selling or renting of data. No profile of what you learn.</p>
        </div>

        <div className="card" style={card}>
          <h3>Who helps us run it</h3>
          <p className="note">The website and the circle run on Vercel, with Upstash for storage. Order emails go through Resend. Like any web server, our host sees the internet address of a request for a short time in order to answer it. We do not use it to identify you.</p>
        </div>

        <div className="card" id="delete" style={{ ...card, scrollMarginTop: 90 }}>
          <h3>Deleting your data from 99names</h3>
          <p className="note">This applies to the 99names app (99names: Light by Name on the App Store, 99names: 99 Names of Allah on Google Play), published by Geomatix Innovative Systems.</p>
          <p className="note" style={{ marginTop: 10 }}><strong>What we hold.</strong> Only what a circle needs: your display name, how many names you know, the last name you learned, and the time of your last update. Everything else is on your phone.</p>
          <p className="note" style={{ marginTop: 10 }}><strong>To delete it yourself.</strong> Open the app. Go to You, then Your circle, then leave the circle. Your entry is removed from our server at once.</p>
          <p className="note" style={{ marginTop: 10 }}><strong>To ask us to delete it.</strong> Write to <a href="mailto:team@99names.net">team@99names.net</a> with your display name and your circle code. We delete the entry within seven days and tell you when it is done. You do not need the app installed to ask.</p>
          <p className="note" style={{ marginTop: 10 }}><strong>What is kept.</strong> Nothing from your entry is kept after deletion. A circle that nobody opens for a year is deleted in full by itself.</p>
          <p className="note" style={{ marginTop: 10 }}><strong>On your phone.</strong> Settings, then Privacy and data, then &ldquo;Erase everything on this phone&rdquo; clears your progress. Removing the app does the same. To have a shop order removed, write to the same address.</p>
        </div>

        <div className="card" style={card}>
          <h3>Children</h3>
          <p className="note">The app is suitable for all ages and asks for no personal details. A circle shows a display name to the people invited to it. A parent should choose that name for a child.</p>
        </div>

        <div className="card" style={card}>
          <h3>Changes and contact</h3>
          <p className="note">If this page changes, the date at the top changes with it. 99names is published by Geomatix Innovative Systems Limited, Abuja, Nigeria. Questions go to <a href="mailto:team@99names.net">team@99names.net</a>.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
        <Link className="pill o" href="/support">Help and support</Link>
        <Link className="pill o" href="/app">The app</Link>
      </div>
    </section>
  );
}
