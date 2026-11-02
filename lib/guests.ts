// ============================================================
//  Зочдын нэгдсэн жагсаалт (сервер талд):
//  data/guests.json  +  админаас нэмсэн/засварласан зочид (lib/store)
// ============================================================

import { guests as fileGuests, type Guest } from "@/data/guests";
import { listStoredGuests, putStoredGuest, removeStoredGuest } from "@/lib/store";

export type AdminGuest = Guest & { source: "file" | "admin" };

export async function getAllGuests(): Promise<AdminGuest[]> {
  const stored = await listStoredGuests();
  const bySlug = new Map(stored.map((g) => [g.slug, g]));
  const out: AdminGuest[] = [];
  for (const g of fileGuests) {
    const o = bySlug.get(g.slug);
    if (o?.deleted) continue;
    out.push(o ? { ...strip(o), source: "file" } : { ...g, source: "file" });
  }
  const fileSlugs = new Set(fileGuests.map((g) => g.slug));
  stored
    .filter((g) => !g.deleted && !fileSlugs.has(g.slug))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((g) => out.push({ ...strip(g), source: "admin" }));
  return out;
}

export async function getGuest(slug: string): Promise<Guest | undefined> {
  const key = slug.trim().toLowerCase();
  return (await getAllGuests()).find((g) => g.slug.toLowerCase() === key);
}

function strip(g: { slug: string; name: string; title?: string; note?: string; vip?: boolean }): Guest {
  return { slug: g.slug, name: g.name, title: g.title || undefined, note: g.note || undefined, vip: !!g.vip };
}

// Монгол кирилл → латин (data/guests.json-ын slug-уудтай ижил: Ц→ts, Х→h, Ө→o, Ү→u)
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "i", э: "e",
  ю: "yu", я: "ya",
};

export function slugify(name: string): string {
  const latin = Array.from(name.toLowerCase())
    .map((ch) => MAP[ch] ?? ch)
    .join("");
  return (
    latin
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "zochin"
  );
}

export async function uniqueSlug(name: string, taken: Set<string>): Promise<string> {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export type GuestInput = { name: string; title?: string; note?: string; vip?: boolean };

/** Server-side validation of admin input. */
export function cleanInput(body: unknown): GuestInput | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = String(b.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2) return "Нэр оруулна уу.";
  if (name.length > 80) return "Нэр хэт урт байна.";
  const title = String(b.title ?? "").trim().slice(0, 120);
  const note = String(b.note ?? "").trim().slice(0, 600);
  return { name, title: title || undefined, note: note || undefined, vip: Boolean(b.vip) };
}

export async function createGuest(input: GuestInput): Promise<AdminGuest> {
  const all = await getAllGuests();
  const stored = await listStoredGuests();
  const taken = new Set([...all.map((g) => g.slug), ...stored.map((g) => g.slug)]);
  const slug = await uniqueSlug(input.name, taken);
  await putStoredGuest({ ...input, slug, createdAt: new Date().toISOString() });
  return { ...strip({ ...input, slug }), source: "admin" };
}

export async function updateGuest(slug: string, input: GuestInput): Promise<boolean> {
  const g = (await getAllGuests()).find((x) => x.slug === slug);
  if (!g) return false;
  await putStoredGuest({ ...input, slug, createdAt: new Date().toISOString() });
  return true;
}

export async function deleteGuest(slug: string): Promise<boolean> {
  const g = (await getAllGuests()).find((x) => x.slug === slug);
  if (!g) return false;
  // a guest from data/guests.json can't be removed from the read-only file, so hide it
  if (g.source === "file") await putStoredGuest({ slug, name: g.name, deleted: true, createdAt: new Date().toISOString() });
  else await removeStoredGuest(slug);
  return true;
}
