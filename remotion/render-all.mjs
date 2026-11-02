// Renders every composition to ../public/videos/<id>.mp4 plus a <id>.jpg poster.
// Usage: npm run render:all            (all)
//        npm run render:all -- hero-loop (one)
import { execSync } from "node:child_process";

const all = ["hero-loop", "hero-loop-vertical", "title-20", "milestones", "flow-scrub", "flow-scrub-vertical"];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const posterFrame = { "title-20": 200, milestones: 140 };
// Scroll-scrubbed videos: every frame is a keyframe so seeking is instant.
const scrub = new Set(["flow-scrub", "flow-scrub-vertical"]);

for (const id of ids) {
  const run = (cmd) => execSync(cmd, { stdio: "inherit" });
  if (scrub.has(id)) {
    run(`npx remotion render ${id} out/${id}.mp4 --codec=h264 --muted`);
    run(`npx remotion ffmpeg -y -i out/${id}.mp4 -c:v libx264 -g 1 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart -an ../public/videos/${id}.mp4`);
  } else {
    run(`npx remotion render ${id} ../public/videos/${id}.mp4 --codec=h264 --crf=26 --muted`);
  }
  run(`npx remotion still ${id} ../public/videos/${id}.jpg --frame=${posterFrame[id] ?? 0} --image-format=jpeg --jpeg-quality=80`);
}
