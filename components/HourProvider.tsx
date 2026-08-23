"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Hour, hourFromClock, hourFromLocation } from "@/lib/hour";

type Ctx = { hour: Hour; override: Hour | null; setOverride: (h: Hour | null) => void; source: string };
const HourCtx = createContext<Ctx>({ hour: "fajr", override: null, setOverride: () => {}, source: "clock" });
export const useHour = () => useContext(HourCtx);

export default function HourProvider({ children }: { children: React.ReactNode }) {
  const [live, setLive] = useState<Hour>("fajr");
  const [override, setOverrideState] = useState<Hour | null>(null);
  const [source, setSource] = useState("clock");

  useEffect(() => {
    const saved = localStorage.getItem("99names:hour") as Hour | null;
    if (saved) setOverrideState(saved);
    setLive(hourFromClock());
    const tick = async () => {
      const loc = localStorage.getItem("99names:loc");
      if (loc) {
        const [lat, lng] = loc.split(",").map(Number);
        try { setLive(await hourFromLocation(lat, lng)); setSource("prayer times"); return; } catch {}
      }
      setLive(hourFromClock());
    };
    tick();
    if ("geolocation" in navigator && !localStorage.getItem("99names:loc")) {
      navigator.geolocation.getCurrentPosition(p => {
        localStorage.setItem("99names:loc", `${p.coords.latitude},${p.coords.longitude}`);
        tick();
      }, () => {}, { maximumAge: 86400000, timeout: 8000 });
    }
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const hour = override ?? live;
  useEffect(() => { document.documentElement.dataset.hour = hour; }, [hour]);

  const setOverride = (h: Hour | null) => {
    setOverrideState(h);
    if (h) localStorage.setItem("99names:hour", h); else localStorage.removeItem("99names:hour");
  };
  return <HourCtx.Provider value={{ hour, override, setOverride, source }}>{children}</HourCtx.Provider>;
}
