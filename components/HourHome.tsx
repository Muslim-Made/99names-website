"use client";
import Link from "next/link";
import { useHour } from "./HourProvider";
import { HOUR_LABEL, hourForName } from "@/lib/hour";
import { NAMES, Name } from "@/lib/names";
import NameCard from "./NameCard";
import Breath from "./Breath";
import Listen from "./Listen";

/** Names that belong to the current hour's palette. */
function hourNames(hour: string): Name[] {
  return NAMES.filter(n => hourForName(n.n) === hour);
}

/** One name for this hour, rotating daily so each visit in a season feels fresh. */
function nameOfTheHour(hour: string): Name {
  const group = hourNames(hour);
  const day = Math.floor(Date.now() / 86400000);
  return group[day % group.length];
}

function splitTitle(en: string) {
  const parts = en.replace(/^The /, "").split(" ");
  if (parts.length === 1) return <>The <em>{parts[0]}</em></>;
  const last = parts.pop();
  return <>The {parts.join(" ")} <em>{last}</em></>;
}

export function HourHero() {
  const { hour } = useHour();
  const name = nameOfTheHour(hour);
  return (
    <>
      <div style={{ position: "relative" }} data-reveal data-stagger>
        <div className="eyebrow">The hour of {HOUR_LABEL[hour]} · No. {name.n} of 99</div>
        <h1 style={{ marginTop: 16 }}>{splitTitle(name.en)}</h1>
        <div className="ar hero-ar">{name.ar}</div>
        <p className="lede">{name.tr}. {name.line}</p>
        <div className="actions">
          <Listen text={name.ar} />
          <Link href={`/names/${name.slug}`} className="pill o">Read this name</Link>
          <Breath />
        </div>
      </div>
      <div className="hero-card" data-reveal data-parallax="0.06"><NameCard name={name} big /></div>
    </>
  );
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
        The 99 run from Ar-Rahman at dawn to As-Sabur at night. These are the names wearing the {HOUR_LABEL[hour]} sky right now — come back at another hour and different ones will be waiting.
      </p>
      <div className="strip" data-reveal data-stagger>
        {group.slice(0, 12).map(n => <NameCard key={n.n} name={n} rays={false} />)}
      </div>
    </>
  );
}
