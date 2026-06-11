"use client"

import { useEffect, useState } from "react"

type NewsItem = {
  title: string
  link: string
  description: string
  source: string
  date: string
  ts: number
}

type NewsData = {
  updated: string
  count: number
  failed?: string[]
  items: NewsItem[]
}

function relativeTime(ts: number): string {
  const diff = Date.now() / 1000 - ts
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

export default function NewsStrip() {
  const [data, setData] = useState<NewsData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/data/news.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: NewsData) => setData(d))
      .catch(() => setError(true))
  }, [])

  if (error || !data || data.items.length === 0) return null

  return (
    <section className="mb-12" aria-label="Latest World Cup 2026 news">
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#231645]">Latest news</h2>
        <span className="text-xs text-[#615E6E]">
          Updated {relativeTime(new Date(data.updated).getTime() / 1000)} · {data.items.length} stories from BBC, Guardian, ESPN, FIFA
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.slice(0, 9).map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl bg-white border border-black/[0.06] p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">
              {item.source} · {relativeTime(item.ts)}
            </p>
            <h3 className="text-sm font-extrabold text-[#231645] leading-snug mb-2"
                style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.title}
            </h3>
            {item.description && (
              <p className="text-xs text-[#615E6E] leading-relaxed"
                 style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {item.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </section>
  )
}
