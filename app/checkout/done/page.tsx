import type { Metadata } from "next";
import { Suspense } from "react";
import Done from "./Done";
export const metadata: Metadata = { title: "Thank you" };
export default function Page() { return <Suspense fallback={null}><Done /></Suspense>; }
