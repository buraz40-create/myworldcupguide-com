// One-off: crop the FootyHeadlines watermark off the top of the Iran kit images.
// The watermark sits in the top ~13% of each image, above the shirt collar.
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"

const DIR = "public/images/kits"
const FILES = [
  "iran-home-front.jpg",
  "iran-home-back.jpg",
  "iran-away-front.jpg",
  "iran-away-back.jpg",
]
const CROP_FRACTION = 0.13 // 13% off the top

for (const name of FILES) {
  const p = path.join(DIR, name)
  if (!fs.existsSync(p)) { console.warn(`skip (missing): ${p}`); continue }
  const meta = await sharp(p).metadata()
  if (!meta.width || !meta.height) { console.warn(`skip (no meta): ${p}`); continue }
  const cropTop = Math.round(meta.height * CROP_FRACTION)
  const newHeight = meta.height - cropTop
  const tmp = p + ".tmp.jpg"
  await sharp(p)
    .extract({ left: 0, top: cropTop, width: meta.width, height: newHeight })
    .jpeg({ quality: 85 })
    .toFile(tmp)
  fs.renameSync(tmp, p)
  console.log(`cropped ${name}: ${meta.width}x${meta.height} -> ${meta.width}x${newHeight}`)
}
