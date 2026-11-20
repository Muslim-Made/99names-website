import { NextResponse } from "next/server";
import { type Circle, MAX_MEMBERS, cleanCount, cleanLast, cleanName, load, newCode, newId, normCode, persistent, publicView, save, validCode } from "@/lib/circle";

export const dynamic = "force-dynamic";
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** GET /api/circle?code=XXXX-XXXX : who is in a circle. Anyone holding the code may look. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  // ?health=1 says whether circles are being kept in a real store (they must be, in production)
  if (q.get("health")) return NextResponse.json({ ok: true, persistent: persistent() });
  const code = normCode(q.get("code"));
  if (!validCode(code)) return bad("That code doesn't look right.");
  const c = await load(code);
  return c ? NextResponse.json(publicView(c)) : bad("No circle has that code.", 404);
}

/**
 * POST /api/circle  { action, ... }
 *   create { name, count, last? }               -> { code, memberId, members }
 *   join   { code, name, count, last? }         -> { code, memberId, members }
 *   sync   { code, memberId, count, last?, name? } -> { code, members }
 *   leave  { code, memberId }                   -> { ok }
 */
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return bad("Send JSON."); }
  const now = new Date().toISOString();
  const name = cleanName(b.name), count = cleanCount(b.count), last = cleanLast(b.last);

  if (b.action === "create") {
    if (!name) return bad("A name to show the others is needed.");
    let code = newCode();
    for (let i = 0; i < 4 && (await load(code)); i++) code = newCode();
    const id = newId();
    const c: Circle = { code, created: now, members: [{ id, name, count, last, at: now, joined: now }] };
    await save(c);
    return NextResponse.json({ ...publicView(c, id), memberId: id });
  }

  const code = normCode(b.code);
  if (!validCode(code)) return bad("That code doesn't look right.");
  const c = await load(code);
  if (!c) return bad("No circle has that code.", 404);

  if (b.action === "join") {
    if (!name) return bad("A name to show the others is needed.");
    if (c.members.length >= MAX_MEMBERS) return bad("This circle is full. A circle holds five people.", 409);
    const id = newId();
    c.members.push({ id, name, count, last, at: now, joined: now });
    await save(c);
    return NextResponse.json({ ...publicView(c, id), memberId: id });
  }

  const me = c.members.find(m => m.id === b.memberId);
  if (!me) return bad("You are not in this circle.", 403);

  if (b.action === "sync") {
    me.count = count;
    if (last) me.last = last;
    if (name) me.name = name;
    me.at = now;
    await save(c);
    return NextResponse.json(publicView(c, me.id));
  }
  if (b.action === "leave") {
    c.members = c.members.filter(m => m.id !== me.id);
    await save(c);
    return NextResponse.json({ ok: true });
  }
  return bad("Unknown action.");
}
