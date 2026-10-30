// ============================================================
//  УРИХ ЗОЧДЫН ЖАГСААЛТ
//  Хүн бүр өөрийн давтагдашгүй "slug" (замтай) урилгатай.
//  Жишээ: https://mtaa-invite.vercel.app/b-odsuren
//
//  ➜ Зочдыг ЭНД биш, data/guests.json файлд засна/нэмнэ.
//    (ингэснээр "npm run links" скрипт мөн уншиж чадна.)
//  slug нь латин үсэг, тоо, зураасаар бичигдсэн давхцахгүй утга байх ёстой.
// ============================================================

import raw from "./guests.json";

export type Guest = {
  /** Давтагдашгүй зам (URL-ийн төгсгөл). Жишээ: "b-odsuren" */
  slug: string;
  /** Хүндэтгэлтэйгээр дуудах нэр. Жишээ: "Б.Одсүрэн" */
  name: string;
  /** Албан тушаал / хэн болох (сонголт) */
  title?: string;
  /** Урилганд гарах хувийн нэмэлт мессеж (сонголт) */
  note?: string;
  /** Онцгой зочин бол true (алтан хүрээтэй харагдана) */
  vip?: boolean;
};

export const guests: Guest[] = raw as Guest[];

export function findGuest(slug: string): Guest | undefined {
  const key = slug.trim().toLowerCase();
  return guests.find((g) => g.slug.toLowerCase() === key);
}
