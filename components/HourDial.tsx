"use client";
import { useEffect, useRef, useState } from "react";
import { useHour } from "./HourProvider";
import { HOURS, HOUR_LABEL, Hour } from "@/lib/hour";

/* A small swatch of each hour's sky, used as the dial's face (and the quiz certificates). */
export const SWATCH: Record<Hour, string> = {
  fajr: "linear-gradient(160deg,#F6DCCF,#CFD9C4 60%,#C9DBE6)",
  morning: "linear-gradient(160deg,#F4EEE4,#F1D9A6)",
  dhuhr: "linear-gradient(160deg,#F4EEE4,#F2CFC0)",
  asr: "linear-gradient(160deg,#EFD9B8,#A9BFA6)",
  maghrib: "linear-gradient(170deg,#E8A64B,#D98C7C 50%,#2A2F44)",
  isha: "linear-gradient(160deg,#2A2F44,#171A26)",
};

/**
 * The hour dial: lives in the nav. Tap to open the six hours of the day;
 * pick one to tint the whole site, or let it follow the sky (Auto).
 */
export default function HourDial() {
  const { hour, override, setOverride } = useHour();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="hourdial" ref={ref}>
      <button className={`hd-btn ${open ? "open" : ""}`} onClick={() => setOpen(o => !o)}
        aria-haspopup="true" aria-expanded={open} title="The hour — tints the whole site">
        <span className="hd-swatch" style={{ background: SWATCH[hour] }} aria-hidden="true" />
        <span className="hd-label">{HOUR_LABEL[hour]}</span>
      </button>
      {open && (
        <div className="hd-pop" role="menu">
          <div className="hd-hours">
            {HOURS.map(h => (
              <button key={h} role="menuitemradio" aria-checked={h === hour}
                className={`hd-opt ${h === hour ? "on" : ""}`}
                onClick={() => { setOverride(h); setOpen(false); }}>
                <span className="hd-swatch" style={{ background: SWATCH[h] }} aria-hidden="true" />
                <span>{HOUR_LABEL[h]}</span>
              </button>
            ))}
          </div>
          <button className={`hd-auto ${override ? "" : "on"}`} onClick={() => { setOverride(null); setOpen(false); }}>
            {override ? "Follow the sky" : "Following the sky"}
          </button>
        </div>
      )}
    </div>
  );
}
