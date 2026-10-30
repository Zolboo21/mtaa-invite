import GuestInviteClient from "@/components/GuestInviteClient";
import { guests } from "@/data/guests";
import { getRsvp } from "@/lib/store";

export const dynamic = "force-dynamic";

// Нүүр хуудас — ерөнхий (хувийн бус) урилга.
export default async function HomePage() {
  const guest = guests[0];
  const existing = await getRsvp(guest.slug);
  const initial = existing
    ? { status: existing.status, message: existing.message }
    : null;
  return <GuestInviteClient guest={guest} initial={initial} />;
}
