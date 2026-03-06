#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { readdirSync, copyFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const PHOTOS_DIR = resolve(__dirname, "../../assets/photos");
const TEMP_DIR = resolve(__dirname, "../.temp-photos");
const COPIES = parseInt(process.argv[2] || "300", 10);
const SIMULATOR_UDID =
  process.argv[3] || "5F505C88-A204-4A5D-8438-34DBA88D9F1B";

async function main() {
  const originals = readdirSync(PHOTOS_DIR).filter((f) =>
    /\.(jpg|jpeg|png)$/i.test(f),
  );
  console.log(`Found ${originals.length} original images`);

  if (existsSync(TEMP_DIR)) {
    rmSync(TEMP_DIR, { recursive: true });
  }
  mkdirSync(TEMP_DIR, { recursive: true });

  const totalImages = originals.length * COPIES;
  console.log(`Creating ${totalImages} copies...`);

  const allPaths: string[] = [];
  for (let i = 0; i < COPIES; i++) {
    for (const original of originals) {
      const ext = original.split(".").pop();
      const idx = i * originals.length + originals.indexOf(original) + 1;
      const name = `photo_${String(idx).padStart(5, "0")}.${ext}`;
      const dest = join(TEMP_DIR, name);
      copyFileSync(join(PHOTOS_DIR, original), dest);
      allPaths.push(dest);
    }
    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${COPIES} batches done`);
    }
  }

  console.log(`Created ${allPaths.length} images`);

  // Push to simulator in batches of 20
  const BATCH_SIZE = 20;
  for (let i = 0; i < allPaths.length; i += BATCH_SIZE) {
    const batch = allPaths.slice(i, i + BATCH_SIZE);
    const cmd = `xcrun simctl addmedia ${SIMULATOR_UDID} ${batch.map((p) => `"${p}"`).join(" ")}`;
    execSync(cmd, { stdio: "pipe" });
    if ((i + BATCH_SIZE) % 200 === 0) {
      console.log(
        `  Pushed ${Math.min(i + BATCH_SIZE, allPaths.length)}/${allPaths.length} to simulator`,
      );
    }
  }

  console.log(
    `Done! ${allPaths.length} images added to simulator ${SIMULATOR_UDID}`,
  );

  rmSync(TEMP_DIR, { recursive: true });
  console.log("Temp files cleaned up");
}

main().catch(console.error);
