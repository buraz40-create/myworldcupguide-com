// One-shot optimizer for public/images/kits/.
// Goal: kit images render at ~150x220 px in cards, so 600 px max width is plenty
// even on retina. JPEG quality 80 is visually indistinguishable from quality 95.
//
// Operates in place. Re-running is safe (idempotent within a few bytes . sharp's
// output is deterministic for the same input).
//
// Run: node scripts/optimize-kit-images.mjs

import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIR = path.resolve(__dirname, "..", "public", "images", "kits")

const MAX_WIDTH = 600
const JPEG_QUALITY = 80

function fmt(bytes) {
  if (bytes < 1024) return `${bytes}b`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

async function main() {
  const files = (await fsp.readdir(DIR)).filter((f) => f.endsWith(".jpg"))
  console.log(`${files.length} files to process. Target: max ${MAX_WIDTH}px wide, JPEG q${JPEG_QUALITY}.\n`)

  let totalBefore = 0
  let totalAfter = 0
  let skipped = 0
  let processed = 0
  let failed = 0

  for (const file of files) {
    const src = path.join(DIR, file)
    const before = fs.statSync(src).size
    totalBefore += before

    try {
      // Read into buffer first so we can overwrite the same path.
      const inputBuf = await fsp.readFile(src)
      const meta = await sharp(inputBuf).metadata()

      // If already small AND below our width threshold AND already JPEG, skip.
      if (meta.format === "jpeg" && (meta.width ?? 0) <= MAX_WIDTH && before < 150 * 1024) {
        skipped++
        totalAfter += before
        continue
      }

      const outputBuf = await sharp(inputBuf)
        .resize({ width: MAX_WIDTH, height: MAX_WIDTH, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer()

      await fsp.writeFile(src, outputBuf)
      const after = outputBuf.length
      totalAfter += after
      processed++
      const pct = ((1 - after / before) * 100).toFixed(0)
      console.log(`  ${file.padEnd(48)} ${fmt(before).padStart(8)} -> ${fmt(after).padStart(8)} (${pct}% smaller)`)
    } catch (e) {
      failed++
      totalAfter += before
      console.log(`  FAIL ${file}: ${e.message}`)
    }
  }

  const totalPct = ((1 - totalAfter / totalBefore) * 100).toFixed(0)
  console.log(`\n${processed} processed, ${skipped} skipped, ${failed} failed`)
  console.log(`Total: ${fmt(totalBefore)} -> ${fmt(totalAfter)} (${totalPct}% reduction)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
