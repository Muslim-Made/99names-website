"use client";
import { useState } from "react";

/** Placeholder recitation via the browser's Arabic voice until studio audio exists. */
export default function Listen({ text, label = "Listen" }: { text: string; label?: string }) {
  const [on, setOn] = useState(false);
  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-SA"; u.rate = 0.75;
    const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("ar"));
    if (v) u.voice = v;
    u.onend = () => setOn(false);
    setOn(true);
    window.speechSynthesis.speak(u);
  };
  return <button className="pill" onClick={speak} aria-pressed={on}>{on ? "◼ Playing" : `▶ ${label}`}</button>;
}
