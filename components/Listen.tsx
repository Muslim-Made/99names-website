"use client";
import { useState } from "react";
import { sayName, stopSaying } from "@/lib/say";

/** Hear a name, recited once from the studio recordings. Tapping again stops it. */
export default function Listen({ slug, text, label = "Listen" }: { slug: string; text: string; label?: string }) {
  const [on, setOn] = useState(false);
  const toggle = () => {
    if (on) { stopSaying(); setOn(false); return; }
    setOn(true);
    sayName(slug, text, () => setOn(false));
  };
  return <button className="pill" onClick={toggle} aria-pressed={on}>{on ? "◼ Playing" : `▶ ${label}`}</button>;
}
