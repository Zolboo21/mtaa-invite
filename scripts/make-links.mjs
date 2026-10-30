// Бүх зочдын хувийн урилгын линкийг CSV болон консол дээр гаргана.
//   npm run links                 -> localhost суурьтай
//   npm run links -- https://таны-домэйн
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const guestsPath = join(__dirname, "..", "data", "guests.json");
const outPath = join(__dirname, "..", "invite-links.csv");

const base = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");
const guests = JSON.parse(readFileSync(guestsPath, "utf8"));

const lines = ["name,slug,link"];
console.log(`\n  ${guests.length} зочны урилгын линк (${base}):\n`);
for (const g of guests) {
  const link = `${base}/${g.slug}`;
  const safe = `"${String(g.name).replace(/"/g, '""')}"`;
  lines.push(`${safe},${g.slug},${link}`);
  console.log(`  • ${g.name.padEnd(24)} ${link}`);
}
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`\n  ✓ CSV хадгаллаа: ${outPath}\n`);
