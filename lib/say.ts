"use client";
import { VOICED } from "./voices";

// One name heard at a time, from the owner's recordings in /public/audio.
// A name without a recording yet falls back to the browser's Arabic voice.
let current: HTMLAudioElement | null = null;

export function stopSaying() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Plays a name; `onEnd` runs when it finishes or is cut off by another. */
export function sayName(slug: string, ar: string, onEnd?: () => void) {
  if (typeof window === "undefined") return;
  stopSaying();
  if (VOICED.has(slug)) {
    const a = new Audio(`/audio/${slug}.mp3`);
    current = a;
    const done = () => { if (current === a) current = null; onEnd?.(); };
    a.onended = done; a.onerror = done; a.onpause = done;
    a.play().catch(done);
    return;
  }
  if (!("speechSynthesis" in window)) { onEnd?.(); return; }
  const u = new SpeechSynthesisUtterance(ar);
  u.lang = "ar-SA"; u.rate = 0.75;
  const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("ar"));
  if (v) u.voice = v;
  u.onend = () => onEnd?.(); u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}
