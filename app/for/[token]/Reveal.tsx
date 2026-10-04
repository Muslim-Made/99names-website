"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Name } from "@/lib/names";
import type { Sent } from "@/lib/send";
import { arrivalLine } from "@/lib/send";
import Envelope from "@/components/Envelope";
import NameCard from "@/components/NameCard";
import Listen from "@/components/Listen";
import Breath from "@/components/Breath";
import AddressFields, { EMPTY_ADDRESS, addressComplete } from "@/components/AddressFields";
import type { Address } from "@/lib/orders";

/**
 * The recipient’s page. An envelope with their name; it opens in about a second;
 * the card settles on a ledge; the meaning unfolds beneath it. Nav and footer step back.
 */
export default function Reveal({ sent, name }: { sent: Sent; name: Name }) {
  const [phase, setPhase] = useState<"closed" | "open" | "settled">("closed");
  const [address, setAddress] = useState<Address>({ ...EMPTY_ADDRESS, name: sent.t });
  const [sentAddr, setSentAddr] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);

  useEffect(() => { document.documentElement.dataset.reveal = "1"; return () => { delete document.documentElement.dataset.reveal; }; }, []);
  const open = () => { if (phase !== "closed") return; setPhase("open"); setTimeout(() => setPhase("settled"), 1300); };
  useEffect(() => { const t = setTimeout(open, 1100); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const needAddress = !!sent.a && !!sent.r && !sentAddr;
  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/address", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: sent.r, address }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Something went wrong");
      setSentAddr(true);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="reveal">
      <div className={`stage ${phase}`}>
        <div className="stage-env"><Envelope name={name} to={sent.t} state={phase === "closed" ? "closed" : "open"} onClick={open} /></div>
        <div className="stage-card"><div className="ledge"><NameCard name={name} href={false} big /></div></div>
        {phase === "closed" && <p className="note tap">Tap to open</p>}
      </div>

      <section className={`wrap unfold ${phase === "settled" ? "in" : ""}`}>
        <div className="eyebrow">For {sent.t}{sent.f ? ` · from ${sent.f}` : ""}</div>
        <h2 style={{ marginTop: 8 }}>{name.tr}, <em>{name.en.replace(/^The /, "the ")}.</em></h2>
        {sent.m && <p className="fromnote">&ldquo;{sent.m}&rdquo;{sent.f && <span> — {sent.f}</span>}</p>}
        {arrivalLine(sent.d) && <p className="note" style={{ marginBottom: 12 }}>{arrivalLine(sent.d)}</p>}
        <p className="lede">{name.meaning}</p>
        <p className="line">{name.line}</p>
        <div className="actions-row" style={{ marginTop: 22 }}>
          <Listen text={name.ar} />
          <Link href={`/names/${name.slug}`} className="pill o">Read more about this name</Link>
          <Breath />
        </div>

        {needAddress && (
          <div className="card askaddr">
            <div className="eyebrow">A real card is coming</div>
            <h3 style={{ marginTop: 10 }}>Where should the printed card go?</h3>
            <p className="note" style={{ marginBottom: 18 }}>{sent.f || "Someone"} has already paid to post you this name. Add an address and we&rsquo;ll send it within three days. We won&rsquo;t use it for anything else.</p>
            <AddressFields value={address} onChange={setAddress} forWhom="you" />
            {err && <p className="error">{err}</p>}
            <button className="pill" disabled={!addressComplete(address) || busy} onClick={submit}>{busy ? "One moment…" : "Post it to me"}</button>
          </div>
        )}
        {sentAddr && <div className="card askaddr"><h3>It&rsquo;s on its way.</h3><p className="note">We&rsquo;ll post it within three days, with your name on the envelope.</p></div>}

        <div className="sendback">
          <div className="rule" />
          <p className="note">Know someone who needs a name this week?</p>
          <Link href="/send" className="pill o">Send one back</Link>
        </div>
      </section>
    </div>
  );
}
