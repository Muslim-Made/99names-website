"use client";
import { useState } from "react";

/** One link, several doors. */
export default function ShareLinks({ url, to, from, text }: { url: string; to: string; from?: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const msg = `${text}\n${url}`;
  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); };
  const native = async () => { if (navigator.share) { try { await navigator.share({ title: `A name for ${to}`, text, url }); return; } catch { } } copy(); };
  return (
    <div className="share">
      <button className="share-url" onClick={copy} title="Copy the link"><span>{url.replace(/^https?:\/\//, "")}</span><b>{copied ? "Copied" : "Copy"}</b></button>
      <div className="share-doors">
        <a className="pill" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="pill o" href={`sms:?&body=${encodeURIComponent(msg)}`}>Message</a>
        <a className="pill o" href={`mailto:?subject=${encodeURIComponent(`A name for you${from ? `, from ${from}` : ""}`)}&body=${encodeURIComponent(msg)}`}>Email</a>
        <button className="pill o" onClick={native}>More…</button>
      </div>
    </div>
  );
}
