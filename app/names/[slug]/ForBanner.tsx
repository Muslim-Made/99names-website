"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
function Inner() {
  const sp = useSearchParams(); const to = sp.get("to"); const from = sp.get("from");
  if (!to) return null;
  return <div className="for">For {to}{from ? `, from ${from}` : ""}. <span className="note" style={{ fontStyle: "normal", fontSize: 12 }}>Someone thought you needed this name this week.</span></div>;
}
export default function ForBanner() { return <Suspense fallback={null}><Inner /></Suspense>; }
