// Copies browser builds of GSAP + Lenis from node_modules into /vendor.
// /vendor is committed, so GitHub Pages serves a plain static site — no build step.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const files = [
  ["node_modules/gsap/dist/gsap.min.js", "vendor/gsap/gsap.min.js"],
  ["node_modules/gsap/dist/ScrollTrigger.min.js", "vendor/gsap/ScrollTrigger.min.js"],
  ["node_modules/lenis/dist/lenis.min.js", "vendor/lenis/lenis.min.js"],
  ["node_modules/lenis/dist/lenis.css", "vendor/lenis/lenis.css"],
];

for (const [from, to] of files) {
  const src = path.join(root, from);
  const dest = path.join(root, to);
  if (!fs.existsSync(src)) {
    console.error(`[vendor] missing ${from} — run "npm install" first`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`[vendor] ${from} → ${to}`);
}
