// Renders every composition to ../public/videos/<id>.mp4 plus a <id>.jpg poster.
// Usage: npm run render:all            (all)
//        npm run render:all -- hero-loop (one)
import { execSync } from "node:child_process";

const all = ["hero-loop", "hero-loop-vertical", "title-20", "milestones"];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const posterFrame = { "title-20": 200, milestones: 140 };

for (const id of ids) {
  const run = (cmd) => execSync(cmd, { stdio: "inherit" });
  run(`npx remotion render ${id} ../public/videos/${id}.mp4 --codec=h264 --crf=26 --muted`);
  run(`npx remotion still ${id} ../public/videos/${id}.jpg --frame=${posterFrame[id] ?? 0} --image-format=jpeg --jpeg-quality=80`);
}
