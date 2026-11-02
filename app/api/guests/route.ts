import { NextRequest, NextResponse } from "next/server";
import { cleanInput, createGuest, deleteGuest, getAllGuests, updateGuest } from "@/lib/guests";

export const dynamic = "force-dynamic";

// Same protection as /admin: when ADMIN_KEY is set it must be sent as x-admin-key (or ?key=).
function denied(req: NextRequest) {
  const key = process.env.ADMIN_KEY;
  if (!key) return null;
  const given = req.headers.get("x-admin-key") || req.nextUrl.searchParams.get("key") || "";
  return given === key ? null : NextResponse.json({ error: "Хандах эрхгүй." }, { status: 401 });
}

export async function GET(req: NextRequest) {
  return denied(req) ?? NextResponse.json({ guests: await getAllGuests() });
}

export async function POST(req: NextRequest) {
  const no = denied(req);
  if (no) return no;
  const input = cleanInput(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  return NextResponse.json({ guest: await createGuest(input) });
}

export async function PATCH(req: NextRequest) {
  const no = denied(req);
  if (no) return no;
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug ?? "");
  const input = cleanInput(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  return (await updateGuest(slug, input))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Зочин олдсонгүй." }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
  const no = denied(req);
  if (no) return no;
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  return (await deleteGuest(slug))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Зочин олдсонгүй." }, { status: 404 });
}
