// ============================================================
//  RSVP ХАДГАЛАХ ДАВХАРГА
//  - Production: Vercel KV / Upstash Redis (REST) — env тохируулсан бол
//  - Локал / fallback: .data/rsvp.json файл
// ============================================================

import { promises as fs } from "fs";
import path from "path";
import os from "os";

export type RsvpStatus = "yes" | "no";

export type Rsvp = {
  slug: string;
  name: string;
  status: RsvpStatus;
  /** Дагалдах хүний тоо (өөрийгөөс гадна) */
  companions: number;
  message?: string;
  updatedAt: string; // ISO
};

const HASH_KEY = "mtaa:rsvp";

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

export function storageMode(): "redis" | "file" {
  return useRedis ? "redis" : "file";
}

// ---------- Redis (Upstash REST) ----------
async function redisCmd(cmd: (string | number)[]): Promise<any> {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Redis error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.result;
}

// ---------- File fallback ----------
// Vercel-ийн serverless орчинд ажлын фолдер read-only тул /tmp руу бичнэ
// (түр зуурынх — байнга хадгалахад KV ашиглана уу). Локал дээр төслийн .data.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "mtaa-data")
  : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "rsvp.json");

async function readFileStore(): Promise<Record<string, Rsvp>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Record<string, Rsvp>;
  } catch {
    return {};
  }
}

async function writeFileStore(obj: Record<string, Rsvp>): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(obj, null, 2), "utf8");
}

// ---------- Public API ----------
export async function saveRsvp(r: Rsvp): Promise<void> {
  if (useRedis) {
    await redisCmd(["HSET", HASH_KEY, r.slug, JSON.stringify(r)]);
    return;
  }
  const store = await readFileStore();
  store[r.slug] = r;
  await writeFileStore(store);
}

export async function getRsvp(slug: string): Promise<Rsvp | null> {
  if (useRedis) {
    const val = await redisCmd(["HGET", HASH_KEY, slug]);
    if (!val) return null;
    try {
      return JSON.parse(val as string) as Rsvp;
    } catch {
      return null;
    }
  }
  const store = await readFileStore();
  return store[slug] ?? null;
}

export async function listRsvps(): Promise<Rsvp[]> {
  if (useRedis) {
    const flat = (await redisCmd(["HGETALL", HASH_KEY])) as string[] | null;
    const out: Rsvp[] = [];
    if (Array.isArray(flat)) {
      for (let i = 0; i < flat.length; i += 2) {
        try {
          out.push(JSON.parse(flat[i + 1]) as Rsvp);
        } catch {
          /* skip */
        }
      }
    }
    return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const store = await readFileStore();
  return Object.values(store).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}
