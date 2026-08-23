import type { Metadata } from "next";
import Quiz from "./Quiz";
export const metadata: Metadata = { title: "Remember" };
export default function Remember() { return <Quiz />; }
