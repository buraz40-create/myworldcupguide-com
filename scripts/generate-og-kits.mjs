// Generates public/kits-og.jpg, the 1200x630 Open Graph image for /kits/.
// Pure SVG rasterised by sharp . no external assets, works offline.
import sharp from "sharp"

const W = 1200, H = 630

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#231645"/>
      <stop offset="100%" stop-color="#5b22b8"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#7E43FF" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#7E43FF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Top branding -->
  <text x="${W / 2}" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900"
        font-size="22" letter-spacing="8" fill="#c4a8ff">MYWORLDCUPGUIDE.COM</text>

  <!-- Big title -->
  <text x="${W / 2}" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900"
        font-size="92" fill="#ffffff">RANK ALL 96</text>
  <text x="${W / 2}" y="332" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900"
        font-size="92" fill="#ffffff">WORLD CUP 2026 KITS</text>

  <!-- Underline accent -->
  <rect x="${W / 2 - 220}" y="360" width="440" height="6" rx="3" fill="#FFD24A"/>

  <!-- Subtitle -->
  <text x="${W / 2}" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600"
        font-size="30" fill="#ffffff" opacity="0.92">Vote on every home and away jersey</text>
  <text x="${W / 2}" y="468" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600"
        font-size="26" fill="#c4a8ff">48 qualified teams · 12 groups · 1 ranking</text>

  <!-- Thumbs row -->
  <text x="${W / 2}" y="556" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800"
        font-size="48" fill="#ffffff">👍   👎</text>

  <!-- Footer URL -->
  <text x="${W / 2}" y="610" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700"
        font-size="20" fill="#c4a8ff" opacity="0.9">myworldcupguide.com/kits</text>
</svg>`

await sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile("public/kits-og.jpg")

console.log("wrote public/kits-og.jpg (1200x630)")
