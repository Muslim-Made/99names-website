"use client";
import Link from "next/link";
import { useHour } from "./HourProvider";
import { HOUR_LABEL, hourForName } from "@/lib/hour";
import { NAMES, Name } from "@/lib/names";
import NameCard from "./NameCard";

/** Names that belong to the current hour's palette. */
export function hourNames(hour: string): Name[] {
  return NAMES.filter(n => hourForName(n.n) === hour);
}

/** One name for this hour, rotating daily so each visit in a season feels fresh. */
export function nameOfTheHour(hour: string): Name {
  const group = hourNames(hour);
  const day = Math.floor(Date.now() / 86400000);
  return group[day % group.length];
}

export function HourStrip() {
  const { hour } = useHour();
  const group = hourNames(hour);
  return (
    <>
      <div data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
        <div><div className="eyebrow">Names of this hour</div><h2>The {HOUR_LABEL[hour]} <em>names.</em></h2></div>
        <Link href="/names" className="pill o">All 99 names</Link>
      </div>
      <p className="lede" data-reveal style={{ marginBottom: 48 }}>
        The 99 run from Ar-Rahman at dawn to As-Sabur at night. These are the names wearing the {HOUR_LABEL[hour]} sky right now. Come back at another hour and different ones will be waiting.
      </p>
      <div className="strip" data-reveal data-stagger>
        {group.slice(0, 8).map(n => <NameCard key={n.n} name={n} rays={false} />)}
      </div>
    </>
  );
}
