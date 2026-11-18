import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NAMES, bySlug } from "@/lib/names";
import NameExplorer from "@/components/NameExplorer";
import ForBanner from "./ForBanner";

export function generateStaticParams() { return NAMES.map(n => ({ slug: n.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const n = bySlug((await params).slug); if (!n) return {};
  return { title: `${n.tr} — ${n.en}`, description: `${n.ar} · ${n.tr}, ${n.en}. ${n.meaning}` };
}

export default async function NamePage({ params }: { params: Promise<{ slug: string }> }) {
  const n = bySlug((await params).slug); if (!n) notFound();
  // the wheel opens on this name; turning it moves the page (and the address) to its neighbours
  return <NameExplorer key={n.slug} start={n.n - 1} banner={<ForBanner />} />;
}
