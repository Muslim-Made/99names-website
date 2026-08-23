import type { Metadata } from "next";
import { Suspense } from "react";
import Send from "./Send";
export const metadata: Metadata = { title: "Send a name" };
export default function Page() { return <Suspense fallback={null}><Send /></Suspense>; }
