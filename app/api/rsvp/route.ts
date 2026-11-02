import { NextRequest, NextResponse } from "next/server";
import { getGuest } from "@/lib/guests";
import { saveRsvp, listRsvps } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = String(body.slug || "").trim();
    const status = body.status === "no" ? "no" : "yes";
    let companions = Number(body.companions) || 0;
    companions = Math.max(0, Math.min(9, Math.floor(companions)));
    const message = String(body.message || "").slice(0, 400);

    const guest = await getGuest(slug);
    if (!guest) {
      return NextResponse.json(
        { error: "Урилга олдсонгүй." },
        { status: 404 }
      );
    }

    await saveRsvp({
      slug: guest.slug,
      name: guest.name,
      status,
      companions: status === "yes" ? companions : 0,
      message,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Хадгалах үед алдаа гарлаа." },
      { status: 500 }
    );
  }
}

// Админд зориулсан жагсаалт (ADMIN_KEY тохируулсан бол шаардана)
export async function GET(req: NextRequest) {
  const key = process.env.ADMIN_KEY;
  if (key) {
    const given =
      req.nextUrl.searchParams.get("key") ||
      req.headers.get("x-admin-key") ||
      "";
    if (given !== key) {
      return NextResponse.json({ error: "Хандах эрхгүй." }, { status: 401 });
    }
  }
  const rows = await listRsvps();
  return NextResponse.json({ rows });
}
