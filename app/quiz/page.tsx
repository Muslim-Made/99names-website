import type { Metadata } from "next";
import Quiz from "./Quiz";

export const metadata: Metadata = {
  title: "The quiz: learn the 99 Names of Allah",
  description: "Learn the 99 Names of Allah by heart. Four names at a time, six kinds of question, a daily five to keep them, and a certificate for every level. Free, no account.",
};

export default function QuizPage() { return <Quiz />; }
