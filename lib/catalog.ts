/**
 * Everything we sell. Prices are in USD and NGN (the NGN figure is what a
 * Squad/Paystack checkout actually charges — set it deliberately, don't derive it).
 */
export type Product = {
  sku: string; name: string; tagline: string; desc: string; usd: number; ngn: number;
  status: "order" | "preorder" | "notify"; ships: string; needsAddress: boolean; hour: "fajr" | "morning" | "dhuhr" | "asr" | "maghrib" | "isha";
  details: string[]; picksName?: boolean; digital?: boolean;
};

export const PRODUCTS: Product[] = [
  { sku: "send", name: "Send-a-Name", tagline: "One card, one envelope, posted anywhere.", desc: "Choose a name, write a line, and we hand-address it and post it. The envelope carries their name; the card carries His.", usd: 6, ngn: 9500, status: "preorder", ships: "Posted within 3 days · worldwide", needsAddress: true, hour: "fajr", picksName: true,
    details: ["70 × 110mm soft-touch card, one of the 99", "Hand-addressed envelope with a 99-ray stamp", "Your note printed inside, in your words", "A short link on the back so they can revisit the name"] },
  { sku: "deck", name: "The Deck", tagline: "Ninety-nine, in your hand.", desc: "99 soft-touch cards, dawn to night, in a navy box with the rays blind-embossed. Keep one on the nightstand. Give one away.", usd: 34, ngn: 55000, status: "preorder", ships: "Ships worldwide · pre-orders post first", needsAddress: true, hour: "isha",
    details: ["99 cards, 70 × 110mm, 350gsm soft-touch", "Ordered by hour: Fajr through Isha", "Navy box, blind-embossed 99-ray mark", "A folded guide: how to use one a week"] },
  { sku: "bundle", name: "Deck + Nightstand", tagline: "The deck and a place to stand today's name.", desc: "The full deck with a small ash-wood stand so one name can sit where you'll see it first thing.", usd: 42, ngn: 68000, status: "preorder", ships: "Ships worldwide", needsAddress: true, hour: "asr",
    details: ["Everything in The Deck", "Ash-wood stand, 80 × 30mm, oiled", "Saves $4 on buying both"] },
  { sku: "stand", name: "The Nightstand", tagline: "A small stand for one card.", desc: "Solid ash, oiled, sized for one 99names card. Change the name each week.", usd: 12, ngn: 19000, status: "preorder", ships: "Ships worldwide", needsAddress: true, hour: "morning",
    details: ["Ash wood, 80 × 30 × 18mm", "Fits one card at a gentle lean", "Also holds a phone, sideways"] },
  { sku: "print", name: "The Name Print", tagline: "One name, A3, for a wall.", desc: "Choose any of the 99. Printed on heavy cotton paper in its hour's colours, with the 99 rays around it.", usd: 24, ngn: 38000, status: "preorder", ships: "Ships rolled, worldwide", needsAddress: true, hour: "dhuhr", picksName: true,
    details: ["A3 (297 × 420mm), 300gsm cotton", "Giclée print, archival inks", "Unframed, posted in a tube"] },
  { sku: "journal", name: "The 99-Week Journal", tagline: "One page a week, for two years.", desc: "A page per name: the name, its root, one line, and space for yours. Finish it and you'll have met all 99.", usd: 22, ngn: 36000, status: "preorder", ships: "Ships worldwide", needsAddress: true, hour: "asr",
    details: ["99 spreads + a few blank ones", "Lay-flat binding, sand cloth cover", "Ribbon marker in the hour's colour"] },
  { sku: "ramadan", name: "Ramadan Edition", tagline: "Thirty nights, thirty names.", desc: "Thirty verse cards, one per night, in Maghrib gradients. A limited run for the month.", usd: 29, ngn: 47000, status: "notify", ships: "Ships before Ramadan", needsAddress: true, hour: "maghrib",
    details: ["30 cards, a name and its verse each", "Maghrib-to-Isha gradients", "Numbered, limited to 999 boxes"] },
  { sku: "wallpapers", name: "The Hour Wallpapers", tagline: "Six skies for your phone.", desc: "The six hour gradients as lock-screen wallpapers with the day's name. Pay what feels right.", usd: 4, ngn: 6000, status: "order", ships: "Emailed instantly", needsAddress: false, hour: "fajr", digital: true,
    details: ["6 wallpapers, iPhone and Android sizes", "Plus a widget-ready pack of all 99 names", "Delivered by email"] },
  { sku: "classroom", name: "Classroom Set", tagline: "Ten decks for a class or a masjid.", desc: "Ten decks at a teacher's price, with a poster of all 99 for the wall.", usd: 290, ngn: 470000, status: "preorder", ships: "Ships worldwide", needsAddress: true, hour: "isha",
    details: ["10 × The Deck", "A2 poster of all 99 names", "A one-page guide for teaching one a week"] },
];

export const bySku = (sku: string) => PRODUCTS.find(p => p.sku === sku);
export const usd = (n: number) => `$${n}`;
export const ngn = (n: number) => `₦${n.toLocaleString("en-NG")}`;
