"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const IOS = "https://apps.apple.com/app/id6807740287";
const PLAY = "https://play.google.com/store/apps/details?id=net.ninetyninenames.app";

type Os = "ios" | "android" | "other";

/** Copy the code before leaving for the store, so the app can offer to paste it on first open. */
async function copy(code: string) {
  try { await navigator.clipboard.writeText(code); return true; } catch {}
  // Older in-app browsers (Instagram, WhatsApp) refuse the async clipboard; the old way still works there.
  try {
    const t = Object.assign(document.createElement("textarea"), { value: code, readOnly: true });
    t.style.cssText = "position:fixed;opacity:0;top:0";
    document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  } catch { return false; }
}

/**
 * The invite page's buttons. On a phone, one store button that copies the code on the way out.
 * Elsewhere, both stores. "I have the app" opens it by its own scheme, for when the link opened here instead.
 */
export default function InviteActions({ code }: { code: string }) {
  const [os, setOs] = useState<Os>("other");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    setOs(/iPhone|iPad|iPod/.test(ua) || iPadOS ? "ios" : /Android/.test(ua) ? "android" : "other");
  }, []);

  const play = `${PLAY}&referrer=${encodeURIComponent(`circle=${code}`)}`;
  const go = (url: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    setCopied(await copy(code));
    window.location.href = url;
  };
  const copyOnly = async () => setCopied(await copy(code));

  return (
    <>
      <div className="actions-row" style={{ justifyContent: "center" }}>
        {os !== "android" && <a className="pill big" href={IOS} onClick={go(IOS)}>{os === "ios" ? "Get the app" : "App Store"}</a>}
        {os !== "ios" && <a className={`pill big${os === "other" ? " o" : ""}`} href={play} onClick={go(play)}>{os === "android" ? "Get the app" : "Google Play"}</a>}
        <a className="pill o big" href={`ninetyninenames://with/${code}`}>I have the app</a>
      </div>
      <p className="note" style={{ textAlign: "center", marginTop: 14 }}>
        {copied
          ? <>Code copied. When the app opens, tap <strong>Paste code</strong> and you&rsquo;ll be in the circle.</>
          : <>The store button copies your code too. <button type="button" className="linkish" onClick={copyOnly}>Copy it now</button> · <Link href="/quiz">Start on the web</Link></>}
      </p>
    </>
  );
}
