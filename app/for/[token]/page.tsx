import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSent } from "@/lib/send";
import Reveal from "./Reveal";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const s = decodeSent((await params).token);
  if (!s) return {};
  return { title: `For ${s.t} — ${s.name.tr}`, description: `${s.name.en}. ${s.name.line}`, openGraph: { title: `A name for ${s.t}`, description: `${s.name.tr} — ${s.name.en}. Someone thought you needed this one.` } };
}

export default async function ForPage({ params }: { params: Promise<{ token: string }> }) {
  const s = decodeSent((await params).token);
  if (!s) notFound();
  const { name, ...sent } = s;
  return <Reveal sent={sent} name={name} />;
}
