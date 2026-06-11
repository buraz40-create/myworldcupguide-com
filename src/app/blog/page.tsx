import type { Metadata } from "next"
import Link from "next/link"
import { blogPosts } from "@/data/blogPosts"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Blog - Visitor Guides, Tickets, Travel & News",
  description:
    "In-depth guides for the 2026 FIFA World Cup: tickets, visa, travel logistics, host city deep-dives, and tournament format. Updated regularly.",
  keywords: [
    "World Cup 2026 blog",
    "World Cup 2026 articles",
    "FIFA World Cup news",
    "World Cup travel guide",
    "World Cup 2026 visa",
    "World Cup ticket guide",
  ],
  alternates: alternatesFor(`${SITE}/blog/`),
  openGraph: {
    title: "World Cup 2026 Blog - Visitor Guides, Tickets, Travel & News",
    description: "In-depth guides for the 2026 FIFA World Cup: tickets, visa, travel logistics, host city deep-dives.",
    url: `${SITE}/blog/`,
    type: "website",
  },
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function BlogPage() {
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        name: "My World Cup Guide Blog",
        url: `${SITE}/blog/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog/` },
        ],
      },
      {
        "@type": "ItemList",
        numberOfItems: posts.length,
        itemListElement: posts.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE}/blog/${p.slug}/`,
          name: p.title,
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Blog</span>
        </nav>

        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="pill" style={{ background: "#7E43FF", color: "#fff", border: "none" }}>
              {posts.length} articles
            </span>
            <span className="pill">Updated regularly</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
            World Cup 2026 Blog
          </h1>
          <p className="text-[#615E6E] text-lg leading-relaxed">
            Long-form guides for the 2026 FIFA World Cup. Tickets, travel, visa rules, host city deep-dives,
            and tournament format - written and updated as FIFA confirms details.
          </p>
        </header>

        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}/`}
              className="card p-6 block group hover:border-[#7E43FF]/40 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-3 text-xs text-[#615E6E]">
                <span className="font-bold text-[#7E43FF] uppercase tracking-widest text-[10px]">{p.category}</span>
                <span className="opacity-40">·</span>
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                <span className="opacity-40">·</span>
                <span>{p.readMinutes} min read</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2 leading-tight group-hover:text-[#7E43FF] transition-colors">
                {p.title}
              </h2>
              <p className="text-[#615E6E] text-sm leading-relaxed mb-3">{p.description}</p>
              <span className="text-[#7E43FF] text-xs font-bold inline-flex items-center gap-1">
                Read article <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-black/[0.06]">
          <Link href="/" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
