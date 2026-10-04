"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NAMES, Name, bySlug } from "@/lib/names";
import { MOODS, moodNames, searchNames } from "@/lib/moods";
import { encodeSent, sentUrl, NOTE_MAX, arrivalLine, type Sent } from "@/lib/send";
import { bySku, usd, ngn } from "@/lib/catalog";
import NameCard from "@/components/NameCard";
import Envelope from "@/components/Envelope";
import AddressFields, { EMPTY_ADDRESS, addressComplete } from "@/components/AddressFields";
import ShareLinks from "@/components/ShareLinks";
import type { Address } from "@/lib/orders";

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Choose", "Write", "Send"];
const DRAFT = "99names:send-draft";

const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

export default function Send() {
  const sp = useSearchParams();
  const product = bySku("send")!;
  const [step, setStep] = useState<Step>(0);
  const [slug, setSlug] = useState<string | null>(sp.get("name"));
  const [mood, setMood] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [to, setTo] = useState(""); const [from, setFrom] = useState(""); const [note, setNote] = useState("");
  const [when, setWhen] = useState<"now" | "tomorrow" | "date">("now"); const [date, setDate] = useState("");
  const [mode, setMode] = useState<"link" | "post">("link");
  const [addressMode, setAddressMode] = useState<"have" | "ask">("have");
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [email, setEmail] = useState(""); const [senderInput, setSender] = useState("");
  const sender = senderInput || from; // the receipt name defaults to "From"
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);

  // a draft survives a refresh (and the trip to the payment page and back). Restored after mount so the
  // server and first client render match; the state sync here is the point, not an accident.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT) || "null");
      if (d) { if (!sp.get("name") && d.slug) setSlug(d.slug); setTo(d.to || ""); setFrom(d.from || ""); setNote(d.note || ""); setEmail(d.email || ""); setSender(d.sender || ""); if (d.address) setAddress(d.address); if (d.slug && !sp.get("name")) setStep(d.step ?? 0); }
    } catch { }
  }, [sp]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { try { sessionStorage.setItem(DRAFT, JSON.stringify({ slug, to, from, note, email, sender: senderInput, address, step: Math.min(step, 2) })); } catch { } }, [slug, to, from, note, email, senderInput, address, step]);

  const name: Name | null = slug ? bySlug(slug) || null : null;
  const go = (s: Step) => {
    if (s === 2 && !address.name && to) setAddress(a => ({ ...a, name: to })); // the envelope is addressed to whoever it’s for
    setStep(s); setErr(null); requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const d = when === "now" ? undefined : when === "tomorrow" ? tomorrow() : date || undefined;
  const sent: Sent | null = name ? { n: name.n, t: to, f: from, m: note, d } : null;
  const url = sent ? sentUrl(sent) : "";
  const shareText = name ? `${name.tr} — ${name.en}. ${name.line}` : "";

  const pool = useMemo(() => {
    if (q.trim()) return searchNames(q);
    if (mood && !showAll) { const m = MOODS.find(x => x.key === mood); return m ? moodNames(m) : NAMES; }
    return showAll ? NAMES : NAMES.filter((_, i) => i % 9 === 0 || [4, 29, 46, 98, 45, 33, 17, 8].includes(i)).slice(0, 12);
  }, [q, mood, showAll]);

  const pay = async () => {
    if (!sent) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku: "send", email, name: sender, addressMode, address: addressMode === "have" ? address : undefined, sent }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong");
      location.href = j.url;
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  const canWrite = !!name; const canSend = canWrite && to.trim().length > 0;
  const canPay = canSend && /\S+@\S+\.\S+/.test(email) && sender.trim() && (addressMode === "ask" || addressComplete(address));

  return (
    <section className="wrap sendflow" ref={top}>
      <div className="steps" aria-label="Progress">
        {STEPS.map((s, i) => <button key={s} className={`step ${i === step ? "on" : ""} ${i < step ? "done" : ""}`} disabled={i > step && !(i === 1 && canWrite) && !(i === 2 && canSend)} onClick={() => go(i as Step)}><i>{i + 1}</i>{s}</button>)}
      </div>

      {/* ---------- 1 · choose ---------- */}
      {step === 0 && (
        <div className="rise">
          <div className="eyebrow">Send a name · Who is it for?</div>
          <h2>For whoever <em>needs it this week.</em></h2>
          <p className="lede">Tell us what they’re going through and we’ll suggest a few names. Or browse all ninety-nine. Nothing to sign up for.</p>
          <div className="moods">
            {MOODS.map(m => <button key={m.key} className={`mood ${mood === m.key ? "on" : ""}`} onClick={() => { setMood(mood === m.key ? null : m.key); setShowAll(false); setQ(""); }}>{m.label}</button>)}
          </div>
          {mood && !q && !showAll && <p className="note moodline">{MOODS.find(m => m.key === mood)?.line}</p>}
          <div className="pickbar">
            <input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search a name, a meaning, a number…" aria-label="Search the 99 names" />
            <button className="pill o small" onClick={() => { setShowAll(v => !v); setMood(null); setQ(""); }}>{showAll ? "Fewer" : "All 99"}</button>
          </div>
          <div className="strip pick" data-stagger>
            {pool.map(n => (
              <button key={n.n} className={`ncard-link pickcard ${slug === n.slug ? "on" : ""}`} onClick={() => { setSlug(n.slug); go(1); }} aria-label={`Choose ${n.tr}, ${n.en}`}>
                <NameCard name={n} href={false} rays={false} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- 2 · write ---------- */}
      {step === 1 && name && (
        <div className="rise">
          <div className="eyebrow">Send a name · Make it theirs</div>
          <h2>{name.tr}, <em>for…</em></h2>
          <div className="sendgrid">
            <div className="card">
              <div className="field"><label>To</label><input value={to} onChange={e => setTo(e.target.value)} placeholder="Nayla" maxLength={60} autoFocus /></div>
              <div className="field"><label>From (optional)</label><input value={from} onChange={e => setFrom(e.target.value)} placeholder="Amaar" maxLength={60} /></div>
              <div className="field"><label>A line, if you like</label>
                <textarea value={note} onChange={e => setNote(e.target.value.slice(0, NOTE_MAX))} rows={3} placeholder={`I thought of you when I read this one.`} />
                <span className="counter">{note.length} / {NOTE_MAX}</span></div>
              <div className="field"><label>When should it arrive?</label>
                <div className="whens">
                  {(["now", "tomorrow", "date"] as const).map(w => <button key={w} className={`chip ${when === w ? "on" : ""}`} onClick={() => setWhen(w)}>{w === "now" ? "Now" : w === "tomorrow" ? "Tomorrow morning" : "A date"}</button>)}
                  {when === "date" && <input type="date" value={date} min={tomorrow()} onChange={e => setDate(e.target.value)} aria-label="Delivery date" />}
                </div>
                {arrivalLine(d) && <span className="note" style={{ fontSize: 12 }}>{arrivalLine(d)}</span>}
              </div>
              <div className="actions-row">
                <button className="pill" disabled={!canSend} onClick={() => go(2)}>Continue</button>
                <button className="pill o" onClick={() => go(0)}>Change the name</button>
              </div>
            </div>
            <div className="preview">
              <Envelope name={name} to={to} state="peek" />
              <div className="inside">
                <p className="note">Inside, in your words:</p>
                <p className="insidenote">{to ? `${to} — ` : ""}{note || <span style={{ opacity: .5 }}>{name.line}</span>}{from ? ` — ${from}` : ""}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- 3 · send ---------- */}
      {step === 2 && name && sent && (
        <div className="rise">
          <div className="eyebrow">Send a name · How should it travel?</div>
          <h2>Two ways <em>to send it.</em></h2>
          <div className="choices">
            <button className={`choice ${mode === "link" ? "on" : ""}`} onClick={() => setMode("link")}>
              <span className="choice-price">Free</span>
              <b>Send the link</b>
              <span className="note">They open an envelope on their screen, tinted to their own hour. Works in WhatsApp, a text, an email.</span>
            </button>
            <button className={`choice ${mode === "post" ? "on" : ""}`} onClick={() => setMode("post")}>
              <span className="choice-price">{usd(product.usd)} <small>· {ngn(product.ngn)}</small></span>
              <b>Post the real card</b>
              <span className="note">We print it, hand-address the envelope, and post it anywhere in the world. The link is on the back, so they get both.</span>
            </button>
          </div>

          {mode === "link" ? (
            <div className="card sendbox">
              <p className="lede" style={{ marginBottom: 18 }}>Ready. Your link is made, nothing is stored, and it never expires.</p>
              <div className="actions-row"><button className="pill" onClick={() => go(3)}>Make the link</button><button className="pill o" onClick={() => go(1)}>Back</button></div>
            </div>
          ) : (
            <div className="sendgrid">
              <div className="card sendbox">
                <div className="field"><label>Where should it go?</label>
                  <div className="whens">
                    <button className={`chip ${addressMode === "have" ? "on" : ""}`} onClick={() => setAddressMode("have")}>I know their address</button>
                    <button className={`chip ${addressMode === "ask" ? "on" : ""}`} onClick={() => setAddressMode("ask")}>Ask them for it</button>
                  </div>
                  {addressMode === "ask" && <span className="note" style={{ fontSize: 13, marginTop: 6 }}>Their link will gently ask where to post it. We print and send the day they reply. You pay now, once.</span>}
                </div>
                {addressMode === "have" && <AddressFields value={address} onChange={setAddress} />}
                <div className="rule" />
                <div className="eyebrow" style={{ marginBottom: 12 }}>Your receipt</div>
                <div className="addr">
                  <div className="field"><label>Your name</label><input value={sender} onChange={e => setSender(e.target.value)} autoComplete="name" /></div>
                  <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" /></div>
                </div>
                {err && <p className="error">{err}</p>}
                <div className="actions-row">
                  <button className="pill" disabled={!canPay || busy} onClick={pay}>{busy ? "One moment…" : `Pay ${usd(product.usd)} · ${ngn(product.ngn)}`}</button>
                  <button className="pill o" onClick={() => go(1)}>Back</button>
                </div>
                <p className="note" style={{ fontSize: 12, marginTop: 14 }}>Paid securely through Squad. {product.ships}. You’ll get the link straight after, too.</p>
              </div>
              <div className="preview"><Envelope name={name} to={to} state="closed" /><p className="note" style={{ textAlign: "center" }}>Hand-addressed to {to || "them"}{from ? `, from ${from}` : ""}.</p></div>
            </div>
          )}
        </div>
      )}

      {/* ---------- 4 · share ---------- */}
      {step === 3 && name && sent && (
        <div className="rise share-stage">
          <div className="eyebrow">Sent · {name.tr} for {to}</div>
          <h2>It’s <em>ready.</em></h2>
          <p className="lede">Send this link however you talk to {to}. They’ll open an envelope with their name on it.</p>
          <ShareLinks url={url} to={to} from={from} text={shareText} />
          <div className="actions-row" style={{ justifyContent: "center" }}>
            <a className="pill o" href={`/for/${encodeSent(sent)}`} target="_blank" rel="noreferrer">Preview what they’ll see</a>
            <button className="pill o" onClick={() => { setMode("post"); go(2); }}>Also post the real card · {usd(product.usd)}</button>
            <Link href="/send" className="pill o" onClick={() => { sessionStorage.removeItem(DRAFT); setSlug(null); setTo(""); setFrom(""); setNote(""); setStep(0); }}>Send another</Link>
          </div>
        </div>
      )}
    </section>
  );
}
