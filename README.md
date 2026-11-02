# МТАА — 20 жилийн ойн урилга

Ус Сувгийн Удирдах Газрын **Мэдээллийн технологи, автоматжуулалтын албаны** 20 жилийн
ойн хүндэтгэлийн арга хэмжээний **хувь хүнд зориулсан** цахим урилга.

- **Three.js** cinematic motion intro (ус + дата урсгал, bloom)
- Хүн бүрт **өөрийн линк** (`/<slug>`) — нэр нь урилганд гарна
- **Ирэх эсэхийг бүртгэх** (RSVP) — хариултыг серверт хадгална
- **Админ хуудас** (`/admin`) — хэн ирэх, ирэхгүйг хянана
- **Түүхэн замнал** (1987→) ба **хамт олны зургийн галерей**

Технологи: Next.js 15 (App Router) · React 19 · TypeScript · Three.js · Framer Motion.

---

## 1. Локал дээр ажиллуулах

```bash
npm install
npm run dev
```

Нээх: http://localhost:3000 (ерөнхий урилга) эсвэл http://localhost:3000/b-odsuren (хувийн).

## 2. Зочид нэмэх

`data/guests.json` файлыг засна:

```json
{
  "slug": "ganbat-d",            // линкийн төгсгөл: /ganbat-d  (латин, давхцахгүй)
  "name": "Д.Ганбат",            // урилганд гарах нэр
  "title": "Хэлтсийн дарга",     // сонголт
  "vip": true,                    // сонголт — алтан "хүндэт зочин" тэмдэг
  "note": "Хувийн мессеж..."      // сонголт — hero дээр гарах текст
}
```

## 3. Бүх линкийг гаргаж авах

```bash
npm run links -- https://таны-домэйн.vercel.app
```

→ консол дээр хэвлэнэ, мөн `invite-links.csv` үүснэ (нэр, slug, линк).

## 4. Арга хэмжээний мэдээлэл засах

`data/event.ts` — огноо, цаг, байршил, хөтөлбөр, холбоо барих, RSVP хугацаа.

## 5. RSVP хадгалалт (чухал)

- **Локал дээр**: `.data/rsvp.json` файлд хадгална (автоматаар).
- **Vercel дээр байнга хадгалах**: Vercel дээр **KV (Upstash Redis)** store үүсгээд
  prod-д холбоно. Vercel дараах env-үүдийг өөрөө нэмнэ:
  - `KV_REST_API_URL`, `KV_REST_API_TOKEN`
  (эсвэл Upstash-ийн `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).

  > Эдгээрийг тохируулаагүй бол Vercel-ийн serverless орчинд хариулт **түр зуур** хадгалагдаж,
  > дараа нь арилж болзошгүй. Тиймээс production-д KV холбохыг **зөвлөнө**.

## 6. Админ хамгаалалт

`.env`-д `ADMIN_KEY=нууц_утга` тохируулбал `/admin?key=нууц_утга` гэж нэвтэрнэ.
Тохируулаагүй бол `/admin` нээлттэй.

## 7. Vercel-д deploy

1. GitHub repo үүсгэж push хийнэ.
2. vercel.com → **New Project** → repo-г импортлоно (тохиргоо шаардахгүй, автоматаар Next.js-ийг таних).
3. (Сонголт) Storage → **KV** үүсгэж төсөлд холбоно → env автоматаар орно.
4. (Сонголт) Settings → Environment Variables → `ADMIN_KEY` нэмнэ.

Эсвэл CLI-р:

```bash
npm i -g vercel
vercel
```

---

### Хавтасны бүтэц

```
app/
  [slug]/page.tsx     хувийн урилга
  page.tsx            ерөнхий урилга
  admin/page.tsx      RSVP хяналт
  api/rsvp/route.ts   хариулт хадгалах API
components/           IntroScene (Three.js), Invitation, RsvpForm, Timeline, TeamGallery
data/                 guests.json, event.ts, timeline.ts, team.ts
lib/store.ts          RSVP хадгалах давхарга (KV / файл)
public/images/team/   хамт олны зургууд
scripts/make-links.mjs линк үүсгэгч
```

---

## Remotion видеонууд (`remotion/`)

Сайтын арын видеонуудыг Remotion-оор кодоор үүсгэдэг (тусдаа `package.json`, Next build-д нөлөөлөхгүй).

```bash
cd remotion
npm install
npm run studio        # засварлах самбар: http://localhost:3001
npm run render:all    # → public/videos/*.mp4 + *.jpg (poster)
```

| Composition | Хэрэглэгдэх газар |
|---|---|
| `hero-loop` / `hero-loop-vertical` | Hero арын видео (утсан дээр босоо хувилбар) |
| `title-20` | "20 жил" кино хэсэг |
| `milestones` | Түүхэн замнал хэсгийн видео (`data/timeline.ts`-ээс уншина) |
