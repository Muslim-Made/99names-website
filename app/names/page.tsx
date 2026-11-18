import type { Metadata } from "next";
import { NamesBrowse } from "@/components/NameExplorer";

export const metadata: Metadata = {
  title: "All 99 names",
  description: "The 99 Names of Allah in the traditional order, from Ar-Rahman to As-Sabur. Turn the wheel, search by meaning, and open any name to read it.",
};

export default function Names() { return <NamesBrowse />; }
