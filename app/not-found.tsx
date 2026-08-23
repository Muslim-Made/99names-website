import Link from "next/link";
export default function NotFound() { return <section className="wrap quiz"><div className="eyebrow">Not found</div><h2>That name isn't <em>one of the 99.</em></h2><Link href="/names" className="pill" style={{ margin: "0 auto" }}>See all 99</Link></section>; }
