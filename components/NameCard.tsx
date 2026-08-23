import Link from "next/link";
import { Name, arNum } from "@/lib/names";
import { hourForName } from "@/lib/hour";
import { Rays } from "./Rays";

export default function NameCard({ name, rays = true, href = true, big = false }: { name: Name; rays?: boolean; href?: boolean; big?: boolean }) {
  const h = hourForName(name.n);
  const inner = (
    <div className={`ncard h-${h} ${big ? "big" : ""}`}>
      {rays && <Rays className="ncard-rays" r1={105} r2={200} w={0.8} />}
      <div className="ncard-top"><span>99names</span><span>No. {String(name.n).padStart(2, "0")}</span></div>
      <div className="ncard-mid">
        <div className="ar ncard-ar">{name.ar}</div>
        <div className="ncard-en">{name.en}</div>
        <div className="ncard-tr">{name.tr}</div>
      </div>
      <div className="ncard-top"><span>{h}</span><span>{arNum(name.n)}</span></div>
    </div>
  );
  return href ? <Link href={`/names/${name.slug}`} className="ncard-link">{inner}</Link> : inner;
}
