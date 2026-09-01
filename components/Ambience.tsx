"use client";
import { useEffect, useRef, useState } from "react";
import { useHour } from "./HourProvider";
import type { Hour } from "@/lib/hour";

/* Root chords per hour (Hz). Soft open voicings — dawn sits higher, night sinks low. */
const CHORDS: Record<Hour, number[]> = {
  fajr:    [220.0, 277.18, 329.63, 440.0],   // A add9-ish, airy
  morning: [196.0, 246.94, 293.66, 392.0],   // G, warm
  dhuhr:   [174.61, 220.0, 261.63, 349.23],  // F, full daylight
  asr:     [164.81, 207.65, 246.94, 329.63], // E, golden
  maghrib: [146.83, 174.61, 220.0, 293.66],  // D minor-lean, amber
  isha:    [110.0, 130.81, 164.81, 220.0],   // A low, night
};

/**
 * Generative ambience: four detuned sine pads on the hour's chord,
 * slow breathing swell, and a whisper of filtered wind. No files,
 * nothing recorded, nothing looping — it just is.
 */
export default function Ambience() {
  const [on, setOn] = useState(false);
  const { hour } = useHour();
  const engine = useRef<{
    ctx: AudioContext; master: GainNode; oscs: OscillatorNode[]; oscGains: GainNode[];
    lfo: OscillatorNode; wind: AudioBufferSourceNode; stop: () => void;
  } | null>(null);

  const start = () => {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 6);

    // breathing swell — 8s cycle, the site's tempo
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 1 / 8;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();

    // pad: per chord note, two slightly detuned sines through a lowpass
    const oscs: OscillatorNode[] = [];
    const oscGains: GainNode[] = [];
    CHORDS[hour].forEach((f, i) => {
      const g = ctx.createGain();
      g.gain.value = 0.12 / (i + 1) + 0.04;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.3;
      g.connect(lp).connect(master);
      [1, 1.003].forEach(det => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f * det;
        o.connect(g);
        o.start();
        oscs.push(o);
      });
      oscGains.push(g);
    });

    // wind: looped pink-ish noise through a slowly wandering bandpass
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + 0.03 * w; b1 = 0.985 * b1 + 0.032 * w; b2 = 0.95 * b2 + 0.05 * w;
      data[i] = (b0 + b1 + b2) * 0.6;
    }
    const wind = ctx.createBufferSource();
    wind.buffer = buf; wind.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 420; bp.Q.value = 0.4;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.06;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 1 / 13;
    const windLfoG = ctx.createGain();
    windLfoG.gain.value = 160;
    windLfo.connect(windLfoG).connect(bp.frequency);
    windLfo.start();
    wind.connect(bp).connect(windGain).connect(master);
    wind.start();

    const stop = () => {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 1.5);
      setTimeout(() => ctx.close(), 1800);
    };
    engine.current = { ctx, master, oscs, oscGains, lfo, wind, stop };
  };

  // retune (not restart) when the hour changes while playing
  useEffect(() => {
    const e = engine.current;
    if (!e || !on) return;
    const chord = CHORDS[hour];
    e.oscs.forEach((o, i) => {
      const f = chord[Math.floor(i / 2)] * (i % 2 ? 1.003 : 1);
      o.frequency.exponentialRampToValueAtTime(f, e.ctx.currentTime + 5);
    });
  }, [hour, on]);

  useEffect(() => () => engine.current?.stop(), []);

  const toggle = () => {
    if (on) { engine.current?.stop(); engine.current = null; setOn(false); }
    else { start(); setOn(true); }
  };

  return (
    <button className={`amb ${on ? "on" : ""}`} onClick={toggle} aria-pressed={on}
      title={on ? "Sound off" : "A quiet sound for this hour"}>
      <span className="amb-bars" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="amb-label">{on ? "Sound on" : "Sound"}</span>
    </button>
  );
}
