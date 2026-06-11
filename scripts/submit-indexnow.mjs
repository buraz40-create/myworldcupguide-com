// Push every URL in the live sitemap to IndexNow (Bing, Yandex, Naver, etc).
// Google does not consume IndexNow directly, but ChatGPT / Copilot citations
// pull from Bing's index, so this matters for AI search visibility.
//
// Usage:
//   node scripts/submit-indexnow.mjs                    # submit all live sitemap URLs
//   node scripts/submit-indexnow.mjs --since 2026-06-01 # only URLs lastmod >= date
//
// Run after every deploy to keep Bing's index fresh.

import fs from "node:fs"

const HOST = "myworldcupguide.com"
const KEY = "7e43ff231645a04b3cd8e9f1a2b3c4d5"
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = "https://api.indexnow.org/IndexNow"
const SITEMAP = `https://${HOST}/sitemap.xml`

const args = process.argv.slice(2)
const sinceIdx = args.indexOf("--since")
const sinceDate = sinceIdx >= 0 ? args[sinceIdx + 1] : null

async function fetchSitemapUrls() {
  const xml = await (await fetch(SITEMAP)).text()
  const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  return urlBlocks
    .map((m) => {
      const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]
      const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
      return loc ? { loc, lastmod } : null
    })
    .filter((x) => !!x)
}

// IndexNow caps each submission at 10,000 URLs but recommends batching ≤ 1,000.
async function submitBatch(urls) {
  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })
  return { status: res.status, count: urls.length }
}

const all = await fetchSitemapUrls()
const filtered = sinceDate
  ? all.filter((u) => u.lastmod && u.lastmod.slice(0, 10) >= sinceDate)
  : all
const urlList = filtered.map((u) => u.loc)
console.log(`Submitting ${urlList.length} URLs to IndexNow${sinceDate ? ` (since ${sinceDate})` : ""}…`)

// Key sanity check before sending: confirm the key file is reachable.
const keyCheck = await fetch(KEY_LOCATION)
if (keyCheck.status !== 200) {
  console.error(`Key file not reachable at ${KEY_LOCATION} (HTTP ${keyCheck.status}). Deploy it first.`)
  process.exit(1)
}

const chunks = []
for (let i = 0; i < urlList.length; i += 1000) {
  chunks.push(urlList.slice(i, i + 1000))
}
for (const batch of chunks) {
  const r = await submitBatch(batch)
  console.log(`  batch of ${r.count}: HTTP ${r.status}`)
}
console.log("Done.")
